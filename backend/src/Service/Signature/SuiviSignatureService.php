<?php

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 */

namespace App\Service\Signature;

use App\ApiResource\Utilisateur;
use App\Entity\DecisionAmenagementExamens;
use App\Message\RessourceModifieeMessage;
use App\Repository\DecisionAmenagementExamensRepository;
use App\Service\Decision\ArchivageDecision;
use App\State\Utilisateur\UtilisateurManager;
use Psr\Log\LoggerInterface;
use Symfony\Component\Clock\ClockAwareTrait;
use Symfony\Component\Messenger\MessageBusInterface;
use Throwable;

/**
 * Suit les décisions en signature et dépose le PDF signé au dossier. Une décision n'est
 * déclarée signée qu'une fois son PDF archivé, sinon elle est reprise au passage suivant.
 */
readonly class SuiviSignatureService
{
    use ClockAwareTrait;

    public function __construct(
        private DecisionAmenagementExamensRepository $decisionAmenagementExamensRepository,
        private FastParapheurClientInterface $fastParapheurClient,
        private EtatSignatureDeriver $etatSignatureDeriver,
        private ArchivageDecision $archivageDecision,
        private UtilisateurManager $utilisateurManager,
        private MessageBusInterface $messageBus,
        private LoggerInterface $logger,
    ) {}

    public function traiterLot(int $limite = 50): RapportSuiviSignature
    {
        $rapport = new RapportSuiviSignature();

        // Sans client réel, aucune décision n'a pu partir en signature : rien à suivre.
        if (!$this->fastParapheurClient->estDisponible()) {
            return $rapport;
        }

        foreach ($this->decisionAmenagementExamensRepository->aSuivreDansFast($limite) as $decision) {
            $rapport = $rapport->avec(examinees: 1)->avec(...$this->traiter($decision));
        }

        // Le passage est planifié : sans décision à suivre, on ne remplit pas les journaux.
        if (0 === $rapport->examinees) {
            $this->logger->debug('Suivi des signatures FAST : aucune décision en cours de signature.');

            return $rapport;
        }

        // tout le lot en échec : FAST est probablement injoignable
        if ($rapport->erreurs === $rapport->examinees) {
            $this->logger->critical(
                'Suivi des signatures FAST : aucune des {examinees} décision(s) n\'a pu être vérifiée, '
                . 'FAST-Parapheur semble injoignable.',
                $rapport->toArray(),
            );

            return $rapport;
        }

        $this->logger->info('Suivi des signatures FAST : {examinees} décision(s) examinée(s).', $rapport->toArray());

        return $rapport;
    }

    /**
     * @return array<string, int> incréments à reporter au bilan
     */
    private function traiter(DecisionAmenagementExamens $decision): array
    {
        try {
            $historique = $this->fastParapheurClient->consulterHistorique($decision->getFastDocumentId());
        } catch (Throwable $e) {
            // n'interrompt pas le lot : la décision est reprise au passage suivant
            $this->logger->error(
                'Suivi FAST impossible pour la décision {id} : {erreur}',
                ['id' => $decision->getId(), 'erreur' => $e->getMessage()],
            );

            return ['erreurs' => 1];
        }

        $etat = $this->etatSignatureDeriver->deriver(array_column($historique, 'stateName'));
        $decision->setDerniereVerificationFast($this->now());

        if (DecisionAmenagementExamens::ETAT_SIGNATURE_EN_SIGNATURE === $etat) {
            $this->decisionAmenagementExamensRepository->save($decision, true);

            return [];
        }

        if (DecisionAmenagementExamens::ETAT_SIGNATURE_SIGNEE === $etat) {
            return $this->finaliser($decision, $historique);
        }

        $decision->setEtatSignature($etat);
        $this->decisionAmenagementExamensRepository->save($decision, true);
        // la fiche du bénéficiaire affiche l'état de signature
        $this->messageBus->dispatch(new RessourceModifieeMessage(new Utilisateur($decision->getBeneficiaire())));
        $this->logger->warning(
            'Décision {id} : circuit de signature terminé sans signature ({etat}).',
            ['id' => $decision->getId(), 'etat' => $etat],
        );

        return match ($etat) {
            DecisionAmenagementExamens::ETAT_SIGNATURE_REFUSEE => ['refusees' => 1],
            default => ['closes' => 1],
        };
    }

    /**
     * Récupère le PDF signé, le dépose au dossier, et clôt la décision.
     *
     * @param array<int, array{stateName: string, date: string}> $historique historique FAST du document
     *
     * @return array<string, int>
     */
    private function finaliser(DecisionAmenagementExamens $decision, array $historique): array
    {
        // sans demandeur mémorisé au dépôt, la pièce jointe n'a pas d'auteur
        $uidDemandeur = $decision->getUidDemandeurSignature();
        if (null === $uidDemandeur) {
            $this->logger->error(
                'Décision {id} signée dans FAST mais sans demandeur mémorisé : archivage impossible.',
                ['id' => $decision->getId()],
            );
            $this->decisionAmenagementExamensRepository->save($decision, true);

            return ['erreurs' => 1];
        }

        try {
            $pdf = $this->fastParapheurClient->telecharger($decision->getFastDocumentId());
            $this->archivageDecision->archiver(
                decision: $decision,
                pdf: $pdf,
                auteur: $this->utilisateurManager->parUid($uidDemandeur),
                signee: true,
            );
        } catch (Throwable $e) {
            // pas signée sans son document : nouvel essai au passage suivant
            $this->logger->error(
                'Décision {id} signée dans FAST mais récupération du PDF impossible : {erreur}',
                ['id' => $decision->getId(), 'erreur' => $e->getMessage()],
            );
            $this->decisionAmenagementExamensRepository->save($decision, true);

            return ['erreurs' => 1];
        }

        $dateSignature = $this->etatSignatureDeriver->dateDeSignature($historique);
        if (null === $dateSignature) {
            // Signée mais sans date lisible dans l'historique : on ne l'invente pas.
            $this->logger->warning(
                'Décision {id} signée dans FAST sans date de signature lisible dans l\'historique.',
                ['id' => $decision->getId()],
            );
        }

        $decision->setDateSignature($dateSignature);
        $decision->setEtatSignature(DecisionAmenagementExamens::ETAT_SIGNATURE_SIGNEE);
        $decision->setEtat(DecisionAmenagementExamens::ETAT_EDITE);
        $this->decisionAmenagementExamensRepository->save($decision, true);
        $this->messageBus->dispatch(new RessourceModifieeMessage(new Utilisateur($decision->getBeneficiaire())));

        return ['signees' => 1];
    }
}

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
        private AbstractParapheur $parapheur,
        private ArchivageDecision $archivageDecision,
        private UtilisateurManager $utilisateurManager,
        private MessageBusInterface $messageBus,
        private LoggerInterface $logger,
    ) {}

    public function traiterLot(int $limite = 50): RapportSuiviSignature
    {
        $rapport = new RapportSuiviSignature();

        // sans parapheur, aucune décision n'a pu partir en signature
        if (!$this->parapheur->estDisponible()) {
            return $rapport;
        }

        foreach ($this->decisionAmenagementExamensRepository->enCoursDeSignature($limite) as $decision) {
            $rapport = $rapport->avec(examinees: 1)->avec(...$this->traiter($decision));
        }

        // Le passage est planifié : sans décision à suivre, on ne remplit pas les journaux.
        if (0 === $rapport->examinees) {
            $this->logger->debug('Suivi des signatures : aucune décision en cours de signature.');

            return $rapport;
        }

        // tout le lot en échec : le parapheur est probablement injoignable
        if ($rapport->erreurs === $rapport->examinees) {
            $this->logger->critical(
                'Suivi des signatures : aucune des {examinees} décision(s) n\'a pu être vérifiée, '
                . 'le parapheur semble injoignable.',
                $rapport->toArray(),
            );

            return $rapport;
        }

        $this->logger->info('Suivi des signatures : {examinees} décision(s) examinée(s).', $rapport->toArray());

        return $rapport;
    }

    /**
     * @return array<string, int> incréments à reporter au bilan
     */
    private function traiter(DecisionAmenagementExamens $decision): array
    {
        try {
            $suivi = $this->parapheur->suivre($decision->getIdDocumentParapheur());
        } catch (DocumentInconnuException) {
            // le parapheur ne connaît plus le document : le réinterroger ne servirait à rien
            $decision->setEtat(DecisionAmenagementExamens::ETAT_REFUSEE);
            $decision->setEtatSignature(DecisionAmenagementExamens::ETAT_SIGNATURE_ERREUR);
            $this->decisionAmenagementExamensRepository->save($decision, true);
            $this->messageBus->dispatch(new RessourceModifieeMessage(new Utilisateur($decision->getBeneficiaire())));
            $this->logger->error(
                'Décision {id} : document {document} inconnu du parapheur, suivi arrêté.',
                ['id' => $decision->getId(), 'document' => $decision->getIdDocumentParapheur()],
            );

            return ['closes' => 1];
        } catch (Throwable $e) {
            // n'interrompt pas le lot : la décision est reprise au passage suivant
            $this->logger->error(
                'Suivi de signature impossible pour la décision {id} : {erreur}',
                ['id' => $decision->getId(), 'erreur' => $e->getMessage()],
            );

            return ['erreurs' => 1];
        }

        $decision->setDerniereVerificationSignature($this->now());

        if (DecisionAmenagementExamens::ETAT_SIGNATURE_EN_SIGNATURE === $suivi->etat) {
            $this->decisionAmenagementExamensRepository->save($decision, true);

            return [];
        }

        if (DecisionAmenagementExamens::ETAT_SIGNATURE_SIGNEE === $suivi->etat) {
            return $this->finaliser($decision, $suivi);
        }

        $decision->setEtat(DecisionAmenagementExamens::ETAT_REFUSEE);
        $decision->setEtatSignature($suivi->etat);
        $this->decisionAmenagementExamensRepository->save($decision, true);
        // la fiche du bénéficiaire affiche l'état de signature
        $this->messageBus->dispatch(new RessourceModifieeMessage(new Utilisateur($decision->getBeneficiaire())));
        $this->logger->warning(
            'Décision {id} : circuit de signature terminé sans signature ({etat}).',
            ['id' => $decision->getId(), 'etat' => $suivi->etat],
        );

        return match ($suivi->etat) {
            DecisionAmenagementExamens::ETAT_SIGNATURE_REFUSEE => ['refusees' => 1],
            default => ['closes' => 1],
        };
    }

    /**
     * Récupère le PDF signé, le dépose au dossier, et clôt la décision.
     *
     * @return array<string, int>
     */
    private function finaliser(DecisionAmenagementExamens $decision, SuiviSignature $suivi): array
    {
        // sans demandeur mémorisé au dépôt, la pièce jointe n'a pas d'auteur
        $uidDemandeur = $decision->getUidDemandeurSignature();
        if (null === $uidDemandeur) {
            $this->logger->error(
                'Décision {id} signée mais sans demandeur mémorisé : archivage impossible.',
                ['id' => $decision->getId()],
            );
            $this->decisionAmenagementExamensRepository->save($decision, true);

            return ['erreurs' => 1];
        }

        try {
            $pdf = $this->parapheur->telecharger($decision->getIdDocumentParapheur());
            $this->archivageDecision->archiver(
                decision: $decision,
                pdf: $pdf,
                auteur: $this->utilisateurManager->parUid($uidDemandeur),
                signee: true,
            );
        } catch (Throwable $e) {
            // pas signée sans son document : nouvel essai au passage suivant
            $this->logger->error(
                'Décision {id} signée mais récupération du PDF impossible : {erreur}',
                ['id' => $decision->getId(), 'erreur' => $e->getMessage()],
            );
            $this->decisionAmenagementExamensRepository->save($decision, true);

            return ['erreurs' => 1];
        }

        if (null === $suivi->dateSignature) {
            // on n'invente pas de date de signature
            $this->logger->warning(
                'Décision {id} signée sans date de signature fournie par le parapheur.',
                ['id' => $decision->getId()],
            );
        }

        $decision->setDateSignature($suivi->dateSignature);
        $decision->setEtatSignature(DecisionAmenagementExamens::ETAT_SIGNATURE_SIGNEE);
        $decision->setEtat(DecisionAmenagementExamens::ETAT_EDITE);
        $this->decisionAmenagementExamensRepository->save($decision, true);
        $this->messageBus->dispatch(new RessourceModifieeMessage(new Utilisateur($decision->getBeneficiaire())));

        return ['signees' => 1];
    }
}

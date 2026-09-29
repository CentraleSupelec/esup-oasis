<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\Service\Signature;

use App\ApiResource\Utilisateur;
use App\Entity\DecisionAmenagementExamens;
use App\Message\RessourceModifieeMessage;
use App\Repository\DecisionAmenagementExamensRepository;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Symfony\Component\Messenger\MessageBusInterface;

/**
 * Passage d'une décision d'aménagements par le parapheur : dépôt à la demande d'édition.
 */
readonly class SignatureElectronique
{
    public function __construct(
        private AbstractParapheur $parapheur,
        private DecisionAmenagementExamensRepository $decisionAmenagementExamensRepository,
        private MessageBusInterface $messageBus,
        private LoggerInterface $logger,
    ) {}

    /**
     * Circuit de signature de la décision : celui de la composante des inscriptions en cours du
     * bénéficiaire. Null : la décision est envoyée par e-mail.
     */
    public function circuitPour(DecisionAmenagementExamens $decision): ?string
    {
        $circuits = [];
        foreach ($decision->getBeneficiaire()->getInscriptionsEnCours() as $inscription) {
            $composante = $inscription->getFormation()?->getComposante();
            if (null !== $composante?->getCircuitSignature()) {
                $circuits[$composante->getCodeExterne()] = $composante->getCircuitSignature();
            }
        }

        // composante sans circuit : envoi par e-mail, ce qui permet une activation progressive
        if ([] === $circuits) {
            return null;
        }

        if (!$this->parapheur->estDisponible()) {
            $this->logger->warning(
                'Un circuit de signature est renseigné sur la composante mais aucun parapheur n\'est configuré '
                . '(PARAPHEUR) : décision {id} envoyée par e-mail.',
                ['id' => $decision->getId()],
            );

            return null;
        }

        // plusieurs circuits possibles : on ne choisit pas le signataire à la place de l'établissement
        if (count(array_unique($circuits)) > 1) {
            $this->logger->warning(
                'Décision {id} : inscriptions en cours dans plusieurs composantes à circuits distincts '
                . '({composantes}), envoi par e-mail.',
                ['id' => $decision->getId(), 'composantes' => implode(', ', array_keys($circuits))],
            );

            return null;
        }

        return current($circuits);
    }

    public function estEnCours(DecisionAmenagementExamens $decision): bool
    {
        return DecisionAmenagementExamens::ETAT_EN_SIGNATURE === $decision->getEtat()
            && null !== $decision->getIdDocumentParapheur();
    }

    /**
     * @param string $uidDemandeur auteur de la pièce jointe au retour de signature
     *
     * @throws ParapheurException
     * @throws RuntimeException si le bénéficiaire n'a pas d'adresse e-mail
     */
    public function deposer(
        DecisionAmenagementExamens $decision,
        string $pdf,
        string $circuit,
        string $uidDemandeur,
    ): void {
        // le parapheur transmet la décision signée à l'étudiant, à l'adresse de l'e-mail habituel
        $destinataire = $decision->getBeneficiaire()->getEmail()
            ?? throw new RuntimeException(sprintf('Bénéficiaire de la décision %d sans adresse e-mail.', $decision->getId()));

        $documentId = $this->parapheur->deposer(
            pdf: $pdf,
            circuit: $circuit,
            libelle: sprintf(
                "Décision d'aménagements - %s %s",
                $decision->getBeneficiaire()->getPrenom(),
                $decision->getBeneficiaire()->getNom(),
            ),
            destinataire: $destinataire,
        );

        $decision->setEtat(DecisionAmenagementExamens::ETAT_EN_SIGNATURE);
        $decision
            ->setEtatSignature(DecisionAmenagementExamens::ETAT_SIGNATURE_EN_SIGNATURE)
            ->setIdDocumentParapheur($documentId)
            ->setCircuitParapheur($circuit)
            ->setUidDemandeurSignature($uidDemandeur)
            // une signature précédente ne concerne pas ce nouveau document
            ->setDateSignature(null)
            ->setDerniereVerificationSignature(null);
        $this->decisionAmenagementExamensRepository->save($decision, true);
        $this->messageBus->dispatch(new RessourceModifieeMessage(new Utilisateur($decision->getBeneficiaire())));
    }

}

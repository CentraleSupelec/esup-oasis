<?php

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

namespace App\MessageHandler;

use App\ApiResource\ModificationEtatDemande;
use App\Entity\EtatDemande;
use App\Message\DemandeAttenteValidationAccompagnementMessage;
use App\Message\DemandeAttenteValidationCharteMessage;
use App\Message\DemandeConformeMessage;
use App\Message\DemandeNonConformeMessage;
use App\Message\DemandeProfilValideMessage;
use App\Message\DemandeReceptionneeMessage;
use App\Message\DemandeRefuseeMessage;
use App\Message\DemandeValideeMessage;
use App\Message\EtatDemandeModifieMessage;
use App\Message\RessourceCollectionModifieeMessage;
use App\State\Demande\DemandeManager;
use App\State\Utilisateur\UtilisateurManager;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Messenger\MessageBusInterface;

#[AsMessageHandler(handles: EtatDemandeModifieMessage::class, priority: 20)]
readonly class EtatDemandeModifieMessageHandler
{
    public function __construct(
        private MessageBusInterface $messageBus,
        private DemandeManager $demandeManager,
        private UtilisateurManager $utilisateurManager,
    ) {}

    public function __invoke(EtatDemandeModifieMessage $message): void
    {
        /**
         * On logge la modif, puis on forwarde si nécessaire (envois de mails, etc...)
         */
        $log = $this->demandeManager->logModificationEtat(
            idDemande: $message->getIdDemande(),
            idEtat: $message->getIdEtat(),
            idEtatPrecedent: $message->getIdEtatprecedent(),
            idProfil: $message->getIdProfil(),
            utilisateur: $this->utilisateurManager->parUid($message->getUidUtilisateurModif()),
            commentaire: $message->getCommentaire(),
        );

        $logResource = new ModificationEtatDemande($log);
        $this->messageBus->dispatch(new RessourceCollectionModifieeMessage($logResource));

        $forwardMessage = match ($message->getIdEtat()) {
            EtatDemande::RECEPTIONNEE => new DemandeReceptionneeMessage($message, $this->demandeManager),
            EtatDemande::CONFORME => new DemandeConformeMessage($message, $this->demandeManager),
            EtatDemande::NON_CONFORME => new DemandeNonConformeMessage($message, $this->demandeManager),
            EtatDemande::PROFIL_VALIDE => new DemandeProfilValideMessage($message, $this->demandeManager),
            EtatDemande::ATTENTE_VALIDATION_CHARTE => new DemandeAttenteValidationCharteMessage(
                $message,
                $this->demandeManager,
            ),
            EtatDemande::ATTENTE_VALIDATION_ACCOMPAGNEMENT => new DemandeAttenteValidationAccompagnementMessage(
                $message,
                $this->demandeManager,
            ),
            EtatDemande::REFUSEE => new DemandeRefuseeMessage($message, $this->demandeManager),
            EtatDemande::VALIDEE => new DemandeValideeMessage($message, $this->demandeManager),
            default => null,
        };

        if (null !== $forwardMessage) {
            $this->messageBus->dispatch($forwardMessage);
        }
    }
}

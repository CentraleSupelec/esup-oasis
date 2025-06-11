<?php

/*
 * Copyright (c) 2024. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

namespace App\State\Demande;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\BeneficiaireProfil;
use App\ApiResource\Demande;
use App\Entity\EtatDemande;
use App\Message\RessourceCollectionModifieeMessage;
use App\Message\RessourceModifieeMessage;
use App\State\TransformerService;
use Exception;
use Override;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Messenger\MessageBusInterface;

readonly class PatchDemandeProcessor implements ProcessorInterface
{
    public function __construct(private DemandeManager      $demandeManager,
                                private Security            $security,
                                private TransformerService  $transformerService,
                                private MessageBusInterface $messageBus)
    {
    }

    /**
     * @param Demande $data
     * @throws Exception
     */
    #[Override] public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Demande
    {
        //soit changement d'état, soit simple commentaire
        $demande = $this->demandeManager->getDemande($data->id);
        if ($demande->getEtat()->getId() !== $data->etat->id) {
            $demande = $this->demandeManager->modifierDemande(
                demande: $demande,
                idEtat: $data->etat->id,
                commentaire: $data->commentaireChangementEtat,
                profilId: $data->profilAttribue?->id,
                user: $this->security->getUser()
            );
            //si nouvel état = validé, on veut refresh le cache!
            if ($data->etat->id === EtatDemande::VALIDEE) {
                $beneficiaire = $this->transformerService->transform($demande->getDemandeur()->getBeneficiairesActifs()[0], BeneficiaireProfil::class);
                $demandeur = $data->demandeur;
                $demandeur->roleId = 'ROLE_DEMANDEUR';
                $this->messageBus->dispatch(new RessourceModifieeMessage($beneficiaire));
                $this->messageBus->dispatch(new RessourceModifieeMessage($demandeur));
                $this->messageBus->dispatch(new RessourceCollectionModifieeMessage($beneficiaire));
                $this->messageBus->dispatch(new RessourceCollectionModifieeMessage($demandeur));
                $demandeur->roleId = 'ROLE_BENEFICIAIRE';
                $this->messageBus->dispatch(new RessourceModifieeMessage($demandeur));
                $this->messageBus->dispatch(new RessourceCollectionModifieeMessage($demandeur));
            }

        } else {
            $this->demandeManager->ajouterCommentaire($demande, $data->commentaire);
        }

        $resource = $this->transformerService->transform($demande, Demande::class);

        $this->messageBus->dispatch(new RessourceModifieeMessage($resource));

        return $resource;
    }
}
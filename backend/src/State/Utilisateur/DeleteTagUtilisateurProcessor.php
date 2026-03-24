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

namespace App\State\Utilisateur;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\TagUtilisateur;
use App\ApiResource\Utilisateur;
use App\Message\RessourceCollectionModifieeMessage;
use App\Message\RessourceModifieeMessage;
use App\Repository\TagRepository;
use Override;
use Symfony\Component\Messenger\MessageBusInterface;

readonly class DeleteTagUtilisateurProcessor implements ProcessorInterface
{
    public function __construct(
        private UtilisateurManager $utilisateurManager,
        private TagRepository $tagRepository,
        private MessageBusInterface $messageBus,
    ) {}

    /**
     * @param TagUtilisateur $data
     * @param Operation $operation
     * @param array $uriVariables
     * @param array $context
     * @return void
     */
    #[Override]
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): void
    {
        $utilisateur = $this->utilisateurManager->parUid($data->uid);
        $tag = $this->tagRepository->find($data->id);
        $this->utilisateurManager->supprimerTag($utilisateur, $tag);
        $utilisateurResource = new Utilisateur($utilisateur);
        $this->messageBus->dispatch(new RessourceModifieeMessage($utilisateurResource));
        $this->messageBus->dispatch(new RessourceCollectionModifieeMessage($data));
    }
}

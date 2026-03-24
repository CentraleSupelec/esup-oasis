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

use App\Message\ModificationUtilisateurMessage;
use App\Service\ErreurLdapException;
use App\State\Utilisateur\UtilisateurManager;
use Psr\Cache\InvalidArgumentException;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Contracts\Cache\TagAwareCacheInterface;

#[AsMessageHandler]
readonly class ModificationUtilisateurMessageHandler
{
    public function __construct(
        private TagAwareCacheInterface $cache,
        private UtilisateurManager $utilisateurManager,
    ) {}

    /**
     * @throws InvalidArgumentException
     */
    public function __invoke(ModificationUtilisateurMessage $message): void
    {
        $this->cache->invalidateTags(['utilisateur_' . $message->getUid()]);
        try {
            $utilisateur = $this->utilisateurManager->parUid($message->getUid());
        } catch (ErreurLdapException) {
            return;
        }
        foreach ($utilisateur->getRoles() as $role) {
            $this->cache->invalidateTags(['utilisateurs_roles_' . $role]);
        }
    }
}

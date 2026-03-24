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

namespace App\State\Stats;

use ApiPlatform\Metadata\IriConverterInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\Utilisateur;
use App\State\Demande\DemandeManager;
use App\State\Evenement\EvenementManager;
use Exception;
use Symfony\Bundle\SecurityBundle\Security;

readonly class TableauDeBordProvider implements ProviderInterface
{
    public function __construct(
        private EvenementManager $evenementManager,
        private DemandeManager $demandeManager,
        private IriConverterInterface $iriConverter,
        private Security $security,
    ) {}

    /**
     * @param Operation $operation
     * @param array     $uriVariables
     * @param array     $context
     * @return object|array|null
     * @throws Exception
     */
    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        if (!$this->security->isGranted(Utilisateur::ROLE_PLANIFICATEUR)) {
            //si non planificateur, ajout du filtre sur lui-même
            $utilisateur = new \App\ApiResource\Utilisateur($this->security->getUser());
        } else {
            //filtre custom - cf définition openapi de l'opération
            if (isset($context['filters']['utilisateur'])) {
                $utilisateur = $this->iriConverter->getResourceFromIri($context['filters']['utilisateur']);
            } else {
                $utilisateur = null;
            }
        }

        $tdb = $this->evenementManager->tableauDeBord($utilisateur);
        $tdb = $this->demandeManager->tableauDeBord($utilisateur, $tdb);

        return $tdb;
    }
}

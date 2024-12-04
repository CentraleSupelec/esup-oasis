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

namespace App\State\TauxHoraire;

use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Operation;
use App\ApiResource\TauxHoraire;
use App\ApiResource\TypeEvenement;
use App\State\AbstractEntityProvider;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class TauxHoraireProvider extends AbstractEntityProvider
{

    protected function getResourceClass(): string
    {
        return TauxHoraire::class;
    }

    protected function getEntityClass(): string
    {
        return \App\Entity\TauxHoraire::class;
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $relevantVariables = ['id' => $uriVariables['id']];

        $link = new Link(parameterName: 'id', fromClass: TauxHoraire::class, identifiers: ['id']);
        $relevantOperation = (new (get_class($operation)))->withClass(TauxHoraire::class)
            ->withStateOptions($operation->getStateOptions())
            ->withUriVariables([$link]);

        $taux = parent::provide(
            operation: $relevantOperation,
            uriVariables: $relevantVariables,
            context: $context
        );

        //devrait être une contrainte de validation
        if ($taux->typeId !== $uriVariables['typeId']) {
            throw new UnprocessableEntityHttpException($uriVariables['typeId'] . " n'a pas de taux d'id " . $uriVariables['id']);
        }
        return $taux;
    }

    /**
     * @param \App\Entity\TauxHoraire $entity
     * @return TauxHoraire
     */
    public function transform($entity): TauxHoraire
    {
        $resource = new TauxHoraire();
        $resource->id = $entity->getId();
        $resource->montant = $entity->getMontant();
        $resource->typeId = $entity->getTypeEvenement()->getId();
        $resource->debut = $entity->getDebut();
        $resource->fin = $entity->getFin();
        $resource->typeEvenement = new TypeEvenement();
        $resource->typeEvenement->id = $resource->typeId;
        return $resource;
    }
}
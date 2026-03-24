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

namespace App\State\TauxHoraire;

use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\TauxHoraire;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

readonly class TauxHoraireProvider implements ProviderInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.item_provider')]
        private ProviderInterface $itemProvider,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $relevantVariables = ['id' => $uriVariables['id']];

        $link = new Link(parameterName: 'id', fromClass: TauxHoraire::class, identifiers: ['id']);
        $relevantOperation = new (get_class($operation))()
            ->withClass(TauxHoraire::class)
            ->withStateOptions($operation->getStateOptions())
            ->withUriVariables([$link]);

        $entity = $this->itemProvider->provide(
            operation: $relevantOperation,
            uriVariables: $relevantVariables,
            context: $context,
        );
        if (null === $entity) {
            return null;
        }

        $taux = new TauxHoraire($entity);

        if ($taux->typeId !== (int) $uriVariables['typeId']) {
            return null; //combinaison taux/type inexistante, 404
        }

        return $taux;
    }
}

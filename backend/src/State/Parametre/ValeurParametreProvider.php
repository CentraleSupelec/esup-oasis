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

namespace App\State\Parametre;

use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\ValeurParametre;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

readonly class ValeurParametreProvider implements ProviderInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.item_provider')]
        private ProviderInterface $itemProvider,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $relevantVariables = ['id' => $uriVariables['id']];

        $link = new Link(parameterName: 'id', fromClass: ValeurParametre::class, identifiers: ['id']);
        $relevantOperation = new (get_class($operation))()
            ->withClass(ValeurParametre::class)
            ->withStateOptions($operation->getStateOptions())
            ->withUriVariables([$link]);

        $valeur = $this->itemProvider->provide(
            operation: $relevantOperation,
            uriVariables: $relevantVariables,
            context: $context,
        );

        assert($valeur instanceof \App\Entity\ValeurParametre);

        if ($valeur->getParametre()->getCle() !== $uriVariables['cle']) {
            throw new UnprocessableEntityHttpException(
                $uriVariables['cle'] . " n'a pas de valeur d'id " . $uriVariables['id'],
            );
        }

        return new ValeurParametre($valeur);
    }
}

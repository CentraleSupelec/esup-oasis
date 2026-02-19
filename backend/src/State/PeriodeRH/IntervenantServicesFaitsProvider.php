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

namespace App\State\PeriodeRH;

use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\TraversablePaginator;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\PeriodeRH;
use App\Repository\PeriodeRHRepository;
use ArrayObject;
use Exception;

readonly class IntervenantServicesFaitsProvider implements ProviderInterface
{
    function __construct(
        private ServicesFaitsProvider $servicesFaitsProvider,
        private PeriodeRHRepository $periodeRHRepository,
    ) {}

    /**
     * @throws Exception
     */
    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        if ($operation instanceof Get) {
            return $this->servicesFaitsProvider->provide($operation, $uriVariables, $context);
        }

        $page = $context['filters']['page'] ?? 1;
        $itemsPerPage = $context['filters']['itemsPerPage'] ?? 30;
        $periodes = $this->periodeRHRepository->parIntervenant(
            uid: $uriVariables['uid'],
            page: $page,
            itemsPerPage: $itemsPerPage,
            order: $context['filters']['order'] ?? false ? array_key_first($context['filters']['order']) : null,
            direction: $context['filters']['order'] ?? false ? array_values($context['filters']['order'])[0] : null,
        );

        //on a les périodes filtrées...
        $result = [];
        foreach ($periodes as $periode) {
            $servicesFaits = $this->servicesFaitsProvider->init(new PeriodeRH($periode), $uriVariables['uid']);
            $result[] = $this->servicesFaitsProvider->traiterEvenements(
                evenements: $this->servicesFaitsProvider->getEvenements($periode, $uriVariables['uid']),
                servicesFaits: $servicesFaits,
            );
        }

        //on reconstruit la pagination !
        $totalPeriodes = $this->periodeRHRepository->countParIntervenant(uid: $uriVariables['uid']);

        $paginator = new TraversablePaginator(
            traversable: new ArrayObject($result),
            currentPage: $page,
            itemsPerPage: $itemsPerPage,
            totalItems: $totalPeriodes,
        );

        return $paginator;
    }
}

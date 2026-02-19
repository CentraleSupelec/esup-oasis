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

namespace App\ApiResource;

use ApiPlatform\Doctrine\Orm\Filter\ExistsFilter;
use ApiPlatform\Doctrine\Orm\State\Options;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\OpenApi\Model\Operation;
use App\Filter\BilanFinancierProfilBeneficiairesFilter;
use App\Filter\PeriodeDansIntervalleFilter;
use App\State\Evenement\BilanFinancierProvider;
use DateTimeInterface;

#[ApiResource(operations: [
    new GetCollection(
        uriTemplate: '/suivis/financiers/debut/{debut}/fin/{fin}',
        formats: ['jsonld', 'customcsv' => 'text/csv'],
        uriVariables: ['debut', 'fin'],
        openapi: new Operation(tags: ['Suivis'], description: 'Bilan financier'),
        paginationEnabled: false,
        security: "is_granted('ROLE_GESTIONNAIRE')",
        provider: BilanFinancierProvider::class,
        stateOptions: new Options(entityClass: \App\Entity\Evenement::class),
    ),
])]
#[ApiFilter(PeriodeDansIntervalleFilter::class, properties: ['intervalle'])]
#[ApiFilter(BilanFinancierProfilBeneficiairesFilter::class)]
#[ApiFilter(ExistsFilter::class, properties: ['dateAnnulation'])]
class BilanFinancier
{
    public DateTimeInterface $debut;
    public DateTimeInterface $fin;
    /**
     * @var IntervenantBilanFinancier[]
     */
    public array $intervenants;

    /**
     * @var PeriodeRH[]
     */
    public array $periodes;

    #[ApiProperty(identifier: true)]
    public function getid(): string
    {
        return $this->debut->format('Ymd') . '-' . $this->fin->format('Ymd');
    }
}

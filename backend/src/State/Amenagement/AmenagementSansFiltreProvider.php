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

namespace App\State\Amenagement;

use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Amenagement;
use App\ApiResource\Composante;
use App\Entity\Utilisateur;
use App\Filter\AmenagementBeneficiaireActifFilter;
use App\Filter\PreloadAssociationsFilter;
use App\State\MappedCollectionPaginator;
use Override;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class AmenagementSansFiltreProvider implements ProviderInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.item_provider')]
        private readonly ProviderInterface $itemProvider,
        #[Autowire(service: 'api_platform.doctrine.orm.state.collection_provider')]
        private readonly ProviderInterface $collectionProvider,
        private readonly Security $security,
    ) {}

    #[Override]
    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        if ($operation instanceof GetCollection) {
            //on ne veut que les aménagements sur les bénéficiaires actifs
            $context['filters'][AmenagementBeneficiaireActifFilter::PROPERTY] = true;

            //preload
            $context['filters'][PreloadAssociationsFilter::PROPERTY] = [
                'beneficiaires' => ['sourceEntity' => 'root', 'relationName' => 'beneficiaires'],
                'beneficiaireUtilisateur' => ['sourceEntity' => 'beneficiaires', 'relationName' => 'utilisateur'],
                'intervenant' => ['sourceEntity' => 'beneficiaireUtilisateur', 'relationName' => 'intervenant'],
            ];

            // les renforts ne voient que les aménagements d'aide humaine !
            if ($this->security->isGranted(Utilisateur::ROLE_RENFORT)) {
                $context['filters']['type.examens'] = false;
                $context['filters']['type.pedagogique'] = false;
            }

            //les référents composante ne voient que les aménagements d'examens et pédagogiques de leur composante
            if ($this->security->isGranted(Utilisateur::ROLE_REFERENT_COMPOSANTE)) {
                $context['filters']['type.aideHumaine'] = false;
                /**
                 * @var Utilisateur $user
                 */
                $user = $this->security->getUser();

                if (!array_key_exists('composante', $context['filters'] ?? [])) {
                    $context['filters']['composante'] = array_map(
                        fn($cmp) => Composante::COLLECTION_URI . '/' . $cmp->getId(),
                        $user->getComposantes()->toArray(),
                    );
                }
            }
            $results = $this->collectionProvider->provide($operation, $uriVariables, $context);
            assert($results instanceof PaginatorInterface);
            return new MappedCollectionPaginator($results, fn($entity) => new Amenagement($entity));
        }

        return $this->itemProvider->provide($operation, $uriVariables, $context);
    }
}

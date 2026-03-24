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

namespace App\State\Commission;

use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Charte;
use App\ApiResource\Commission;
use App\ApiResource\MembreCommission;
use App\ApiResource\Utilisateur;
use App\Repository\CommissionRepository;
use App\Repository\MembreCommissionRepository;
use App\State\MappedCollectionPaginator;
use App\State\Utilisateur\UtilisateurManager;
use Exception;
use Override;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

readonly class MembreCommissionProvider implements ProviderInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.collection_provider')]
        private ProviderInterface $collectionProvider,
        private MembreCommissionRepository $repository,
        private CommissionRepository $commissionRepository,
        private UtilisateurManager $utilisateurManager,
    ) {}

    #[Override]
    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        if ($operation instanceof GetCollection) {
            $results = $this->collectionProvider->provide($operation, $uriVariables, $context);
            assert($results instanceof PaginatorInterface);
            return new MappedCollectionPaginator($results, fn($entity) => new MembreCommission($entity));
        }
        //on fait du custom pour le cas complexe
        $utilisateur = $this->utilisateurManager->parUid($uriVariables['uid']);
        $commission = $this->commissionRepository->find($uriVariables['commissionId']);

        $membre = $this->repository->findOneBy([
            'utilisateur' => $utilisateur,
            'commission' => $uriVariables['commissionId'],
        ]);

        return match ($membre) {
            null => $this->transformUtilisateur($utilisateur, $commission),
            default => new MembreCommission($membre),
        };
    }

    /**
     * @param \App\Entity\Utilisateur $utilisateur
     * @param \App\Entity\Commission  $commission
     * @return MembreCommission|null
     * @throws Exception
     */
    private function transformUtilisateur(
        \App\Entity\Utilisateur $utilisateur,
        \App\Entity\Commission $commission,
    ): ?MembreCommission {
        if (!$utilisateur->isAdmin() && !$utilisateur->isGestionnaire() && !$utilisateur->estRenfortDemandes()) {
            return null;
        }

        $resource = new MembreCommission();
        $resource->id = null;
        $resource->utilisateur = new Utilisateur($utilisateur);
        $resource->commission = new Commission($commission);
        if ($utilisateur->isAdmin() || $utilisateur->isGestionnaire()) {
            $resource->roles = [
                \App\Entity\Utilisateur::ROLE_MEMBRE_COMMISSION,
                \App\Entity\Utilisateur::ROLE_ATTRIBUER_PROFIL,
                \App\Entity\Utilisateur::ROLE_VALIDER_CONFORMITE_DEMANDE,
            ];
        } else {
            $resource->roles = [
                \App\Entity\Utilisateur::ROLE_MEMBRE_COMMISSION,
            ];
        }

        return $resource;
    }
}

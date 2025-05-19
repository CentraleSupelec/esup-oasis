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

namespace App\State\Amenagement;

use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Amenagement;
use App\ApiResource\Composante;
use App\ApiResource\Inscription;
use App\ApiResource\TypeAmenagement;
use App\ApiResource\TypeSuiviAmenagement;
use App\ApiResource\Utilisateur;
use App\Filter\AmenagementBeneficiaireActifFilter;
use App\State\AbstractEntityProvider;
use Exception;
use Override;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class AmenagementSansFiltreProvider extends AbstractEntityProvider
{
    public function __construct(#[Autowire(service: 'api_platform.doctrine.orm.state.item_provider')] ProviderInterface       $itemProvider,
                                #[Autowire(service: 'api_platform.doctrine.orm.state.collection_provider')] ProviderInterface $collectionProvider,
                                private readonly Security                                                                     $security)
    {
        parent::__construct($itemProvider, $collectionProvider);
    }

    #[Override] public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        if ($operation instanceof GetCollection) {
            //on ne veut que les aménagements sur les bénéficiaires actifs
            $context['filters'][AmenagementBeneficiaireActifFilter::PROPERTY] = true;

            // les renforts ne voient que les aménagements aide humaine!
            if ($this->security->isGranted(\App\Entity\Utilisateur::ROLE_RENFORT)) {
                $context['filters']['type.examens'] = false;
                $context['filters']['type.pedagogique'] = false;
            }

            //les référents composante ne voient que les aménagements d'examens et pédagogiques de leur composante
            if ($this->security->isGranted(\App\Entity\Utilisateur::ROLE_REFERENT_COMPOSANTE)) {
                $context['filters']['type.aideHumaine'] = false;
                /**
                 * @var \App\Entity\Utilisateur $user
                 */
                $user = $this->security->getUser();

                if (!array_key_exists('composante', $context['filters'] ?? [])) {
                    $context['filters']['composante'] = array_map(
                        fn($cmp) => Composante::COLLECTION_URI . '/' . $cmp->getId(),
                        $user->getComposantes()->toArray()
                    );
                }
            }
        }

        return parent::provide($operation, $uriVariables, $context);
    }


    #[Override] protected function getResourceClass(): string
    {
        return Amenagement::class;
    }

    #[Override] protected function getEntityClass(): string
    {
        return \App\Entity\Amenagement::class;
    }

    /**
     * @param \App\Entity\Amenagement $entity
     * @return Amenagement
     * @throws Exception
     */
    #[Override] public function transform($entity): mixed
    {
        $resource = new Amenagement();

        $resource->typeAmenagement = $this->transformerService->transform($entity->getType(), TypeAmenagement::class);

        $resource->id = $entity->getId();
        $utilisateruBeneficiaire = ($entity->getBeneficiaires())->current()->getUtilisateur();
        $resource->beneficiaire = $this->transformerService->transform($utilisateruBeneficiaire, Utilisateur::class);

        $derniereInscription = $utilisateruBeneficiaire->getDerniereInscription();
        $resource->beneficiaire->inscriptions = match ($derniereInscription) {
            null => [],
            default => [$this->transformerService->transform($derniereInscription, Inscription::class)]
        };

        $resource->uid = $utilisateruBeneficiaire->getUid();

        $resource->commentaire = $entity->getCommentaire();

        $resource->semestre1 = $entity->isSemestre1();
        $resource->semestre2 = $entity->isSemestre2();

        $resource->debut = $entity->getDebut();
        $resource->fin = $entity->getFin();

        $resource->suivi = match ($suivi = $entity->getSuivi()) {
            null => null,
            default => $this->transformerService->transform($suivi, TypeSuiviAmenagement::class)
        };

        return $resource;
    }
}
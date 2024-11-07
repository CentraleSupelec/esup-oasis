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

namespace App\Service;

use ApiPlatform\HttpCache\PurgerInterface;
use ApiPlatform\Metadata\IriConverterInterface;
use ApiPlatform\Metadata\Operation\Factory\OperationMetadataFactoryInterface;
use ApiPlatform\Metadata\UrlGeneratorInterface;
use Exception;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

readonly class HttpCacheInvalidator
{
    public function __construct(private IriConverterInterface                                                        $iriConverter,
                                private OperationMetadataFactoryInterface                                            $operationMetadataFactory,
                                #[Autowire(service: 'api_platform.http_cache.purger.souin')] private PurgerInterface $httpCachePurger,
                                private LoggerInterface                                                              $logger)
    {

    }

    public function invalidateCollectionForRessource($resource): void
    {
        // si la ressource n'a pas de GetCollection, on sort
        if (!defined(get_class($resource) . '::COLLECTION_URI')) {
            return;
        }

        $collectionUriTemplate = get_class($resource)::COLLECTION_URI;

        $collectionOperation = $this->operationMetadataFactory->create($collectionUriTemplate, []);
        $collectionUri = $this->iriConverter->getIriFromResource($resource, UrlGeneratorInterface::ABS_PATH, $collectionOperation);
        try {
            $this->httpCachePurger->purge([$collectionUri]);
            $this->logger->info("Invalidated collection for ressource : $collectionUri");
        } catch (Exception) {
            //sans cache disponible on évite de planter...
        }
    }

    public function invalidateRessource($resource): void
    {
        $itemIri = $this->iriConverter->getIriFromResource($resource);
        try {
            $this->httpCachePurger->purge([$itemIri]);
            $this->logger->info("Invalidated item for ressource : $itemIri");
        } catch (Exception) {
            //sans cache disponible on évite de planter...
        }
    }

}
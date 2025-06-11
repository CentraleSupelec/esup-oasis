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
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\IriConverterInterface;
use ApiPlatform\Metadata\Resource\Factory\ResourceMetadataCollectionFactoryInterface;
use ApiPlatform\Metadata\ResourceClassResolverInterface;
use ApiPlatform\Metadata\UrlGeneratorInterface;
use Exception;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

readonly class HttpCacheInvalidator
{
    public function __construct(private IriConverterInterface                                                        $iriConverter,
                                private ResourceClassResolverInterface                                               $resourceClassResolver,
                                private ResourceMetadataCollectionFactoryInterface                                   $resourceMetadataCollectionFactory,
                                #[Autowire(service: 'api_platform.http_cache.purger.souin')] private PurgerInterface $httpCachePurger,
                                private LoggerInterface                                                              $logger)
    {

    }

    public function invalidateCollectionForRessource($resource): void
    {
        $this->invalidate($resource, GetCollection::class);
    }

    public function invalidateRessource($resource): void
    {
        $this->invalidate($resource, Get::class);
    }


    private function invalidate(object $resource, string $type): void
    {
        $resourceClass = $this->resourceClassResolver->getResourceClass($resource);
        $resourceMetadataCollection = $this->resourceMetadataCollectionFactory->create($resourceClass);

        foreach ($resourceMetadataCollection as $resourceMetadata) {
            foreach ($resourceMetadata->getOperations() ?? [] as $operation) {
                if ($operation instanceof $type) {
                    $targetUri = $this->iriConverter->getIriFromResource($resource, UrlGeneratorInterface::ABS_PATH, $operation);
                    try {
                        $this->httpCachePurger->purge([$targetUri]);
                        $this->logger->info("Invalidated uri for ressource : $targetUri");
                    } catch (Exception) {
                        //sans cache disponible, on évite de planter...
                    }
                }
            }
        }

    }

}
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

namespace App\MessageHandler;

use ApiPlatform\Doctrine\Orm\Util\QueryNameGenerator;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\IriConverterInterface;
use App\ApiResource\Amenagement;
use App\ApiResource\BeneficiaireProfil;
use App\ApiResource\Inscription;
use App\Entity\Beneficiaire;
use App\Entity\Bilan;
use App\Entity\Fichier;
use App\Entity\Utilisateur;
use App\Filter\BilanActiviteIntervalleFilter;
use App\Filter\DerniereInscriptionSearchFilter;
use App\Filter\NestedFieldSearchFilter;
use App\Filter\NestedUtilisateurFilter;
use App\Message\BilanActiviteDemandeMessage;
use App\Repository\BilanRepository;
use App\Repository\FichierRepository;
use App\Repository\UtilisateurRepository;
use App\Serializer\BilanActiviteNormalizer;
use App\Serializer\Encoder\CustomCsvEncoder;
use App\Service\FileStorage\StorageProviderError;
use App\Service\FileStorage\StorageProviderInterface;
use App\State\Utilisateur\UtilisateurManager;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;
use Exception;
use Psr\Log\LoggerInterface;
use Symfony\Component\Clock\ClockAwareTrait;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Messenger\Message\RedispatchMessage;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\DelayStamp;

#[AsMessageHandler(handles: BilanActiviteDemandeMessage::class)]
readonly class BilanActiviteDemandeMessageHandler
{
    use ClockAwareTrait;

    private QueryNameGeneratorInterface $queryNameGenerator;

    public function __construct(
        private BilanRepository $bilanRepository,
        private FichierRepository $fichierRepository,
        private UtilisateurRepository $utilisateurRepository,
        private UtilisateurManager $utilisateurManager,
        private IriConverterInterface $iriConverter,
        private ManagerRegistry $managerRegistry,
        private LoggerInterface $logger,
        private StorageProviderInterface $storageProvider,
        private MessageBusInterface $messageBus,
    ) {
        $this->queryNameGenerator = new QueryNameGenerator();
    }

    /**
     * Récupérer les données, enregistrer en csv et mettre à jour le Bilan
     *
     * @param BilanActiviteDemandeMessage $message
     * @return void
     */
    public function __invoke(BilanActiviteDemandeMessage $message): void
    {
        $bilanEntity = $this->bilanRepository->find($message->getIdBilan());

        if (null === $bilanEntity) {
            $this->logger->error('Bilan demandé non présent en base.');
            return;
        }

        $queryBuilder = $this->utilisateurRepository->createQueryBuilder('u');

        $this->applyFilters($bilanEntity, $queryBuilder);

        $utilisateursConcernes = $queryBuilder->getQuery()->getResult();

        /**
         * On construit le BilanActivite à partir des données récupérees
         */
        $bilan = new BilanActivite();
        $bilan->debut = $bilanEntity->getDebut();
        $bilan->fin = $bilanEntity->getFin();
        $this->initBeneficiaires($utilisateursConcernes, $bilan);

        /**
         * On le normalize / encode
         */
        $normalizer = new BilanActiviteNormalizer();
        $normalized = $normalizer->normalize($bilan, 'customcsv');

        $encoder = new CustomCsvEncoder();
        $csvData = $encoder->encode($normalized, 'customcsv');

        /**
         * Puis on enregistre le résultat!
         */
        $filename = 'BilanActivite.csv';
        $mimeType = 'text/csv';
        try {
            $metadata = $this->storageProvider->store($csvData, $filename, $mimeType);
        } catch (StorageProviderError $e) {
            $this->logger->error($e->getMessage());
            $this->logger->info($e->getTraceAsString());
            $delay = new DelayStamp(300000); //on réessaye dans 5 minutes
            $this->messageBus->dispatch(new RedispatchMessage($message), [$delay]);
            return;
        }
        $fichier = new Fichier();
        $fichier->setBilan($bilanEntity);
        $fichier->setNom($filename);
        $fichier->setTypeMime($mimeType);
        $fichier->setMetadata($metadata);
        $fichier->setProprietaire($bilanEntity->getDemandeur());
        $bilanEntity->setDateGeneration($this->now());

        $this->fichierRepository->save($fichier, true);
    }

    /**
     * @param Bilan        $bilan
     * @param QueryBuilder $queryBuilder
     * @return void
     */
    protected function applyFilters(Bilan $bilan, QueryBuilder $queryBuilder): void
    {
        $filters = [];
        $context = [];

        //filtre sur l'intervalle, obligatoire
        $filters[BilanActiviteIntervalleFilter::class] = new BilanActiviteIntervalleFilter(
            $this->managerRegistry,
            $this->logger,
        );
        $context['filters'][BilanActiviteIntervalleFilter::PROPERTY] = [$bilan->getDebut(), $bilan->getFin()];

        //filtres optionnels
        foreach ($bilan->getParametres() as $param => $valeurs) {
            if (null === $valeurs) {
                continue;
            }
            $filter = match ($param) {
                'gestionnaires' => new NestedUtilisateurFilter(
                    $this->iriConverter,
                    $this->managerRegistry,
                    $this->logger,
                    properties: ['gestionnaires' => 'beneficiaires.gestionnaire'],
                ),
                'profils' => new NestedFieldSearchFilter(
                    $this->managerRegistry,
                    $this->iriConverter,
                    $this->logger,
                    properties: [
                        'profils' => [
                            'type' => 'relation',
                            'mapping' => 'beneficiaires.profil',
                            'desc' => 'profil du bénéficiaire',
                        ],
                    ],
                ),
                'formations', 'composantes' => new DerniereInscriptionSearchFilter(
                    $this->managerRegistry,
                    $this->iriConverter,
                    $this->logger,
                    properties: [
                        'composante' => [
                            'type' => 'relation',
                            'mapping' => 'inscriptions.formation.composante',
                            'desc' => 'Composante',
                        ],
                        'formation' => [
                            'type' => 'relation',
                            'mapping' => 'inscriptions.formation',
                            'desc' => 'Formation',
                        ],
                    ],
                ),
            };

            if (!array_key_exists($filter::class, $filters)) {
                $filters[$filter::class] = $filter;
            }

            $context['filters'][$param] = $valeurs;
        }

        foreach ($filters as $filter) {
            $filter->apply($queryBuilder, $this->queryNameGenerator, Utilisateur::class, context: $context);
        }
    }

    /**
     * @param Utilisateur[] $utilisateursConcernes
     * @param BilanActivite $bilan
     * @return void
     * @throws Exception
     */
    protected function initBeneficiaires(mixed $utilisateursConcernes, BilanActivite $bilan): void
    {
        $bilan->beneficiaires = [];
        foreach ($utilisateursConcernes as $utilisateur) {
            $user = new UtilisateurBilanActivite();

            if (null === $utilisateur->getNumeroAnonyme()) {
                //on génère un numéro
                $utilisateur = $this->utilisateurManager->initNumeroAnonyme($utilisateur);
            }
            $user->numero = $utilisateur->getNumeroAnonyme();
            $user->anneeNaissance = (int) ($utilisateur->getDateNaissance()?->format('Y') ?? 0);
            $user->sexe = $utilisateur->getGenre();
            $derniereInscription = $utilisateur->getDerniereInscription();
            $user->derniereInscription = match ($derniereInscription) {
                null => null,
                default => new Inscription($derniereInscription),
            };

            $user->regimeInscription = $utilisateur->getStatutEtudiant();

            $beneficiaires = $utilisateur->getBeneficiairesParIntervalle($bilan->debut, $bilan->fin);
            if (count($beneficiaires) > 0) {
                usort($beneficiaires, fn(Beneficiaire $a, Beneficiaire $b) => $a->getDebut() <=> $b->getDebut());
                foreach ($beneficiaires as $beneficiaire) {
                    $user->profils[] = new BeneficiaireProfil($beneficiaire);
                }
                $user->gestionnaire = end($user->profils)?->gestionnaire;
            }

            foreach ($utilisateur->getAmenagementsParIntervalle($bilan->debut, $bilan->fin) as $amenagement) {
                $user->amenagements[] = new Amenagement($amenagement);
            }

            $user->nbEntretiens = $utilisateur->countEntretiens($bilan->debut, $bilan->fin);

            $bilan->beneficiaires[] = $user;
        }
    }
}

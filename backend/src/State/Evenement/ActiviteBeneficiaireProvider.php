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

namespace App\State\Evenement;

use ApiPlatform\Doctrine\Orm\State\CollectionProvider;
use ApiPlatform\Metadata\IriConverterInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\ActiviteBeneficiaire;
use App\ApiResource\ActiviteUtilisateur;
use App\ApiResource\Campus;
use App\ApiResource\TauxHoraire;
use App\ApiResource\TypeEvenement;
use App\ApiResource\Utilisateur;
use App\Entity\Evenement;
use App\Entity\InterventionForfait;

readonly class ActiviteBeneficiaireProvider implements ProviderInterface
{
    public function __construct(
        private CollectionProvider $provider,
        private IriConverterInterface $iriConverter,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $evenementOperation = (clone $operation)->withClass(Evenement::class)->withPaginationEnabled(false);

        $interventionsOperation = (clone $operation)
            ->withClass(InterventionForfait::class)
            ->withStateOptions(null)
            ->withPaginationEnabled(false);

        if (array_key_exists('filters', $context) && array_key_exists('beneficiaires', $context['filters'])) {
            $utilisateurIRIs = $context['filters']['beneficiaires'];
            if (!is_array($context['filters']['beneficiaires'])) {
                $utilisateurIRIs = [$utilisateurIRIs];
            }
            $utilisateursDemandesIds = array_map(
                fn($iri) => $this->iriConverter->getResourceFromIri($iri)->uid,
                $utilisateurIRIs,
            );
        }

        /**
         * @var InterventionForfait[] $interventions
         */
        $interventions = $this->provider->provide($interventionsOperation, $uriVariables, $context);

        /**
         * @var Evenement[] $evenements
         */
        $context['filters']['exists']['dateAnnulation'] = false; //on ne tient pas compte des événements annulés !
        $evenements = $this->provider->provide($evenementOperation, $uriVariables, $context);

        $results = [];
        foreach ([...$evenements, ...$interventions] as $item) {
            $tauxEntity = $item->getType()->getTauxHoraireActifPourDate(match (true) {
                $item instanceof Evenement => $item->getDebut(),
                $item instanceof InterventionForfait => $item->getPeriode()->getFin(),
                default => null,
            });
            if (null !== $tauxEntity) {
                $taux = new TauxHoraire(entity: $tauxEntity);
            }

            $utilisateursTraites = [];
            foreach ($item->getBeneficiaires() as $beneficiaire) {
                $idUtilisateur = $beneficiaire->getUtilisateur()->getId();
                if (
                    isset($utilisateursDemandesIds)
                    && !in_array($beneficiaire->getUtilisateur()->getUid(), $utilisateursDemandesIds)
                ) {
                    continue;
                }
                $campusId = $item instanceof InterventionForfait ? 'undefined' : $item->getCampus()->getId();
                if (!in_array($idUtilisateur, $utilisateursTraites)) { //on peut avoir 2 beneficiaires pour 1 utilisateur!
                    $key =
                        $idUtilisateur
                        . '#'
                        . $campusId
                        . '#'
                        . $item->getType()->getId()
                        . '#'
                        . ($taux->id ?? 'undefined');
                    if (!array_key_exists($key, $results)) {
                        $results[$key] = new ActiviteBeneficiaire(
                            id: $key,
                            utilisateur: new Utilisateur(entity: $beneficiaire->getUtilisateur()),
                            campus: $item instanceof Evenement ? new Campus(entity: $item->getCampus()) : null,
                            type: new TypeEvenement(entity: $item->getType()),
                            tauxHoraire: $taux ?? null,
                        );
                    }
                    $results[$key]->nbEvenements++;
                    $results[$key]->nbHeures = bcadd($results[$key]->nbHeures, $item->getDureeEnHeures());
                    $utilisateursTraites[] = $idUtilisateur;
                }
            }
        }

        //On trie le résultat
        usort($results, ActiviteUtilisateur::compare(...));

        //pagination? Peu probable que ce soit nécessaire...
        return $results;
    }
}

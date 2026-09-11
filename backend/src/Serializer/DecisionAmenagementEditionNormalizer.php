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

namespace App\Serializer;

use App\ApiResource\DecisionAmenagementExamens;
use App\Entity\Composante;
use App\Entity\Utilisateur;
use App\Repository\ParametreRepository;
use App\State\DecisionAmenagementExamens\DecisionAmenagementManager;
use App\Util\AnneeUniversitaireAwareTrait;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

readonly class DecisionAmenagementEditionNormalizer implements NormalizerInterface
{
    use AnneeUniversitaireAwareTrait;

    public function __construct(
        private DecisionAmenagementManager $decisionAmenagementManager,
        private ParametreRepository $parametreRepository,
    ) {}

    /**
     * @param DecisionAmenagementExamens $object
     * @param string|null $format
     * @param array $context
     * @return array
     * @noinspection PhpParameterNameChangedDuringInheritanceInspection
     */
    public function normalize(mixed $object, ?string $format = null, array $context = []): array
    {
        //On génère un tableau contenant l'état de la décision + tous les aménagements actifs,
        //regroupés par catégorie (études / aides humaines / examens).
        $data[0] = $object;

        $entity = $this->decisionAmenagementManager->parUidEtAnnee($object->uid, $object->annee);
        $amenagementsActifs = $entity->getBeneficiaire()->getAmenagementsActifs();

        $data['amenagements'] = $amenagementsActifs;
        $data['amenagementsParCategorie'] = $this->groupByCategorie($amenagementsActifs);
        $data['observations'] = $entity->getObservations();
        $data['dateAvisMedecin'] = $entity->getDateAvisMedecin();

        $data['annee'] = $this->anneeDuJour($this->now());
        $codeComposante = $this->composanteBeneficiaire($entity->getBeneficiaire())?->getCodeExterne();
        $data['president']['qualite'] = $this->parametreSignataire('PRESIDENT_QUALITE', $codeComposante);
        $data['president']['nom'] = $this->parametreSignataire('PRESIDENT_NOM', $codeComposante);

        return $data;
    }

    /**
     * Valeur d'un paramètre signataire, spécifique à la composante lorsqu'un paramètre
     * suffixé par son code externe existe, avec repli sur la valeur globale de l'établissement.
     */
    private function parametreSignataire(string $cle, ?string $codeComposante): ?string
    {
        if ($codeComposante !== null && $codeComposante !== '') {
            $valeurComposante = $this->valeurParametre($cle . '_' . $codeComposante);
            if ($valeurComposante !== null && $valeurComposante !== '') {
                return $valeurComposante;
            }
        }

        return $this->valeurParametre($cle);
    }

    private function valeurParametre(string $cle): ?string
    {
        return $this->parametreRepository
            ->findOneBy(['cle' => $cle])
            ?->getValeurCourante()
            ?->getValeur();
    }

    /**
     * Composante de l'inscription en cours du bénéficiaire, ou null s'il n'en a aucune.
     */
    private function composanteBeneficiaire(?Utilisateur $beneficiaire): ?Composante
    {
        if ($beneficiaire === null) {
            return null;
        }

        foreach ($beneficiaire->getInscriptionsEnCours() as $inscription) {
            $composante = $inscription->getFormation()?->getComposante();
            if ($composante !== null) {
                return $composante;
            }
        }

        return null;
    }

    public function supportsNormalization(mixed $data, ?string $format = null, array $context = []): bool
    {
        if (!$data instanceof DecisionAmenagementExamens || $format != 'pdf') {
            return false;
        }

        return true;
    }

    function getSupportedTypes(?string $format): array
    {
        if (!in_array($format, ['pdf'])) {
            return [];
        }

        return [DecisionAmenagementExamens::class => false];
    }

    /**
     * @param iterable<\App\Entity\Amenagement> $amenagements
     * @return array{etudes: list<\App\Entity\Amenagement>, aidesHumaines: list<\App\Entity\Amenagement>, examens: list<\App\Entity\Amenagement>}
     */
    public function groupByCategorie(iterable $amenagements): array
    {
        $groupes = ['etudes' => [], 'aidesHumaines' => [], 'examens' => []];
        foreach ($amenagements as $amenagement) {
            $type = $amenagement->getType();
            if ($type === null) {
                continue;
            }
            if ($type->isPedagogique()) {
                $groupes['etudes'][] = $amenagement;
            }
            if ($type->isAideHumaine()) {
                $groupes['aidesHumaines'][] = $amenagement;
            }
            if ($type->isExamens()) {
                $groupes['examens'][] = $amenagement;
            }
        }

        return $groupes;
    }
}

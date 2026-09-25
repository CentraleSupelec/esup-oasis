<?php

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 */

namespace App\Service\Signature;

use App\Entity\DecisionAmenagementExamens;
use DateTimeImmutable;
use Exception;
use Normalizer;

/**
 * Dérive l'état de signature de l'historique FAST, qui n'expose pas d'état courant.
 * Libellés comparés sans accents ni casse, libellés inconnus ignorés. La fin du circuit
 * est le classement, pas le nombre de « Signé », qui dépend du circuit.
 */
class EtatSignatureDeriver
{
    // terminaux négatifs ; le refus peut porter un suffixe d'étape (« Refusé à l'étape OTP »)
    private const string PREFIXE_REFUS = 'refus';
    private const string SIGNATURE_REJETEE = 'signature rejetee';
    private const string VISA_DESAPPROUVE = 'visa desapprouve';
    private const string CLASSE_INTERROMPU = 'classe (interrompu)';
    private const string DOCUMENT_REMPLACE = 'document remplace';
    private const string ECHEC_ENVOI = "echec de l'envoi a fast";
    private const string ECHEC_TRAITEMENT = 'echec du traitement fast';

    // terminaux positifs
    private const string CLASSE = 'classe';
    private const string ARCHIVE = 'archive';

    private const string SIGNE = 'signe';

    /**
     * Date du dernier « Signé », à défaut celle du classement (circuit de visa seul).
     *
     * @param array<int, array{stateName: string, date: string}> $historique dans l'ordre chronologique
     */
    public function dateDeSignature(array $historique): ?DateTimeImmutable
    {
        $derniereSignature = null;
        $classement = null;

        foreach ($historique as $entree) {
            $normalise = $this->normaliser($entree['stateName'] ?? '');
            // « Signé à l'étape 2 » compte, « Signature rejetée » non
            if (self::SIGNE === $normalise || str_starts_with($normalise, self::SIGNE . ' ')) {
                $derniereSignature = $entree['date'] ?? null;
            } elseif (null === $classement && (self::CLASSE === $normalise || self::ARCHIVE === $normalise)) {
                $classement = $entree['date'] ?? null;
            }
        }

        return $this->lireDate($derniereSignature ?? $classement);
    }

    /**
     * @param string[] $libelles les `stateName` de l'historique FAST, dans l'ordre chronologique
     *
     * @return string une constante DecisionAmenagementExamens::ETAT_SIGNATURE_*
     */
    public function deriver(array $libelles): string
    {
        $erreur = false;

        foreach ($libelles as $libelle) {
            $normalise = $this->normaliser($libelle);

            // Les issues négatives priment sur toute progression antérieure.
            if (str_starts_with($normalise, self::PREFIXE_REFUS)
                || self::SIGNATURE_REJETEE === $normalise
                || self::VISA_DESAPPROUVE === $normalise) {
                return DecisionAmenagementExamens::ETAT_SIGNATURE_REFUSEE;
            }

            if (self::CLASSE_INTERROMPU === $normalise) {
                return DecisionAmenagementExamens::ETAT_SIGNATURE_EXPIREE;
            }

            if (self::DOCUMENT_REMPLACE === $normalise) {
                return DecisionAmenagementExamens::ETAT_SIGNATURE_REMPLACEE;
            }

            if (self::CLASSE === $normalise || self::ARCHIVE === $normalise) {
                return DecisionAmenagementExamens::ETAT_SIGNATURE_SIGNEE;
            }

            if (self::ECHEC_ENVOI === $normalise || self::ECHEC_TRAITEMENT === $normalise) {
                $erreur = true;
            }
        }

        return match ($erreur) {
            true => DecisionAmenagementExamens::ETAT_SIGNATURE_ERREUR,
            false => DecisionAmenagementExamens::ETAT_SIGNATURE_EN_SIGNATURE,
        };
    }

    private function normaliser(string $libelle): string
    {
        $epure = trim($libelle);
        $decompose = Normalizer::normalize($epure, Normalizer::FORM_D);

        if (false === $decompose) {
            return strtolower($epure);
        }

        return strtolower(preg_replace('/\p{Mn}+/u', '', $decompose) ?? $epure);
    }

    /**
     * Date d'une entrée d'historique ; null si elle est absente ou illisible, plutôt
     * que d'inventer une date de signature.
     */
    private function lireDate(?string $date): ?DateTimeImmutable
    {
        if (null === $date || '' === trim($date)) {
            return null;
        }

        try {
            return new DateTimeImmutable($date);
        } catch (Exception) {
            return null;
        }
    }
}

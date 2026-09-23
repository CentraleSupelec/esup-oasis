<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

namespace App\Twig;

use Twig\Attribute\AsTwigFilter;

final class ArticleExtension
{
    #[AsTwigFilter('articlePartitif')]
    public function partitif(string $sujet, string $defini): string
    {
        return match ($this->articleSeul($defini)) {
            'le' => 'du ' . $sujet,
            'la' => 'de la ' . $sujet,
            default => "de l'" . $sujet,
        };
    }

    #[AsTwigFilter('articleDefini')]
    public function defini(string $sujet, string $defini): string
    {
        return match (strtolower($this->articleSeul($defini))) {
            'le', 'la' => $defini . ' ' . $sujet,
            default => $defini . $sujet,
        };
    }

    #[AsTwigFilter('articleDefiniContracte')]
    public function definiContracte(string $sujet, string $defini): string
    {
        return match ($this->articleSeul($defini)) {
            'le' => 'au ' . $sujet,
            'la' => 'à la ' . $sujet,
            default => "à l'" . $sujet,
        };
    }

    /**
     * On gère le cas où l'établissement met "le TRUC" dans le champ APP_ETABLISSEMENT_ARTICLE au lieu de "le"
     */
    private function articleSeul(string $article): string
    {
        if (strlen($article) > 2) {
            return substr($article, 0, 2);
        }
        return $article;
    }
}

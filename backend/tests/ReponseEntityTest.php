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

namespace App\Tests;

use App\Entity\CategorieAmenagement;
use App\Entity\ClubSportif;
use App\Entity\Reponse;
use PHPUnit\Framework\TestCase;

class ReponseEntityTest extends TestCase
{
    public function testMajCategoriesAmenagementMetAJourLesCategoriesSansImpactSurLesClubs(): void
    {
        $reponse = new Reponse();

        $cat1 = new CategorieAmenagement()->setLibelle('cat1');
        $cat2 = new CategorieAmenagement()->setLibelle('cat2');
        $cat3 = new CategorieAmenagement()->setLibelle('cat3');

        $reponse->addCategoriesAmenagement($cat1);
        $reponse->addCategoriesAmenagement($cat2);
        $reponse->addCategoriesAmenagement($cat3);

        $club1 = new ClubSportif();
        $club2 = new ClubSportif();

        $reponse->addClub($club1);
        $reponse->addClub($club2);

        $reponse->majCategoriesAmenagement([$cat1, $cat3]);

        $this->assertTrue($reponse->getCategoriesAmenagement()->contains($cat1));
        $this->assertTrue($reponse->getCategoriesAmenagement()->contains($cat3));
        $this->assertFalse($reponse->getCategoriesAmenagement()->contains($cat2));

        $this->assertTrue($reponse->getClubs()->contains($club1));
        $this->assertTrue($reponse->getClubs()->contains($club2));
    }

    public function testMajCategoriesAmenagementAvecOptionsVides(): void
    {
        $reponse = new Reponse();

        $cat1 = new CategorieAmenagement()->setLibelle('cat1');
        $cat2 = new CategorieAmenagement()->setLibelle('cat2');

        $reponse->addCategoriesAmenagement($cat1);
        $reponse->addCategoriesAmenagement($cat2);

        $reponse->majCategoriesAmenagement([]);

        $this->assertCount(0, $reponse->getCategoriesAmenagement());
    }

    public function testMajCategoriesAmenagementRetourneInstance(): void
    {
        $reponse = new Reponse();
        $this->assertSame($reponse, $reponse->majCategoriesAmenagement([]));
    }
}

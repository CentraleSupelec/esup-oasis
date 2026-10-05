<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\Tests\State\ProfilBeneficiaire;

use ApiPlatform\Metadata\Patch;
use App\ApiResource\ProfilBeneficiaire as ProfilResource;
use App\Entity\ProfilBeneficiaire;
use App\Repository\ProfilBeneficiaireRepository;
use App\State\DecisionAmenagementExamens\DecisionAmenagementManager;
use App\State\ProfilBeneficiaire\PatchProfilBeneficiaireProcessor;
use PHPUnit\Framework\TestCase;

final class PatchProfilBeneficiaireProcessorTest extends TestCase
{
    public function testSavingAProfilInvalidatesItsPendingDecisions(): void
    {
        $entity = $this->profil();
        $data = new ProfilResource($entity);
        $data->libelle = 'Handicap';
        $data->avisMedicalRequis = true;

        $manager = $this->createMock(DecisionAmenagementManager::class);
        $manager->expects(self::once())->method('invaliderDecisionsNonEnvoyees')->with($entity);

        $this->processor($entity, $manager)->process($data, new Patch(), ['id' => 1]);

        self::assertSame('Handicap', $entity->getLibelle());
        self::assertTrue($entity->isAvisMedicalRequis());
    }

    private function profil(): ProfilBeneficiaire
    {
        return new ProfilBeneficiaire()
            ->setLibelle('Handicap permanent')
            ->setActif(true)
            ->setAvecTypologie(true)
            ->setAvisMedicalRequis(false);
    }

    private function processor(ProfilBeneficiaire $entity, DecisionAmenagementManager $manager): PatchProfilBeneficiaireProcessor
    {
        $repository = $this->createMock(ProfilBeneficiaireRepository::class);
        $repository->method('find')->with(1)->willReturn($entity);
        $repository->expects(self::once())->method('save')->with($entity, true);

        return new PatchProfilBeneficiaireProcessor($repository, $manager);
    }
}

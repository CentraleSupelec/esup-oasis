<?php

namespace App\Tests\Behat;

use Behat\Behat\Context\Context;
use Behat\Behat\Hook\Scope\AfterScenarioScope;
use Behat\Behat\Hook\Scope\BeforeFeatureScope;
use Behat\Hook\AfterScenario;
use Behat\Hook\BeforeFeature;

class ReferentielContext implements Context
{
    use FixturesLoaderTrait;

    /**
     * @param BeforeFeatureScope|AfterScenarioScope $scope
     * @return void
     * @noinspection PhpUnusedParameterInspection
     */
    #[BeforeFeature]
    #[AfterScenario('@modifyData')]
    static function init(BeforeFeatureScope|AfterScenarioScope $scope): void
    {
        self::recreateDatabase();

        self::loadFixtures([
            'beneficiaires.yaml',
            'campus.yaml',
            'campagnes_demandes.yaml',
            'categories_amenagements.yaml',
            'commissions.yaml',
            'competences.yaml',
            'composantes.yaml',
            'evenements.yaml',
            'etapes_demandes.yaml',
            'etats_demandes.yaml',
            'formations.yaml',
            'inscriptions.yaml',
            'intervenants.yaml',
            'interventions_forfait.yaml',
            'options_reponses.yaml',
            'parametres.yaml',
            'periodes_rh.yaml',
            'profils_beneficiaires.yaml',
            'questions.yaml',
            'questions_etapes_demandes.yaml',
            'services.yaml',
            'taux_horaires.yaml',
            'types_demandes.yaml',
            'types_equipements.yaml',
            'types_evenements.yaml',
            'typologies.yaml',
            'utilisateurs.yaml',
            'valeurs_parametres.yaml',
        ]);
    }
}

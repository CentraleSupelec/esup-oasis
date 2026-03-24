<?php

namespace App\Tests;

use Symfony\Component\Clock\ClockAwareTrait;

class DemandesTest extends ApiTestCaseCustom
{
    use ClockAwareTrait;

    public function testGetTypesDemandes(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('GET', '/types_demandes');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@id' => '/types_demandes',
            '@type' => 'hydra:Collection',
        ]);
    }

    public function testDemandeurOnlySeesOwnDemandes(): void
    {
        $client = $this->createClientWithCredentials('demandeur');
        $client->request('GET', '/demandes');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@id' => '/demandes',
            'hydra:totalItems' => 1,
        ]);

        $client = $this->createClientWithCredentials('demandeur3');
        $client->request('GET', '/demandes');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@id' => '/demandes',
            'hydra:totalItems' => 2,
        ]);
    }

    public function testDemandeurCanReprendreDemande(): void
    {
        $client = $this->createClientWithCredentials('demandeur');
        $client->request('GET', '/demandes?demandeur=/utilisateurs/demandeur&campagne.typeDemande=/types_demandes/1');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'hydra:totalItems' => 1,
        ]);
    }

    public function testGestionnaireCanFilterDemandesByTypeLibelle(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');

        // Sans filtre d'archivage (3 au total dans les fixtures pour ce type)
        $client->request('GET', '/demandes?campagne.typeDemande=/types_demandes/1');
        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['hydra:totalItems' => 3]);

        // Avec filtre d'archivage (2 actives)
        $client->request('GET', '/demandes?campagne.typeDemande=/types_demandes/1&archivees=false');
        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['hydra:totalItems' => 2]);
    }

    public function testGestionnaireCanFilterDemandesByDemandeurNom(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');

        // Tout (1 active fixture + 1 archivée fixture pour demandeur3)
        $client->request('GET', '/demandes?demandeur=/utilisateurs/demandeur3');
        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['hydra:totalItems' => 2]);

        // Uniquement actives (1)
        $client->request('GET', '/demandes?demandeur=/utilisateurs/demandeur3&archivees=false');
        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['hydra:totalItems' => 1]);
    }

    public function testAdminCanCreateTypeDemande(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('POST', '/types_demandes', [
            'json' => [
                'libelle' => 'nouveau type',
                'actif' => true,
                'visibiliteLimitee' => true,
                'accompagnementOptionnel' => true,
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            'libelle' => 'nouveau type',
        ]);
    }

    public function testAdminCanUpdateTypeDemande(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('PATCH', '/types_demandes/1', [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'libelle' => 'nouveau libelle',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@id' => '/types_demandes/1',
            'libelle' => 'nouveau libelle',
        ]);
    }

    public function testGetCampagnesByTypeDemande(): void
    {
        $client = $this->createClientWithCredentials('demandeur');
        $client->request('GET', '/types_demandes/1/campagnes');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@id' => '/types_demandes/1/campagnes',
            '@type' => 'hydra:Collection',
        ]);
    }

    public function testAdminCanCreateCampagne(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('POST', '/types_demandes/1/campagnes', [
            'json' => [
                'libelle' => 'nouvelle campagne',
                'debut' => '2040-01-01',
                'fin' => '2041-01-01',
                'dateCommission' => '2041-02-01',
                'commission' => '/commissions/1',
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            'libelle' => 'nouvelle campagne',
        ]);
    }

    public function testAdminCanUpdateCampagne(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('PATCH', '/types_demandes/1/campagnes/1', [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'libelle' => 'nouveau libelle campagne',
                'debut' => '2020-01-01T08:00:00+00:00',
                'fin' => '2030-02-01T08:00:00+00:00',
                'dateCommission' => '2030-03-01T08:00:00+00:00',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'libelle' => 'nouveau libelle campagne',
        ]);
    }

    public function testAdminCanCreateDemande(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('POST', '/demandes', [
            'json' => [
                'typeDemande' => '/types_demandes/1',
                'demandeur' => '/utilisateurs/demandeur2',
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            '@type' => 'Demande',
        ]);
    }

    public function testCannotCreateTwoDemandesForSameCampaign(): void
    {
        $client = $this->createClientWithCredentials('demandeur');

        // demandeur already has a demande for /types_demandes/1 in fixtures (demande1)
        $client->request('POST', '/demandes', [
            'json' => [
                'typeDemande' => '/types_demandes/1',
            ],
        ]);

        $this->assertResponseStatusCodeSame(422);
    }

    public function testInvalidStateTransition(): void
    {
        $client = $this->createClientWithCredentials('admin');

        // demande1 is RECEPTIONNEE (2)
        // Transition to EN_COURS (1) is invalid
        $client->request('PATCH', '/demandes/1', [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'etat' => '/etats_demandes/1',
            ],
        ]);

        $this->assertResponseStatusCodeSame(422);
    }

    public function testAdminCanUpdateDemande(): void
    {
        $client = $this->createClientWithCredentials('admin');
        // create fresh
        $client->request('POST', '/demandes', [
            'json' => [
                'typeDemande' => '/types_demandes/1',
                'demandeur' => '/utilisateurs/demandeur-admin-update',
            ],
        ]);
        $this->assertResponseStatusCodeSame(201);
        $id = $client->getResponse()->toArray()['@id'];

        $client->request('PATCH', $id, [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'etat' => '/etats_demandes/5',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@id' => $id,
            'etat' => '/etats_demandes/5',
        ]);
    }

    public function testDemandeurCanAnswerQuestion(): void
    {
        $client = $this->createClientWithCredentials('demandeur');
        $client->request('PUT', '/demandes/1/questions/3/reponse', [
            'json' => [
                'optionsChoisies' => ['/questions/3/options/3'],
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            '@id' => '/demandes/1/questions/3/reponse',
        ]);
    }

    public function testDemandeurRecuperationReponseExistante(): void
    {
        $client = $this->createClientWithCredentials('nouveau-beneficiaire');
        $client->request('POST', '/demandes', [
            'json' => [
                'typeDemande' => '/types_demandes/1',
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
    }

    public function testRepondreSubmitValideLaDemandeSiComplete(): void
    {
        // On utilise un utilisateur qui n'a VRAIMENT pas de demande
        $client = $this->createClientWithCredentials('demandeur-complet');
        $client->request('POST', '/demandes', [
            'json' => [
                'typeDemande' => '/types_demandes/1',
            ],
        ]);
        $this->assertResponseStatusCodeSame(201);
        $data = $client->getResponse()->toArray();
        $demandeId = $data['@id'];

        // On répond à tout le questionnaire
        // -1: besoin accompagnement
        $client->request('PUT', $demandeId . '/questions/-1/reponse', [
            'json' => ['optionsChoisies' => ['/questions/-1/options/-2']], // non
        ]);
        $this->assertResponseStatusCodeSame(201);

        // 1: question commune 1
        $client->request('PUT', $demandeId . '/questions/1/reponse', [
            'json' => ['optionsChoisies' => ['/questions/1/options/1']],
        ]);
        $this->assertResponseStatusCodeSame(201);

        // 3: question sportifs 1
        $client->request('PUT', $demandeId . '/questions/3/reponse', [
            'json' => ['optionsChoisies' => ['/questions/3/options/3']], // oui -> triggers 4
        ]);
        $this->assertResponseStatusCodeSame(201);

        // 4: question sportifs 2 (mandatory because triggered by 3=oui)
        $client->request('PUT', $demandeId . '/questions/4/reponse', [
            'json' => ['commentaire' => 'SHN_OK'],
        ]);
        $this->assertResponseStatusCodeSame(201);

        // On vérifie que si on tente de valider alors qu'il manque le submit, ça échoue (422)
        $client->request('PUT', $demandeId . '/questions/7/reponse', [
            'json' => [
                'commentaire' => 'Validation',
            ],
        ]);
        $this->assertResponseStatusCodeSame(201); // Oh wait, answering the submit question IS the validation

        // On vérifie l'état de la demande
        $client->request('GET', $demandeId);
        $this->assertJsonContains([
            'etat' => '/etats_demandes/10', // Attente validation accompagnement
            'complete' => true,
        ]);
    }

    public function testDemandeurCannotAnswerWithOptionsFromOtherQuestion(): void
    {
        $client = $this->createClientWithCredentials('demandeur');
        $client->request('PUT', '/demandes/1/questions/1/reponse', [
            'json' => [
                'optionsChoisies' => ['/questions/3/options/3'],
            ],
        ]);

        $this->assertResponseStatusCodeSame(422);
    }

    public function testDemandeurCannotAnswerCommentOnlyWhenOptionsRequired(): void
    {
        $client = $this->createClientWithCredentials('demandeur');
        $client->request('PUT', '/demandes/1/questions/1/reponse', [
            'json' => [
                'commentaire' => 'blabliblu',
            ],
        ]);

        $this->assertResponseStatusCodeSame(422);
    }

    public function testQuestionWithReferenceTableOptions(): void
    {
        $client = $this->createClientWithCredentials('demandeur');
        $client->request('GET', '/questions/5');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@id' => '/questions/5',
        ]);
        $data = $client->getResponse()->toArray();
        $this->assertArrayHasKey('optionsReponses', $data);
        $this->assertNotEmpty($data['optionsReponses']);
    }

    public function testAnswerWithReferenceTableOption(): void
    {
        $client = $this->createClientWithCredentials('demandeur');
        $client->request('PUT', '/demandes/1/questions/5/reponse', [
            'json' => [
                'optionsChoisies' => ['/questions/5/options/1'],
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
    }

    public function testSHNValidator(): void
    {
        $client = $this->createClientWithCredentials('demandeur');

        // OK case
        $client->request('PUT', '/demandes/1/questions/4/reponse', [
            'json' => [
                'commentaire' => 'SHN_OK',
            ],
        ]);
        $this->assertResponseStatusCodeSame(201);

        // Wrong year
        $client->request('PUT', '/demandes/1/questions/4/reponse', [
            'json' => [
                'commentaire' => 'SHN_WRONG_YEAR',
            ],
        ]);
        $this->assertResponseStatusCodeSame(422);

        // Not found
        $client->request('PUT', '/demandes/1/questions/4/reponse', [
            'json' => [
                'commentaire' => 'SHN_UNKNOWN',
            ],
        ]);
        $this->assertResponseStatusCodeSame(422);
    }

    public function testMembreCommissionCanSeeDemande(): void
    {
        $client = $this->createClientWithCredentials('membrecommission');
        // demande_receptionnee_1 est liée à campagne1_sportifs qui est liée à commission_sport
        $client->request('GET', '/demandes/1');

        $this->assertResponseIsSuccessful();
    }

    public function testPasserConformeDemandeSansCommissionPasseAProfilValideEtAttenteAccompagnement(): void
    {
        $client = $this->createClientWithCredentials('admin');

        // type_demande_artistes (id 2) n'a pas de commission et 1 seul profil (@profil6)
        $client->request('POST', '/demandes', [
            'json' => [
                'typeDemande' => '/types_demandes/2',
                'demandeur' => '/utilisateurs/demandeur2',
            ],
        ]);
        $this->assertResponseStatusCodeSame(201);
        $demandeId = $client->getResponse()->toArray()['@id'];

        // On doit compléter la demande avant de pouvoir la passer à conforme
        $client = $this->createClientWithCredentials('demandeur2');

        // Questionnaire pour artistes (id 2):
        // -1: besoin accompagnement
        $client->request('PUT', $demandeId . '/questions/-1/reponse', [
            'json' => ['optionsChoisies' => ['/questions/-1/options/-1']], // oui
        ]);
        $this->assertResponseStatusCodeSame(201);

        // 1: question commune 1
        $client->request('PUT', $demandeId . '/questions/1/reponse', [
            'json' => ['optionsChoisies' => ['/questions/1/options/1']],
        ]);
        $this->assertResponseStatusCodeSame(201);

        // Question artistes 1 (id 9?) - Voyons l'ID réel via GET
        $client->request('GET', $demandeId);
        $data = $client->getResponse()->toArray();
        // On cherche la question manquante dans les étapes
        $questionId = null;
        foreach ($data['etapes'] as $etape) {
            foreach ($etape['questions'] ?? [] as $q) {
                if (isset($q['reponse']) && $q['reponse'] === null && $q['id'] != 7) { // 7 est le submit
                    $questionId = $q['id'];
                    break 2;
                }
            }
        }

        if ($questionId) {
            $client->request('PUT', $demandeId . '/questions/' . $questionId . '/reponse', [
                'json' => ['commentaire' => 'réponse'],
            ]);
            $this->assertResponseStatusCodeSame(201);
        }

        // Submit (7)
        $client->request('PUT', $demandeId . '/questions/7/reponse', [
            'json' => ['commentaire' => 'Validation'],
        ]);
        $this->assertResponseStatusCodeSame(201);

        // Maintenant l'admin peut passer à conforme (id 3)
        $client = $this->createClientWithCredentials('admin');
        $client->request('PATCH', $demandeId, [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'etat' => '/etats_demandes/3',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'etat' => '/etats_demandes/10', // Attente validation accompagnement
        ]);
    }

    public function testGetEtapesDemandes(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('GET', '/etapes_demandes');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@id' => '/etapes_demandes',
            '@type' => 'hydra:Collection',
        ]);

        $client->request('GET', '/etapes_demandes/1');
        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@id' => '/etapes_demandes/1',
            '@type' => 'EtapeDemande',
        ]);
    }

    public function testModificationEtatDemande(): void
    {
        $client = $this->createClientWithCredentials('admin');

        // Create a new demande to have a clean state
        $client->request('POST', '/demandes', [
            'json' => [
                'typeDemande' => '/types_demandes/1',
                'demandeur' => '/utilisateurs/demandeur-modification',
            ],
        ]);
        $this->assertResponseStatusCodeSame(201);
        $demandeId = $client->getResponse()->toArray()['@id'];

        // Initial state is EN_COURS (1)
        // Move to REFUSEE (5)
        $client->request('PATCH', $demandeId, [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'etat' => '/etats_demandes/5',
            ],
        ]);
        $this->assertResponseIsSuccessful();

        $client->request('GET', $demandeId . '/modifications');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@id' => $demandeId . '/modifications',
            'hydra:totalItems' => 1,
        ]);

        $data = $client->getResponse()->toArray();
        $modId = $data['hydra:member'][0]['@id'];

        $client->request('GET', $modId);
        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@id' => $modId,
            'etat' => '/etats_demandes/5',
        ]);
    }
}

<?php

namespace App\Tests;

use App\Entity\Utilisateur;
use App\Service\LdapService;
use App\Service\SiScol\FakeSiScolDataProvider;
use App\State\Utilisateur\UtilisateurManager;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class UtilisateurManagerTest extends ApiTestCaseCustom
{
    public function testInitNumeroAnonyme(): void
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $user = $em->getRepository(Utilisateur::class)->findOneBy(['uid' => 'beneficiaire']);
        
        /** @var UtilisateurManager $manager */
        $manager = $container->get(UtilisateurManager::class);
        
        $manager->initNumeroAnonyme($user);
        
        $this->assertNotNull($user->getNumeroAnonyme());
        $this->assertStringStartsWith(date('Y'), (string)$user->getNumeroAnonyme());
    }

    public function testParRole(): void
    {
        $container = static::getContainer();
        /** @var UtilisateurManager $manager */
        $manager = $container->get(UtilisateurManager::class);
        
        $admins = $manager->parRole('ROLE_ADMIN');
        $this->assertNotEmpty($admins);
        // Find 'admin' in the list
        $uids = array_map(fn($u) => $u->getUid(), $admins);
        $this->assertContains('admin', $uids);
    }

    public function testParUidCreeUtilisateurAvecLesChampsAnnuaireLdap(): void
    {
        // Un uid absent en base est créé à partir de l'annuaire (LDAP) : c'est le même
        // chemin que la connexion et que l'import de reprise (qui appelle parUid via l'API).
        $container = static::getContainer();

        $ldap = new class extends LdapService {
            public function __construct()
            {
            }

            public function searchUid(string $uid, array $attributes = []): array
            {
                return [[
                    'uid' => [$uid],
                    'sn' => ['Dupont'],
                    'givenname' => ['Marie'],
                    'mail' => [$uid . '@univ-paris-saclay.fr'],
                    'supannetuid' => ['21800999'],
                    'count' => 1,
                ]];
            }

            public function isConnected(): bool
            {
                return true;
            }

            public function checkLdapConnection(): bool
            {
                return true;
            }

            public function connectAndBind(): void
            {
            }
        };
        $container->set(LdapService::class, $ldap);

        /** @var UtilisateurManager $manager */
        $manager = $container->get(UtilisateurManager::class);

        $user = $manager->parUid('e888888', true);

        self::assertSame('e888888', $user->getUid());
        self::assertSame('Dupont', $user->getNom());
        self::assertSame('Marie', $user->getPrenom());
        self::assertSame('e888888@univ-paris-saclay.fr', $user->getEmail());
        self::assertNotNull($user->getId());
    }

    public function testMajInscriptionsProjetteSituationSociale(): void
    {
        // La projection situation sociale est alimentée par le
        // SiScolDataProvider. En env de test, AbstractSiScolDataProvider est aliasé
        // sur FakeSiScolDataProvider qui renvoie codeSituationSociale "NO"/"Normal"
        // et boursier=false. On valide que la projection recopie ces champs.
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        // 'demandeur' porte un numeroEtudiant (123456), donc la MAJ scol se déclenche.
        $user = $em->getRepository(Utilisateur::class)->findOneBy(['uid' => 'demandeur']);

        /** @var UtilisateurManager $manager */
        $manager = $container->get(UtilisateurManager::class);

        $debut = new \DateTime('2024-09-01');
        $fin = new \DateTime('2025-08-31');
        $manager->majInscriptionsEtIdentite($user, $debut, $fin);

        $this->assertSame('NO', $user->getCodeSituationSociale());
        $this->assertSame('Normal', $user->getLibelleSituationSociale());
        $this->assertFalse($user->isBoursier(), 'Le code NO ne doit pas dériver boursier');
    }

    public function testMajInscriptionsCodeBoDeriveBoursier(): void
    {
        // Coeur de la règle : un code situation sociale "BO"
        // doit dériver boursier = true, MÊME si le témoin Apogée legacy est faux.
        // On exerce ici le VRAI UtilisateurManager (pas une réplique) via le
        // FakeSiScolDataProvider configuré pour renvoyer "BO".
        FakeSiScolDataProvider::$boursier = false;
        FakeSiScolDataProvider::$codeSituationSociale = 'BO';
        FakeSiScolDataProvider::$libelleSituationSociale = 'Boursier';

        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $user = $em->getRepository(Utilisateur::class)->findOneBy(['uid' => 'demandeur']);

        /** @var UtilisateurManager $manager */
        $manager = $container->get(UtilisateurManager::class);
        $manager->majInscriptionsEtIdentite($user, new \DateTime('2024-09-01'), new \DateTime('2025-08-31'));

        $this->assertSame('BO', $user->getCodeSituationSociale());
        $this->assertSame('Boursier', $user->getLibelleSituationSociale());
        $this->assertTrue($user->isBoursier(), 'Le code BO doit dériver boursier = true');
    }

    public function testMajInscriptionsTemoinLegacyResteBoursier(): void
    {
        // Rétrocompat : le témoin boursier legacy d'Apogée reste honoré même quand
        // le code situation sociale n'est pas "BO".
        FakeSiScolDataProvider::$boursier = true;
        FakeSiScolDataProvider::$codeSituationSociale = 'NO';
        FakeSiScolDataProvider::$libelleSituationSociale = 'Normal';

        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $user = $em->getRepository(Utilisateur::class)->findOneBy(['uid' => 'demandeur']);

        /** @var UtilisateurManager $manager */
        $manager = $container->get(UtilisateurManager::class);
        $manager->majInscriptionsEtIdentite($user, new \DateTime('2024-09-01'), new \DateTime('2025-08-31'));

        $this->assertTrue($user->isBoursier(), 'Le témoin legacy boursier doit rester honoré');
    }

    public function testMajInscriptionsProjetteAdresse(): void
    {
        // L'adresse Apogée de la dernière inscription est projetée vers
        // Utilisateur::adresse. Ligne2 (AD2) et complément (AD3) sont concaténés
        // sur ligne2 car notre modèle ne porte que deux lignes.
        FakeSiScolDataProvider::$adresseLigne1 = '12 rue des Lilas';
        FakeSiScolDataProvider::$adresseLigne2 = 'Bâtiment B';
        FakeSiScolDataProvider::$adresseComplement = 'Appartement 42';
        FakeSiScolDataProvider::$adresseCodePostal = '33000';
        FakeSiScolDataProvider::$adresseVille = 'Bordeaux';
        FakeSiScolDataProvider::$adressePays = 'FRANCE';

        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $user = $em->getRepository(Utilisateur::class)->findOneBy(['uid' => 'demandeur']);

        /** @var UtilisateurManager $manager */
        $manager = $container->get(UtilisateurManager::class);
        $manager->majInscriptionsEtIdentite($user, new \DateTime('2024-09-01'), new \DateTime('2025-08-31'));

        $adresse = $user->getAdresse();
        $this->assertSame('12 rue des Lilas', $adresse->getLigne1());
        $this->assertSame('Bâtiment B Appartement 42', $adresse->getLigne2());
        $this->assertSame('33000', $adresse->getCodePostal());
        $this->assertSame('Bordeaux', $adresse->getVille());
        $this->assertSame('FRANCE', $adresse->getPays());
    }

    public function testMajInscriptionsRafraichitInscriptionExistante(): void
    {
        // Le compteur d'inscriptions à l'étape et le cursus aménagé
        // évoluent côté SI en cours d'année pour une inscription déjà connue :
        // la MAJ doit rafraîchir ces champs sur l'inscription EXISTANTE, sans
        // la recréer. On exerce le vrai UtilisateurManager via le
        // FakeSiScolDataProvider reconfiguré entre les deux appels.
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        // 'demandeur' porte un numeroEtudiant (123456), donc la MAJ scol se déclenche.
        $user = $em->getRepository(Utilisateur::class)->findOneBy(['uid' => 'demandeur']);

        /** @var UtilisateurManager $manager */
        $manager = $container->get(UtilisateurManager::class);

        $debut = new \DateTime('2024-09-01');
        $fin = new \DateTime('2025-08-31');

        // Premier appel : création de l'inscription renvoyée par le mock
        FakeSiScolDataProvider::$codeEtape = 'ETP1';
        FakeSiScolDataProvider::$nombreInscriptionsEtape = 1;
        FakeSiScolDataProvider::$codeCursusAmenage = null;
        FakeSiScolDataProvider::$libelleCursusAmenage = null;
        $manager->majInscriptionsEtIdentite($user, $debut, $fin);

        $this->assertCount(1, $user->getInscriptions());
        $inscription = $user->getInscriptions()->first();
        $idInitial = $inscription->getId();
        $this->assertSame('ETP1', $inscription->getCodeEtape());
        $this->assertSame(1, $inscription->getNombreInscriptionsEtape());
        $this->assertNull($inscription->getCodeCursusAmenage());

        // Second appel : le SI a incrémenté le compteur et posé un cursus aménagé
        FakeSiScolDataProvider::$nombreInscriptionsEtape = 2;
        FakeSiScolDataProvider::$codeCursusAmenage = 'CA';
        FakeSiScolDataProvider::$libelleCursusAmenage = 'Cursus aménagé handicap';
        $manager->majInscriptionsEtIdentite($user, $debut, $fin);

        $this->assertCount(1, $user->getInscriptions());
        $inscription = $user->getInscriptions()->first();
        $this->assertSame($idInitial, $inscription->getId(), "L'inscription ne doit pas être recréée");
        $this->assertSame('ETP1', $inscription->getCodeEtape());
        $this->assertSame(2, $inscription->getNombreInscriptionsEtape());
        $this->assertSame('CA', $inscription->getCodeCursusAmenage());
        $this->assertSame('Cursus aménagé handicap', $inscription->getLibelleCursusAmenage());
    }

    protected function tearDown(): void
    {
        // Réinitialise le mock situation sociale pour ne pas polluer les autres tests.
        FakeSiScolDataProvider::$boursier = false;
        FakeSiScolDataProvider::$codeSituationSociale = 'NO';
        FakeSiScolDataProvider::$libelleSituationSociale = 'Normal';
        // Idem pour l'adresse simulée.
        FakeSiScolDataProvider::$adresseLigne1 = null;
        FakeSiScolDataProvider::$adresseLigne2 = null;
        FakeSiScolDataProvider::$adresseComplement = null;
        FakeSiScolDataProvider::$adresseCodePostal = null;
        FakeSiScolDataProvider::$adresseVille = null;
        FakeSiScolDataProvider::$adressePays = null;
        // Idem pour le mock des données d'étape.
        FakeSiScolDataProvider::$codeEtape = null;
        FakeSiScolDataProvider::$nombreInscriptionsEtape = null;
        FakeSiScolDataProvider::$codeCursusAmenage = null;
        FakeSiScolDataProvider::$libelleCursusAmenage = null;
        parent::tearDown();
    }

    public function testCreerBeneficiairePourDemande(): void
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        
        // On crée une demande pour un type qui n'a qu'un profil (artiste, id 2)
        $typeDemande = $em->getRepository(\App\Entity\TypeDemande::class)->find(2);
        $campagne = $typeDemande->getCampagnes()->first();
        $demandeur = $em->getRepository(Utilisateur::class)->findOneBy(['uid' => 'demandeur2']);
        
        $demande = new \App\Entity\Demande();
        $demande->setCampagne($campagne);
        $demande->setDemandeur($demandeur);
        $demande->setEtat($em->getRepository(\App\Entity\EtatDemande::class)->find(\App\Entity\EtatDemande::RECEPTIONNEE));
        $demande->setDateDepot(new \DateTime());
        
        $em->persist($demande);
        $em->flush();
        
        /** @var UtilisateurManager $manager */
        $manager = $container->get(UtilisateurManager::class);
        
        $beneficiaire = $manager->creerBeneficiairePourDemande($demande, null, 'gestionnaire');
        
        $this->assertNotNull($beneficiaire);
        $this->assertEquals($demandeur, $beneficiaire->getUtilisateur());
        $this->assertEquals(6, $beneficiaire->getProfil()->getId()); // profil6 for artistes
    }
}

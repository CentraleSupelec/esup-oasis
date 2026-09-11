<?php

declare(strict_types=1);

namespace App\Tests\Templates;

use App\Entity\Amenagement;
use App\Entity\Beneficiaire;
use App\Entity\TypeAmenagement;
use App\Entity\Utilisateur;
use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\FilesystemLoader;

final class PaehTemplateTest extends TestCase
{
    private Environment $twig;

    protected function setUp(): void
    {
        $this->twig = new Environment(new FilesystemLoader(dirname(__DIR__, 2) . '/templates'));
    }

    public function testTemplateRendersTheThreeCategorySectionsWhenAllAreNonEmpty(): void
    {
        $html = $this->renderWith(
            etudes: [$this->amenagement('Tiers-temps en cours', pedagogique: true)],
            aidesHumaines: [$this->amenagement('Preneur de notes', aideHumaine: true)],
            examens: [$this->amenagement('Tiers-temps aux examens', examens: true)],
        );

        self::assertStringContainsString('Aménagements des études :', $html);
        self::assertStringContainsString('Aides humaines :', $html);
        self::assertStringContainsString('Aménagements des examens :', $html);
        self::assertStringContainsString('class="sous-titre"', $html);

        self::assertStringContainsString('Tiers-temps en cours', $html);
        self::assertStringContainsString('Preneur de notes', $html);
        self::assertStringContainsString('Tiers-temps aux examens', $html);
    }

    public function testTemplateOnlyShowsCategoriesThatHaveAmenagements(): void
    {
        $html = $this->renderWith(
            etudes: [],
            aidesHumaines: [],
            examens: [$this->amenagement('Tiers-temps aux examens', examens: true)],
        );

        self::assertStringNotContainsString('Aménagements des études :', $html);
        self::assertStringNotContainsString('Aides humaines :', $html);
        self::assertStringContainsString('Aménagements des examens :', $html);
    }

    public function testTemplateRendersAucunAmenagementWhenNoCategoryHasAmenagements(): void
    {
        $html = $this->renderWith(etudes: [], aidesHumaines: [], examens: []);

        // Le titre de section reste, mais on affiche une mention explicite plutôt qu'un vide.
        self::assertStringContainsString("Aménagements actifs pour l'année", $html);
        self::assertStringContainsString("Aucun aménagement actif pour l'année.", $html);
        self::assertStringNotContainsString('class="sous-titre"', $html);
    }

    public function testClosingParagraphsUseTheValidatedWording(): void
    {
        $html = $this->renderWith(
            etudes: [$this->amenagement('Tiers-temps en cours', pedagogique: true)],
            aidesHumaines: [],
            examens: [],
        );

        self::assertStringContainsString('Le bénéfice des aménagements vous est accordé', $html);
        self::assertStringContainsString(
            "En cas de nécessité, vos besoins pourront faire l'objet d'une nouvelle évaluation.",
            $html,
        );
        self::assertStringContainsString(
            'un entretien avec le service handicap de votre composante',
            $html,
        );
        self::assertStringNotContainsString('Je vous prie de croire', $html);
    }

    public function testTemplateRendersTheNewVisaBlock(): void
    {
        $html = $this->renderWith(
            etudes: [],
            aidesHumaines: [],
            examens: [$this->amenagement('Tiers-temps aux examens', examens: true)],
        );

        self::assertStringContainsString('<section class="visa-block">', $html);
        self::assertStringContainsString('Vu la loi n° 2005-102 du 11 février 2005', $html);
        self::assertStringContainsString('Vu la loi n° 2013-660 du 22 juillet 2013', $html);
        self::assertStringNotContainsString('Vu les articles D. 613-26', $html);
        self::assertStringContainsString('Vu le décret n° 2013-756 du 19 août 2013', $html);
        self::assertStringContainsString('Vu la circulaire du 6 février 2023', $html);
        self::assertStringContainsString('Vu la circulaire du 10 juillet 2024', $html);
        self::assertStringContainsString(
            'Vu l\'avis rendu par le médecin du service universitaire de médecine préventive',
            $html,
        );
        self::assertStringContainsString('désigné par la CDAPH', $html);
    }

    public function testTemplateRendersTheTitleAndHeaderLines(): void
    {
        $html = $this->renderWith(
            etudes: [$this->amenagement('Tiers-temps en cours', pedagogique: true)],
            aidesHumaines: [],
            examens: [],
        );

        self::assertStringContainsString('class="paeh-titre"', $html);
        self::assertStringContainsString(
            "Notification de Plan d'accompagnement de l'étudiant en situation de handicap (PAEH)",
            $html,
        );

        self::assertStringContainsString('Année universitaire : 2026-2027', $html);
        self::assertStringContainsString('Version : Notification initiale', $html);
        self::assertStringContainsString("Aménagements actifs pour l'année", $html);
        self::assertStringContainsString('class="section-titre"', $html);
    }

    public function testTemplateRemovesOldIntroAndAnnouncementSentences(): void
    {
        $html = $this->renderWith(
            etudes: [$this->amenagement('Tiers-temps en cours', pedagogique: true)],
            aidesHumaines: [],
            examens: [],
        );

        self::assertStringNotContainsString('Vous avez sollicité', $html);
        self::assertStringNotContainsString("Je vous informe que j'ai pris la décision", $html);
    }

    public function testTemplateRendersDateAvisMedecinWhenProvided(): void
    {
        $html = $this->renderWith(
            etudes: [],
            aidesHumaines: [],
            examens: [$this->amenagement('Tiers-temps aux examens', examens: true)],
            dateAvisMedecin: new \DateTimeImmutable('2026-06-15'),
        );

        self::assertStringContainsString('15/06/2026', $html);
        self::assertStringNotContainsString('________', $html);
    }

    public function testTemplateRendersPlaceholderWhenDateAvisMedecinIsNull(): void
    {
        $html = $this->renderWith(
            etudes: [],
            aidesHumaines: [],
            examens: [$this->amenagement('Tiers-temps aux examens', examens: true)],
            dateAvisMedecin: null,
        );

        self::assertStringContainsString('________', $html);
    }

    public function testRecourseBlockJurisdictionIsConfigurable(): void
    {
        // Sans surcharge, la juridiction retombe sur la valeur upstream.
        $default = $this->renderWith(
            etudes: [],
            aidesHumaines: [],
            examens: [$this->amenagement('Tiers-temps aux examens', examens: true)],
        );

        self::assertStringContainsString('Voies et délais de recours', $default);
        self::assertStringContainsString('Tribunal administratif', $default);
        self::assertStringContainsString('Bordeaux', $default);

        // Chaque etablissement declare la juridiction dont il depend.
        $custom = $this->renderWith(
            etudes: [],
            aidesHumaines: [],
            examens: [$this->amenagement('Tiers-temps aux examens', examens: true)],
            branding: [
                'tribunalAdministratifVille' => 'Versailles',
                'tribunalAdministratifAdresse' => '56 avenue de Saint-Cloud, 78000 Versailles',
            ],
        );

        self::assertStringContainsString('Tribunal administratif', $custom);
        self::assertStringContainsString('56 avenue de Saint-Cloud, 78000 Versailles', $custom);
    }

    public function testTemplateKeepsTheUpstreamDecisionEtablissementTitle(): void
    {
        $html = $this->renderWith(etudes: [], aidesHumaines: [], examens: []);

        self::assertStringContainsString("<title>Décision d'établissement</title>", $html);
    }

    public function testTemplateRendersObservationsBlockWhenProvided(): void
    {
        $html = $this->renderWith(
            etudes: [$this->amenagement('Tiers-temps en cours', pedagogique: true)],
            aidesHumaines: [],
            examens: [],
            observations: "Suivi médical à prévoir.\nContact prochain semestre.",
        );

        self::assertStringContainsString('Observations particulières', $html);
        self::assertStringContainsString('Suivi médical à prévoir.', $html);
        self::assertStringContainsString('Contact prochain semestre.', $html);
        self::assertStringContainsString('<section class="observations">', $html);
    }

    public function testTemplateHidesObservationsBlockWhenNullOrEmpty(): void
    {
        $htmlNull = $this->renderWith(
            etudes: [$this->amenagement('Tiers-temps en cours', pedagogique: true)],
            aidesHumaines: [],
            examens: [],
            observations: null,
        );
        $htmlBlank = $this->renderWith(
            etudes: [$this->amenagement('Tiers-temps en cours', pedagogique: true)],
            aidesHumaines: [],
            examens: [],
            observations: "   \n  ",
        );

        self::assertStringNotContainsString('Observations particulières', $htmlNull);
        self::assertStringNotContainsString('<section class="observations">', $htmlNull);
        self::assertStringNotContainsString('Observations particulières', $htmlBlank);
        self::assertStringNotContainsString('<section class="observations">', $htmlBlank);
    }

    public function testDestinataireSectionRendersIdentityFields(): void
    {
        $html = $this->renderWith(
            etudes: [],
            aidesHumaines: [],
            examens: [$this->amenagement('Tiers-temps aux examens', examens: true)],
            dateNaissance: new \DateTimeImmutable('2002-04-15'),
            numeroEtudiant: '21800123',
        );

        // Le destinataire est rendu en section sur deux colonnes.
        self::assertStringContainsString('Destinataire :', $html);
        self::assertStringContainsString('class="destinataire-grid"', $html);
        self::assertStringContainsString('Nom : DOE', $html);
        self::assertStringContainsString('Prénom : Jane', $html);
        self::assertStringContainsString('Date de naissance : 15/04/2002', $html);
        self::assertStringContainsString("Numéro d'étudiant : 21800123", $html);
    }

    public function testDestinataireOmitsBirthDateAndStudentNumberWhenAbsent(): void
    {
        $html = $this->renderWith(
            etudes: [],
            aidesHumaines: [],
            examens: [$this->amenagement('Tiers-temps aux examens', examens: true)],
            dateNaissance: null,
            numeroEtudiant: null,
        );

        self::assertStringNotContainsString('Date de naissance :', $html);
        self::assertStringNotContainsString("Numéro d'étudiant :", $html);
    }

    public function testServiceReferentBlockIsHiddenByDefaultAndShownWhenEnabled(): void
    {
        // Par défaut, l'encart « dossier suivi par » n'est pas rendu.
        $default = $this->renderWith(etudes: [], aidesHumaines: [], examens: []);
        self::assertStringNotContainsString('Dossier suivi par', $default);
        self::assertStringNotContainsString('Service PHASE', $default);

        // Activable par paramétrage, il réaffiche l'établissement, le service et le gestionnaire.
        $withReferent = $this->renderWith(
            etudes: [],
            aidesHumaines: [],
            examens: [],
            branding: [
                'afficherServiceReferent' => true,
                'etablissementNom' => 'Université Paris-Saclay',
                'serviceNom' => 'Service Accompagnement Étudiants',
            ],
        );
        self::assertStringContainsString('Dossier suivi par', $withReferent);
        self::assertStringContainsString('Université Paris-Saclay', $withReferent);
        self::assertStringContainsString('Service Accompagnement Étudiants', $withReferent);
        self::assertStringContainsString('Alice Dupont', $withReferent);
    }

    public function testFaitALineUsesConfiguredCityWithoutDate(): void
    {
        // La date n'est plus sur la ligne « Fait à … » : elle figure dans le cadre de signature.
        $default = $this->renderWith(etudes: [], aidesHumaines: [], examens: []);
        self::assertStringContainsString('Fait à Talence', $default);
        self::assertStringNotContainsString('Fait à Talence, le', $default);

        $custom = $this->renderWith(
            etudes: [],
            aidesHumaines: [],
            examens: [],
            branding: ['etablissementVille' => 'Orsay'],
        );
        self::assertStringContainsString('Fait à Orsay', $custom);
        self::assertStringNotContainsString('Fait à Talence', $custom);
    }

    public function testSignatureBlockKeepsTheDigitalSignatureMention(): void
    {
        $html = $this->renderWith(
            etudes: [$this->amenagement('Tiers-temps en cours', pedagogique: true)],
            aidesHumaines: [],
            examens: [],
        );

        // La mention de signature numérique figure toujours dans le cadre de signature.
        self::assertStringContainsString('Signé numériquement le', $html);
    }

    public function testSignatureBoxDoesNotRenderAScannedSignatureImage(): void
    {
        // Le signataire est nommé et signé numériquement : aucune image manuscrite d'un tiers
        // ne doit apparaître dans le cadre.
        $html = $this->renderWith(
            etudes: [$this->amenagement('Tiers-temps en cours', pedagogique: true)],
            aidesHumaines: [],
            examens: [],
            signatureContents: base64_encode('FAKE-SIGNATURE-BYTES'),
        );

        self::assertStringContainsString('Signé numériquement le', $html);
        self::assertStringNotContainsString('<img src="data:image/png', $html);
        self::assertStringNotContainsString(base64_encode('FAKE-SIGNATURE-BYTES'), $html);
    }

    /**
     * @param list<Amenagement> $etudes
     * @param list<Amenagement> $aidesHumaines
     * @param list<Amenagement> $examens
     */
    private function renderWith(
        array $etudes,
        array $aidesHumaines,
        array $examens,
        ?string $observations = null,
        ?\DateTimeInterface $dateNaissance = null,
        int|string|null $numeroEtudiant = null,
        ?\DateTimeInterface $dateAvisMedecin = null,
        array $branding = [],
        ?string $signatureContents = null,
    ): string {
        $etudiant = (new Utilisateur())
            ->setNom('DOE')
            ->setPrenom('Jane')
            ->setEmail('jane@example.org');
        if ($dateNaissance !== null) {
            $etudiant->setDateNaissance($dateNaissance);
        }
        if ($numeroEtudiant !== null) {
            $etudiant->setNumeroEtudiant((int) $numeroEtudiant);
        }

        $gestionnaire = (new Utilisateur())
            ->setNom('Dupont')
            ->setPrenom('Alice')
            ->setEmail('alice@example.org');

        $beneficiaire = (new Beneficiaire())
            ->setUtilisateur($etudiant)
            ->setGestionnaire($gestionnaire);

        // Header reads premierAmenagement.beneficiaires|first — attach the beneficiary
        // to a header-only amenagement that is NOT exposed in categories.
        $headerAmenagement = $this->amenagement('__header__');
        $headerAmenagement->addBeneficiaire($beneficiaire);

        $data = [
            'amenagements' => [$headerAmenagement, ...$etudes, ...$aidesHumaines, ...$examens],
            'amenagementsParCategorie' => [
                'etudes' => $etudes,
                'aidesHumaines' => $aidesHumaines,
                'examens' => $examens,
            ],
            'observations' => $observations,
            'dateAvisMedecin' => $dateAvisMedecin,
            'annee' => 2026,
            'president' => ['qualite' => 'Le President', 'nom' => 'P. NOMME'],
            'responsable_phase' => [
                'qualite' => 'Le responsable',
                'nom' => 'R. NOMME',
                'signature' => [
                    'contents' => $signatureContents,
                    'mimeType' => $signatureContents !== null ? 'image/png' : null,
                ],
            ],
        ];

        // Stub Symfony's `app` Twig global only with the env value the template reads.
        $appStub = new class {
            public string $environment = 'test';
        };

        return $this->twig->render('Decisions/index.html.twig', [
            'data' => $data,
            'backUrl' => 'http://localhost',
            'app' => $appStub,
            ...$branding,
        ]);
    }

    private function amenagement(
        string $libelle,
        bool $pedagogique = false,
        bool $aideHumaine = false,
        bool $examens = false,
    ): Amenagement {
        $type = (new TypeAmenagement())
            ->setLibelle($libelle)
            ->setActif(true)
            ->setPedagogique($pedagogique)
            ->setAideHumaine($aideHumaine)
            ->setExamens($examens);

        $amenagement = new Amenagement();
        $amenagement->setType($type);

        return $amenagement;
    }
}

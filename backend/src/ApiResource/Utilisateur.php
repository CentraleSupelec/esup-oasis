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

namespace App\ApiResource;

use ApiPlatform\Doctrine\Orm\Filter\BooleanFilter;
use ApiPlatform\Doctrine\Orm\Filter\ExistsFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\State\Options;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\OpenApi\Model\Operation;
use App\Filter\BeneficiaireActifTagFilter;
use App\Filter\BeneficiaireAvecAmenagementEnCoursFilter;
use App\Filter\BeneficiaireFilter;
use App\Filter\CaseInsensitiveOrderFilter;
use App\Filter\CategorieAmenagementEnCoursFilter;
use App\Filter\ComposanteFormationFilter;
use App\Filter\DomaineAmenagementEnCoursFilter;
use App\Filter\EtatAvisEseUtilisateurFilter;
use App\Filter\EtatDecisionAmenagementFilter;
use App\Filter\IntervenantArchiveFilter;
use App\Filter\IntervenantDisponibleFilter;
use App\Filter\IntervenantFilter;
use App\Filter\IntervenantOrderedByBeneficiaireFilter;
use App\Filter\LdapSearchFilter;
use App\Filter\LibCampusIntervenantFilter;
use App\Filter\LibComposanteBeneficiaireFilter;
use App\Filter\NestedFieldSearchFilter;
use App\Filter\NomGestionnaireFilter;
use App\Filter\PreloadAssociationsFilter;
use App\Filter\ProfilBeneficiaireFilter;
use App\Filter\RenfortFilter;
use App\Filter\TypeAmenagementEnCoursFilter;
use App\Filter\UtilisateurExistantSearchFilter;
use App\Filter\UtilisateurRoleFilter;
use App\Service\ErreurLdapException;
use App\State\Amenagement\AmenagementsParUtilisateurProvider;
use App\State\Utilisateur\BeneficiaireProvider;
use App\State\Utilisateur\IntervenantProvider;
use App\State\Utilisateur\RenfortProvider;
use App\State\Utilisateur\UtilisateurProcessor;
use App\State\Utilisateur\UtilisateurProvider;
use App\State\Utilisateur\UtilisateurRoleProvider;
use App\Validator\NumeroAnonymeUniqueConstraint;
use DateTimeInterface;
use Symfony\Component\ObjectMapper\Attribute\Map;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: self::COLLECTION_URI,
            name: self::COLLECTION_URI,
            provider: UtilisateurProvider::class,
            map: false,
        ),
        new GetCollection(
            uriTemplate: self::BENEFICIAIRE_COLLECTION_URI,
            name: self::BENEFICIAIRE_COLLECTION_URI,
            provider: BeneficiaireProvider::class,
            map: false,
        ),
        new GetCollection(
            uriTemplate: self::INTERVENANT_COLLECTION_URI,
            name: self::INTERVENANT_COLLECTION_URI,
            provider: IntervenantProvider::class,
            map: false,
        ),
        new GetCollection(
            uriTemplate: self::RENFORT_COLLECTION_URI,
            name: self::RENFORT_COLLECTION_URI,
            provider: RenfortProvider::class,
            map: false,
        ),
        new GetCollection(
            uriTemplate: '/roles/{roleId}/utilisateurs',
            uriVariables: ['roleId'],
            security: "is_granted('" . self::LIST_BY_ROLE . "', request)",
            provider: UtilisateurRoleProvider::class,
            map: false,
        ),
        new GetCollection(
            uriTemplate: '/amenagements/utilisateurs',
            normalizationContext: ['groups' => [self::AMENAGEMENTS_UTILISATEURS_OUT]],
            security: "is_granted('" . Amenagement::VOIR_AMENAGEMENTS . "')",
            filters: [
                BeneficiaireAvecAmenagementEnCoursFilter::class,
                CategorieAmenagementEnCoursFilter::class,
                TypeAmenagementEnCoursFilter::class,
                DomaineAmenagementEnCoursFilter::class,
            ],
            provider: AmenagementsParUtilisateurProvider::class,
            map: false,
        ),
        new Get(uriTemplate: self::ITEM_URI, uriVariables: ['uid'], provider: UtilisateurProvider::class, map: false),
        new Patch(
            uriTemplate: self::ITEM_URI,
            securityPostDenormalize: "is_granted('" . self::CAN_PATCH_USER . "', [previous_object, object])",
            provider: UtilisateurProvider::class,
            map: false,
        ),
    ],
    normalizationContext: ['groups' => [self::GROUP_OUT]],
    denormalizationContext: ['groups' => [self::GROUP_IN]],
    openapi: new Operation(tags: ['Utilisateurs']),
    exceptionToStatus: [ErreurLdapException::class => 400],
    processor: UtilisateurProcessor::class,
    stateOptions: new Options(entityClass: \App\Entity\Utilisateur::class),
)]
#[ApiFilter(LdapSearchFilter::class)]
#[ApiFilter(RenfortFilter::class)]
#[ApiFilter(BeneficiaireFilter::class)]
#[ApiFilter(IntervenantFilter::class)]
#[ApiFilter(IntervenantOrderedByBeneficiaireFilter::class)]
#[ApiFilter(IntervenantDisponibleFilter::class)]
#[ApiFilter(UtilisateurExistantSearchFilter::class, properties: ['nom', 'prenom', 'uid', 'numeroAnonyme' => 'int'])]
#[ApiFilter(BeneficiaireActifTagFilter::class, properties: ['tags' => ['description' => 'filtrer par tag']])]
#[ApiFilter(SearchFilter::class, properties: [
    'nom' => 'ipartial',
    'prenom' => 'ipartial',
    'intervenant.typesEvenements',
    'intervenant.campuses',
    'intervenant.competences',
])]
#[ApiFilter(ProfilBeneficiaireFilter::class)]
#[ApiFilter(LibCampusIntervenantFilter::class)]
#[ApiFilter(LibComposanteBeneficiaireFilter::class)]
#[ApiFilter(NomGestionnaireFilter::class)]
#[ApiFilter(IntervenantArchiveFilter::class)]
#[ApiFilter(CaseInsensitiveOrderFilter::class, properties: ['nom'])]
#[ApiFilter(BooleanFilter::class, properties: ['beneficiaires.avecAccompagnement'])]
#[ApiFilter(NestedFieldSearchFilter::class, properties: [
    'gestionnaire' => [
        'type' => 'string',
        'mapping' => 'beneficiaires.gestionnaire',
        'desc' => 'gestionnaire du bénéficiaire',
    ],
])]
#[ApiFilter(ExistsFilter::class, properties: ['numeroEtudiant'])]
#[ApiFilter(ComposanteFormationFilter::class, properties: ['composante', 'formation'])]
#[ApiFilter(EtatAvisEseUtilisateurFilter::class)]
#[ApiFilter(EtatDecisionAmenagementFilter::class)]
#[ApiFilter(UtilisateurRoleFilter::class)]
#[ApiFilter(PreloadAssociationsFilter::class)]
#[NumeroAnonymeUniqueConstraint]
final class Utilisateur
{
    public const string COLLECTION_URI = '/utilisateurs';
    public const string ITEM_URI = self::COLLECTION_URI . '/{uid}';
    public const string INTERVENANT_COLLECTION_URI = '/intervenants';
    public const string BENEFICIAIRE_COLLECTION_URI = '/beneficiaires';
    public const string RENFORT_COLLECTION_URI = '/renforts';
    public const string GROUP_OUT = 'utilisateur:out';
    public const string GROUP_IN = 'utilisateur:in';
    public const string AMENAGEMENTS_UTILISATEURS_OUT = 'amenagements_utilisateurs:out';

    public const string CAN_PATCH_USER = 'CAN_PATCH_USER';
    public const string LIST_BY_ROLE = 'LIST_BY_ROLE';
    public const string VOIR_INFOS_PERSO = 'VOIR_INFOS_PERSO';

    public const array TOUS_ROLES = [
        \App\Entity\Utilisateur::ROLE_ADMIN,
        \App\Entity\Utilisateur::ROLE_GESTIONNAIRE,
        \App\Entity\Utilisateur::ROLE_RENFORT,
        \App\Entity\Utilisateur::ROLE_USER,
        \App\Entity\Utilisateur::ROLE_BENEFICIAIRE,
        \App\Entity\Utilisateur::ROLE_DEMANDEUR,
        \App\Entity\Utilisateur::ROLE_INTERVENANT,
        \App\Entity\Utilisateur::ROLE_PLANIFICATEUR,
        \App\Entity\Utilisateur::ROLE_ADMIN_TECHNIQUE,
        \App\Entity\Utilisateur::ROLE_MEMBRE_COMMISSION,
        \App\Entity\Utilisateur::ROLE_REFERENT_COMPOSANTE,
        \App\Entity\Utilisateur::ROLE_VALIDER_CONFORMITE_DEMANDE,
        \App\Entity\Utilisateur::ROLE_ATTRIBUER_PROFIL,
    ];

    #[ApiProperty(identifier: true)]
    #[Groups([
        self::GROUP_OUT,
        Demande::GROUP_OUT,
        self::AMENAGEMENTS_UTILISATEURS_OUT,
        Amenagement::GROUP_OUT,
    ])]
    public string $uid {
        get {
            if (!isset($this->uid) && $this->entity !== null) {
                $this->uid = $this->entity->getUid() ?? '';
            }
            return $this->uid;
        }
    }

    public ?string $roleId = null {
        get => $this->roleId ?? $this->roles[0] ?? null;
    }

    #[Groups([
        self::GROUP_OUT,
        self::AMENAGEMENTS_UTILISATEURS_OUT,
        ActiviteBeneficiaire::OUT,
        ActiviteIntervenant::OUT,
        Amenagement::GROUP_OUT,
    ])]
    public string $email {
        get {
            if (!isset($this->email) && $this->entity !== null) {
                $this->email = $this->entity->getEmail() ?? '';
            }
            return $this->email;
        }
    }

    #[Groups([
        self::GROUP_OUT,
        ActiviteBeneficiaire::OUT,
        ActiviteIntervenant::OUT,
        Demande::GROUP_OUT,
        self::AMENAGEMENTS_UTILISATEURS_OUT,
        Amenagement::GROUP_OUT,
    ])]
    public string $nom {
        get {
            if (!isset($this->nom) && $this->entity !== null) {
                $this->nom = $this->entity->getNom() ?? '';
            }
            return $this->nom;
        }
    }

    #[Groups([
        self::GROUP_OUT,
        ActiviteBeneficiaire::OUT,
        ActiviteIntervenant::OUT,
        Demande::GROUP_OUT,
        self::AMENAGEMENTS_UTILISATEURS_OUT,
        Amenagement::GROUP_OUT,
    ])]
    public string $prenom {
        get {
            if (!isset($this->prenom) && $this->entity !== null) {
                $this->prenom = $this->entity->getPrenom() ?? '';
            }
            return $this->prenom;
        }
    }

    #[Groups([self::GROUP_OUT])]
    public ?DateTimeInterface $dateNaissance = null {
        get {
            if ($this->dateNaissance === null && $this->entity !== null) {
                $this->dateNaissance = $this->entity->getDateNaissance();
            }
            return $this->dateNaissance ?? null;
        }
    }

    #[Groups([self::GROUP_OUT])]
    public ?string $genre = null {
        get {
            if ($this->genre === null && $this->entity !== null) {
                $this->genre = $this->entity->getGenre();
            }
            return $this->genre ?? null;
        }
    }

    #[Groups([self::GROUP_OUT, self::AMENAGEMENTS_UTILISATEURS_OUT, Amenagement::GROUP_OUT])]
    public ?int $numeroEtudiant = null {
        get {
            if ($this->numeroEtudiant === null && $this->entity !== null) {
                $this->numeroEtudiant = $this->entity->getNumeroEtudiant();
            }
            return $this->numeroEtudiant ?? null;
        }
    }

    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[Assert\Email]
    #[ApiProperty(
        security: "object == null or object.uid == user.getUserIdentifier() or is_granted('ROLE_PLANIFICATEUR')",
        securityPostDenormalize: "is_granted('" . self::VOIR_INFOS_PERSO . "', object)",
    )]
    public ?string $emailPerso = null {
        get {
            if ($this->emailPerso === null && $this->entity !== null) {
                $this->emailPerso = $this->entity->getEmailPerso();
            }
            return $this->emailPerso ?? null;
        }
    }

    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[Assert\Length(max: 20)]
    #[ApiProperty(
        security: "object == null or object.uid == user.getUserIdentifier() or is_granted('ROLE_PLANIFICATEUR')",
        securityPostDenormalize: "is_granted('" . self::VOIR_INFOS_PERSO . "', object)",
    )]
    public ?string $telPerso = null {
        get {
            if ($this->telPerso === null && $this->entity !== null) {
                $this->telPerso = $this->entity->getTelPerso();
            }
            return $this->telPerso ?? null;
        }
    }

    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[ApiProperty(
        security: "object == null or object.uid == user.getUserIdentifier() or is_granted('ROLE_PLANIFICATEUR')",
        securityPostDenormalize: "is_granted('" . self::VOIR_INFOS_PERSO . "', object)",
    )]
    public ?string $contactUrgence = null {
        get {
            if ($this->contactUrgence === null && $this->entity !== null) {
                $this->contactUrgence = $this->entity->getContactUrgence();
            }
            return $this->contactUrgence ?? null;
        }
    }

    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[Assert\Choice(choices: self::TOUS_ROLES, multiple: true)]
    public array $roles {
        get {
            if (!isset($this->roles) && $this->entity !== null) {
                $this->roles = $this->entity->getRoles();
            }
            return $this->roles ?? [];
        }
    }

    /**
     * @var Service[] $services
     */
    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[Assert\All([new Assert\Type(Service::class)])]
    public array $services {
        get {
            if (!isset($this->services) && $this->entity !== null) {
                $this->services = array_map(fn($s) => new Service($s), $this->entity->getServices()->toArray());
            }
            return $this->services ?? [];
        }
    }

    /**
     * @var Campus[]
     */
    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[Assert\All([new Assert\Type(Campus::class)])]
    public ?array $campus {
        get {
            if (!isset($this->campus) && $this->entity !== null && $this->entity->getIntervenant()) {
                $this->campus = array_map(
                    fn($c) => new Campus($c),
                    $this->entity
                        ->getIntervenant()
                        ->getCampuses()
                        ->toArray(),
                );
            }
            return $this->campus ?? [];
        }
    }

    /**
     * @var Competence[]
     */
    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[Assert\All([new Assert\Type(Competence::class)])]
    public ?array $competences {
        get {
            if (!isset($this->competences) && $this->entity !== null && $this->entity->getIntervenant()) {
                $this->competences = array_map(
                    fn($c) => new Competence($c),
                    $this->entity
                        ->getIntervenant()
                        ->getCompetences()
                        ->toArray(),
                );
            }
            return $this->competences ?? [];
        }
    }

    /**
     * @var TypeEvenement[]
     */
    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[Assert\All([new Assert\Type(TypeEvenement::class)])]
    public ?array $typesEvenements {
        get {
            if (!isset($this->typesEvenements) && $this->entity !== null && $this->entity->getIntervenant()) {
                $this->typesEvenements = array_map(
                    fn($t) => new TypeEvenement($t),
                    $this->entity
                        ->getIntervenant()
                        ->getTypesEvenements()
                        ->toArray(),
                );
            }
            return $this->typesEvenements ?? [];
        }
    }

    /**
     * @var BeneficiaireProfil[]
     */
    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[Assert\All([new Assert\Type(BeneficiaireProfil::class)])]
    #[ApiProperty(security: "is_granted('ROLE_GESTIONNAIRE')")]
    public array $profils {
        get {
            if (!isset($this->profils) && $this->entity !== null) {
                $this->profils = array_map(
                    fn($b) => new BeneficiaireProfil($b),
                    $this->entity->getBeneficiaires()->toArray(),
                );
            }
            return $this->profils ?? [];
        }
    }

    #[Groups([self::GROUP_OUT, self::AMENAGEMENTS_UTILISATEURS_OUT, Amenagement::GROUP_OUT])]
    #[ApiProperty(security: "is_granted('ROLE_GESTIONNAIRE')")]
    public string $etatAvisEse {
        get {
            if (!isset($this->etatAvisEse) && $this->entity !== null) {
                $this->etatAvisEse = $this->entity->getEtatAvisEse() ?? '';
            }
            return $this->etatAvisEse;
        }
    }

    /**
     * @var Amenagement[]
     */
    #[Groups([self::AMENAGEMENTS_UTILISATEURS_OUT])]
    public array $amenagements {
        get {
            if (!isset($this->amenagements) && $this->entity !== null) {
                // Using getAmenagementsActifs from Entity logic
                $this->amenagements = array_values(array_map(
                    fn($a) => new Amenagement($a),
                    $this->entity->getAmenagementsActifs(),
                ));
            }
            return $this->amenagements ?? [];
        }
    }

    /**
     * @var Tag[]
     */
    #[Groups([self::GROUP_OUT, self::AMENAGEMENTS_UTILISATEURS_OUT, Amenagement::GROUP_OUT])]
    #[ApiProperty(security: "is_granted('ROLE_PLANIFICATEUR')")]
    public array $tags {
        get {
            if (!isset($this->tags) && $this->entity !== null) {
                $this->tags = array_values(array_map(fn($t) => new Tag($t), $this->entity->getTagsActifs()));
            }
            return $this->tags ?? [];
        }
    }

    /**
     * @var Utilisateur[]
     */
    #[Groups([self::GROUP_OUT, Amenagement::GROUP_OUT])]
    #[ApiProperty(readableLink: false, writableLink: false)]
    public array $gestionnairesActifs {
        get {
            // Complex calculation in Provider. We return property if set.
            // Or we could try to replicate it, but it involves 'now' and logic.
            // If EntityToResourceTransformer is used, this will be empty unless we implement it.
            // For now, we rely on Provider or return empty.
            return $this->gestionnairesActifs ?? [];
        }
    }

    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    public ?DateTimeInterface $intervenantDebut = null {
        get {
            if ($this->intervenantDebut === null && $this->entity !== null && $this->entity->getIntervenant()) {
                $this->intervenantDebut = $this->entity->getIntervenant()->getDebut();
            }
            return $this->intervenantDebut ?? null;
        }
    }
    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    public ?DateTimeInterface $intervenantFin = null {
        get {
            if ($this->intervenantFin === null && $this->entity !== null && $this->entity->getIntervenant()) {
                $this->intervenantFin = $this->entity->getIntervenant()->getFin();
            }
            return $this->intervenantFin ?? null;
        }
    }

    /**
     * @var Inscription[]
     */
    #[Groups([self::GROUP_OUT, Demande::GROUP_OUT, self::AMENAGEMENTS_UTILISATEURS_OUT, Amenagement::GROUP_OUT])]
    public array $inscriptions {
        get {
            if (!isset($this->inscriptions) && $this->entity !== null) {
                $this->inscriptions = array_map(
                    fn($i) => new Inscription($i),
                    $this->entity->getInscriptions()->toArray(),
                );
            }
            return $this->inscriptions ?? [];
        }
    }

    #[Groups([self::GROUP_OUT])]
    #[ApiProperty(
        security: "object == null or object.uid == user.getUserIdentifier() or is_granted('ROLE_PLANIFICATEUR')",
    )]
    public ?bool $boursier = null {
        get {
            if ($this->boursier === null && $this->entity !== null) {
                $this->boursier = $this->entity->isBoursier();
            }
            return $this->boursier ?? null;
        }
    }

    #[Groups([self::GROUP_OUT])]
    #[ApiProperty(
        security: "object == null or object.uid == user.getUserIdentifier() or is_granted('ROLE_PLANIFICATEUR')",
    )]
    public ?string $statutEtudiant = null {
        get {
            if ($this->statutEtudiant === null && $this->entity !== null) {
                $this->statutEtudiant = $this->entity->getStatutEtudiant();
            }
            return $this->statutEtudiant ?? null;
        }
    }

    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[ApiProperty(
        security: "object == null or object.uid == user.getUserIdentifier() or is_granted('ROLE_PLANIFICATEUR')",
        securityPostDenormalize: "is_granted('" . self::VOIR_INFOS_PERSO . "', object)",
    )]
    public bool $abonneImmediat = false {
        get {
            if ($this->entity !== null) {
                return $this->entity->isAbonneImmediat();
            }
            return $this->abonneImmediat;
        }
    }

    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[ApiProperty(
        security: "object == null or object.uid == user.getUserIdentifier() or is_granted('ROLE_PLANIFICATEUR')",
        securityPostDenormalize: "is_granted('" . self::VOIR_INFOS_PERSO . "', object)",
    )]
    public bool $abonneVeille = false {
        get {
            if ($this->entity !== null) {
                return $this->entity->isAbonneVeille();
            }
            return $this->abonneVeille;
        }
    }

    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[ApiProperty(
        security: "object == null or object.uid == user.getUserIdentifier() or is_granted('ROLE_PLANIFICATEUR')",
        securityPostDenormalize: "is_granted('" . self::VOIR_INFOS_PERSO . "', object)",
    )]
    public bool $abonneAvantVeille = false {
        get {
            if ($this->entity !== null) {
                return $this->entity->isAbonneAvantVeille();
            }
            return $this->abonneAvantVeille;
        }
    }

    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[ApiProperty(
        security: "object == null or object.uid == user.getUserIdentifier() or is_granted('ROLE_PLANIFICATEUR')",
        securityPostDenormalize: "is_granted('" . self::VOIR_INFOS_PERSO . "', object)",
    )]
    public bool $abonneRecapHebdo = false {
        get {
            if ($this->entity !== null) {
                return $this->entity->isAbonneRecapHebdo();
            }
            return $this->abonneRecapHebdo;
        }
    }

    #[Groups([self::GROUP_OUT])]
    #[ApiProperty(security: "is_granted('" . \App\Entity\Utilisateur::ROLE_GESTIONNAIRE . "', object)")]
    public ?DecisionAmenagementExamens $decisionAmenagementAnneeEnCours = null {
        get {
            // Relies on Provider to populate.
            return $this->decisionAmenagementAnneeEnCours ?? null;
        }
    }

    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[ApiProperty(security: "is_granted('" . self::VOIR_INFOS_PERSO . "', object)")]
    public ?int $numeroAnonyme = null {
        get {
            if ($this->numeroAnonyme === null && $this->entity !== null) {
                $this->numeroAnonyme = $this->entity->getNumeroAnonyme();
            }
            return $this->numeroAnonyme ?? null;
        }
    }

    public function nomAffichage(): string
    {
        return ucfirst($this->prenom) . ' ' . ucfirst($this->nom);
    }

    public function __construct(
        private readonly ?\App\Entity\Utilisateur $entity = null,
    ) {}
}

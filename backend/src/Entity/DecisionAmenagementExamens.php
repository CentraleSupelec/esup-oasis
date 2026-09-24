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

namespace App\Entity;

use App\Repository\DecisionAmenagementExamensRepository;
use App\State\EntityToResourceTransformer;
use DateTime;
use DateTimeInterface;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ORM\Entity(repositoryClass: DecisionAmenagementExamensRepository::class)]
#[ORM\Index(name: 'IDX_DECISION_BENEFICIAIRE_DEBUT', columns: ['beneficiaire_id', 'debut'])]
#[ORM\Index(name: 'IDX_DECISION_AMENAGEMENT_EXAMENS_ETAT', columns: ['etat'])]
#[ORM\Index(name: 'IDX_DECISION_BENEFICIAIRE_ETAT_DEBUT', columns: ['beneficiaire_id', 'etat', 'debut'])]
#[ORM\Index(name: 'IDX_DECISION_BENEFICIAIRE_ETAT', columns: ['beneficiaire_id', 'etat'])]
#[ORM\Index(name: 'IDX_DECISION_AMENAGEMENT_EXAMENS_DEBUT', columns: ['debut'])]
#[ORM\Index(name: 'IDX_DECISION_AMENAGEMENT_EXAMENS_DEBUT_FIN', columns: ['debut', 'fin'])]
#[ORM\Index(name: 'IDX_DECISION_ETAT_SIGNATURE', columns: ['etat_signature'])]
#[ORM\UniqueConstraint(name: 'UNIQ_DECISION_FAST_DOCUMENT_ID', columns: ['fast_document_id'])]
#[Map(target: \App\ApiResource\DecisionAmenagementExamens::class, transform: [
    EntityToResourceTransformer::class,
    'entityToResource',
])]
class DecisionAmenagementExamens
{
    public const string ETAT_ATTENTE_VALIDATION_CAS = 'ATTENTE_VALIDATION_CAS';
    public const string ETAT_VALIDE = 'VALIDE';
    public const string ETAT_EDITE = 'EDITE';

    public const string ETAT_EDITION_DEMANDEE = 'EDITION_DEMANDEE';

    // états de la signature électronique, null tant que la décision n'est pas passée par FAST
    public const string ETAT_SIGNATURE_EN_SIGNATURE = 'EN_SIGNATURE';
    public const string ETAT_SIGNATURE_SIGNEE = 'SIGNEE';
    public const string ETAT_SIGNATURE_REFUSEE = 'REFUSEE';
    public const string ETAT_SIGNATURE_EXPIREE = 'EXPIREE';
    public const string ETAT_SIGNATURE_ERREUR = 'ERREUR';
    public const string ETAT_SIGNATURE_REMPLACEE = 'REMPLACEE';

    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'SEQUENCE')]
    #[ORM\Column]
    #[Map(if: false)]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Map(if: false)]
    private ?DateTimeInterface $debut = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Map(if: false)]
    private ?DateTimeInterface $fin = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Map(if: false)]
    private ?DateTimeInterface $dateModification = null;

    #[ORM\ManyToOne(inversedBy: 'decisionsAmenagementExamens')]
    #[ORM\JoinColumn(nullable: false)]
    #[Map(if: false)]
    private ?Utilisateur $beneficiaire = null;

    #[ORM\Column(length: 255)]
    #[Map(if: false)]
    private ?string $etat = null;

    #[ORM\OneToOne(inversedBy: 'decisionAmenagementExamens', cascade: ['persist', 'remove'])]
    #[Map(if: false)]
    private ?Fichier $fichier = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Map(if: false)]
    private ?string $etatSignature = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Map(if: false)]
    private ?string $fastDocumentId = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Map(if: false)]
    private ?string $fastCircuitId = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Map(if: false)]
    private ?DateTimeInterface $derniereVerificationFast = null;

    /** Auteur de la pièce jointe au retour de signature : le suivi tourne sans utilisateur connecté. */
    #[ORM\Column(length: 255, nullable: true)]
    #[Map(if: false)]
    private ?string $uidDemandeurSignature = null;

    /** Lue dans l'historique FAST : le PDF, généré avant d'être signé, ne peut pas la porter. */
    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Map(if: false)]
    private ?DateTimeInterface $dateSignature = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDebut(): ?DateTimeInterface
    {
        return $this->debut;
    }

    public function setDebut(DateTimeInterface $debut): static
    {
        $this->debut = DateTime::createFromInterface($debut);

        return $this;
    }

    public function getFin(): ?DateTimeInterface
    {
        return $this->fin;
    }

    public function setFin(DateTimeInterface $fin): static
    {
        $this->fin = DateTime::createFromInterface($fin);

        return $this;
    }

    public function getDateModification(): ?DateTimeInterface
    {
        return $this->dateModification;
    }

    public function setDateModification(DateTimeInterface $dateModification): static
    {
        $this->dateModification = DateTime::createFromInterface($dateModification);

        return $this;
    }

    public function getBeneficiaire(): ?Utilisateur
    {
        return $this->beneficiaire;
    }

    public function setBeneficiaire(?Utilisateur $beneficiaire): static
    {
        $this->beneficiaire = $beneficiaire;

        return $this;
    }

    public function getEtat(): ?string
    {
        return $this->etat;
    }

    public function setEtat(string $etat): static
    {
        $this->etat = $etat;

        return $this;
    }

    public function getFichier(): ?Fichier
    {
        return $this->fichier;
    }

    public function setFichier(?Fichier $fichier): static
    {
        $this->fichier = $fichier;

        return $this;
    }

    public function getEtatSignature(): ?string
    {
        return $this->etatSignature;
    }

    public function setEtatSignature(?string $etatSignature): static
    {
        $this->etatSignature = $etatSignature;

        return $this;
    }

    public function getFastDocumentId(): ?string
    {
        return $this->fastDocumentId;
    }

    public function setFastDocumentId(?string $fastDocumentId): static
    {
        $this->fastDocumentId = $fastDocumentId;

        return $this;
    }

    public function getFastCircuitId(): ?string
    {
        return $this->fastCircuitId;
    }

    public function setFastCircuitId(?string $fastCircuitId): static
    {
        $this->fastCircuitId = $fastCircuitId;

        return $this;
    }

    public function getDerniereVerificationFast(): ?DateTimeInterface
    {
        return $this->derniereVerificationFast;
    }

    public function setDerniereVerificationFast(?DateTimeInterface $derniereVerificationFast): static
    {
        $this->derniereVerificationFast = match ($derniereVerificationFast) {
            null => null,
            default => DateTime::createFromInterface($derniereVerificationFast),
        };

        return $this;
    }

    public function getUidDemandeurSignature(): ?string
    {
        return $this->uidDemandeurSignature;
    }

    public function setUidDemandeurSignature(?string $uidDemandeurSignature): static
    {
        $this->uidDemandeurSignature = $uidDemandeurSignature;

        return $this;
    }

    public function getDateSignature(): ?DateTimeInterface
    {
        return $this->dateSignature;
    }

    public function setDateSignature(?DateTimeInterface $dateSignature): static
    {
        $this->dateSignature = match ($dateSignature) {
            null => null,
            default => DateTime::createFromInterface($dateSignature),
        };

        return $this;
    }
}

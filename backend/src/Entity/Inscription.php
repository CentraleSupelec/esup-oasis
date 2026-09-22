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

use App\Repository\InscriptionRepository;
use DateTime;
use DateTimeInterface;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\Index;

#[ORM\Entity(repositoryClass: InscriptionRepository::class)]
#[Index(name: 'IDX_INSCRIPTION_FIN', columns: ['fin'])]
class Inscription
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'SEQUENCE')]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'inscriptions')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Utilisateur $etudiant = null;

    #[ORM\ManyToOne(inversedBy: 'inscriptions')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Formation $formation = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?DateTimeInterface $debut = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?DateTimeInterface $fin = null;

    /**
     * Code étape du SI scolarité, conservé pour exposer le cursus d'inscription
     * et regrouper les inscriptions relevant du même parcours.
     */
    #[ORM\Column(length: 20, nullable: true)]
    private ?string $codeEtape = null;

    /**
     * Code du cursus aménagé (étalement, contrat pédagogique pluri-annuel),
     * quand le SI scolarité le renseigne.
     */
    #[ORM\Column(length: 10, nullable: true)]
    private ?string $codeCursusAmenage = null;

    /**
     * Libellé du cursus aménagé, affiché tel quel sur la fiche bénéficiaire.
     */
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $libelleCursusAmenage = null;

    /**
     * Niveau d'études de l'inscription (L1, M2, BUT1…) tel que fourni par le
     * connecteur de SI scolarité. Sert de repli quand la formation ne porte pas
     * de niveau : la correspondance entre les codes du SI et un niveau dépend du
     * paramétrage de l'établissement et n'est donc pas calculée ici, mais dans
     * le connecteur (cf. ApogeeProvider::enrichirInscription()). null quand
     * aucun connecteur ne la renseigne.
     */
    #[ORM\Column(length: 20, nullable: true)]
    private ?string $niveau = null;

    /**
     * Redoublement tel que déterminé par le connecteur de SI scolarité. null
     * quand celui-ci ne se prononce pas : l'information ne se déduit pas d'un
     * compteur d'inscriptions sans connaître les conventions locales
     * (étalement, réorientation, césure…).
     */
    #[ORM\Column(nullable: true)]
    private ?bool $redoublant = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEtudiant(): ?Utilisateur
    {
        return $this->etudiant;
    }

    public function setEtudiant(?Utilisateur $etudiant): self
    {
        $this->etudiant = $etudiant;

        return $this;
    }

    public function getFormation(): ?Formation
    {
        return $this->formation;
    }

    public function setFormation(?Formation $formation): self
    {
        $this->formation = $formation;

        return $this;
    }

    public function getDebut(): ?DateTimeInterface
    {
        return $this->debut;
    }

    public function setDebut(DateTimeInterface $debut): self
    {
        $this->debut = DateTime::createFromInterface($debut);

        return $this;
    }

    public function getFin(): ?DateTimeInterface
    {
        return $this->fin;
    }

    public function setFin(DateTimeInterface $fin): self
    {
        $this->fin = DateTime::createFromInterface($fin);

        return $this;
    }

    public function getCodeEtape(): ?string
    {
        return $this->codeEtape;
    }

    public function setCodeEtape(?string $codeEtape): self
    {
        $this->codeEtape = $codeEtape;

        return $this;
    }

    public function getCodeCursusAmenage(): ?string
    {
        return $this->codeCursusAmenage;
    }

    public function setCodeCursusAmenage(?string $codeCursusAmenage): self
    {
        $this->codeCursusAmenage = $codeCursusAmenage;

        return $this;
    }

    public function getLibelleCursusAmenage(): ?string
    {
        return $this->libelleCursusAmenage;
    }

    public function setLibelleCursusAmenage(?string $libelleCursusAmenage): self
    {
        $this->libelleCursusAmenage = $libelleCursusAmenage;

        return $this;
    }

    public function setNiveau(?string $niveau): self
    {
        $this->niveau = $niveau;

        return $this;
    }

    public function isRedoublant(): ?bool
    {
        return $this->redoublant;
    }

    public function setRedoublant(?bool $redoublant): self
    {
        $this->redoublant = $redoublant;

        return $this;
    }

    /**
     * Niveau d'études (L1..M2 / D1-D3, BUT1…) de l'inscription.
     *
     * Le niveau porté par la formation fait foi : un établissement dont le SI
     * scolarité le renseigne garde exactement son affichage. À défaut, on reprend
     * le niveau fourni par le connecteur de SI scolarité, qui seul connaît les
     * conventions de codage de l'établissement. null quand aucune des deux
     * sources ne permet de conclure.
     */
    public function getNiveau(): ?string
    {
        // Le SI peut renvoyer une colonne de longueur fixe complétée d'espaces : une
        // valeur qui ne contient que du blanc n'est pas un niveau renseigné, et ne doit
        // donc pas masquer celui fourni par le connecteur.
        $niveauFormation = trim((string) ($this->formation?->getNiveau() ?? ''));
        if ('' !== $niveauFormation) {
            return $niveauFormation;
        }

        return $this->niveau;
    }
}

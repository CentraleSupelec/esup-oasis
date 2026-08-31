<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Postal address embedded into Utilisateur. Modeled as a Doctrine Embeddable
 * so we can reuse it on other entities (intervenant, gestionnaire) without
 * duplicating the column set. Not exposed as an ApiResource: the
 * UtilisateurResource property hook converts it to an associative array that
 * API Platform serializes inline alongside the parent resource.
 */
#[ORM\Embeddable]
class Adresse
{
    #[ORM\Column(length: 255, nullable: true)]
    public ?string $ligne1 = null;

    #[ORM\Column(length: 255, nullable: true)]
    public ?string $ligne2 = null;

    #[ORM\Column(length: 20, nullable: true)]
    public ?string $codePostal = null;

    #[ORM\Column(length: 255, nullable: true)]
    public ?string $ville = null;

    #[ORM\Column(length: 100, nullable: true)]
    public ?string $pays = null;

    public function getLigne1(): ?string
    {
        return $this->ligne1;
    }

    public function setLigne1(?string $ligne1): static
    {
        $this->ligne1 = $ligne1;
        return $this;
    }

    public function getLigne2(): ?string
    {
        return $this->ligne2;
    }

    public function setLigne2(?string $ligne2): static
    {
        $this->ligne2 = $ligne2;
        return $this;
    }

    public function getCodePostal(): ?string
    {
        return $this->codePostal;
    }

    public function setCodePostal(?string $codePostal): static
    {
        $this->codePostal = $codePostal;
        return $this;
    }

    public function getVille(): ?string
    {
        return $this->ville;
    }

    public function setVille(?string $ville): static
    {
        $this->ville = $ville;
        return $this;
    }

    public function getPays(): ?string
    {
        return $this->pays;
    }

    public function setPays(?string $pays): static
    {
        $this->pays = $pays;
        return $this;
    }

    /**
     * True when no field carries any meaningful value. Used to short-circuit
     * serialization (we'd rather expose null than a payload of nulls).
     */
    public function isEmpty(): bool
    {
        return null === $this->ligne1
            && null === $this->ligne2
            && null === $this->codePostal
            && null === $this->ville
            && null === $this->pays;
    }

    /**
     * Plain associative representation, suitable for direct serialization by
     * API Platform alongside the parent resource (instead of being turned
     * into a blank-node `@id` reference).
     *
     * @return array{ligne1: ?string, ligne2: ?string, codePostal: ?string, ville: ?string, pays: ?string}
     */
    public function toArray(): array
    {
        return [
            'ligne1' => $this->ligne1,
            'ligne2' => $this->ligne2,
            'codePostal' => $this->codePostal,
            'ville' => $this->ville,
            'pays' => $this->pays,
        ];
    }
}

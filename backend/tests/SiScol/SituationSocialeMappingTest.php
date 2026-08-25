<?php

declare(strict_types=1);

namespace App\Tests\SiScol;

use App\Entity\Utilisateur;
use PHPUnit\Framework\TestCase;

/**
 * Accessors de la situation sociale sur l'entité Utilisateur.
 *
 * Ce test couvre uniquement le contrat de l'entité (valeur par défaut, get/set,
 * accessors fluents) sur les deux champs ajoutés codeSituationSociale et
 * libelleSituationSociale.
 *
 * La RÈGLE de projection (recopie depuis la dernière inscription + dérivation
 * boursier via le code "BO") est testée sur le vrai code de production dans
 * {@see \App\Tests\UtilisateurManagerTest} (cas NO, BO et témoin legacy), et non
 * répliquée ici, pour éviter un test tautologique.
 *
 * TODO(apogée-réel) : confirmer contre Apogée Saclay réel le nom de colonne
 * cod_soc (vs cod_sco) et la liste exacte des codes considérés "boursier".
 */
final class SituationSocialeMappingTest extends TestCase
{
    public function testSituationSocialeEstNulleParDefaut(): void
    {
        $utilisateur = new Utilisateur();

        self::assertNull($utilisateur->getCodeSituationSociale());
        self::assertNull($utilisateur->getLibelleSituationSociale());
    }

    public function testGetSetSituationSocialeConserventLesValeurs(): void
    {
        $utilisateur = new Utilisateur();

        $utilisateur->setCodeSituationSociale('BO');
        $utilisateur->setLibelleSituationSociale('Boursier');

        self::assertSame('BO', $utilisateur->getCodeSituationSociale());
        self::assertSame('Boursier', $utilisateur->getLibelleSituationSociale());
    }

    public function testSituationSocialeAccepteNull(): void
    {
        $utilisateur = new Utilisateur();
        $utilisateur->setCodeSituationSociale('PU');
        $utilisateur->setLibelleSituationSociale('Pupille de la nation');

        $utilisateur->setCodeSituationSociale(null);
        $utilisateur->setLibelleSituationSociale(null);

        self::assertNull($utilisateur->getCodeSituationSociale());
        self::assertNull($utilisateur->getLibelleSituationSociale());
    }

    public function testAccessorsSituationSocialeSontFluents(): void
    {
        $utilisateur = new Utilisateur();

        self::assertSame($utilisateur, $utilisateur->setCodeSituationSociale('PU'));
        self::assertSame($utilisateur, $utilisateur->setLibelleSituationSociale('Pupille de la nation'));
    }
}

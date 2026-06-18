import { describe, it, expect } from "vitest";
import { RoleValues } from "@lib";
import { FONCTIONNALITES } from "@context/demande/QuestionnaireTypes";
import { MATRICE_DROITS_ROLES } from "@context/demande/QuestionnaireRights";

describe("MATRICE_DROITS_ROLES", () => {
  describe("ROLE_GESTIONNAIRE", () => {
    const droits = MATRICE_DROITS_ROLES[RoleValues.ROLE_GESTIONNAIRE];

    it("peut déclarer réceptionnée", () => {
      expect(droits[FONCTIONNALITES.DECLARER_RECEPTIONNEE]).toBe(true);
    });

    it("peut attribuer un profil", () => {
      expect(droits[FONCTIONNALITES.ATTRIBUER_PROFIL]).toBe(true);
    });

    it("peut déclarer la conformité d'une demande", () => {
      expect(droits[FONCTIONNALITES.DECLARER_CONFORMITE_DEMANDE]).toBe(true);
    });

    it("peut statuer sur l'accompagnement", () => {
      expect(droits[FONCTIONNALITES.STATUER_ACCOMPAGNEMENT]).toBe(true);
    });

    it("peut modifier le questionnaire", () => {
      expect(droits[FONCTIONNALITES.MODIFIER_QUESTIONNAIRE]).toBe(true);
    });
  });

  describe("ROLE_MEMBRE_COMMISSION", () => {
    const droits = MATRICE_DROITS_ROLES[RoleValues.ROLE_MEMBRE_COMMISSION];

    it("ne peut pas déclarer réceptionnée", () => {
      expect(droits[FONCTIONNALITES.DECLARER_RECEPTIONNEE]).toBe(false);
    });

    describe("ATTRIBUER_PROFIL (conditionnel)", () => {
      const attribuerProfil = droits[FONCTIONNALITES.ATTRIBUER_PROFIL];

      it("est une fonction", () => {
        expect(typeof attribuerProfil).toBe("function");
      });

      it("autorisé avec le rôle ROLE_ATTRIBUER_PROFIL", () => {
        expect((attribuerProfil as (roles: string[]) => boolean)(["ROLE_ATTRIBUER_PROFIL"])).toBe(
          true,
        );
      });

      it("refusé sans le rôle ROLE_ATTRIBUER_PROFIL", () => {
        expect((attribuerProfil as (roles: string[]) => boolean)([])).toBe(false);
      });

      it("refusé avec des rôles non pertinents", () => {
        expect(
          (attribuerProfil as (roles: string[]) => boolean)(["ROLE_VALIDER_CONFORMITE_DEMANDE"]),
        ).toBe(false);
      });
    });

    describe("DECLARER_CONFORMITE_DEMANDE (conditionnel)", () => {
      const declarerConformite = droits[FONCTIONNALITES.DECLARER_CONFORMITE_DEMANDE];

      it("est une fonction", () => {
        expect(typeof declarerConformite).toBe("function");
      });

      it("autorisé avec le rôle ROLE_VALIDER_CONFORMITE_DEMANDE", () => {
        expect(
          (declarerConformite as (roles: string[]) => boolean)(["ROLE_VALIDER_CONFORMITE_DEMANDE"]),
        ).toBe(true);
      });

      it("refusé sans le rôle ROLE_VALIDER_CONFORMITE_DEMANDE", () => {
        expect((declarerConformite as (roles: string[]) => boolean)([])).toBe(false);
      });

      it("refusé avec des rôles non pertinents", () => {
        expect(
          (declarerConformite as (roles: string[]) => boolean)(["ROLE_ATTRIBUER_PROFIL"]),
        ).toBe(false);
      });
    });

    it("ne peut pas statuer sur l'accompagnement", () => {
      expect(droits[FONCTIONNALITES.STATUER_ACCOMPAGNEMENT]).toBe(false);
    });

    it("ne peut pas modifier le questionnaire", () => {
      expect(droits[FONCTIONNALITES.MODIFIER_QUESTIONNAIRE]).toBe(false);
    });
  });

  describe("ROLE_RENFORT", () => {
    const droits = MATRICE_DROITS_ROLES[RoleValues.ROLE_RENFORT];

    it("ne peut pas déclarer réceptionnée", () => {
      expect(droits[FONCTIONNALITES.DECLARER_RECEPTIONNEE]).toBe(false);
    });

    it("ne peut pas attribuer un profil", () => {
      expect(droits[FONCTIONNALITES.ATTRIBUER_PROFIL]).toBe(false);
    });

    it("peut déclarer la conformité d'une demande", () => {
      expect(droits[FONCTIONNALITES.DECLARER_CONFORMITE_DEMANDE]).toBe(true);
    });

    it("ne peut pas statuer sur l'accompagnement", () => {
      expect(droits[FONCTIONNALITES.STATUER_ACCOMPAGNEMENT]).toBe(false);
    });

    it("peut modifier le questionnaire", () => {
      expect(droits[FONCTIONNALITES.MODIFIER_QUESTIONNAIRE]).toBe(true);
    });
  });
});

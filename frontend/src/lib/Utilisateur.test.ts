/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { APIEndpointByRole, getRoleLabel, RoleValues, Utilisateur } from "./Utilisateur";

// Helper : crée un Utilisateur minimal avec les rôles spécifiés
const makeUser = (roles: RoleValues[]) => new Utilisateur({ roles } as never);

// ---------------------------------------------------------------------------
// hasRole
// ---------------------------------------------------------------------------

describe("Utilisateur.hasRole", () => {
  it("retourne true si le rôle est présent", () => {
    expect(makeUser([RoleValues.ROLE_ADMIN]).hasRole(RoleValues.ROLE_ADMIN)).toBe(true);
  });

  it("retourne false si le rôle est absent", () => {
    expect(makeUser([RoleValues.ROLE_GESTIONNAIRE]).hasRole(RoleValues.ROLE_ADMIN)).toBe(false);
  });

  it("retourne false pour un tableau de rôles vide", () => {
    expect(makeUser([]).hasRole(RoleValues.ROLE_BENEFICIAIRE)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isAdmin / isAdminTechnique
// ---------------------------------------------------------------------------

describe("Utilisateur.isAdmin", () => {
  it("true pour ROLE_ADMIN", () => {
    expect(makeUser([RoleValues.ROLE_ADMIN]).isAdmin).toBe(true);
  });

  it("true pour ROLE_ADMIN_TECHNIQUE", () => {
    expect(makeUser([RoleValues.ROLE_ADMIN_TECHNIQUE]).isAdmin).toBe(true);
  });

  it("false pour ROLE_GESTIONNAIRE seul", () => {
    expect(makeUser([RoleValues.ROLE_GESTIONNAIRE]).isAdmin).toBe(false);
  });

  it("false pour un tableau vide", () => {
    expect(makeUser([]).isAdmin).toBe(false);
  });
});

describe("Utilisateur.isAdminTechnique", () => {
  it("true pour ROLE_ADMIN_TECHNIQUE uniquement", () => {
    expect(makeUser([RoleValues.ROLE_ADMIN_TECHNIQUE]).isAdminTechnique).toBe(true);
  });

  it("false pour ROLE_ADMIN (non technique)", () => {
    expect(makeUser([RoleValues.ROLE_ADMIN]).isAdminTechnique).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isGestionnaire
// ---------------------------------------------------------------------------

describe("Utilisateur.isGestionnaire", () => {
  it("true pour ROLE_GESTIONNAIRE", () => {
    expect(makeUser([RoleValues.ROLE_GESTIONNAIRE]).isGestionnaire).toBe(true);
  });

  it("true pour un admin (isAdmin implique isGestionnaire)", () => {
    expect(makeUser([RoleValues.ROLE_ADMIN]).isGestionnaire).toBe(true);
  });

  it("false pour ROLE_RENFORT seul", () => {
    expect(makeUser([RoleValues.ROLE_RENFORT]).isGestionnaire).toBe(false);
  });

  it("false pour ROLE_BENEFICIAIRE", () => {
    expect(makeUser([RoleValues.ROLE_BENEFICIAIRE]).isGestionnaire).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isRenfort / isPlanificateur
// ---------------------------------------------------------------------------

describe("Utilisateur.isRenfort", () => {
  it("true pour ROLE_RENFORT", () => {
    expect(makeUser([RoleValues.ROLE_RENFORT]).isRenfort).toBe(true);
  });

  it("false pour ROLE_GESTIONNAIRE", () => {
    expect(makeUser([RoleValues.ROLE_GESTIONNAIRE]).isRenfort).toBe(false);
  });
});

describe("Utilisateur.isPlanificateur", () => {
  it("true pour ROLE_GESTIONNAIRE", () => {
    expect(makeUser([RoleValues.ROLE_GESTIONNAIRE]).isPlanificateur).toBe(true);
  });

  it("true pour ROLE_RENFORT", () => {
    expect(makeUser([RoleValues.ROLE_RENFORT]).isPlanificateur).toBe(true);
  });

  it("true pour ROLE_ADMIN (via isGestionnaire)", () => {
    expect(makeUser([RoleValues.ROLE_ADMIN]).isPlanificateur).toBe(true);
  });

  it("false pour ROLE_BENEFICIAIRE", () => {
    expect(makeUser([RoleValues.ROLE_BENEFICIAIRE]).isPlanificateur).toBe(false);
  });

  it("false pour un tableau vide", () => {
    expect(makeUser([]).isPlanificateur).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isIntervenant / isBeneficiaire / isDemandeur
// ---------------------------------------------------------------------------

describe("Utilisateur - rôles métier", () => {
  it("isIntervenant : true pour ROLE_INTERVENANT", () => {
    expect(makeUser([RoleValues.ROLE_INTERVENANT]).isIntervenant).toBe(true);
  });

  it("isBeneficiaire : true pour ROLE_BENEFICIAIRE", () => {
    expect(makeUser([RoleValues.ROLE_BENEFICIAIRE]).isBeneficiaire).toBe(true);
  });

  it("isDemandeur : true pour ROLE_DEMANDEUR", () => {
    expect(makeUser([RoleValues.ROLE_DEMANDEUR]).isDemandeur).toBe(true);
  });

  it("isCommissionMembre : true pour ROLE_MEMBRE_COMMISSION", () => {
    expect(makeUser([RoleValues.ROLE_MEMBRE_COMMISSION]).isCommissionMembre).toBe(true);
  });

  it("isReferentComposante : true pour ROLE_REFERENT_COMPOSANTE", () => {
    expect(makeUser([RoleValues.ROLE_REFERENT_COMPOSANTE]).isReferentComposante).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// roleCalcule — chaîne de priorité
// ---------------------------------------------------------------------------

describe("Utilisateur.roleCalcule", () => {
  it("ROLE_ADMIN_TECHNIQUE a la priorité absolue", () => {
    expect(makeUser([RoleValues.ROLE_ADMIN_TECHNIQUE, RoleValues.ROLE_ADMIN]).roleCalcule).toBe(
      RoleValues.ROLE_ADMIN_TECHNIQUE,
    );
  });

  it("ROLE_ADMIN avant ROLE_GESTIONNAIRE", () => {
    expect(makeUser([RoleValues.ROLE_ADMIN, RoleValues.ROLE_GESTIONNAIRE]).roleCalcule).toBe(
      RoleValues.ROLE_ADMIN,
    );
  });

  it("ROLE_RENFORT avant ROLE_GESTIONNAIRE", () => {
    expect(makeUser([RoleValues.ROLE_RENFORT, RoleValues.ROLE_GESTIONNAIRE]).roleCalcule).toBe(
      RoleValues.ROLE_RENFORT,
    );
  });

  it("ROLE_GESTIONNAIRE seul", () => {
    expect(makeUser([RoleValues.ROLE_GESTIONNAIRE]).roleCalcule).toBe(RoleValues.ROLE_GESTIONNAIRE);
  });

  it("ROLE_INTERVENANT", () => {
    expect(makeUser([RoleValues.ROLE_INTERVENANT]).roleCalcule).toBe(RoleValues.ROLE_INTERVENANT);
  });

  it("ROLE_BENEFICIAIRE", () => {
    expect(makeUser([RoleValues.ROLE_BENEFICIAIRE]).roleCalcule).toBe(RoleValues.ROLE_BENEFICIAIRE);
  });

  it("ROLE_DEMANDEUR", () => {
    expect(makeUser([RoleValues.ROLE_DEMANDEUR]).roleCalcule).toBe(RoleValues.ROLE_DEMANDEUR);
  });

  it("retourne undefined pour un tableau de rôles vide", () => {
    expect(makeUser([]).roleCalcule).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getRoleColor
// ---------------------------------------------------------------------------

describe("Utilisateur.getRoleColor", () => {
  it("'gold' pour un admin", () => {
    expect(makeUser([RoleValues.ROLE_ADMIN]).getRoleColor()).toBe("gold");
  });

  it("'gold' pour un admin technique", () => {
    expect(makeUser([RoleValues.ROLE_ADMIN_TECHNIQUE]).getRoleColor()).toBe("gold");
  });

  it("'blue' pour un gestionnaire (non-admin)", () => {
    expect(makeUser([RoleValues.ROLE_GESTIONNAIRE]).getRoleColor()).toBe("blue");
  });

  it("'processing' pour un renfort", () => {
    expect(makeUser([RoleValues.ROLE_RENFORT]).getRoleColor()).toBe("processing");
  });

  it("'purple' pour un membre de commission", () => {
    expect(makeUser([RoleValues.ROLE_MEMBRE_COMMISSION]).getRoleColor()).toBe("purple");
  });

  it("'default' pour un bénéficiaire", () => {
    expect(makeUser([RoleValues.ROLE_BENEFICIAIRE]).getRoleColor()).toBe("default");
  });

  it("'default' pour un tableau vide", () => {
    expect(makeUser([]).getRoleColor()).toBe("default");
  });
});

// ---------------------------------------------------------------------------
// APIEndpointByRole
// ---------------------------------------------------------------------------

describe("APIEndpointByRole", () => {
  it("retourne '/beneficiaires' pour ROLE_BENEFICIAIRE", () => {
    expect(APIEndpointByRole(RoleValues.ROLE_BENEFICIAIRE)).toBe("/beneficiaires");
  });

  it("retourne '/intervenants' pour ROLE_INTERVENANT", () => {
    expect(APIEndpointByRole(RoleValues.ROLE_INTERVENANT)).toBe("/intervenants");
  });

  it("retourne '/utilisateurs' par défaut (ROLE_ADMIN)", () => {
    expect(APIEndpointByRole(RoleValues.ROLE_ADMIN)).toBe("/utilisateurs");
  });

  it("retourne '/utilisateurs' par défaut (ROLE_GESTIONNAIRE)", () => {
    expect(APIEndpointByRole(RoleValues.ROLE_GESTIONNAIRE)).toBe("/utilisateurs");
  });
});

// ---------------------------------------------------------------------------
// getRoleLabel
// ---------------------------------------------------------------------------

describe("getRoleLabel", () => {
  it("retourne 'Administrateur' pour ROLE_ADMIN", () => {
    expect(getRoleLabel(RoleValues.ROLE_ADMIN)).toBe("Administrateur");
  });

  it("retourne le bon label pour ROLE_GESTIONNAIRE", () => {
    expect(getRoleLabel(RoleValues.ROLE_GESTIONNAIRE)).toBe("Chargé•e d'accompagnement");
  });

  it("retourne 'Bénéficiaire' pour ROLE_BENEFICIAIRE", () => {
    expect(getRoleLabel(RoleValues.ROLE_BENEFICIAIRE)).toBe("Bénéficiaire");
  });

  it("retourne 'Intervenant' pour ROLE_INTERVENANT", () => {
    expect(getRoleLabel(RoleValues.ROLE_INTERVENANT)).toBe("Intervenant");
  });

  it("retourne '-Rôle inconnu-' pour undefined", () => {
    expect(getRoleLabel(undefined)).toBe("-Rôle inconnu-");
  });
});

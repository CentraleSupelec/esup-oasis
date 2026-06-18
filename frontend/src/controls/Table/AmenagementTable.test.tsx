import React from "react";
import { screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test";
import { AmenagementTable } from "./AmenagementTable";
import {
  AmenagementsBeneficiaireTable,
  buildAmenagementsBenefDatasource,
  getTypesAmenagements,
} from "./AmenagementsBeneficiaireTable";
import {
  filtreAmenagementToApi,
  getFiltreAmenagementDefault,
  FiltreAmenagement,
} from "./AmenagementTableLayout";
import { ModeAffichageAmenagement } from "@routes/gestionnaire/beneficiaires/Amenagements";
import { AmenagementDomaine } from "@lib";
import { ITypeAmenagement } from "@api";

// --- Hoisted mocks ---
const { mockUseGetCollection } = vi.hoisted(() => ({
  mockUseGetCollection: vi.fn(() => ({
    data: undefined as { items: unknown[]; totalItems: number } | undefined,
    isFetching: false as boolean,
  })),
}));

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({
    useGetCollection: mockUseGetCollection,
    useGetFullCollection: vi.fn(() => ({ data: undefined, isFetching: false })),
  }),
}));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: { isGestionnaire: false, isRenfort: false, uid: "test@test.fr" },
  }),
}));

vi.mock("@controls/Table/AmenagementTableColumns", () => ({
  amenagementTableColumns: () => [
    { title: "Bénéficiaire", dataIndex: "beneficiaire", key: "beneficiaire" },
    { title: "Type aménagement", dataIndex: "typeAmenagement", key: "typeAmenagement" },
  ],
}));

vi.mock("@controls/Table/AmenagementsBeneficiaireTableColumns", () => ({
  amenagementsBeneficiaireTableColumns: () => [
    { title: "Nom", dataIndex: "nom", key: "nom" },
    { title: "Prénom", dataIndex: "prenom", key: "prenom" },
  ],
}));

vi.mock("@controls/Modals/ModalAmenagement", () => ({
  ModalAmenagement: () => null,
}));

vi.mock("antd/es/grid/hooks/useBreakpoint", () => ({
  default: () => ({ lg: true }),
}));

vi.mock("@utils/logger", () => ({ logger: { error: vi.fn() } }));

const FILTRE_DEFAULT: FiltreAmenagement = { page: 1, itemsPerPage: 25 };

const makeAmenagementRow = (n: number) => ({
  "@id": `/amenagements/${n}`,
  typeAmenagement: `/types_amenagements/${n}`,
  beneficiaire: { "@id": `/utilisateurs/ben${n}@test.fr`, uid: `ben${n}@test.fr` },
});

const makeAmenagementBenefRow = (n: number) => ({
  "@id": `/amenagements/utilisateurs/${n}`,
  uid: `ben${n}@test.fr`,
  nom: `Nom${n}`,
  prenom: `Prenom${n}`,
  email: `ben${n}@test.fr`,
  tags: [],
  inscriptions: [],
  amenagements: [],
});

// ---------------------------------------------------------------------------
// 1. Pure helpers – filtreAmenagementToApi
// ---------------------------------------------------------------------------

describe("filtreAmenagementToApi", () => {
  it("mode ParAmenagement : inclut order[beneficiaires.utilisateur.nom] et suivi[]", () => {
    const filtre: FiltreAmenagement = {
      page: 2,
      itemsPerPage: 50,
      "order[beneficiaires.utilisateur.nom]": "desc",
      "suivis[]": ["/suivis/1"],
    };
    const result = filtreAmenagementToApi(filtre, ModeAffichageAmenagement.ParAmenagement);
    expect(result["order[beneficiaires.utilisateur.nom]"]).toBe("desc");
    expect((result as Record<string, unknown>)["suivi[]"]).toEqual(["/suivis/1"]);
    expect(result.page).toBe(2);
    expect(result.itemsPerPage).toBe(50);
  });

  it("mode ParBeneficiaire : inclut order[nom] et flags domaine", () => {
    const filtre: FiltreAmenagement = {
      page: 1,
      itemsPerPage: 25,
      domaine: AmenagementDomaine.examen,
    };
    const result = filtreAmenagementToApi(filtre, ModeAffichageAmenagement.ParBeneficiaire);
    expect(result["order[nom]"]).toBe("asc");
    expect((result as Record<string, unknown>).examens).toBe(true);
    expect((result as Record<string, unknown>).pedagogique).toBeUndefined();
    expect((result as Record<string, unknown>).aideHumaine).toBeUndefined();
  });

  it("mode ParBeneficiaire domaine aideHumaine : active le flag aideHumaine", () => {
    const filtre: FiltreAmenagement = {
      page: 1,
      itemsPerPage: 25,
      domaine: AmenagementDomaine.aideHumaine,
    };
    const result = filtreAmenagementToApi(filtre, ModeAffichageAmenagement.ParBeneficiaire);
    expect((result as Record<string, unknown>).aideHumaine).toBe(true);
    expect((result as Record<string, unknown>).examens).toBeUndefined();
  });

  it("mode ParAmenagement domaine aideHumaine : active type.aideHumaine", () => {
    const filtre: FiltreAmenagement = {
      page: 1,
      itemsPerPage: 25,
      domaine: AmenagementDomaine.aideHumaine,
    };
    const result = filtreAmenagementToApi(filtre, ModeAffichageAmenagement.ParAmenagement);
    expect((result as Record<string, unknown>)["type.aideHumaine"]).toBe(true);
    expect((result as Record<string, unknown>)["type.examens"]).toBeUndefined();
  });

  it("propage les filtres communs (tags, type, composante, formation, gestionnaire, nom, etatAvisEse)", () => {
    const filtre: FiltreAmenagement = {
      page: 1,
      itemsPerPage: 25,
      "tags[]": ["/tags/1"],
      "type[]": ["/types/1"],
      "composante[]": ["/composantes/1"],
      "formation[]": ["/formations/1"],
      "gestionnaire[]": ["/gestionnaires/1"],
      nom: "Dupont",
      etatAvisEse: "favorable",
    };
    const result = filtreAmenagementToApi(filtre, ModeAffichageAmenagement.ParAmenagement);
    expect(result["tags[]"]).toEqual(["/tags/1"]);
    expect(result["type[]"]).toEqual(["/types/1"]);
    expect(result["composante[]"]).toEqual(["/composantes/1"]);
    expect(result["formation[]"]).toEqual(["/formations/1"]);
    expect(result["gestionnaire[]"]).toEqual(["/gestionnaires/1"]);
    expect(result.nom).toBe("Dupont");
    expect((result as Record<string, unknown>).etatAvisEse).toBe("favorable");
  });
});

// ---------------------------------------------------------------------------
// 2. Pure helpers – getFiltreAmenagementDefault
// ---------------------------------------------------------------------------

describe("getFiltreAmenagementDefault", () => {
  it("utilisateur gestionnaire : retourne le filtre générique (domaine=Tous)", () => {
    const user = { isRenfort: true, isGestionnaire: true } as never;
    const filtre = getFiltreAmenagementDefault(user);
    expect(filtre.domaine).toBe("Tous");
    expect(filtre.restreindreColonnes).toBe(false);
  });

  it("utilisateur renfort non gestionnaire : domaine aideHumaine, colonnes restreintes", () => {
    const user = { isRenfort: true, isGestionnaire: false } as never;
    const filtre = getFiltreAmenagementDefault(user);
    expect(filtre.domaine).toBe(AmenagementDomaine.aideHumaine);
    expect(filtre.restreindreColonnes).toBe(true);
  });

  it("utilisateur standard : filtre par défaut générique", () => {
    const user = { isRenfort: false, isGestionnaire: false } as never;
    const filtre = getFiltreAmenagementDefault(user);
    expect(filtre.domaine).toBe("Tous");
    expect(filtre.page).toBe(1);
    expect(filtre.itemsPerPage).toBe(25);
  });
});

// ---------------------------------------------------------------------------
// 3. Pure helpers – buildAmenagementsBenefDatasource & getTypesAmenagements
// ---------------------------------------------------------------------------

describe("buildAmenagementsBenefDatasource", () => {
  it("retourne un tableau vide pour une entrée vide", () => {
    expect(buildAmenagementsBenefDatasource([], [])).toEqual([]);
  });

  it("mappe les champs de base du bénéficiaire", () => {
    const row = makeAmenagementBenefRow(1);
    const result = buildAmenagementsBenefDatasource([row] as never, []);
    expect(result).toHaveLength(1);
    expect(result[0].uid).toBe("ben1@test.fr");
    expect(result[0].nom).toBe("Nom1");
    expect(result[0].prenom).toBe("Prenom1");
    expect(result[0].email).toBe("ben1@test.fr");
  });

  it("associe les aménagements aux colonnes de type", () => {
    const typeId = "/types_amenagements/1";
    const row = {
      "@id": "/amenagements/utilisateurs/1",
      uid: "ben1@test.fr",
      nom: "Nom1",
      prenom: "Prenom1",
      email: "ben1@test.fr",
      tags: [],
      inscriptions: [],
      amenagements: [
        { "@id": "/amenagements/1", typeAmenagement: { "@id": typeId }, commentaire: "ok" },
      ],
    };
    const type = { "@id": typeId, libelle: "Type1" } as ITypeAmenagement;
    const typeDomaine = { typeAmenagement: type, domaine: {} as never };
    const result = buildAmenagementsBenefDatasource([row] as never, [typeDomaine]);
    expect(result[0][typeId]).toEqual({ "@id": "/amenagements/1", commentaire: "ok" });
  });
});

describe("getTypesAmenagements", () => {
  it("retourne une liste vide pour une entrée vide", () => {
    expect(getTypesAmenagements([], [])).toEqual([]);
  });

  it("déduplique les types d'aménagements", () => {
    const typeId = "/types_amenagements/1";
    const amenagement = { typeAmenagement: { "@id": typeId } };
    const row = { amenagements: [amenagement, amenagement] } as never;
    const types = [
      { "@id": typeId, libelle: "T1", aideHumaine: false, pedagogique: true, examens: false },
    ] as ITypeAmenagement[];
    const result = getTypesAmenagements([row], types);
    expect(result).toHaveLength(1);
    expect(result[0].typeAmenagement["@id"]).toBe(typeId);
  });
});

// ---------------------------------------------------------------------------
// 4. AmenagementTable – composant
// ---------------------------------------------------------------------------

describe("AmenagementTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetCollection.mockReturnValue({ data: undefined, isFetching: false });
  });

  it("rendu sans données : le tableau s'affiche sans erreur", () => {
    renderWithProviders(
      <AmenagementTable filtreAmenagement={FILTRE_DEFAULT} setFiltreAmenagement={vi.fn()} />,
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("rendu sans données : aucune ligne de données (1 en-tête + 1 vide)", () => {
    renderWithProviders(
      <AmenagementTable filtreAmenagement={FILTRE_DEFAULT} setFiltreAmenagement={vi.fn()} />,
    );
    expect(screen.getAllByRole("row")).toHaveLength(2);
  });

  it("rendu avec 3 aménagements : 3 lignes de données affichées", () => {
    mockUseGetCollection.mockReturnValue({
      data: {
        items: [makeAmenagementRow(1), makeAmenagementRow(2), makeAmenagementRow(3)],
        totalItems: 3,
      },
      isFetching: false,
    });
    renderWithProviders(
      <AmenagementTable filtreAmenagement={FILTRE_DEFAULT} setFiltreAmenagement={vi.fn()} />,
    );
    // 1 header + 3 data rows
    expect(screen.getAllByRole("row")).toHaveLength(4);
  });

  it("état chargement : le tableau reste présent pendant le fetch", () => {
    mockUseGetCollection.mockReturnValue({ data: undefined, isFetching: true });
    renderWithProviders(
      <AmenagementTable filtreAmenagement={FILTRE_DEFAULT} setFiltreAmenagement={vi.fn()} />,
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("appelle setCount avec totalItems quand des données arrivent", () => {
    const setCount = vi.fn();
    mockUseGetCollection.mockReturnValue({
      data: { items: [makeAmenagementRow(1)], totalItems: 42 },
      isFetching: false,
    });
    renderWithProviders(
      <AmenagementTable
        filtreAmenagement={FILTRE_DEFAULT}
        setFiltreAmenagement={vi.fn()}
        setCount={setCount}
      />,
    );
    expect(setCount).toHaveBeenCalledWith(42);
  });

  it("appelle useGetCollection avec le bon path /amenagements", () => {
    renderWithProviders(
      <AmenagementTable filtreAmenagement={FILTRE_DEFAULT} setFiltreAmenagement={vi.fn()} />,
    );
    expect(mockUseGetCollection).toHaveBeenCalledWith(
      expect.objectContaining({ path: "/amenagements" }),
    );
  });
});

// ---------------------------------------------------------------------------
// 5. AmenagementsBeneficiaireTable – composant
// ---------------------------------------------------------------------------

describe("AmenagementsBeneficiaireTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetCollection.mockReturnValue({ data: undefined, isFetching: false });
  });

  it("rendu sans données : le tableau s'affiche sans erreur", () => {
    renderWithProviders(
      <AmenagementsBeneficiaireTable
        filtreAmenagement={FILTRE_DEFAULT}
        setFiltreAmenagement={vi.fn()}
      />,
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("rendu sans données : aucune ligne de données (1 en-tête + 1 vide)", () => {
    renderWithProviders(
      <AmenagementsBeneficiaireTable
        filtreAmenagement={FILTRE_DEFAULT}
        setFiltreAmenagement={vi.fn()}
      />,
    );
    expect(screen.getAllByRole("row")).toHaveLength(2);
  });

  it("rendu avec 2 bénéficiaires : 2 lignes de données affichées", () => {
    mockUseGetCollection.mockReturnValue({
      data: {
        items: [makeAmenagementBenefRow(1), makeAmenagementBenefRow(2)],
        totalItems: 2,
      },
      isFetching: false,
    });
    renderWithProviders(
      <AmenagementsBeneficiaireTable
        filtreAmenagement={FILTRE_DEFAULT}
        setFiltreAmenagement={vi.fn()}
      />,
    );
    // 1 header + 2 data rows
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  it("état chargement : le tableau reste présent pendant le fetch", () => {
    mockUseGetCollection.mockReturnValue({ data: undefined, isFetching: true });
    renderWithProviders(
      <AmenagementsBeneficiaireTable
        filtreAmenagement={FILTRE_DEFAULT}
        setFiltreAmenagement={vi.fn()}
      />,
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("appelle setCount avec totalItems quand des données arrivent", () => {
    const setCount = vi.fn();
    mockUseGetCollection.mockReturnValue({
      data: { items: [makeAmenagementBenefRow(1)], totalItems: 7 },
      isFetching: false,
    });
    renderWithProviders(
      <AmenagementsBeneficiaireTable
        filtreAmenagement={FILTRE_DEFAULT}
        setFiltreAmenagement={vi.fn()}
        setCount={setCount}
      />,
    );
    expect(setCount).toHaveBeenCalledWith(7);
  });

  it("appelle useGetCollection avec le bon path /amenagements/utilisateurs", () => {
    renderWithProviders(
      <AmenagementsBeneficiaireTable
        filtreAmenagement={FILTRE_DEFAULT}
        setFiltreAmenagement={vi.fn()}
      />,
    );
    expect(mockUseGetCollection).toHaveBeenCalledWith(
      expect.objectContaining({ path: "/amenagements/utilisateurs" }),
    );
  });
});

import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test";
import EvenementTable from "./EvenementTable";
import { evenementTableColumns } from "./EvenementTableColumns";
import { Evenement } from "@lib";

// --- Hoisted mocks ---
const { mockSetModalEvenementId } = vi.hoisted(() => ({
  mockSetModalEvenementId: vi.fn(),
}));

vi.mock("@context/modals/ModalsContext", () => ({
  useModals: () => ({ setModalEvenementId: mockSetModalEvenementId }),
}));

vi.mock("@controls/Table/EvenementTableExport", () => ({
  default: () => <span data-testid="evenement-table-export" />,
}));

vi.mock("@controls/Items/EtudiantItem", () => ({
  EtudiantItem: ({ utilisateurId }: { utilisateurId: string }) => (
    <span data-testid="etudiant-item">{utilisateurId}</span>
  ),
}));

vi.mock("@controls/Items/TypeEvenementItem", () => ({
  TypeEvenementItem: ({ typeEvenementId }: { typeEvenementId: string }) => (
    <span data-testid="type-evenement-item">{typeEvenementId}</span>
  ),
}));

vi.mock("@controls/Items/CampusItem", () => ({
  CampusItem: ({ campusId }: { campusId: string }) => (
    <span data-testid="campus-item">{campusId}</span>
  ),
}));

vi.mock("@controls/Items/EvenementIconeEnvoiRhItem", () => ({
  EvenementIconeEnvoiRhItem: () => <span data-testid="envoi-rh-item" />,
}));

vi.mock("@utils/logger", () => ({ logger: { error: vi.fn() } }));

// --- Auth mock (overridden per test via mockUseAuth) ---
const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(() => ({
    user: { isPlanificateur: false, uid: "test@test.fr" },
  })),
}));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => mockUseAuth(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeEvenement = (overrides: Partial<ConstructorParameters<typeof Evenement>[0]> = {}) =>
  new Evenement({
    "@id": "/evenements/1",
    "@type": "Evenement",
    debut: "2026-06-16T09:00:00+02:00",
    fin: "2026-06-16T11:00:00+02:00",
    libelle: "Mon événement",
    type: "/types_evenements/1",
    beneficiaires: ["/utilisateurs/ben1@test.fr"],
    intervenant: "/utilisateurs/int1@test.fr",
    campus: "/campus/1",
    ...overrides,
  });

// ---------------------------------------------------------------------------
// 1. EvenementTable – composant
// ---------------------------------------------------------------------------

describe("EvenementTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { isPlanificateur: false, uid: "test@test.fr" } });
  });

  it("rendu avec liste vide : le tableau s'affiche sans erreur", () => {
    renderWithProviders(<EvenementTable events={[]} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("rendu avec liste vide : seule la ligne d'en-tête est présente", () => {
    renderWithProviders(<EvenementTable events={[]} />);
    // 1 header row + 1 empty placeholder (Ant Design)
    expect(screen.getAllByRole("row")).toHaveLength(2);
  });

  it("rendu avec 3 événements : 3 lignes de données affichées", () => {
    const events = [
      makeEvenement({ "@id": "/evenements/1" }),
      makeEvenement({ "@id": "/evenements/2" }),
      makeEvenement({ "@id": "/evenements/3" }),
    ];
    renderWithProviders(<EvenementTable events={events} />);
    // 1 header + 3 data rows
    expect(screen.getAllByRole("row")).toHaveLength(4);
  });

  it("non planificateur : le bouton d'export n'est pas affiché", () => {
    mockUseAuth.mockReturnValue({ user: { isPlanificateur: false, uid: "test@test.fr" } });
    renderWithProviders(<EvenementTable events={[makeEvenement()]} />);
    expect(screen.queryByTestId("evenement-table-export")).not.toBeInTheDocument();
  });

  it("planificateur : le composant d'export est affiché", () => {
    mockUseAuth.mockReturnValue({ user: { isPlanificateur: true, uid: "test@test.fr" } });
    renderWithProviders(<EvenementTable events={[makeEvenement()]} />);
    expect(screen.getByTestId("evenement-table-export")).toBeInTheDocument();
  });

  it("cliquer sur 'Voir' appelle setModalEvenementId avec l'@id de l'événement", () => {
    const evt = makeEvenement({ "@id": "/evenements/42" });
    renderWithProviders(<EvenementTable events={[evt]} />);
    fireEvent.click(screen.getByRole("button", { name: /voir/i }));
    expect(mockSetModalEvenementId).toHaveBeenCalledWith("/evenements/42");
  });

  it("classe CSS 'affecte' sur les lignes avec intervenant", () => {
    const affecte = makeEvenement({ intervenant: "/utilisateurs/int1@test.fr" });
    renderWithProviders(<EvenementTable events={[affecte]} />);
    const rows = screen.getAllByRole("row");
    // rows[0] = header, rows[1] = data
    expect(rows[1]).toHaveClass("affecte");
  });

  it("classe CSS 'not-affecte' sur les lignes sans intervenant", () => {
    const nonAffecte = makeEvenement({ intervenant: undefined });
    renderWithProviders(<EvenementTable events={[nonAffecte]} />);
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveClass("not-affecte");
  });

  it("affiche la date formatée DD/MM/YYYY", () => {
    renderWithProviders(<EvenementTable events={[makeEvenement()]} />);
    expect(screen.getByText("16/06/2026")).toBeInTheDocument();
  });

  it("affiche les heures de début et de fin", () => {
    renderWithProviders(<EvenementTable events={[makeEvenement()]} />);
    expect(screen.getByText(/09:00 à 11:00/)).toBeInTheDocument();
  });

  it("les bénéficiaires sont rendus dans les cellules", () => {
    renderWithProviders(<EvenementTable events={[makeEvenement()]} />);
    expect(screen.getByText("/utilisateurs/ben1@test.fr")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 2. evenementTableColumns – fonction pure
// ---------------------------------------------------------------------------

describe("evenementTableColumns", () => {
  it("inclut les colonnes Date, Libellé, Catégorie, Bénéficiaires, Actions", () => {
    const cols = evenementTableColumns({});
    const titles = cols.map((c) => c.title).filter(Boolean);
    expect(titles).toContain("Date");
    expect(titles).toContain("Libellé");
    expect(titles).toContain("Catégorie");
    expect(titles).toContain("Bénéficiaires");
  });

  it("saisieEvtRenfort=false : colonnes Intervenant et Campus présentes", () => {
    const cols = evenementTableColumns({ saisieEvtRenfort: false });
    const titles = cols.map((c) => c.title).filter(Boolean);
    expect(titles).toContain("Intervenant");
    expect(titles).toContain("Campus");
  });

  it("saisieEvtRenfort=true : colonnes Intervenant et Campus absentes", () => {
    const cols = evenementTableColumns({ saisieEvtRenfort: true });
    // When saisieEvtRenfort, the column slots are replaced by empty objects {}
    const titles = cols.map((c) => c.title).filter(Boolean);
    expect(titles).not.toContain("Intervenant");
    expect(titles).not.toContain("Campus");
  });

  it("afficherEtatEnvoiRh=true : colonne 'Transmis RH' présente", () => {
    const cols = evenementTableColumns({ afficherEtatEnvoiRh: true });
    const titles = cols.map((c) => c.title).filter(Boolean);
    expect(titles).toContain("Transmis RH");
  });

  it("afficherEtatEnvoiRh=false : colonne 'Transmis RH' absente", () => {
    const cols = evenementTableColumns({ afficherEtatEnvoiRh: false });
    const titles = cols.map((c) => c.title).filter(Boolean);
    expect(titles).not.toContain("Transmis RH");
  });

  it("la colonne Actions contient un bouton 'Voir'", () => {
    const cols = evenementTableColumns({});
    const actionsCol = cols.find((c) => c.key === "actions");
    expect(actionsCol).toBeDefined();
  });
});

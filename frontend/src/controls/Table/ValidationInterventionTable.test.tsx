import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test";
import ValidationInterventionTable from "./ValidationInterventionTable";

// --- Hoisted mocks ---
const { mockUseGetCollectionPaginated, mockMutate, mockNotifSuccess } = vi.hoisted(() => ({
  mockUseGetCollectionPaginated: vi.fn(() => ({
    data: undefined as { items: unknown[]; totalItems: number } | undefined,
    isFetching: false as boolean,
  })),
  mockMutate: vi.fn(),
  mockNotifSuccess: vi.fn(),
}));

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({
    useGetCollectionPaginated: mockUseGetCollectionPaginated,
    useGetFullCollection: vi.fn(() => ({ data: undefined, isFetching: false })),
    usePatch: vi.fn(() => ({ mutate: mockMutate })),
  }),
}));

vi.mock("@/queryClient", () => ({
  queryClient: { invalidateQueries: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();
  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({
        notification: { success: mockNotifSuccess, error: vi.fn() },
      }),
    },
  };
});

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

vi.mock("@utils/logger", () => ({ logger: { error: vi.fn() } }));

const makeIntervention = (n: number, overrides: Record<string, unknown> = {}) => ({
  "@id": `/evenements/${n}`,
  id: n,
  debut: "2026-06-16T09:00:00+02:00",
  fin: "2026-06-16T10:00:00+02:00",
  type: "/types_evenements/1",
  intervenant: `/utilisateurs/intervenant${n}@test.fr`,
  ...overrides,
});

describe("ValidationInterventionTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetCollectionPaginated.mockReturnValue({ data: undefined, isFetching: false });
  });

  // --- Rendu de base ---

  it("rendu sans données : le tableau s'affiche sans erreur", () => {
    renderWithProviders(<ValidationInterventionTable />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("rendu sans données : seule la ligne d'en-tête et la ligne vide sont présentes", () => {
    renderWithProviders(<ValidationInterventionTable />);
    // 1 header row + 1 empty placeholder row (Ant Design)
    expect(screen.getAllByRole("row")).toHaveLength(2);
  });

  it("rendu avec 3 interventions : 3 lignes de données sont affichées", () => {
    mockUseGetCollectionPaginated.mockReturnValue({
      data: {
        items: [makeIntervention(1), makeIntervention(2), makeIntervention(3)],
        totalItems: 3,
      },
      isFetching: false,
    });
    renderWithProviders(<ValidationInterventionTable />);
    // 1 header row + 3 data rows
    expect(screen.getAllByRole("row")).toHaveLength(4);
  });

  it("état chargement : le tableau reste présent pendant le fetch", () => {
    mockUseGetCollectionPaginated.mockReturnValue({ data: undefined, isFetching: true });
    renderWithProviders(<ValidationInterventionTable />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  // --- Colonnes ---

  it("affiche les colonnes Date, Renfort, Catégorie, Durée", () => {
    renderWithProviders(<ValidationInterventionTable />);
    expect(screen.getByRole("columnheader", { name: "Date" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /renfort/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /catégorie/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /durée/i })).toBeInTheDocument();
  });

  it("affiche la date et les heures d'une intervention", () => {
    mockUseGetCollectionPaginated.mockReturnValue({
      data: { items: [makeIntervention(1)], totalItems: 1 },
      isFetching: false,
    });
    renderWithProviders(<ValidationInterventionTable />);
    expect(screen.getByText("16/06/2026")).toBeInTheDocument();
    expect(screen.getByText(/09:00 à 10:00/)).toBeInTheDocument();
  });

  it("affiche la durée calculée en minutes", () => {
    mockUseGetCollectionPaginated.mockReturnValue({
      data: { items: [makeIntervention(1)], totalItems: 1 },
      isFetching: false,
    });
    renderWithProviders(<ValidationInterventionTable />);
    // debut 09:00, fin 10:00 → 60 minutes
    expect(screen.getByText(/60/)).toBeInTheDocument();
  });

  it("affiche la mention d'annulation pour une intervention annulée", () => {
    mockUseGetCollectionPaginated.mockReturnValue({
      data: {
        items: [makeIntervention(1, { dateAnnulation: "2026-06-15T10:00:00+02:00" })],
        totalItems: 1,
      },
      isFetching: false,
    });
    renderWithProviders(<ValidationInterventionTable />);
    expect(screen.getByText(/annulée le/i)).toBeInTheDocument();
    expect(screen.getByText(/15\/06\/2026/)).toBeInTheDocument();
  });

  // --- Switch filtre annulations ---

  it("le switch 'Masquer les annulations' est présent et actif par défaut", () => {
    renderWithProviders(<ValidationInterventionTable />);
    expect(screen.getByText(/masquer les annulations/i)).toBeInTheDocument();
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("aria-checked", "true");
  });

  it("désactiver le switch décoche l'interrupteur", () => {
    renderWithProviders(<ValidationInterventionTable />);
    const switchEl = screen.getByRole("switch");
    fireEvent.click(switchEl);
    expect(switchEl).toHaveAttribute("aria-checked", "false");
  });

  // --- États des lignes ---

  it("une intervention annulée porte la classe 'table-row-deleted'", () => {
    mockUseGetCollectionPaginated.mockReturnValue({
      data: {
        items: [
          makeIntervention(1),
          makeIntervention(2, { dateAnnulation: "2026-06-15T10:00:00+02:00" }),
        ],
        totalItems: 2,
      },
      isFetching: false,
    });
    renderWithProviders(<ValidationInterventionTable />);
    const rows = screen.getAllByRole("row");
    // rows[0] = header, rows[1] = normale, rows[2] = annulée
    expect(rows[1]).not.toHaveClass("table-row-deleted");
    expect(rows[2]).toHaveClass("table-row-deleted");
  });

  // --- Sélection multiple ---

  it("sans sélection, le FloatButton de validation n'est pas rendu", () => {
    mockUseGetCollectionPaginated.mockReturnValue({
      data: { items: [makeIntervention(1)], totalItems: 1 },
      isFetching: false,
    });
    renderWithProviders(<ValidationInterventionTable />);
    // Le groupe n'est rendu que si selectedRowsKeys.length > 0
    expect(screen.queryByRole("img", { name: /menu/i })).not.toBeInTheDocument();
  });

  it("cliquer sur une ligne la sélectionne et affiche le FloatButton", async () => {
    mockUseGetCollectionPaginated.mockReturnValue({
      data: { items: [makeIntervention(1)], totalItems: 1 },
      isFetching: false,
    });
    renderWithProviders(<ValidationInterventionTable />);
    const rows = screen.getAllByRole("row");
    // rows[0] = header, rows[1] = data row
    fireEvent.click(rows[1]);
    await waitFor(() => {
      // Le FloatButton.Group est rendu avec son icône déclencheur
      expect(screen.getByRole("img", { name: /menu/i })).toBeInTheDocument();
    });
  });

  it("cliquer deux fois sur la même ligne la désélectionne", async () => {
    mockUseGetCollectionPaginated.mockReturnValue({
      data: { items: [makeIntervention(1)], totalItems: 1 },
      isFetching: false,
    });
    renderWithProviders(<ValidationInterventionTable />);
    const rows = screen.getAllByRole("row");
    // Sélection
    fireEvent.click(rows[1]);
    await waitFor(() => {
      expect(screen.getByRole("img", { name: /menu/i })).toBeInTheDocument();
    });
    // Désélection
    fireEvent.click(rows[1]);
    await waitFor(() => {
      expect(screen.queryByRole("img", { name: /menu/i })).not.toBeInTheDocument();
    });
  });

  it("sélection multiple : cliquer sur plusieurs lignes les sélectionne toutes", async () => {
    mockUseGetCollectionPaginated.mockReturnValue({
      data: {
        items: [makeIntervention(1), makeIntervention(2), makeIntervention(3)],
        totalItems: 3,
      },
      isFetching: false,
    });
    renderWithProviders(<ValidationInterventionTable />);
    const rows = screen.getAllByRole("row");
    // rows[0] = header, rows[1-3] = data
    fireEvent.click(rows[1]);
    fireEvent.click(rows[2]);
    fireEvent.click(rows[3]);
    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      // checkboxes[0] = header select-all, [1-3] = lignes de données
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[2]).toBeChecked();
      expect(checkboxes[3]).toBeChecked();
    });
  });

  // --- Validation / Annulation en masse ---

  it("cliquer sur 'Valider' après sélection appelle mutate avec valide:true", async () => {
    mockUseGetCollectionPaginated.mockReturnValue({
      data: { items: [makeIntervention(42)], totalItems: 1 },
      isFetching: false,
    });
    renderWithProviders(<ValidationInterventionTable />);
    const rows = screen.getAllByRole("row");
    fireEvent.click(rows[1]);

    // Ouvrir le FloatButton.Group (trigger="click")
    await waitFor(() => {
      expect(screen.getByRole("img", { name: /menu/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("img", { name: /menu/i }));

    // Cliquer sur le bouton de validation
    await waitFor(() => {
      expect(screen.getByRole("img", { name: /check/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("img", { name: /check/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          "@id": "/evenements/42",
          data: expect.objectContaining({ valide: true, dateAnnulation: null }),
        }),
      );
    });
  });

  it("cliquer sur 'Annuler' après sélection appelle mutate avec dateAnnulation", async () => {
    mockUseGetCollectionPaginated.mockReturnValue({
      data: { items: [makeIntervention(43)], totalItems: 1 },
      isFetching: false,
    });
    renderWithProviders(<ValidationInterventionTable />);
    const rows = screen.getAllByRole("row");
    fireEvent.click(rows[1]);

    // Ouvrir le FloatButton.Group (trigger="click")
    await waitFor(() => {
      expect(screen.getByRole("img", { name: /menu/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("img", { name: /menu/i }));

    // Cliquer sur le bouton d'annulation
    await waitFor(() => {
      expect(screen.getByRole("img", { name: /delete/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("img", { name: /delete/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          "@id": "/evenements/43",
          data: expect.objectContaining({ valide: false }),
        }),
      );
      // dateAnnulation doit être une date ISO non nulle
      const call = mockMutate.mock.calls[0][0];
      expect(call.data.dateAnnulation).toBeTruthy();
    });
  });
});

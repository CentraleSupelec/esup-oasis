import { screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test";
import IntervenantTable from "./IntervenantTable";

// --- Hoisted mocks ---
const { mockUseGetCollectionPaginated } = vi.hoisted(() => ({
  mockUseGetCollectionPaginated: vi.fn(() => ({
    data: undefined as { items: unknown[]; totalItems: number } | undefined,
    isFetching: false as boolean,
  })),
}));

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({
    useGetCollectionPaginated: mockUseGetCollectionPaginated,
    useGetFullCollection: vi.fn(() => ({ data: undefined, isLoading: false, isFetching: false })),
    useGetItem: vi.fn(() => ({ data: undefined, isLoading: false })),
  }),
}));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: {
      isGestionnaire: false,
      isAdmin: false,
      uid: "test@test.fr",
    },
    impersonate: undefined,
  }),
}));

vi.mock("@context/utilisateurPreferences/UtilisateurPreferencesProvider", () => ({
  usePreferences: () => ({
    getPreferenceArray: vi.fn(() => []),
    preferencesChargees: true,
  }),
}));

vi.mock("@controls/Table/hooks/useFiltreSessionStorage", () => ({
  useFiltreSessionStorage: () => ({ enabled: false, toggle: vi.fn() }),
}));

vi.mock("@context/drawers/DrawersContext", () => ({
  useDrawers: () => ({
    setDrawerUtilisateur: vi.fn(),
  }),
}));

vi.mock("@controls/Table/IntervenantTableFilter", () => ({
  IntervenantTableFilter: () => null,
}));

vi.mock("@controls/Table/IntervenantTableExport", () => ({
  default: () => null,
}));

vi.mock("@controls/Table/FiltreDescription", () => ({
  default: () => null,
}));

vi.mock("@controls/Table/FiltreSessionSwitch", () => ({
  FiltreSessionSwitch: () => null,
}));

vi.mock("@utils/logger", () => ({ logger: { error: vi.fn() } }));

const makeIntervenantRow = (n: number) => ({
  "@id": `/intervenants/user${n}@test.fr`,
  uid: `user${n}@test.fr`,
  nom: `Nom${n}`,
  prenom: `Prenom${n}`,
  email: `user${n}@test.fr`,
  roles: [],
});

describe("IntervenantTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetCollectionPaginated.mockReturnValue({ data: undefined, isFetching: false });
  });

  it("rendu sans données : le tableau s'affiche sans erreur", () => {
    renderWithProviders(<IntervenantTable />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("rendu sans données : aucune ligne de données n'est affichée", () => {
    renderWithProviders(<IntervenantTable />);
    // 1 header row + 1 empty placeholder row (Ant Design)
    expect(screen.getAllByRole("row")).toHaveLength(2);
  });

  it("rendu avec 3 intervenants : 3 lignes de données sont affichées", () => {
    mockUseGetCollectionPaginated.mockReturnValue({
      data: {
        items: [makeIntervenantRow(1), makeIntervenantRow(2), makeIntervenantRow(3)],
        totalItems: 3,
      },
      isFetching: false,
    });
    renderWithProviders(<IntervenantTable />);
    // 1 header row + 3 data rows
    expect(screen.getAllByRole("row")).toHaveLength(4);
  });

  it("affiche le libellé du compte quand des données sont présentes", () => {
    mockUseGetCollectionPaginated.mockReturnValue({
      data: {
        items: [makeIntervenantRow(1), makeIntervenantRow(2)],
        totalItems: 2,
      },
      isFetching: false,
    });
    renderWithProviders(<IntervenantTable />);
    expect(screen.getByText(/2 intervenant/i)).toBeInTheDocument();
  });

  it("affiche le libellé du compte au singulier pour 1 intervenant", () => {
    mockUseGetCollectionPaginated.mockReturnValue({
      data: {
        items: [makeIntervenantRow(1)],
        totalItems: 1,
      },
      isFetching: false,
    });
    renderWithProviders(<IntervenantTable />);
    expect(screen.getByText(/1 intervenant/i)).toBeInTheDocument();
  });

  it("n'affiche pas le bouton 'Retirer les filtres' avec le filtre par défaut", () => {
    renderWithProviders(<IntervenantTable />);
    expect(screen.queryByText(/retirer les filtres/i)).not.toBeInTheDocument();
  });

  it("état chargement : le tableau reste présent pendant le fetch", () => {
    mockUseGetCollectionPaginated.mockReturnValue({ data: undefined, isFetching: true });
    renderWithProviders(<IntervenantTable />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});

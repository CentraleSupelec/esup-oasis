import { within } from "@testing-library/react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test";
import AvancementDemande from "./AvancementDemande";
import { ETAT_DEMANDE_EN_COURS, ETAT_DEMANDE_RECEPTIONNEE, ETAT_DEMANDE_CONFORME } from "@lib";

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({
    useGetItem: vi.fn(() => ({ data: undefined, isLoading: false })),
    useGetFullCollection: vi.fn(() => ({ data: undefined, isLoading: false })),
  }),
}));

function makeDemande(etat: string) {
  return { "@id": "/demandes/1", id: 1, etat } as never;
}

// Steps (aria-hidden) and the sr-only <ol> both contain the same text, so we scope
// all text queries to the sr-only accessible list.
function getSrOnly() {
  return document.querySelector(".sr-only") as HTMLElement;
}

describe("AvancementDemande", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("état EN_COURS : la liste accessible indique que la saisie est en cours", () => {
    renderWithProviders(<AvancementDemande demande={makeDemande(ETAT_DEMANDE_EN_COURS)} />);
    expect(within(getSrOnly()).getByText(/Votre saisie est en cours/i)).toBeInTheDocument();
  });

  it("état RECEPTIONNEE : la liste accessible indique que la demande a été saisie", () => {
    renderWithProviders(<AvancementDemande demande={makeDemande(ETAT_DEMANDE_RECEPTIONNEE)} />);
    expect(within(getSrOnly()).getByText(/Votre demande a été saisie/i)).toBeInTheDocument();
  });

  it("état CONFORME : la liste accessible liste les deux étapes précédentes", () => {
    renderWithProviders(<AvancementDemande demande={makeDemande(ETAT_DEMANDE_CONFORME)} />);
    const list = within(getSrOnly());
    expect(list.getByText(/Votre demande a été saisie/i)).toBeInTheDocument();
    expect(list.getByText(/Votre demande a été réceptionnée/i)).toBeInTheDocument();
  });

  it("accessibilité : aucune violation axe-core pour l'état EN_COURS", async () => {
    const { container } = renderWithProviders(
      <AvancementDemande demande={makeDemande(ETAT_DEMANDE_EN_COURS)} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

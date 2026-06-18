import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { App } from "antd";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NouvelleDemandeModale from "./NouvelleDemandeModale";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const { mockUseGetFullCollection } = vi.hoisted(() => ({
  mockUseGetFullCollection: vi.fn(),
}));

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({ useGetFullCollection: mockUseGetFullCollection }),
}));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({ user: { "@id": "/utilisateurs/test@test.fr" } }),
}));

vi.mock("@controls/Modals/Demande/TypesDemandesListItems", () => ({
  TypesDemandesListItems: ({ titre }: { titre: string }) => (
    <section>
      <h3>{titre}</h3>
    </section>
  ),
}));

vi.mock("antd/es/grid/hooks/useBreakpoint", () => ({
  default: () => ({ lg: true, md: true }),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const typesDemandes = {
  items: [
    {
      "@id": "/types_demandes/1",
      libelle: "Aménagement d'études",
      actif: true,
      campagneEnCours: "/types_demandes/1/campagnes/1",
      campagneSuivante: null,
    },
  ],
  totalItems: 1,
};

const demandes = { items: [], totalItems: 0 };

// ─── Y20 : NouvelleDemandeModale — accessibilité ──────────────────────────────

describe("NouvelleDemandeModale — accessibilité (Y20)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetFullCollection.mockImplementation(({ path }: { path: string }) => {
      if (path === "/types_demandes") return { data: typesDemandes };
      if (path === "/demandes") return { data: demandes };
      return { data: undefined };
    });
  });

  it("expose role='dialog' avec aria-modal='true' quand open=true", async () => {
    render(
      <App>
        <NouvelleDemandeModale open={true} setOpen={vi.fn()} />
      </App>,
    );
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("aucune violation axe-core (modale ouverte)", async () => {
    render(
      <App>
        <NouvelleDemandeModale open={true} setOpen={vi.fn()} />
      </App>,
    );
    await screen.findByRole("dialog");
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });

  it("le titre 'Nouvelle demande' est lisible dans la modale", async () => {
    render(
      <App>
        <NouvelleDemandeModale open={true} setOpen={vi.fn()} />
      </App>,
    );
    await screen.findByRole("dialog");
    expect(screen.getByText(/nouvelle demande/i)).toBeInTheDocument();
  });

  it("rien n'est rendu quand les données API ne sont pas chargées", () => {
    mockUseGetFullCollection.mockReturnValue({ data: undefined });
    render(
      <App>
        <NouvelleDemandeModale open={true} setOpen={vi.fn()} />
      </App>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("rien n'est rendu quand open=false", () => {
    render(
      <App>
        <NouvelleDemandeModale open={false} setOpen={vi.fn()} />
      </App>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Esc ferme la modale (appelle setOpen(false))", async () => {
    const user = userEvent.setup();
    const setOpen = vi.fn();
    render(
      <App>
        <NouvelleDemandeModale open={true} setOpen={setOpen} />
      </App>,
    );
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it("le bouton de fermeture est accessible (bouton natif avec label)", async () => {
    render(
      <App>
        <NouvelleDemandeModale open={true} setOpen={vi.fn()} />
      </App>,
    );
    await screen.findByRole("dialog");
    const closeBtn = document.querySelector(".ant-modal-close");
    expect(closeBtn).not.toBeNull();
    expect(closeBtn?.tagName.toLowerCase()).toBe("button");
  });
});

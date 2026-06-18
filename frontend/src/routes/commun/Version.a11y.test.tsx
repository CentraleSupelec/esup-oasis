import React from "react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test";
import Version from "./Version";

vi.mock("@/versions", () => ({
  VERSIONS: [
    {
      version: "2.0.0",
      date: "2026-06-01",
      description: "Nouvelle version majeure",
      changes: [
        { type: "add", description: "Ajout de la fonctionnalité de validation des renforts" },
        { type: "fix", description: "Correction du calcul de durée des événements" },
      ],
    },
    {
      version: "1.0.0",
      date: "2026-01-01",
      description: "Version initiale",
      changes: [{ type: "add", description: "Mise en place de l'application" }],
    },
  ],
}));

vi.mock("@controls/Items/RoleCalculeItem", () => ({
  RoleCalculeItem: () => null,
}));

describe("Version — accessibilité (Y9)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("aucune violation axe-core", async () => {
    const { container } = renderWithProviders(<Version />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("contient un titre h1 'Notes de version'", () => {
    renderWithProviders(<Version />);
    expect(
      screen.getByRole("heading", { level: 1, name: /notes de version/i }),
    ).toBeInTheDocument();
  });

  it("les numéros de version sont présents en texte lisible", () => {
    renderWithProviders(<Version />);
    expect(screen.getByText(/version 2\.0\.0/i)).toBeInTheDocument();
    expect(screen.getByText(/version 1\.0\.0/i)).toBeInTheDocument();
  });

  it("les descriptions de changements sont lisibles", () => {
    renderWithProviders(<Version />);
    expect(screen.getByText(/validation des renforts/i)).toBeInTheDocument();
    expect(screen.getByText(/calcul de durée/i)).toBeInTheDocument();
  });

  it("chaque version est rendue comme un item de liste", () => {
    renderWithProviders(<Version />);
    // Ant Design List rend des <li class="ant-list-item">
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(2);
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DemandesBadge from "./DemandesBadge";
import EntretiensBadge from "./EntretiensBadge";

const mockUseGetFullCollection = vi.fn();

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({
    useGetFullCollection: mockUseGetFullCollection,
  }),
}));

describe("Badge — accessibilité", () => {
  beforeEach(() => {
    mockUseGetFullCollection.mockReset();
  });

  describe("DemandesBadge", () => {
    it("ne rend rien quand il n'y a pas de demandes", () => {
      mockUseGetFullCollection.mockReturnValue({ data: { items: [] } });
      const { container } = render(<DemandesBadge utilisateurId="/utilisateurs/1" />);
      expect(container.firstChild).toBeNull();
    });

    it("rend le compteur dans le DOM quand des demandes existent", () => {
      mockUseGetFullCollection.mockReturnValue({
        data: { items: [{ "@id": "/demandes/1" }, { "@id": "/demandes/2" }] },
      });
      render(<DemandesBadge utilisateurId="/utilisateurs/1" />);
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("aucune violation axe-core quand le badge est visible", async () => {
      mockUseGetFullCollection.mockReturnValue({
        data: { items: [{ "@id": "/demandes/1" }] },
      });
      const { container } = render(<DemandesBadge utilisateurId="/utilisateurs/1" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("aucune violation axe-core pendant le chargement (data undefined)", async () => {
      mockUseGetFullCollection.mockReturnValue({ data: undefined });
      const { container } = render(<DemandesBadge utilisateurId="/utilisateurs/1" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("EntretiensBadge", () => {
    it("rend le compteur dans le DOM quand des entretiens existent", () => {
      mockUseGetFullCollection.mockReturnValue({
        data: { items: [{ "@id": "/entretiens/1" }] },
      });
      render(<EntretiensBadge utilisateurId="/utilisateurs/1" />);
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("aucune violation axe-core quand le badge est visible", async () => {
      mockUseGetFullCollection.mockReturnValue({
        data: { items: [{ "@id": "/entretiens/1" }, { "@id": "/entretiens/2" }] },
      });
      const { container } = render(<EntretiensBadge utilisateurId="/utilisateurs/1" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

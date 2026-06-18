import React from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { describe, it, expect } from "vitest";
import Spinner from "./Spinner";

describe("Spinner — accessibilité", () => {
  it("expose aria-label 'Chargement en cours' dans le DOM", () => {
    render(<Spinner />);
    expect(screen.getByLabelText(/chargement en cours/i)).toBeInTheDocument();
  });

  it("aucune violation axe-core (taille par défaut)", async () => {
    const { container } = render(<Spinner />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("aucune violation axe-core (taille personnalisée)", async () => {
    const { container } = render(<Spinner size={48} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

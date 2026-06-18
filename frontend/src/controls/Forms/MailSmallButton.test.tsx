/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { App } from "antd";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MailSmallButton } from "./MailSmallButton";
import { IUtilisateur } from "@api";

const writeText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  writeText.mockClear();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    writable: true,
    configurable: true,
  });
});

function makeUtilisateur(overrides?: Partial<IUtilisateur>): IUtilisateur {
  return {
    "@id": "/utilisateurs/u1",
    email: "user@example.com",
    emailPerso: "perso@example.com",
    ...overrides,
  } as IUtilisateur;
}

function renderButton(props: Parameters<typeof MailSmallButton>[0]) {
  return render(
    <App>
      <MailSmallButton {...props} />
    </App>,
  );
}

// ---------------------------------------------------------------------------
// Rendu conditionnel
// ---------------------------------------------------------------------------

describe("MailSmallButton — rendu conditionnel", () => {
  it("ne rend pas de bouton quand utilisateur est undefined", () => {
    renderButton({ utilisateur: undefined });
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("ne rend pas de bouton quand utilisateur n'a pas de email (emailPerso=false)", () => {
    renderButton({
      utilisateur: makeUtilisateur({ email: undefined }),
      emailPerso: false,
    });
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("ne rend pas de bouton quand utilisateur n'a pas de emailPerso (emailPerso=true)", () => {
    renderButton({
      utilisateur: makeUtilisateur({ emailPerso: undefined }),
      emailPerso: true,
    });
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("rend le bouton mail quand email présent", () => {
    renderButton({ utilisateur: makeUtilisateur() });
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Sélection email / emailPerso
// ---------------------------------------------------------------------------

describe("MailSmallButton — sélection de l'adresse", () => {
  it("utilise email quand emailPerso=false", () => {
    renderButton({ utilisateur: makeUtilisateur(), emailPerso: false });
    fireEvent.click(screen.getByRole("button"));
    expect(writeText).toHaveBeenCalledWith("user@example.com");
  });

  it("utilise emailPerso quand emailPerso=true", () => {
    renderButton({ utilisateur: makeUtilisateur(), emailPerso: true });
    fireEvent.click(screen.getByRole("button"));
    expect(writeText).toHaveBeenCalledWith("perso@example.com");
  });

  it("utilise email par défaut (emailPerso prop absent)", () => {
    renderButton({ utilisateur: makeUtilisateur() });
    fireEvent.click(screen.getByRole("button"));
    expect(writeText).toHaveBeenCalledWith("user@example.com");
  });
});

// ---------------------------------------------------------------------------
// Prop mailto — présence de l'option "Envoyer"
// ---------------------------------------------------------------------------

describe("MailSmallButton — prop mailto", () => {
  it("sans mailto : le menu ne contient pas 'Envoyer un email'", () => {
    renderButton({ utilisateur: makeUtilisateur(), mailto: false });
    // L'item envoyer n'est pas dans le DOM avant ouverture du dropdown
    expect(screen.queryByText("Envoyer un email")).toBeNull();
  });
});

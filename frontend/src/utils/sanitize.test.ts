/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { sanitizeHtml } from "./sanitize";

// ---------------------------------------------------------------------------
// sanitizeHtml — protection XSS via DOMPurify
// ---------------------------------------------------------------------------

describe("sanitizeHtml", () => {
  it("retourne une chaîne vide inchangée", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("retourne du HTML safe inchangé", () => {
    expect(sanitizeHtml("<b>Bonjour</b>")).toBe("<b>Bonjour</b>");
  });

  it("retourne du texte brut inchangé", () => {
    expect(sanitizeHtml("texte simple sans balises")).toBe("texte simple sans balises");
  });

  it("supprime les balises <script>", () => {
    const result = sanitizeHtml("<script>alert('xss')</script>texte");
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("alert");
  });

  it("supprime les attributs de gestionnaire d'événements (onerror)", () => {
    const result = sanitizeHtml('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain("onerror");
  });

  it("supprime les attributs onclick", () => {
    const result = sanitizeHtml('<button onclick="evil()">Clic</button>');
    expect(result).not.toContain("onclick");
  });

  it("supprime les URLs javascript: dans href", () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">lien</a>');
    expect(result).not.toContain("javascript:");
  });

  it("préserve les attributs href légitimes", () => {
    const result = sanitizeHtml('<a href="https://example.com">lien</a>');
    expect(result).toContain("href");
    expect(result).toContain("lien");
  });

  it("préserve les balises de mise en forme standards", () => {
    const html = "<p><strong>Titre</strong> : <em>description</em></p>";
    expect(sanitizeHtml(html)).toBe(html);
  });
});

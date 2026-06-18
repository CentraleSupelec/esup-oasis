import { describe, it, expect } from "vitest";
import { validerFichier } from "./fichierValidation";
import { MAX_FILE_SIZE } from "@/constants";

describe("validerFichier", () => {
  // ---------------------------------------------------------------------------
  // Extension
  // ---------------------------------------------------------------------------

  it.each([["pdf"], ["docx"], ["jpg"], ["mp4"], ["txt"]])("extension .%s valide → null", (ext) => {
    expect(validerFichier({ name: `fichier.${ext}` })).toBeNull();
  });

  it.each([["exe"], ["sh"], ["zip"]])(
    "extension .%s non autorisée → erreur listant les formats autorisés",
    (ext) => {
      const result = validerFichier({ name: `fichier.${ext}` });
      expect(result).not.toBeNull();
      expect(result).toContain("pdf");
    },
  );

  it.each([["PDF"], ["JPG"]])(
    "extension .%s en majuscules → acceptée (insensible à la casse)",
    (ext) => {
      expect(validerFichier({ name: `fichier.${ext}` })).toBeNull();
    },
  );

  it("file.name absent (undefined) → extension vide → erreur", () => {
    expect(validerFichier({ size: 100 })).not.toBeNull();
  });

  // ---------------------------------------------------------------------------
  // MIME
  // ---------------------------------------------------------------------------

  it("MIME valide pour l'extension → null", () => {
    expect(validerFichier({ name: "fichier.pdf", type: "application/pdf" })).toBeNull();
  });

  it("MIME invalide pour une extension connue → erreur contenant le MIME rejeté", () => {
    const badMime = "application/octet-stream";
    const result = validerFichier({ name: "fichier.pdf", type: badMime });
    expect(result).not.toBeNull();
    expect(result).toContain(badMime);
  });

  it("MIME absent (undefined) → pas de vérification MIME, null si extension OK", () => {
    expect(validerFichier({ name: "fichier.pdf" })).toBeNull();
  });

  it("MIME chaîne vide → pas de vérification MIME, null si extension OK", () => {
    expect(validerFichier({ name: "fichier.pdf", type: "" })).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // Taille
  // ---------------------------------------------------------------------------

  it("fichier exactement à la limite (MAX_FILE_SIZE Mo) → null", () => {
    expect(validerFichier({ name: "fichier.pdf", size: MAX_FILE_SIZE * 1024 * 1024 })).toBeNull();
  });

  it("fichier 1 octet au-dessus de la limite → erreur mentionnant MAX_FILE_SIZE", () => {
    const result = validerFichier({
      name: "fichier.pdf",
      size: MAX_FILE_SIZE * 1024 * 1024 + 1,
    });
    expect(result).not.toBeNull();
    expect(result).toContain(String(MAX_FILE_SIZE));
  });

  it("file.size absent (undefined) → pas de vérification taille, null si extension OK", () => {
    expect(validerFichier({ name: "fichier.pdf" })).toBeNull();
  });

  it("taille exactement 0 octet → null (fichier vide accepté côté client)", () => {
    expect(validerFichier({ name: "fichier.pdf", size: 0 })).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // Noms exotiques
  // ---------------------------------------------------------------------------

  it("nom avec plusieurs points (archive.backup.pdf) → extension = 'pdf' → null", () => {
    expect(validerFichier({ name: "archive.backup.pdf" })).toBeNull();
  });

  it("nom sans extension (fichier) → erreur", () => {
    expect(validerFichier({ name: "fichier" })).not.toBeNull();
  });

  it("nom de fichier caché (.hidden.pdf) → extension = 'pdf' → null", () => {
    expect(validerFichier({ name: ".hidden.pdf" })).toBeNull();
  });

  it("nom commençant par un point sans extension après (.gitignore) → erreur", () => {
    expect(validerFichier({ name: ".gitignore" })).not.toBeNull();
  });

  // ---------------------------------------------------------------------------
  // MIME spoofing (contournement client documenté)
  // ---------------------------------------------------------------------------

  it("MIME spoofing : extension .pdf avec MIME image/png → accepté côté client (backend fait la vérif autoritaire)", () => {
    // Les deux types sont individuellement autorisés : le contrôle client ne
    // détecte pas la discordance extension/MIME — seul le backend est autoritaire.
    expect(validerFichier({ name: "malveillant.pdf", type: "image/png" })).toBeNull();
  });

  it("MIME spoofing : extension .jpg avec MIME application/pdf → accepté côté client", () => {
    expect(validerFichier({ name: "photo.jpg", type: "application/pdf" })).toBeNull();
  });
});

/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Evenement } from "./Evenement";

// ---------------------------------------------------------------------------
// Constructeur
// ---------------------------------------------------------------------------

describe("Evenement - constructeur", () => {
  it("initialise avec des valeurs par défaut si l'événement est undefined", () => {
    const e = new Evenement(undefined);
    expect(e.debut).toBe("");
    expect(e.fin).toBe("");
    expect(e.libelle).toBe("");
    expect(e.beneficiaires).toEqual([]);
    expect(e.campus).toBe("");
    expect(e.tempsPreparation).toBe(0);
    expect(e.tempsSupplementaire).toBe(0);
  });

  it("initialise correctement depuis un objet", () => {
    const e = new Evenement({
      "@id": "/evenements/1",
      debut: "2024-03-15T10:00:00",
      fin: "2024-03-15T12:00:00",
      libelle: "Cours magistral",
      beneficiaires: ["/beneficiaires/10"],
    } as never);
    expect(e["@id"]).toBe("/evenements/1");
    expect(e.debut).toBe("2024-03-15T10:00:00");
    expect(e.fin).toBe("2024-03-15T12:00:00");
    expect(e.libelle).toBe("Cours magistral");
    expect(e.beneficiaires).toEqual(["/beneficiaires/10"]);
  });

  it("convertit tempsPreparation en nombre", () => {
    const e = new Evenement({ tempsPreparation: "30" } as never);
    expect(e.tempsPreparation).toBe(30);
    expect(typeof e.tempsPreparation).toBe("number");
  });

  it("initialise tempsPreparation à 0 si absent", () => {
    const e = new Evenement({} as never);
    expect(e.tempsPreparation).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// isAffecte
// ---------------------------------------------------------------------------

describe("Evenement.isAffecte", () => {
  it("retourne true si un intervenant est assigné", () => {
    const e = new Evenement({ intervenant: "/intervenants/42" } as never);
    expect(e.isAffecte()).toBe(true);
  });

  it("retourne false si l'intervenant est absent", () => {
    const e = new Evenement({} as never);
    expect(e.isAffecte()).toBe(false);
  });

  it("retourne false pour un Evenement initialisé avec undefined", () => {
    expect(new Evenement(undefined).isAffecte()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isTransmisRH
// ---------------------------------------------------------------------------

describe("Evenement.isTransmisRH", () => {
  it("retourne true si dateEnvoiRH est définie", () => {
    const e = new Evenement({ dateEnvoiRH: "2024-03-15" } as never);
    expect(e.isTransmisRH()).toBe(true);
  });

  it("retourne false si dateEnvoiRH est absente", () => {
    const e = new Evenement({} as never);
    expect(e.isTransmisRH()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// debutDate / finDate
// ---------------------------------------------------------------------------

describe("Evenement.debutDate / finDate", () => {
  const e = new Evenement({
    debut: "2024-03-15T10:00:00",
    fin: "2024-03-15T12:00:00",
  } as never);

  it("debutDate retourne une instance de Date", () => {
    expect(e.debutDate()).toBeInstanceOf(Date);
  });

  it("finDate retourne une instance de Date", () => {
    expect(e.finDate()).toBeInstanceOf(Date);
  });

  it("debutDate retourne undefined si debut est une chaîne vide", () => {
    expect(new Evenement(undefined).debutDate()).toBeUndefined();
  });

  it("finDate retourne undefined si fin est une chaîne vide", () => {
    expect(new Evenement(undefined).finDate()).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// fromJson
// ---------------------------------------------------------------------------

describe("Evenement.fromJson", () => {
  it("crée un Evenement depuis un JSON valide", () => {
    const json = JSON.stringify({
      "@id": "/evenements/99",
      debut: "2024-03-15T10:00:00",
      fin: "2024-03-15T12:00:00",
      libelle: "TD",
    });
    const e = Evenement.fromJson(json);
    expect(e).toBeInstanceOf(Evenement);
    expect(e["@id"]).toBe("/evenements/99");
    expect(e.libelle).toBe("TD");
  });

  it("l'objet retourné a les méthodes de la classe Evenement", () => {
    const e = Evenement.fromJson(
      JSON.stringify({ debut: "2024-03-15T10:00:00", fin: "2024-03-15T12:00:00" }),
    );
    expect(typeof e.isAffecte).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// hashCode
// ---------------------------------------------------------------------------

describe("Evenement.hashCode", () => {
  it("contient le @id de l'événement", () => {
    const e = new Evenement({
      "@id": "/evenements/7",
      beneficiaires: [],
      enseignants: [],
    } as never);
    expect(e.hashCode()).toContain("/evenements/7");
  });

  it("contient l'intervenant s'il est défini", () => {
    const e = new Evenement({
      "@id": "/evenements/7",
      beneficiaires: [],
      enseignants: [],
      intervenant: "/intervenants/3",
    } as never);
    expect(e.hashCode()).toContain("/intervenants/3");
  });

  it("deux événements identiques produisent le même hashCode", () => {
    const data = {
      "@id": "/evenements/5",
      beneficiaires: ["/b/1"],
      enseignants: ["/e/2"],
      intervenant: "/i/3",
    } as never;
    expect(new Evenement(data).hashCode()).toBe(new Evenement(data).hashCode());
  });
});

// ---------------------------------------------------------------------------
// toCalendarEvent
// ---------------------------------------------------------------------------

describe("Evenement.toCalendarEvent", () => {
  it("retourne la structure attendue par le calendrier", () => {
    const e = new Evenement({
      debut: "2024-03-15T10:00:00",
      fin: "2024-03-15T12:00:00",
      libelle: "Cours",
    } as never);
    const cal = e.toCalendarEvent();
    expect(cal.title).toBe("Cours");
    expect(cal.allDay).toBe(false);
    expect(cal.start).toBeInstanceOf(Date);
    expect(cal.end).toBeInstanceOf(Date);
    expect(cal.data).toBe(e);
  });
});

// ---------------------------------------------------------------------------
// toFcEvent (FullCalendar)
// ---------------------------------------------------------------------------

describe("Evenement.toFcEvent", () => {
  it("utilise @id comme id si disponible", () => {
    const e = new Evenement({
      "@id": "/evenements/42",
      debut: "2024-03-15T10:00:00",
      fin: "2024-03-15T12:00:00",
    } as never);
    const fc = e.toFcEvent();
    expect(fc.id).toBe("/evenements/42");
  });

  it("utilise id numérique comme fallback si @id est absent", () => {
    const e = new Evenement({
      id: 99,
      debut: "2024-03-15T10:00:00",
      fin: "2024-03-15T12:00:00",
    } as never);
    const fc = e.toFcEvent();
    expect(fc.id).toBe("99");
  });

  it("expose les données dans extendedProps", () => {
    const e = new Evenement({ debut: "2024-03-15T10:00:00", fin: "2024-03-15T12:00:00" } as never);
    expect(e.toFcEvent().extendedProps.data).toBe(e);
  });
});

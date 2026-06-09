/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { MaterialColorAmount } from "@utils/colors";
import { IEvenement } from "@api";
import { DateAsString } from "@utils/string";

export interface CalendarEvenement {
  title?: string;
  start?: Date;
  end?: Date;
  allDay?: boolean;
  data: Evenement;
}

export class Evenement implements IEvenement {
  id?: number | null;

  "@context"?: string | { "@vocab": string; hydra: "http://www.w3.org/ns/hydra/core#" };

  "@id": string;

  "@type" = "Evenement" as const;

  beneficiaires: string[] = [];

  campus = "";

  dateAnnulation?: DateAsString = undefined;

  dateEnvoiRH?: DateAsString = undefined;

  dateValidation?: DateAsString = undefined;

  debut: DateAsString;

  equipements?: string[] = [];

  fin: DateAsString;

  intervenant?: string = undefined;

  libelle = "";

  salle?: string | null = null;

  suppleants?: string[] = [];

  enseignants?: string[] = [];

  tempsPreparation?: number = 0;

  tempsSupplementaire?: number = 0;

  type = "";

  dateCreation?: DateAsString = undefined;

  dateModification?: DateAsString = undefined;

  utilisateurCreation?: string = undefined;

  utilisateurModification?: string = undefined;

  constructor(event: IEvenement | undefined) {
    if (event) {
      this["@id"] = event?.["@id"];
      this.id = event?.id;
      this.beneficiaires = event?.beneficiaires || [];
      this.campus = event?.campus || "";
      this.dateAnnulation = event?.dateAnnulation ?? undefined;
      this.dateEnvoiRH = event?.dateEnvoiRH ?? undefined;
      this.debut = event?.debut ?? "";
      this.fin = event?.fin ?? "";
      this.intervenant = event?.intervenant ?? undefined;
      this.libelle = event?.libelle ?? "";
      this.salle = event?.salle;
      this.suppleants = event?.suppleants;
      this.enseignants = event?.enseignants;
      this.tempsPreparation = event?.tempsPreparation ? Number(event.tempsPreparation) : 0;
      this.tempsSupplementaire = event?.tempsSupplementaire ? Number(event.tempsSupplementaire) : 0;
      this.type = event?.type || "";
      this.equipements = event?.equipements;
      this.dateCreation = event?.dateCreation ?? undefined;
      this.dateModification = event?.dateModification ?? undefined;
      this.dateValidation = event?.dateValidation ?? undefined;
      this.utilisateurCreation = event?.utilisateurCreation ?? undefined;
      this.utilisateurModification = event?.utilisateurModification ?? undefined;
    } else {
      this.debut = "";
      this.fin = "";
    }
  }

  static fromJson(json: string): Evenement {
    return new Evenement(JSON.parse(json));
  }

  public isAffecte() {
    return this.intervenant !== undefined;
  }

  public isTransmisRH() {
    return this.dateEnvoiRH !== undefined;
  }

  public debutDate(): Date | undefined {
    return this.debut ? new Date(this.debut) : undefined;
  }

  public finDate(): Date | undefined {
    return this.fin ? new Date(this.fin) : undefined;
  }

  public toCalendarEvent(): CalendarEvenement {
    return {
      title: this.libelle,
      start: this.debutDate(),
      end: this.finDate(),
      allDay: false,
      data: this,
    };
  }

  public toFcEvent() {
    return {
      id: this["@id"] ?? String(this.id),
      title: this.libelle,
      start: this.debutDate(),
      end: this.finDate(),
      allDay: false,
      extendedProps: { data: this },
    };
  }

  public hashCode(): string {
    return (
      this["@id"] + this.beneficiaires.join("-") + this.enseignants?.join("-") + this.intervenant
    );
  }
}

export const EventColors = {
  NotAffected: "100" as MaterialColorAmount,
  Affected: "200" as MaterialColorAmount,
  Text: "900" as MaterialColorAmount,
};

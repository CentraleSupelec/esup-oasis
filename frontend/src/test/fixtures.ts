/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

/**
 * Builders de fixtures pour les tests.
 *
 * Chaque builder produit un objet « suffisamment valide » pour les composants/hooks
 * et accepte un objet `overrides` pour personnaliser les champs utiles au test.
 * On reste volontairement souple sur le typage (`Record<string, unknown>`) : les
 * payloads réels de l'API comportent beaucoup de champs, les tests n'en utilisent
 * qu'une poignée.
 */

import { RoleValues } from "@lib";

let seq = 0;
/** Identifiant incrémental pour générer des fixtures uniques au sein d'un test. */
function nextId(): number {
  seq += 1;
  return seq;
}

/** Réinitialise le compteur de séquence (à appeler dans un `beforeEach` si besoin de déterminisme). */
export function resetFixtureSeq(): void {
  seq = 0;
}

export interface UtilisateurFixture {
  "@id": string;
  uid: string;
  roles: string[];
  nom?: string;
  prenom?: string;
  email?: string;
  [key: string]: unknown;
}

/**
 * Construit un utilisateur. Par défaut un simple `ROLE_USER`.
 *
 * @example makeUtilisateur({ roles: [RoleValues.ROLE_GESTIONNAIRE] })
 */
export function makeUtilisateur(overrides: Partial<UtilisateurFixture> = {}): UtilisateurFixture {
  const uid = overrides.uid ?? `user${nextId()}@test.fr`;
  return {
    "@id": `/utilisateurs/${uid}`,
    uid,
    roles: [RoleValues.ROLE_USER],
    nom: "Doe",
    prenom: "Jane",
    email: uid,
    ...overrides,
  };
}

/** Raccourcis par rôle métier (les rôles fonctionnels impliquent toujours `ROLE_USER`). */
export const makeBeneficiaire = (o: Partial<UtilisateurFixture> = {}) =>
  makeUtilisateur({ roles: [RoleValues.ROLE_USER, RoleValues.ROLE_BENEFICIAIRE], ...o });
export const makeIntervenant = (o: Partial<UtilisateurFixture> = {}) =>
  makeUtilisateur({ roles: [RoleValues.ROLE_USER, RoleValues.ROLE_INTERVENANT], ...o });
export const makeGestionnaire = (o: Partial<UtilisateurFixture> = {}) =>
  makeUtilisateur({ roles: [RoleValues.ROLE_USER, RoleValues.ROLE_GESTIONNAIRE], ...o });
export const makeAdmin = (o: Partial<UtilisateurFixture> = {}) =>
  makeUtilisateur({ roles: [RoleValues.ROLE_USER, RoleValues.ROLE_ADMIN], ...o });
export const makeDemandeur = (o: Partial<UtilisateurFixture> = {}) =>
  makeUtilisateur({ roles: [RoleValues.ROLE_USER, RoleValues.ROLE_DEMANDEUR], ...o });

export interface DemandeFixture {
  "@id": string;
  id: number;
  etat: string;
  [key: string]: unknown;
}

/**
 * Construit une demande. `etat` est une IRI d'état (ex. `ETAT_DEMANDE_EN_COURS` de `@lib`).
 */
export function makeDemande(overrides: Partial<DemandeFixture> = {}): DemandeFixture {
  const id = (overrides.id as number) ?? nextId();
  return {
    "@id": `/demandes/${id}`,
    id,
    etat: "/etats_demande/1",
    ...overrides,
  };
}

export interface EvenementFixture {
  "@id": string;
  id: number;
  debut: string;
  fin: string;
  type?: string;
  [key: string]: unknown;
}

/**
 * Construit un événement / une intervention de planning.
 */
export function makeEvenement(overrides: Partial<EvenementFixture> = {}): EvenementFixture {
  const id = (overrides.id as number) ?? nextId();
  return {
    "@id": `/evenements/${id}`,
    id,
    debut: "2026-06-16T09:00:00+02:00",
    fin: "2026-06-16T10:00:00+02:00",
    ...overrides,
  };
}

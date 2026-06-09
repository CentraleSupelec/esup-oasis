/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

/**
 * Retourne l'identifiant de l'entité mère de l'entité passée en paramètre.
 * Ex: entityId = "/beneficiaires/123/profils/22" => "/beneficiaires/123"
 * @param entityId
 */
export function entiteParent(entityId: string | undefined): string {
  if (!entityId) return "";
  const parts = entityId.split("/");
  return parts.slice(0, parts.length - 2).join("/");
}

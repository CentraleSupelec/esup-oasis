/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { createDateFromStringAsUTC } from "@utils/dates";
import dayjs from "dayjs";
import { Utilisateur } from "@lib";
import { ApiPathMethodParameters, ApiPathMethodQuery } from "@api/SchemaHelpers";

/**
 * Helpers pour précharger les données du référentiel depuis l'API
 */

/**
 * Préchargement des types d'événements
 */
export const PREFETCH_TYPES_EVENEMENTS: {
  path: "/types_evenements";
  query?: ApiPathMethodQuery<"/types_evenements", "get">;
  parameters?: ApiPathMethodParameters<"/types_evenements", "get">;
} = {
  path: "/types_evenements" as const,
};

/**
 * Préchargement des campus
 */
export const PREFETCH_CAMPUS: {
  path: "/campus";
  query?: ApiPathMethodQuery<"/campus", "get">;
  parameters?: ApiPathMethodParameters<"/campus", "get">;
} = {
  path: "/campus" as const,
  query: {
    "order[libelle]": "asc" as "asc" | "desc",
  },
};

/**
 * Préchargement des états des demandes
 */
export const PREFETCH_ETAT_DEMANDE: {
  path: "/etats_demandes";
  query?: ApiPathMethodQuery<"/etats_demandes", "get">;
  parameters?: ApiPathMethodParameters<"/etats_demandes", "get">;
} = {
  path: "/etats_demandes" as const,
};

/**
 * Préchargement de la dernière période RH
 */
export const PREFETCH_LAST_PERIODES_RH: (user: Utilisateur | undefined) => {
  path: "/periodes";
  query?: ApiPathMethodQuery<"/periodes", "get">;
  parameters?: ApiPathMethodParameters<"/periodes", "get">;
} = (user: Utilisateur | undefined) => ({
  query: {
    itemsPerPage: 1,
    page: 1,
    "order[debut]": "desc" as "asc" | "desc",
    "butoir[strictly_before]": createDateFromStringAsUTC(
      dayjs().startOf("day").toString(),
    ).toISOString(),
  },
  path: "/periodes" as const,
  enabled: user && user.isPlanificateur,
});

/**
 * Préchargement des types d'équipements
 */
export const PREFETCH_TYPES_EQUIPEMENTS: {
  path: "/types_equipements";
  query?: ApiPathMethodQuery<"/types_equipements", "get">;
  parameters?: ApiPathMethodParameters<"/types_equipements", "get">;
} = {
  query: {
    "order[libelle]": "asc" as "asc" | "desc",
  },
  path: "/types_equipements" as const,
};

/**
 * Préchargement des compétences (intervenants)
 */
export const PREFETCH_COMPETENCES: {
  path: "/competences";
  query?: ApiPathMethodQuery<"/competences", "get">;
  parameters?: ApiPathMethodParameters<"/competences", "get">;
} = {
  query: {
    "order[libelle]": "asc" as "asc" | "desc",
  },
  path: "/competences" as const,
};

/**
 * Préchargement des composantes
 */
export const PREFETCH_COMPOSANTES: {
  path: "/composantes";
  query?: ApiPathMethodQuery<"/composantes", "get">;
  parameters?: ApiPathMethodParameters<"/composantes", "get">;
} = {
  query: {
    "order[libelle]": "asc" as "asc" | "desc",
  },
  path: "/composantes" as const,
};

/**
 * Préchargement des formations
 */
export const PREFETCH_FORMATIONS: {
  path: "/formations";
  query?: ApiPathMethodQuery<"/formations", "get">;
  parameters?: ApiPathMethodParameters<"/formations", "get">;
} = {
  query: {
    "order[libelle]": "asc" as "asc" | "desc",
    avecInscriptions: true,
  },
  path: "/formations" as const,
};

/**
 * Préchargement des types de demandes
 */
export const PREFETCH_TYPES_DEMANDES: {
  path: "/types_demandes";
  query?: ApiPathMethodQuery<"/types_demandes", "get">;
  parameters?: ApiPathMethodParameters<"/types_demandes", "get">;
} = {
  query: {
    "order[libelle]": "asc" as "asc" | "desc",
  },
  path: "/types_demandes" as const,
};

/**
 * Préchargement des profils bénéficiaires
 */
export const PREFETCH_PROFILS: {
  path: "/profils";
  query?: ApiPathMethodQuery<"/profils", "get">;
  parameters?: ApiPathMethodParameters<"/profils", "get">;
} = {
  query: {
    "order[libelle]": "asc" as "asc" | "desc",
  },
  path: "/profils" as const,
};

/**
 * Préchargement des catégories d'aménagements
 */
export const PREFETCH_CATEGORIES_AMENAGEMENTS: {
  path: "/categories_amenagements";
  query?: ApiPathMethodQuery<"/categories_amenagements", "get">;
  parameters?: ApiPathMethodParameters<"/categories_amenagements", "get">;
} = {
  query: {
    "order[libelle]": "asc" as "asc" | "desc",
  },
  path: "/categories_amenagements" as const,
};

/**
 * Préchargement des types d'aménagements
 */
export const PREFETCH_TYPES_AMENAGEMENTS: {
  path: "/types_amenagements";
  query?: ApiPathMethodQuery<"/types_amenagements", "get">;
  parameters?: ApiPathMethodParameters<"/types_amenagements", "get">;
} = {
  query: {
    "order[libelle]": "asc" as "asc" | "desc",
  },
  path: "/types_amenagements" as const,
};

/**
 * Préchargement des types de suivi des aménagements
 */
export const PREFETCH_TYPES_SUIVI_AMENAGEMENTS: {
  path: "/types_suivi_amenagements";
  query?: ApiPathMethodQuery<"/types_suivi_amenagements", "get">;
  parameters?: ApiPathMethodParameters<"/types_suivi_amenagements", "get">;
} = {
  query: {
    "order[libelle]": "asc" as "asc" | "desc",
  },
  path: "/types_suivi_amenagements" as const,
};

/**
 * Préchargement des catégories de tags
 */
export const PREFETCH_CATEGORIES_TAGS: {
  path: "/categories_tags";
  query?: ApiPathMethodQuery<"/categories_tags", "get">;
  parameters?: ApiPathMethodParameters<"/categories_tags", "get">;
} = {
  query: {
    "order[libelle]": "asc" as "asc" | "desc",
  },
  path: "/categories_tags" as const,
};

/**
 * Préchargement des tags
 */
export const PREFETCH_TAGS: {
  path: "/tags";
  query?: ApiPathMethodQuery<"/tags", "get">;
  parameters?: ApiPathMethodParameters<"/tags", "get">;
} = {
  query: {
    "order[libelle]": "asc" as "asc" | "desc",
  },
  path: "/tags" as const,
};

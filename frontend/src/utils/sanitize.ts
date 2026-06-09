/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import DOMPurify from "dompurify";

/**
 * Sanitize a raw HTML string to prevent XSS injection.
 * Must be used for every `dangerouslySetInnerHTML={{ __html: ... }}` call.
 */
export function sanitizeHtml(raw: string): string {
  return DOMPurify.sanitize(raw);
}

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 *
 */

const IS_DEV = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]): void => {
    if (IS_DEV) console.log(...args);
  },
  info: (...args: unknown[]): void => {
    if (IS_DEV) console.info(...args);
  },
  warn: (...args: unknown[]): void => {
    if (IS_DEV) console.warn(...args);
  },
  error: (...args: unknown[]): void => {
    if (IS_DEV) console.error(...args);
  },
  debug: (...args: unknown[]): void => {
    if (IS_DEV) console.debug(...args);
  },
};

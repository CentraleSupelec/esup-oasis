/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useEffect, useState } from "react";

/**
 * Hook simple pour attendre un certain temps.
 *
 * @param {number} delay - The delay in milliseconds.
 * @return {boolean} - The boolean value.
 */
export function useWait(delay: number): boolean {
  const [wait, setWait] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setWait(false);
    }, delay);
    return () => {
      window.clearTimeout(timer);
    };
  }, [delay]);

  return wait;
}

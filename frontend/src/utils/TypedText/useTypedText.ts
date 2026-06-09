/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useEffect, useRef, useState } from "react";

interface IUseTypedTextOptions {
  strings: string[];
  typeSpeed?: number;
  /** Délai avant de passer à la chaîne suivante (ms) */
  backDelay?: number;
  startDelay?: number;
  /** Durée du fondu entre deux chaînes (ms) */
  fadeDuration?: number;
  /** Délai après la dernière chaîne avant que le curseur passe en visibility:hidden (ms) */
  cursorEndDelay?: number;
}

interface IUseTypedTextResult {
  text: string;
  fading: boolean;
  /** Vrai dès que la frappe démarre */
  showCursor: boolean;
  /** Vrai après cursorEndDelay : le curseur doit passer en visibility:hidden */
  hideCursor: boolean;
}

/**
 * Frappe les chaînes une par une avec fondu entre elles, sans boucle.
 * Le curseur clignote via CSS dès que la frappe commence et reste visible.
 */
export function useTypedText({
  strings,
  typeSpeed = 40,
  backDelay = 1500,
  startDelay = 250,
  fadeDuration = 600,
  cursorEndDelay = 3000,
}: IUseTypedTextOptions): IUseTypedTextResult {
  const [text, setText] = useState("");
  const [fading, setFading] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const [hideCursor, setHideCursor] = useState(false);

  const stringIndexRef = useRef(0);
  const charIndexRef = useRef(0);
  const optsRef = useRef({
    strings,
    typeSpeed,
    backDelay,
    startDelay,
    fadeDuration,
    cursorEndDelay,
  });

  useEffect(() => {
    const {
      strings: strs,
      typeSpeed: ts,
      backDelay: bd,
      startDelay: sd,
      fadeDuration: fd,
    } = optsRef.current;
    if (strs.length === 0) return;

    let timeout: ReturnType<typeof setTimeout>;
    const isLast = () => stringIndexRef.current === strs.length - 1;

    function typeNextChar() {
      const current = strs[stringIndexRef.current] ?? "";
      setShowCursor(true);

      if (charIndexRef.current < current.length) {
        setText(current.slice(0, charIndexRef.current + 1));
        charIndexRef.current += 1;
        timeout = setTimeout(typeNextChar, ts);
      } else if (isLast()) {
        // Dernière chaîne entièrement tapée : curseur clignote puis disparaît
        timeout = setTimeout(() => setHideCursor(true), optsRef.current.cursorEndDelay);
      } else {
        // Chaîne intermédiaire : fondu puis chaîne suivante
        timeout = setTimeout(() => {
          setFading(true);
          timeout = setTimeout(() => {
            setFading(false);
            setText("");
            charIndexRef.current = 0;
            stringIndexRef.current += 1;
            timeout = setTimeout(typeNextChar, ts);
          }, fd);
        }, bd);
      }
    }

    timeout = setTimeout(typeNextChar, sd);
    return () => clearTimeout(timeout);
  }, []); // Options stables au montage (issues de env)

  return { text, fading, showCursor, hideCursor };
}

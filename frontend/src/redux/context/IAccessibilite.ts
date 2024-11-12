/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

export interface IAccessibilite {
   contrast: boolean;
   dyslexieArial: boolean;
   dyslexieOpenDys: boolean;
   dyslexieLexend: boolean;
   policeLarge: boolean;
}

export const initialAccessibilite: IAccessibilite = {
   contrast: false,
   dyslexieArial: false,
   dyslexieOpenDys: false,
   dyslexieLexend: false,
   policeLarge: false,
};

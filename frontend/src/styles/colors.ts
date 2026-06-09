// colorsXlight / colorsLight / colorsRegular sont dérivés de MATERIAL_COLORS (@utils/colors).
// colorsDark contient des valeurs ajustées manuellement pour l'accessibilité.
// Toute modification de colorsDark doit être répercutée dans _colors.scss.

import { MATERIAL_COLORS, MaterialColorAmount, MaterialColorName } from "@utils/colors";

const extractShade = (amount: MaterialColorAmount): Record<string, string> =>
  Object.fromEntries(
    (Object.keys(MATERIAL_COLORS) as MaterialColorName[]).map((key) => [
      key,
      MATERIAL_COLORS[key][amount],
    ]),
  );

export const colorsXlight = extractShade(MaterialColorAmount.c0);
export const colorsLight = extractShade(MaterialColorAmount.c1);
export const colorsRegular = extractShade(MaterialColorAmount.c2);

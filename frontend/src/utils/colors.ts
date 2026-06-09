/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

// noinspection JSUnusedGlobalSymbols

/**
 * ------------------------- Material design colors -------------------------
 * utilisés notamment pour les types d'événements
 */

export enum MaterialColorsTraductions {
  red = "Rouge",
  pink = "Rose",
  purple = "Violet",
  deepPurple = "Violet foncé",
  indigo = "Indigo",
  blue = "Bleu",
  lightBlue = "Bleu clair",
  cyan = "Cyan",
  teal = "Bleu canard",
  green = "Vert",
  lightGreen = "Vert clair",
  lime = "Citron vert",
  yellow = "Jaune",
  amber = "Ambre",
  orange = "Orange",
  deepOrange = "Orange foncé",
  brown = "Marron",
  grey = "Gris",
  blueGrey = "Gris-bleu",
}

export type MaterialColorName = keyof typeof MaterialColorsTraductions;

export enum MaterialColorAmount {
  c0 = "50",
  c1 = "100",
  c2 = "200",
  c3 = "300",
  c4 = "400",
  c5 = "500",
  c6 = "600",
  c7 = "700",
  c8 = "800",
  c9 = "900",
  a1 = "a100",
  a2 = "a200",
  a4 = "a400",
  a7 = "a700",
}

/**
 * Material colors values
 */

export const MATERIAL_COLORS: {
  [key in MaterialColorName]: Record<MaterialColorAmount, string>;
} = {
  red: {
    "50": "#ffebee",
    "100": "#ffcdd2",
    "200": "#ef9a9a",
    "300": "#e57373",
    "400": "#ef5350",
    "500": "#f44336",
    "600": "#e53935",
    "700": "#d32f2f",
    "800": "#c62828",
    "900": "#b71c1c",
    a100: "#ff8a80",
    a200: "#ff5252",
    a400: "#ff1744",
    a700: "#d50000",
  },
  pink: {
    "50": "#fce4ec",
    "100": "#f8bbd0",
    "200": "#f48fb1",
    "300": "#f06292",
    "400": "#ec407a",
    "500": "#e91e63",
    "600": "#d81b60",
    "700": "#c2185b",
    "800": "#ad1457",
    "900": "#880e4f",
    a100: "#ff80ab",
    a200: "#ff4081",
    a400: "#f50057",
    a700: "#c51162",
  },
  purple: {
    "50": "#f3e5f5",
    "100": "#e1bee7",
    "200": "#ce93d8",
    "300": "#ba68c8",
    "400": "#ab47bc",
    "500": "#9c27b0",
    "600": "#8e24aa",
    "700": "#7b1fa2",
    "800": "#6a1b9a",
    "900": "#4a148c",
    a100: "#ea80fc",
    a200: "#e040fb",
    a400: "#d500f9",
    a700: "#aa00ff",
  },
  deepPurple: {
    "50": "#ede7f6",
    "100": "#d1c4e9",
    "200": "#b39ddb",
    "300": "#9575cd",
    "400": "#7e57c2",
    "500": "#673ab7",
    "600": "#5e35b1",
    "700": "#512ebd",
    "800": "#4527a0",
    "900": "#311b92",
    a100: "#b388ff",
    a200: "#7c4dff",
    a400: "#651fff",
    a700: "#6200ea",
  },
  indigo: {
    "50": "#e8eaf6",
    "100": "#c5cae9",
    "200": "#9fa8da",
    "300": "#7986cb",
    "400": "#5c6bc0",
    "500": "#3f51b5",
    "600": "#3949ab",
    "700": "#303f9f",
    "800": "#283593",
    "900": "#1a237e",
    a100: "#8c9eff",
    a200: "#536dfe",
    a400: "#3d5afe",
    a700: "#304ffe",
  },
  blue: {
    "50": "#e3f2fd",
    "100": "#bbdefb",
    "200": "#90caf9",
    "300": "#64b5f6",
    "400": "#42a5f5",
    "500": "#2196f3",
    "600": "#1e88e5",
    "700": "#1976d2",
    "800": "#1565c0",
    "900": "#0d47a1",
    a100: "#82b1ff",
    a200: "#448aff",
    a400: "#2979ff",
    a700: "#2962ff",
  },
  lightBlue: {
    "50": "#e1f5fe",
    "100": "#b3e5fc",
    "200": "#81d4fa",
    "300": "#4fc3f7",
    "400": "#29b6f6",
    "500": "#03a9f4",
    "600": "#039be5",
    "700": "#0288d1",
    "800": "#0277bd",
    "900": "#01579b",
    a100: "#80d8ff",
    a200: "#40c4ff",
    a400: "#00b0ff",
    a700: "#0091ea",
  },
  cyan: {
    "50": "#e0f7fa",
    "100": "#b2ebf2",
    "200": "#80deea",
    "300": "#4dd0e1",
    "400": "#26c6da",
    "500": "#00bcd4",
    "600": "#00acc1",
    "700": "#0097a7",
    "800": "#00838f",
    "900": "#006064",
    a100: "#84ffff",
    a200: "#18ffff",
    a400: "#00e5ff",
    a700: "#00b8d4",
  },
  teal: {
    "50": "#e0f2f1",
    "100": "#b2dfdb",
    "200": "#80cbc4",
    "300": "#4db6ac",
    "400": "#26a69a",
    "500": "#009688",
    "600": "#00897b",
    "700": "#00796b",
    "800": "#00695c",
    "900": "#004d40",
    a100: "#a7ffeb",
    a200: "#64ffda",
    a400: "#1de9b6",
    a700: "#00bfa5",
  },
  green: {
    "50": "#e8f5e9",
    "100": "#c8e6c9",
    "200": "#a5d6a7",
    "300": "#81c784",
    "400": "#66bb6a",
    "500": "#4caf50",
    "600": "#43a047",
    "700": "#388e3c",
    "800": "#2e7d32",
    "900": "#1b5e20",
    a100: "#b9f6ca",
    a200: "#69f0ae",
    a400: "#00e676",
    a700: "#00c853",
  },
  lightGreen: {
    "50": "#f1f8e9",
    "100": "#dcedc8",
    "200": "#c5e1a5",
    "300": "#aed581",
    "400": "#9ccc65",
    "500": "#8bc34a",
    "600": "#7cb342",
    "700": "#689f38",
    "800": "#558b2f",
    "900": "#33691e",
    a100: "#ccff90",
    a200: "#b2ff59",
    a400: "#76ff03",
    a700: "#64dd17",
  },
  lime: {
    "50": "#f9fbe7",
    "100": "#f0f4c3",
    "200": "#e6ee9c",
    "300": "#dce775",
    "400": "#d4e157",
    "500": "#cddc39",
    "600": "#c0ca33",
    "700": "#afb42b",
    "800": "#9e9d24",
    "900": "#827717",
    a100: "#f4ff81",
    a200: "#eeff41",
    a400: "#c6ff00",
    a700: "#aeea00",
  },
  yellow: {
    "50": "#fffde7",
    "100": "#fff9c4",
    "200": "#fff59d",
    "300": "#fff176",
    "400": "#ffee58",
    "500": "#ffeb3b",
    "600": "#fdd835",
    "700": "#fbc02d",
    "800": "#f9a825",
    "900": "#f57f17",
    a100: "#ffff8d",
    a200: "#ffff00",
    a400: "#ffea00",
    a700: "#ffd600",
  },
  amber: {
    "50": "#fff8e1",
    "100": "#ffecb3",
    "200": "#ffe082",
    "300": "#ffd54f",
    "400": "#ffca28",
    "500": "#ffc107",
    "600": "#ffb300",
    "700": "#ffa000",
    "800": "#ff8f00",
    "900": "#ff6f00",
    a100: "#ffe57f",
    a200: "#ffd740",
    a400: "#ffc400",
    a700: "#ffab00",
  },
  orange: {
    "50": "#fff3e0",
    "100": "#ffe0b2",
    "200": "#ffcc80",
    "300": "#ffb74d",
    "400": "#ffa726",
    "500": "#ff9800",
    "600": "#fb8c00",
    "700": "#f57c00",
    "800": "#ef6c00",
    "900": "#e65100",
    a100: "#ffd180",
    a200: "#ffab40",
    a400: "#ff9100",
    a700: "#ff6d00",
  },
  deepOrange: {
    "50": "#fbe9e7",
    "100": "#ffccbc",
    "200": "#ffab91",
    "300": "#ff8a65",
    "400": "#ff7043",
    "500": "#ff5722",
    "600": "#f4511e",
    "700": "#e64a19",
    "800": "#d84315",
    "900": "#bf360c",
    a100: "#ff9e80",
    a200: "#ff6e40",
    a400: "#ff3d00",
    a700: "#dd2c00",
  },
  brown: {
    "50": "#efebe9",
    "100": "#d7ccc8",
    "200": "#bcaaa4",
    "300": "#a1887f",
    "400": "#8d6e63",
    "500": "#795548",
    "600": "#6d4c41",
    "700": "#5d4037",
    "800": "#4e342e",
    "900": "#3e2723",
    a100: "",
    a200: "",
    a400: "",
    a700: "",
  },
  grey: {
    "50": "#fafafa",
    "100": "#f5f5f5",
    "200": "#eeeeee",
    "300": "#e0e0e0",
    "400": "#bdbdbd",
    "500": "#9e9e9e",
    "600": "#757575",
    "700": "#616161",
    "800": "#424242",
    "900": "#212121",
    a100: "",
    a200: "",
    a400: "",
    a700: "",
  },
  blueGrey: {
    "50": "#eceff1",
    "100": "#cfd8dc",
    "200": "#b0bec5",
    "300": "#90a4ae",
    "400": "#78909c",
    "500": "#607d8b",
    "600": "#546e7a",
    "700": "#455a64",
    "800": "#37474f",
    "900": "#263238",
    a100: "",
    a200: "",
    a400: "",
    a700: "",
  },
};

export const MATERIAL_COLORS_NAMES = Object.keys(MATERIAL_COLORS) as MaterialColorName[];

export const getColor = (color: MaterialColorName, amount: MaterialColorAmount): string => {
  return MATERIAL_COLORS[color][amount];
};

/**
 * Permet de modifier la luminosité d'une couleur (lighten ou darken)
 *
 * @source https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)
 * @example pSBC(-0.5, "#ff0000") // darken by 50%
 * @example pSBC(0.5, "#ff0000") // lighten by 50%
 * @example pSBC(0.5, "#ff0000", "#00ff00") // blend by 50% with green
 * @example pSBC(-0.5, "#ff0000", "#0000ff") // blend by 50% with blue
 *
 * @param p
 * @param c0
 * @param c1
 * @param l
 */
interface PsbcResult {
  r: number;
  g: number;
  b: number;
  a: number;
}

function pSBCr(d: string): PsbcResult | null {
  const n = d.length;
  const x: Partial<PsbcResult> = {};
  if (n > 9) {
    const parts = d.split(",");
    if (parts.length < 3 || parts.length > 4) return null;
    const [rPart, gPart, bPart, aPart] = parts;
    x.r = parseInt(rPart[3] === "a" ? rPart.slice(5) : rPart.slice(4));
    x.g = parseInt(gPart);
    x.b = parseInt(bPart);
    x.a = aPart ? parseFloat(aPart) : -1;
  } else {
    if (n === 8 || n === 6 || n < 4) return null;
    let dStr = d;
    if (n < 6) dStr = `#${d[1]}${d[1]}${d[2]}${d[2]}${d[3]}${d[3]}${n > 4 ? d[4] + d[4] : ""}`;
    const dNum = parseInt(dStr.slice(1), 16);
    if (n === 9 || n === 5) {
      x.r = (dNum >> 24) & 255;
      x.g = (dNum >> 16) & 255;
      x.b = (dNum >> 8) & 255;
      x.a = Math.round((dNum & 255) / 0.255) / 1000;
    } else {
      x.r = dNum >> 16;
      x.g = (dNum >> 8) & 255;
      x.b = dNum & 255;
      x.a = -1;
    }
  }
  return x as PsbcResult;
}

export function pSBC(p: number, c0: string, c1?: string, l?: boolean): string | null {
  const isStringC1 = typeof c1 === "string";
  // noinspection SuspiciousTypeOfGuard
  if (
    typeof p !== "number" ||
    p < -1 ||
    p > 1 ||
    typeof c0 !== "string" ||
    (!c0.startsWith("r") && !c0.startsWith("#")) ||
    (c1 && !isStringC1)
  )
    return null;

  const useHexBase = c0.length > 9;
  const h = isStringC1 ? (c1.length > 9 ? true : c1 === "c" ? !useHexBase : false) : useHexBase;

  const f = pSBCr(c0);
  const isNegative = p < 0;
  const t: PsbcResult | null =
    c1 && c1 !== "c"
      ? pSBCr(c1)
      : isNegative
        ? { r: 0, g: 0, b: 0, a: -1 }
        : { r: 255, g: 255, b: 255, a: -1 };

  const pAbs = isNegative ? p * -1 : p;
  const pComp = 1 - pAbs;

  if (!f || !t) return null;

  let r: number;
  let g: number;
  let b: number;
  if (l) {
    r = Math.round(pComp * f.r + pAbs * t.r);
    g = Math.round(pComp * f.g + pAbs * t.g);
    b = Math.round(pComp * f.b + pAbs * t.b);
  } else {
    r = Math.round((pComp * f.r ** 2 + pAbs * t.r ** 2) ** 0.5);
    g = Math.round((pComp * f.g ** 2 + pAbs * t.g ** 2) ** 0.5);
    b = Math.round((pComp * f.b ** 2 + pAbs * t.b ** 2) ** 0.5);
  }

  const fAlpha = f.a;
  const tAlpha = t.a;
  const hasAlpha = fAlpha >= 0 || tAlpha >= 0;
  const alpha = hasAlpha
    ? fAlpha < 0
      ? tAlpha
      : tAlpha < 0
        ? fAlpha
        : fAlpha * pComp + tAlpha * pAbs
    : 0;

  if (h)
    return `rgb${hasAlpha ? "a(" : "("}${r},${g},${b}${hasAlpha ? `,${Math.round(alpha * 1000) / 1000}` : ""})`;
  else
    return `#${(
      4294967296 +
      r * 16777216 +
      g * 65536 +
      b * 256 +
      (hasAlpha ? Math.round(alpha * 255) : 0)
    )
      .toString(16)
      .slice(1, hasAlpha ? undefined : -2)}`;
}

/**
 * Calcule la couleur de contraste (noir ou blanc) pour une couleur hexadécimale donnée.
 * Respecte les principes de luminance relative du WCAG.
 */

export const getContrastColor = (hex: string): "#000000" | "#FFFFFF" => {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

  // Transformation sRGB vers Luminance Linéaire
  const getLinear = (v: number) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };

  const L = 0.2126 * getLinear(r) + 0.7152 * getLinear(g) + 0.0722 * getLinear(b);

  // Le seuil standard WCAG pour le contraste est basé sur 0.179
  // en luminance relative pour le basculement noir/blanc
  return L > 0.179 ? "#000000" : "#FFFFFF";
};

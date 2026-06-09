import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactHooksPlugin from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
   baseDirectory: __dirname,
   resolvePluginsRelativeTo: __dirname,
   recommendedConfig: js.configs.recommended,
});

export default tseslint.config(
   {
      ignores: [
         "**/eslintrc.js",
         "**/eslint.config.mjs",
         "**/craco.config.js",
         "**/src/temp/structures.js",
         "**/config-overrides.js",
         "**/public/index.js",
         "**/public/serviceWorker.js",
         "**/public/env.js",
         "**/src/lib/react-modern-calendar-datepicker/index.js",
         "**/babel.config.json",
         "**/jest.config.js",
         "**/src/api/OpenApi.yml",
         "**/src/api/schema.d.ts",
         "**/dist/**",
         "**/node_modules/**",
         "**/src/api/schema.d.ts",
      ],
   },
   js.configs.recommended,
   ...tseslint.configs.recommended,
   // Fixup plugins that are not yet flat-compatible if needed
   {
      plugins: {
         import: fixupPluginRules(importPlugin),
         react: fixupPluginRules(reactPlugin),
         "jsx-a11y": fixupPluginRules(jsxA11yPlugin),
         "react-hooks": fixupPluginRules(reactHooksPlugin),
      },
      rules: {
         ...reactHooksPlugin.configs.recommended.rules,
         // react-hooks/refs génère des faux positifs sur les patterns Ant Design
         // où les refs sont passées via props (pattern valide, non lié au React Compiler)
         "react-hooks/refs": "off",

         // repérer les deprecations
         "@typescript-eslint/no-deprecated": "warn",
      },
   },
   // We use the fixupConfigRules to handle legacy airbnb-typescript
   ...fixupConfigRules(compat.extends("airbnb-typescript")).map((config) => {
      const newConfig = { ...config };
      // Remove the plugin definition from airbnb to avoid conflict with tseslint.configs.recommended
      if (newConfig.plugins && newConfig.plugins["@typescript-eslint"]) {
         const { "@typescript-eslint": _, ...otherPlugins } = newConfig.plugins;
         newConfig.plugins = otherPlugins;
      }
      // Remove rules that are no longer available in @typescript-eslint v8
      if (newConfig.rules) {
         const newRules = { ...newConfig.rules };
         const pluginRules = tseslint.plugin.rules;
         Object.keys(newRules).forEach((rule) => {
            if (
               rule.startsWith("@typescript-eslint/") &&
               !pluginRules[rule.replace("@typescript-eslint/", "")]
            ) {
               delete newRules[rule];
            }
         });
         newConfig.rules = newRules;
      }
      return newConfig;
   }),
   prettierRecommended,
   {
      files: ["**/*.{ts,tsx}"],
      settings: {
         "import/resolver": {
            typescript: {
               alwaysTryTypes: true,
               project: "./tsconfig.json",
            },
         },
      },
      languageOptions: {
         globals: {
            ...globals.browser,
            ...globals.jest,
            ...globals.es2020,
            vi: "readonly",
         },
         parser: tseslint.parser,
         parserOptions: {
            project: "./tsconfig.json",
            tsconfigRootDir: __dirname,
         },
      },
      rules: {
         "linebreak-style": "off",
         "react/jsx-curly-brace-presence": "error",
         "prefer-template": "error",
         "@typescript-eslint/ban-ts-comment": "off",
         "prettier/prettier": [
            "error",
            {
               endOfLine: "auto",
            },
         ],
         "@typescript-eslint/no-unused-vars": [
            "error",
            {
               vars: "all",
               args: "after-used",
               argsIgnorePattern: "^_",
               varsIgnorePattern: "^_",
               ignoreRestSiblings: true,
            },
         ],
         "import/no-extraneous-dependencies": [
            "error",
            {
               devDependencies: [
                  "**/*.test.{ts,tsx}",
                  "**/*.spec.{ts,tsx}",
                  "**/setupTests.ts",
                  "**/mocks/**",
               ],
               optionalDependencies: false,
               peerDependencies: false,
            },
         ],
      },
   },
);

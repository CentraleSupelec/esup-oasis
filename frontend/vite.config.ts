/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { visualizer } from "rollup-plugin-visualizer";
import { resolve } from "path";

/**
 * Hôtes autorisés du serveur de dev :
 * dérivés de REACT_APP_FRONTEND ou FRONT_URL.
 * localhost reste toujours autorisé par Vite.
 */
function buildAllowedHosts(env: Record<string, string>): string[] | undefined {
  const frontUrl = env.REACT_APP_FRONTEND || env.FRONT_URL;
  if (!frontUrl) return undefined;
  try {
    return [new URL(frontUrl).hostname];
  } catch {
    return undefined;
  }
}

export default defineConfig(({ mode }) => {
  const isAnalyze = process.env.ANALYZE === "true";
  const isHttps = process.env.HTTPS === "true";
  const allowedHosts = buildAllowedHosts(loadEnv(mode, __dirname, ""));

  return {
    plugins: [
      react(),
      svgr(),
      ...(isHttps ? [basicSsl()] : []),
      ...(isAnalyze
        ? [visualizer({ open: true, filename: "dist/stats.html", gzipSize: true })]
        : []),
    ],

    envPrefix: "REACT_APP_",

    resolve: {
      alias: {
        "@assets": resolve(__dirname, "src/assets"),
        "@controls": resolve(__dirname, "src/controls"),
        "@context": resolve(__dirname, "src/context"),
        "@lib": resolve(__dirname, "src/lib"),
        "@utils": resolve(__dirname, "src/utils"),
        "@api": resolve(__dirname, "src/api"),
        "@routes": resolve(__dirname, "src/routes"),
        "@": resolve(__dirname, "src"),
      },
    },

    server: {
      port: 3000,
      ...(allowedHosts ? { allowedHosts } : {}),
    },

    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: ["legacy-js-api"],
        },
      },
    },

    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/setupTests.ts"],
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
      coverage: {
        provider: "v8",
        reporter: ["text", "lcov"],
        include: ["src/**/*.{ts,tsx}"],
        exclude: ["src/**/*.d.ts", "src/api/schema.d.ts", "src/main.tsx"],
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) {
              return "vendor-react";
            }
            if (/node_modules\/(antd|@ant-design)\//.test(id)) {
              return "vendor-antd";
            }
            if (/node_modules\/(rc-[a-z-]+)\//.test(id)) {
              return "vendor-rc";
            }
            if (/node_modules\/(@tiptap|prosemirror-)/.test(id)) {
              return "vendor-tiptap";
            }
            if (/node_modules\/@fullcalendar\//.test(id)) {
              return "vendor-fullcalendar";
            }
            if (/node_modules\/@tanstack\/react-query-devtools\//.test(id)) {
              return "vendor-devtools";
            }
          },
        },
      },
    },
  };
});

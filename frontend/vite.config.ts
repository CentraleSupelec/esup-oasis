/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { visualizer } from "rollup-plugin-visualizer";
import { resolve } from "path";

export default defineConfig(() => {
  const isAnalyze = process.env.ANALYZE === "true";
  const isHttps = process.env.HTTPS === "true";

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
      },build: {
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

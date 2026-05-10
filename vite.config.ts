import devServer from "@hono/vite-dev-server"
import path from "path"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    devServer({ entry: "api/boot.ts", exclude: [/^\/(?!api\/).*$/] }),
    inspectAttr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@db": path.resolve(__dirname, "./db"),
      "db": path.resolve(__dirname, "./db"),
    },
  },
  envDir: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          const depPath = id.split("node_modules/").at(1)?.replace(/\\/g, "/");
          const [scopeOrName, scopedName] = depPath?.split("/") ?? [];
          const pkg = scopeOrName?.startsWith("@")
            ? `${scopeOrName}/${scopedName}`
            : scopeOrName;

          if (pkg === "react" || pkg === "react-dom" || pkg === "scheduler") return "react";
          if (pkg?.startsWith("@trpc/") || pkg?.startsWith("@tanstack/") || pkg === "superjson") return "data";
          if (pkg?.startsWith("@radix-ui/") || pkg === "lucide-react") return "ui";
          if (pkg === "framer-motion") return "motion";
          if (pkg === "recharts") return "charts";
          return "vendor";
        },
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import path from "path";

export default defineConfig({
  base: './',
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11'],
      modernPolyfills: true,
    }),
  ],
  optimizeDeps: {
    exclude: [
      "bcrypt",
      "bcryptjs",
      "express",
      "express-rate-limit",
      "helmet",
      "multer",
      "passport",
      "passport-local",
      "twilio",
      "ws",
      "jsonwebtoken",
      "openid-client",
      "exceljs",
      "drizzle-orm",
      "drizzle-zod",
      "@neondatabase/serverless",
    ],
    include: [
      "react",
      "react-dom",
      "react-hook-form",
      "@hookform/resolvers",
      "date-fns",
      "clsx",
      "class-variance-authority",
      "lucide-react",
      "recharts",
      "framer-motion",
      "wouter",
      "zod",
      "nanoid",
      "uuid",
      "tailwind-merge",
      "next-themes",
      "sonner",
      "input-otp",
      "cmdk",
      "react-day-picker",
      "react-icons",
      "qrcode",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client/src"), // ✅ client/src
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },

  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Use Vite/Rollup defaults for chunking to avoid circular dependencies
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: true,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Target modern browsers for better optimization
    target: 'es2018',
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000", // your Express server
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxy
        // rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
      "/uploads": {
        target: "http://localhost:5000", // your Express server
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      overlay: true,
    },
  },
  preview: {
    port: 5173,
  },
  define: {
    global: "globalThis",
    "process.env": {},
  },
});

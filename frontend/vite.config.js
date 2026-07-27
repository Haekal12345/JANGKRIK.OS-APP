import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // Tambahkan ini jika memakai v4

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Pastikan plugin ini aktif
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    // Tambahkan pengaturan headers ini agar pop-up Google diizinkan
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  },
});

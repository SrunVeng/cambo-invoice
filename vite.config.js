import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 650,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "pdf-stamp",
              test: /node_modules\/pdf-lib\//,
            },
            {
              name: "pdf-export",
              test: /node_modules\/jspdf\//,
            },
            {
              name: "invoice-capture",
              test: /node_modules\/html2canvas\//,
            },
          ],
        },
      },
    },
  },
});

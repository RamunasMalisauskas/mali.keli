import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy":
    "default-src 'self'; img-src 'self'; media-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'",
};

export default defineConfig({
  plugins: [react()],
  preview: {
    headers: securityHeaders,
  },
});

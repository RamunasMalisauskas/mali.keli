import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { uploadApi } from "./vite.upload.js";

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy":
    "default-src 'self'; img-src 'self' data:; media-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'",
};

function withUpload(server, password) {
  server.middlewares.use(uploadApi(process.cwd(), password));
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const password = env.UPLOAD_PASSWORD ?? "";

  return {
    plugins: [
      react(),
      {
        name: "upload-api",
        configureServer(server) {
          withUpload(server, password);
        },
        configurePreviewServer(server) {
          withUpload(server, password);
        },
      },
    ],
    preview: {
      headers: securityHeaders,
    },
  };
});

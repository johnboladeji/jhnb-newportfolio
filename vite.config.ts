import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import prerenderContent from "./prerender";

export default defineConfig({
  // prerenderContent: real text + share-preview tags in index.html for crawlers and link previews (see prerender.ts)
  plugins: [react(), tailwindcss(), prerenderContent()],
});

import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Ancora la root del workspace a questa cartella: evita che Turbopack
  // inferisca una root sbagliata in presenza di lockfile in directory superiori.
  turbopack: { root: projectRoot },
  serverExternalPackages: ["@mastra/*", "@react-pdf/renderer", "exceljs", "docx"],
};

export default nextConfig;

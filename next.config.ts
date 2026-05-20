import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/*", "@react-pdf/renderer", "exceljs", "docx"],
};

export default nextConfig;

import type { NextConfig } from "next";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

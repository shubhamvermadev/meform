import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from root .env file if not already loaded
// This is needed for monorepo setups where .env might be in the root
if (!process.env.DATABASE_URL) {
  const envPath = resolve(__dirname, "../../../.env");
  config({ path: envPath });
}

// Also try loading from apps/dashboard/.env.local (Next.js convention)
if (!process.env.DATABASE_URL) {
  const dashboardEnvPath = resolve(__dirname, "../../../apps/dashboard/.env.local");
  config({ path: dashboardEnvPath });
}

/**
 * Prisma client singleton
 * Use this instance throughout the application
 * 
 * In Next.js, we need to ensure the client is reused across requests
 * to avoid connection pool exhaustion.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "@prisma/client";


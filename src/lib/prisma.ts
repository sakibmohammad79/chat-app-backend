import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { config } from "../app/config";

const adapter = new PrismaPg({
  connectionString: config.database.URL,
});

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      config.app.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

if (config.app.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Driver adapter instead of Prisma's default Rust/WASM query engine - the engine
// binary alone was ~2.2MB of the compiled Cloudflare Worker, pushing the bundle
// over the free plan's 3MiB size limit. This talks to Neon over its serverless
// driver instead, cutting bundle size substantially.
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

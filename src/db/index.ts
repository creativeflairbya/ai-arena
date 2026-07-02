import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

// Allow build to complete without database during static generation
const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

let pool: Pool | undefined;

if (databaseUrl) {
  pool = globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }
}

export { pool };

// Create a proxy db object that throws helpful errors when database is not configured
export const db = pool ? drizzle(pool) : new Proxy({} as any, {
  get() {
    throw new Error("DATABASE_URL is not configured. Please set it in your environment variables.");
  }
});

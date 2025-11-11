import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "@shared/schema";
// Destructure Pool from the CommonJS import
const { Pool } = pkg;
// Explicitly declare the type of pool
let pool: InstanceType<typeof Pool>;
let db: ReturnType<typeof drizzle>;
function initializePool() {
  if (!process.env.DATABASE_URL) {
    // Create a mock pool that throws errors for all operations
    pool = {
      query: async () => {
        throw new Error(
          "Database not configured. Please set DATABASE_URL environment variable."
        );
      },
      end: async () => {},
    } as any;
  } else {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  db = drizzle(pool, { schema });
}
// Export db variable (will be initialized later)
export { db };
export async function initializeDb() {
  // Initialize the pool after environment variables are loaded
  initializePool();
  try {
    await pool.query("SELECT 1");
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("Database not configured") ||
        error.message.includes("password authentication failed") ||
        error.message.includes("does not exist"))
    ) {
      console.warn(
        "⚠️ Database connection failed, continuing with limited functionality"
      );
      console.warn("Error:", error.message);
      return; // Don't throw error, just continue with mock database
    }
    throw error;
  }
}
export const closeDb = async () => {
  if (pool) {
    await pool.end();
  }
};

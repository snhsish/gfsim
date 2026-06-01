/**
 * Stub for @better-auth/kysely-adapter — gfsim uses the Drizzle adapter only.
 * Avoids Turbopack bundling kysely@0.29.x dialect code (incompatible exports).
 */

export function getKyselyDatabaseType() {
  return null;
}

export async function createKyselyAdapter() {
  return {
    kysely: null,
    databaseType: null,
    transaction: undefined,
  };
}

export function kyselyAdapter() {
  throw new Error("Kysely adapter is not used in this project (Drizzle + Supabase).");
}

import "dotenv/config";
import { createClient } from "@libsql/client";
import path from "path";

// Orden respetando foreign keys
const TABLES = [
  "User",
  "Category",
  "Transaction",
  "SavingsGoal",
  "SavingsTransaction",
  "SavingsConfig",
  "PendingExpense",
  "FixedExpense",
];

async function migrate() {
  const local = createClient({
    url: `file:${path.resolve(process.cwd(), "dev.db")}`,
  });

  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log("Conectado a ambas bases de datos\n");

  for (const table of TABLES) {
    try {
      const { rows } = await local.execute(`SELECT * FROM "${table}"`);

      if (rows.length === 0) {
        console.log(`${table}: sin datos, omitiendo`);
        continue;
      }

      const columns = Object.keys(rows[0]);
      const colList = columns.map((c) => `"${c}"`).join(", ");
      const placeholders = columns.map(() => "?").join(", ");
      const sql = `INSERT OR IGNORE INTO "${table}" (${colList}) VALUES (${placeholders})`;

      let inserted = 0;
      for (const row of rows) {
        await turso.execute({
          sql,
          args: columns.map((c) => row[c] as never),
        });
        inserted++;
      }

      console.log(`✓ ${table}: ${inserted} filas copiadas`);
    } catch (err) {
      console.error(`✗ ${table}: error →`, err);
    }
  }

  console.log("\n¡Migración completada!");
  local.close();
  turso.close();
}

migrate().catch(console.error);

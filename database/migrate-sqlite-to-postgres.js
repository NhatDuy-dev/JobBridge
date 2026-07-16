import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { DatabaseSync } = process.getBuiltinModule("node:sqlite");
const { Client } = pg;
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sourcePath = path.resolve(process.argv[2] || path.join(root, "data", "jobbridge.db"));
const databaseUrl = process.env.DATABASE_URL;
const tables = [
  "users",
  "skills",
  "user_skills",
  "jobs",
  "applications",
  "saved_jobs",
  "notifications",
  "sessions",
  "reports",
  "admin_logs",
  "system_settings",
];
const identityTables = [
  "users",
  "skills",
  "jobs",
  "applications",
  "notifications",
  "reports",
  "admin_logs",
];

if (!databaseUrl) {
  throw new Error("Hãy đặt biến DATABASE_URL trỏ tới PostgreSQL đích.");
}
if (!fs.existsSync(sourcePath)) {
  throw new Error(`Không tìm thấy SQLite nguồn: ${sourcePath}`);
}

const quote = (identifier) => `"${identifier.replaceAll('"', '""')}"`;
const sqlite = new DatabaseSync(sourcePath, { readOnly: true });
const postgres = new Client({
  connectionString: databaseUrl,
  ssl: process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

try {
  await postgres.connect();
  await postgres.query(fs.readFileSync(path.join(root, "database", "schema.sql"), "utf8"));

  const existing = await postgres.query("SELECT COUNT(*)::integer AS count FROM users");
  if (existing.rows[0].count > 0) {
    throw new Error("PostgreSQL đích đã có user. Hãy dùng một database trống để tránh trộn hoặc mất dữ liệu.");
  }

  await postgres.query("BEGIN");
  await postgres.query("DELETE FROM system_settings");

  for (const table of tables) {
    const sourceColumns = sqlite
      .prepare(`PRAGMA table_info(${quote(table)})`)
      .all()
      .map((column) => column.name);
    if (sourceColumns.length === 0) continue;

    const targetResult = await postgres.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      [table],
    );
    const targetColumns = new Set(targetResult.rows.map((row) => row.column_name));
    const columns = sourceColumns.filter((column) => targetColumns.has(column));
    const rows = sqlite.prepare(`SELECT * FROM ${quote(table)}`).all();
    if (columns.length === 0 || rows.length === 0) continue;

    const sql = `INSERT INTO ${quote(table)} (${columns.map(quote).join(", ")})
      VALUES (${columns.map((_, index) => `$${index + 1}`).join(", ")})
      ON CONFLICT DO NOTHING`;
    for (const row of rows) {
      await postgres.query(sql, columns.map((column) => row[column]));
    }
    console.log(`${table}: ${rows.length} bản ghi`);
  }

  for (const table of identityTables) {
    await postgres.query(
      `SELECT setval(
        pg_get_serial_sequence($1, 'id'),
        COALESCE((SELECT MAX(id) FROM ${quote(table)}), 1),
        EXISTS (SELECT 1 FROM ${quote(table)})
      )`,
      [table],
    );
  }

  await postgres.query("COMMIT");
  console.log("Đã chuyển dữ liệu SQLite sang PostgreSQL thành công.");
} catch (error) {
  await postgres.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  sqlite.close();
  await postgres.end();
}

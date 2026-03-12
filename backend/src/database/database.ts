import initSqlJs, { Database } from "sql.js";
import fs from "fs";
import path from "path";

const DB_FILE = path.join(__dirname, "../data/attendance.db");

let db: Database;

/**
 * SECTION 2 – Database Design
 *
 * Table: employees
 *   - id          VARCHAR  PRIMARY KEY
 *   - name        VARCHAR  NOT NULL
 *   - department  VARCHAR  NOT NULL
 *
 * Table: attendance
 *   - id          INTEGER  PRIMARY KEY AUTOINCREMENT
 *   - employee_id VARCHAR  NOT NULL  → FK → employees.id
 *   - date        TEXT     NOT NULL  (YYYY-MM-DD)
 *   - time_in     TEXT               (HH:MM:SS)
 *   - time_out    TEXT               (HH:MM:SS)
 *   UNIQUE (employee_id, date)  ← enforce 1 record per employee per day
 */
const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS employees (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    department  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id          TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    date        TEXT NOT NULL,
    time_in     TEXT,
    time_out    TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE (employee_id, date)
  );
`;

const SEED_SQL = `
  INSERT OR IGNORE INTO employees (id, name, department) VALUES
    ('EMP001', 'Budi Santoso',  'Engineering'),
    ('EMP002', 'Siti Rahayu',   'HR'),
    ('EMP003', 'Andi Wijaya',   'Finance'),
    ('EMP004', 'Dewi Lestari',  'Marketing'),
    ('EMP005', 'Rizky Pratama', 'Engineering');
`;

export async function initDatabase(): Promise<Database> {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    db = new SQL.Database();
  }

  db.run(CREATE_TABLES_SQL);
  db.run(SEED_SQL);
  saveDatabase();

  console.log("✅ Database initialized");
  return db;
}

export function getDatabase(): Database {
  if (!db) throw new Error("Database not initialized");
  return db;
}

export function saveDatabase(): void {
  const data = db.export();
  fs.writeFileSync(DB_FILE, Buffer.from(data));
}

/** Helper: run a SELECT and return rows as plain objects */
export function queryAll<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | null)[] = []
): T[] {
  const stmt = getDatabase().prepare(sql);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

/** Helper: run a SELECT and return first row or null */
export function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | null)[] = []
): T | null {
  const rows = queryAll<T>(sql, params);
  return rows[0] ?? null;
}

/** Helper: run INSERT / UPDATE / DELETE */
export function run(
  sql: string,
  params: (string | number | null)[] = []
): void {
  const db = getDatabase();
  db.run(sql, params);
  saveDatabase();
}

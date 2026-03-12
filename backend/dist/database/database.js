"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
exports.getDatabase = getDatabase;
exports.saveDatabase = saveDatabase;
exports.queryAll = queryAll;
exports.queryOne = queryOne;
exports.run = run;
const sql_js_1 = __importDefault(require("sql.js"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_FILE = path_1.default.join(__dirname, "../data/attendance.db");
let db;
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
async function initDatabase() {
    const SQL = await (0, sql_js_1.default)();
    if (fs_1.default.existsSync(DB_FILE)) {
        const fileBuffer = fs_1.default.readFileSync(DB_FILE);
        db = new SQL.Database(fileBuffer);
    }
    else {
        fs_1.default.mkdirSync(path_1.default.dirname(DB_FILE), { recursive: true });
        db = new SQL.Database();
    }
    db.run(CREATE_TABLES_SQL);
    db.run(SEED_SQL);
    saveDatabase();
    console.log("✅ Database initialized");
    return db;
}
function getDatabase() {
    if (!db)
        throw new Error("Database not initialized");
    return db;
}
function saveDatabase() {
    const data = db.export();
    fs_1.default.writeFileSync(DB_FILE, Buffer.from(data));
}
/** Helper: run a SELECT and return rows as plain objects */
function queryAll(sql, params = []) {
    const stmt = getDatabase().prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
        rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
}
/** Helper: run a SELECT and return first row or null */
function queryOne(sql, params = []) {
    const rows = queryAll(sql, params);
    return rows[0] ?? null;
}
/** Helper: run INSERT / UPDATE / DELETE */
function run(sql, params = []) {
    const db = getDatabase();
    db.run(sql, params);
    saveDatabase();
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.punch = punch;
exports.getReport = getReport;
exports.getAbsentToday = getAbsentToday;
exports.getMonthlySummary = getMonthlySummary;
exports.getToday = getToday;
exports.getEmployees = getEmployees;
const database_1 = require("../database");
const utils_1 = require("../utils");
/**
 * POST /attendance
 * body: { employee_id, type: "IN" | "OUT" }
 */
function punch(req, res) {
    const { employee_id, type } = req.body;
    // validation
    if (!employee_id || !type) {
        return res
            .status(400)
            .json({ error: "employee_id dan type (IN/OUT) wajib diisi" });
    }
    const punchType = type.toUpperCase();
    if (punchType !== "IN" && punchType !== "OUT") {
        return res.status(400).json({ error: "type harus IN atau OUT" });
    }
    const empId = employee_id.trim().toUpperCase();
    const employee = (0, database_1.queryOne)("SELECT id, name, department FROM employees WHERE id = ?", [empId]);
    if (!employee) {
        return res.status(404).json({ error: `Karyawan '${empId}' tidak ditemukan` });
    }
    const today = (0, utils_1.todayDate)();
    const now = (0, utils_1.currentTime)();
    const record = (0, database_1.queryOne)("SELECT id, time_in, time_out FROM attendance WHERE employee_id = ? AND date = ?", [empId, today]);
    if (punchType === "IN") {
        if (record && record.time_in) {
            return res.status(409).json({ error: "Karyawan sudah melakukan absen IN hari ini" });
        }
        (0, database_1.run)("INSERT INTO attendance (employee_id, date, time_in) VALUES (?, ?, ?)", [empId, today, now]);
        return res.status(201).json({
            message: "Absen IN berhasil dicatat",
            data: { employee_id: empId, name: employee.name, date: today, time_in: now },
        });
    }
    // OUT
    if (!record || !record.time_in) {
        return res
            .status(422)
            .json({ error: "Tidak bisa absen OUT sebelum absen IN" });
    }
    if (record.time_out) {
        return res.status(409).json({ error: "Karyawan sudah melakukan absen OUT hari ini" });
    }
    (0, database_1.run)("UPDATE attendance SET time_out = ? WHERE employee_id = ? AND date = ?", [now, empId, today]);
    return res.status(200).json({
        message: "Absen OUT berhasil dicatat",
        data: { employee_id: empId, name: employee.name, date: today, time_out: now },
    });
}
/**
 * GET /attendance/report?startDate=&endDate=
 */
function getReport(req, res) {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return res
            .status(400)
            .json({ error: "Query param startDate dan endDate wajib diisi" });
    }
    const rows = (0, database_1.queryAll)(`SELECT
       e.id         AS employee_id,
       e.name       AS name,
       e.department AS department,
       a.date       AS date,
       a.time_in    AS time_in,
       a.time_out   AS time_out
     FROM attendance a
     JOIN employees e ON a.employee_id = e.id
     WHERE a.date BETWEEN ? AND ?
     ORDER BY a.date ASC, e.id ASC`, [startDate, endDate]);
    const report = rows.map((row) => ({
        ...row,
        status: (0, utils_1.determineStatus)(row.time_in, row.time_out),
    }));
    return res.json({ data: report, total: report.length });
}
/**
 * GET /attendance/absent-today
 */
function getAbsentToday(_req, res) {
    const today = (0, utils_1.todayDate)();
    const rows = (0, database_1.queryAll)(`SELECT e.id, e.name, e.department
     FROM employees e
     LEFT JOIN attendance a
       ON a.employee_id = e.id AND a.date = ?
     WHERE a.id IS NULL
     ORDER BY e.id ASC`, [today]);
    return res.json({ date: today, data: rows, total: rows.length });
}
/**
 * GET /attendance/monthly-summary?year=&month=
 */
function getMonthlySummary(req, res) {
    const { year, month } = req.query;
    const now = new Date();
    const y = year ?? String(now.getFullYear());
    const m = month ?? String(now.getMonth() + 1).padStart(2, "0");
    const monthStr = `${y}-${m.padStart(2, "0")}`;
    const rows = (0, database_1.queryAll)(`SELECT
       e.id                          AS employee_id,
       e.name                        AS name,
       e.department                  AS department,
       COUNT(a.id)                   AS total_hadir
     FROM employees e
     LEFT JOIN attendance a
       ON a.employee_id = e.id
       AND a.date LIKE ?
       AND a.time_in  IS NOT NULL
       AND a.time_out IS NOT NULL
     GROUP BY e.id, e.name, e.department
     ORDER BY e.id ASC`, [`${monthStr}%`]);
    return res.json({ month: monthStr, data: rows });
}
// additional helpers previously in routes
function getToday(_req, res) {
    const today = (0, utils_1.todayDate)();
    const rows = (0, database_1.queryAll)(`SELECT
       e.id         AS employee_id,
       e.name       AS name,
       e.department AS department,
       a.date       AS date,
       a.time_in    AS time_in,
       a.time_out   AS time_out
     FROM attendance a
     JOIN employees e ON a.employee_id = e.id
     WHERE a.date = ?
     ORDER BY a.time_in DESC`, [today]);
    const result = rows.map((row) => ({
        ...row,
        status: (0, utils_1.determineStatus)(row.time_in, row.time_out),
    }));
    return res.json({ data: result });
}
function getEmployees(_req, res) {
    const rows = (0, database_1.queryAll)("SELECT id, name, department FROM employees ORDER BY id");
    return res.json({ data: rows });
}

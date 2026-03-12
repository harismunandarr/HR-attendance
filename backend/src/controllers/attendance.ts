import { Request, Response } from "express";
import { queryAll, queryOne, run } from "../database";
import { determineStatus, todayDate, currentTime } from "../utils";
import {
  PunchType,
  Employee,
  AttendanceRecord,
  AttendanceReport,
  MonthlySummary,
} from "../types";

/**
 * POST /attendance
 * body: { employee_id, type: "IN" | "OUT" }
 */
export function punch(req: Request, res: Response) {
  const { employee_id, type } = req.body as {
    employee_id?: string;
    type?: string;
  };

  // validation
  if (!employee_id || !type) {
    return res
      .status(400)
      .json({ error: "employee_id dan type (IN/OUT) wajib diisi" });
  }

  const punchType = type.toUpperCase() as PunchType;
  if (punchType !== "IN" && punchType !== "OUT") {
    return res.status(400).json({ error: "type harus IN atau OUT" });
  }

  const empId = employee_id.trim().toUpperCase();

  const employee = queryOne<Employee>(
    "SELECT id, name, department FROM employees WHERE id = ?",
    [empId]
  );
  if (!employee) {
    return res.status(404).json({ error: `Karyawan '${empId}' tidak ditemukan` });
  }

  const today = todayDate();
  const now = currentTime();

  const record = queryOne<AttendanceRecord>(
    "SELECT id, time_in, time_out FROM attendance WHERE employee_id = ? AND date = ?",
    [empId, today]
  );

  if (punchType === "IN") {
    if (record && record.time_in) {
      return res.status(409).json({ error: "Karyawan sudah melakukan absen IN hari ini" });
    }

    run(
      "INSERT INTO attendance (employee_id, date, time_in) VALUES (?, ?, ?)",
      [empId, today, now]
    );

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

  run(
    "UPDATE attendance SET time_out = ? WHERE employee_id = ? AND date = ?",
    [now, empId, today]
  );

  return res.status(200).json({
    message: "Absen OUT berhasil dicatat",
    data: { employee_id: empId, name: employee.name, date: today, time_out: now },
  });
}

/**
 * GET /attendance/report?startDate=&endDate=
 */
export function getReport(req: Request, res: Response) {
  const { startDate, endDate } = req.query as {
    startDate?: string;
    endDate?: string;
  };

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Query param startDate dan endDate wajib diisi" });
  }

  const rows = queryAll<{
    employee_id: string;
    name: string;
    department: string;
    date: string;
    time_in: string | null;
    time_out: string | null;
  }>(
    `SELECT
       e.id         AS employee_id,
       e.name       AS name,
       e.department AS department,
       a.date       AS date,
       a.time_in    AS time_in,
       a.time_out   AS time_out
     FROM attendance a
     JOIN employees e ON a.employee_id = e.id
     WHERE a.date BETWEEN ? AND ?
     ORDER BY a.date ASC, e.id ASC`,
    [startDate, endDate]
  );

  const report: AttendanceReport[] = rows.map((row) => ({
    ...row,
    status: determineStatus(row.time_in, row.time_out),
  }));

  return res.json({ data: report, total: report.length });
}

/**
 * GET /attendance/absent-today
 */
export function getAbsentToday(_req: Request, res: Response) {
  const today = todayDate();

  const rows = queryAll<Employee>(
    `SELECT e.id, e.name, e.department
     FROM employees e
     LEFT JOIN attendance a
       ON a.employee_id = e.id AND a.date = ?
     WHERE a.id IS NULL
     ORDER BY e.id ASC`,
    [today]
  );

  return res.json({ date: today, data: rows, total: rows.length });
}

/**
 * GET /attendance/monthly-summary?year=&month=
 */
export function getMonthlySummary(req: Request, res: Response) {
  const { year, month } = req.query as { year?: string; month?: string };

  const now = new Date();
  const y = year ?? String(now.getFullYear());
  const m = month ?? String(now.getMonth() + 1).padStart(2, "0");
  const monthStr = `${y}-${m.padStart(2, "0")}`;

  const rows = queryAll<MonthlySummary>(
    `SELECT
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
     ORDER BY e.id ASC`,
    [`${monthStr}%`]
  );

  return res.json({ month: monthStr, data: rows });
}

// additional helpers previously in routes
export function getToday(_req: Request, res: Response) {
  const today = todayDate();

  const rows = queryAll<{
    employee_id: string;
    name: string;
    department: string;
    date: string;
    time_in: string | null;
    time_out: string | null;
  }>(
    `SELECT
       e.id         AS employee_id,
       e.name       AS name,
       e.department AS department,
       a.date       AS date,
       a.time_in    AS time_in,
       a.time_out   AS time_out
     FROM attendance a
     JOIN employees e ON a.employee_id = e.id
     WHERE a.date = ?
     ORDER BY a.time_in DESC`,
    [today]
  );

  const result = rows.map((row) => ({
    ...row,
    status: determineStatus(row.time_in, row.time_out),
  }));

  return res.json({ data: result });
}

export function getEmployees(_req: Request, res: Response) {
  const rows = queryAll<Employee>("SELECT id, name, department FROM employees ORDER BY id");
  return res.json({ data: rows });
}
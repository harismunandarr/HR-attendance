export type PunchType = "IN" | "OUT";

export type AttendanceStatus =
  | "Hadir"
  | "Terlambat"
  | "Tidak Lengkap"
  | "Tidak Absen";

export interface Employee {
  id: string;
  name: string;
  department: string;
}

export interface AttendanceRecord {
  id: number;
  employee_id: string;
  date: string;       // YYYY-MM-DD
  time_in: string | null;
  time_out: string | null;
}

export interface AttendanceReport {
  employee_id: string;
  name: string;
  department: string;
  date: string;
  time_in: string | null;
  time_out: string | null;
  status: AttendanceStatus;
}

export interface MonthlySummary {
  employee_id: string;
  name: string;
  department: string;
  total_hadir: number;
}

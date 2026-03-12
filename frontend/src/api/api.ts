import axios from "axios";
import type { AttendanceRecord, Employee, PunchType } from "./types";

const api = axios.create({ baseURL: "http://localhost:3001" });

export async function getEmployees(): Promise<Employee[]> {
  const res = await api.get<{ data: Employee[] }>("/attendance/employees");
  return res.data.data;
}

export async function postAttendance(
  employee_id: string,
  type: PunchType
): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>("/attendance", {
    employee_id,
    type,
  });
  return res.data;
}

export async function getTodayAttendance(): Promise<AttendanceRecord[]> {
  const res = await api.get<{ data: AttendanceRecord[] }>("/attendance/today");
  return res.data.data;
}

export async function getReport(
  startDate: string,
  endDate: string
): Promise<AttendanceRecord[]> {
  const res = await api.get<{ data: AttendanceRecord[] }>(
    `/attendance/report?startDate=${startDate}&endDate=${endDate}`
  );
  return res.data.data;
}

export async function getAbsentToday(): Promise<Employee[]> {
  const res = await api.get<{ data: Employee[] }>("/attendance/absent-today");
  return res.data.data;
}

export async function getMonthlySummary(year: string, month: string) {
  const res = await api.get(`/attendance/monthly-summary?year=${year}&month=${month}`);
  return res.data;
}

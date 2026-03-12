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
    employee_id: string;
    name: string;
    department: string;
    date: string;
    time_in: string | null;
    time_out: string | null;
    status: AttendanceStatus;
}

export interface ApiResponse<T> {
    data: T;
    total?: number;
    message?: string;
    error?: string;
}

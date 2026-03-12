import type { AttendanceStatus } from "./types";

/**
 * SECTION 4 – Logical Thinking
 *
 * Jam masuk normal : 09:00
 * Aturan status:
 *   - Tidak ada time_in               → "Tidak Absen"
 *   - Ada time_in, tidak ada time_out → "Tidak Lengkap"
 *   - time_in > "09:15"               → "Terlambat"
 *   - time_in <= "09:15"              → "Hadir"
 */
export function determineStatus(
  timeIn: string | null,
  timeOut: string | null
): AttendanceStatus {
  if (!timeIn) return "Tidak Absen";
  if (!timeOut) return "Tidak Lengkap";

  const checkIn = timeIn.substring(0, 5); // "HH:MM"
  if (checkIn > "09:15") return "Terlambat";

  return "Hadir";
}

export function formatTime(time: string | null): string {
  if (!time) return "—";
  return time.substring(0, 5);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; color: string; bg: string }
> = {
  Hadir:          { label: "Hadir",          color: "#16a34a", bg: "#dcfce7" },
  Terlambat:      { label: "Terlambat",      color: "#d97706", bg: "#fef3c7" },
  "Tidak Lengkap":{ label: "Tidak Lengkap",  color: "#2563eb", bg: "#dbeafe" },
  "Tidak Absen":  { label: "Tidak Absen",    color: "#dc2626", bg: "#fee2e2" },
};

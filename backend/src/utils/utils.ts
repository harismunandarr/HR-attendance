import { AttendanceStatus } from "../types/types";

/**
 * SECTION 4 – Logical Thinking
 *
 * Rules:
 *   - Jam masuk normal : 09:00
 *   - IN > 09:15       → "Terlambat"
 *   - Tidak ada OUT    → "Tidak Lengkap"
 *   - Tidak ada IN     → "Tidak Absen"
 *   - IN ≤ 09:15 & ada OUT → "Hadir"
 */
export function determineStatus(
  timeIn: string | null,
  timeOut: string | null
): AttendanceStatus {
  if (!timeIn) return "Tidak Absen";
  if (!timeOut) return "Tidak Lengkap";

  // Compare HH:MM string lexicographically (works because zero-padded)
  const checkIn = timeIn.substring(0, 5); // "HH:MM"
  if (checkIn > "09:15") return "Terlambat";

  return "Hadir";
}

/** Format "HH:MM:SS" → "HH:MM" for display */
export function formatTime(time: string | null): string {
  if (!time) return "-";
  return time.substring(0, 5);
}

/** Return today's date as YYYY-MM-DD */
export function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/** Return current time as HH:MM:SS */
export function currentTime(): string {
  return new Date().toTimeString().split(" ")[0];
}

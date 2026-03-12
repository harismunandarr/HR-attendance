"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineStatus = determineStatus;
exports.formatTime = formatTime;
exports.todayDate = todayDate;
exports.currentTime = currentTime;
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
function determineStatus(timeIn, timeOut) {
    if (!timeIn)
        return "Tidak Absen";
    if (!timeOut)
        return "Tidak Lengkap";
    // Compare HH:MM string lexicographically (works because zero-padded)
    const checkIn = timeIn.substring(0, 5); // "HH:MM"
    if (checkIn > "09:15")
        return "Terlambat";
    return "Hadir";
}
/** Format "HH:MM:SS" → "HH:MM" for display */
function formatTime(time) {
    if (!time)
        return "-";
    return time.substring(0, 5);
}
/** Return today's date as YYYY-MM-DD */
function todayDate() {
    return new Date().toISOString().split("T")[0];
}
/** Return current time as HH:MM:SS */
function currentTime() {
    return new Date().toTimeString().split(" ")[0];
}

# HRIS Attendance System
**Technical Test – Junior Developer (HRIS)**

Stack: **Express.js + TypeScript** (backend) · **React.js + TypeScript** (frontend) · **SQLite** (raw queries, no ORM)

---

## Struktur Proyek

```
hris-attendance/
├── backend/                  # Express.js + TypeScript
│   ├── src/
│   │   ├── index.ts          # Entry point, server setup
│   │   ├── database.ts       # SQLite init, raw query helpers
│   │   ├── types.ts          # TypeScript interfaces
│   │   ├── utils.ts          # Section 4 – determineStatus()
│   │   └── routes/
│   │       └── attendance.ts # Semua endpoint REST API
│   ├── data/                 # attendance.db (auto-created)
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                 # React.js + TypeScript (Vite)
    └── src/
        ├── App.tsx           # Single-page component (useState + fetch)
        ├── App.css
        ├── api.ts            # Axios API calls
        ├── types.ts          # TypeScript types
        └── utils.ts          # Section 4 – determineStatus() (frontend)
```

---

## Cara Menjalankan

### Backend
```bash
cd backend
npm install
npm run dev       # ts-node, port 3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev       # Vite, port 5173
```

Buka: `http://localhost:5173`

---

## Section 1 – REST API

### `POST /attendance`
Mencatat absen IN atau OUT.

**Body:**
```json
{ "employee_id": "EMP001", "type": "IN" }
```

**Validasi:**
- `type` harus `IN` atau `OUT`
- Hanya boleh **1 IN** dan **1 OUT** per karyawan per hari
- `OUT` ditolak jika belum ada `IN`

**Response 201 (IN berhasil):**
```json
{
  "message": "Absen IN berhasil dicatat",
  "data": { "employee_id": "EMP001", "name": "Budi Santoso", "date": "2026-03-11", "time_in": "08:45:00" }
}
```

**Error Responses:**
| Code | Kondisi |
|------|---------|
| 400  | Body tidak lengkap / type invalid |
| 404  | employee_id tidak ditemukan |
| 409  | Sudah absen IN/OUT hari ini |
| 422  | OUT sebelum IN |

---

### `GET /attendance/report?startDate=&endDate=`
Laporan absensi per rentang tanggal.

**Response:**
```json
{
  "data": [
    {
      "employee_id": "EMP001",
      "name": "Budi Santoso",
      "department": "Engineering",
      "date": "2026-03-11",
      "time_in": "08:45:00",
      "time_out": "17:10:00",
      "status": "Hadir"
    }
  ],
  "total": 1
}
```

### `GET /attendance/today`
Rekap absensi hari ini (digunakan frontend).

### `GET /attendance/absent-today`
Karyawan yang belum absen hari ini.

### `GET /attendance/monthly-summary?year=&month=`
Total hari hadir per karyawan dalam 1 bulan.

### `GET /attendance/employees`
Daftar semua karyawan (untuk dropdown frontend).

---

## Section 2 – Database Design

### Tabel `employees`
| Kolom      | Tipe | Constraint       |
|------------|------|------------------|
| id         | TEXT | **PRIMARY KEY**  |
| name       | TEXT | NOT NULL         |
| department | TEXT | NOT NULL         |

### Tabel `attendance`
| Kolom       | Tipe    | Constraint                              |
|-------------|---------|----------------------------------------|
| id          | INTEGER | **PRIMARY KEY** AUTOINCREMENT           |
| employee_id | TEXT    | **FOREIGN KEY** → employees.id          |
| date        | TEXT    | NOT NULL (YYYY-MM-DD)                   |
| time_in     | TEXT    | nullable (HH:MM:SS)                     |
| time_out    | TEXT    | nullable (HH:MM:SS)                     |
|             |         | UNIQUE(employee_id, date)               |

**Raw Query – Karyawan belum absen hari ini:**
```sql
SELECT e.id, e.name, e.department
FROM employees e
LEFT JOIN attendance a
  ON a.employee_id = e.id AND a.date = '2026-03-11'
WHERE a.id IS NULL
ORDER BY e.id ASC;
```

**Raw Query – Total hadir per karyawan dalam 1 bulan:**
```sql
SELECT
  e.id          AS employee_id,
  e.name        AS name,
  e.department  AS department,
  COUNT(a.id)   AS total_hadir
FROM employees e
LEFT JOIN attendance a
  ON a.employee_id = e.id
  AND a.date LIKE '2026-03%'
  AND a.time_in  IS NOT NULL
  AND a.time_out IS NOT NULL
GROUP BY e.id, e.name, e.department
ORDER BY e.id ASC;
```

---

## Section 3 – Frontend React

Single page dengan 3 tab:
1. **Absensi** – Form absen (dropdown karyawan + tombol IN/OUT), tabel rekap hari ini, list karyawan belum absen
2. **Laporan** – Filter tanggal, tabel laporan dengan kolom status
3. **Ringkasan** – Pilih bulan/tahun, tabel total kehadiran per karyawan

Menggunakan `useState` untuk semua state dan `axios` (fetch wrapper) untuk API calls.

---

## Section 4 – Logical Thinking

```typescript
// utils.ts (backend & frontend identik)
function determineStatus(
  timeIn: string | null,
  timeOut: string | null
): AttendanceStatus {
  if (!timeIn)  return "Tidak Absen";    // tidak ada IN
  if (!timeOut) return "Tidak Lengkap";  // ada IN, tidak ada OUT

  const checkIn = timeIn.substring(0, 5); // "HH:MM"
  if (checkIn > "09:15") return "Terlambat";

  return "Hadir";
}
```

| Kondisi               | Status          |
|-----------------------|-----------------|
| Tidak ada time_in     | `Tidak Absen`   |
| Ada time_in, no OUT   | `Tidak Lengkap` |
| time_in > 09:15       | `Terlambat`     |
| time_in ≤ 09:15 + OUT | `Hadir`         |

---

## Data Seed (Karyawan)

| ID     | Nama           | Departemen  |
|--------|----------------|-------------|
| EMP001 | Budi Santoso   | Engineering |
| EMP002 | Siti Rahayu    | HR          |
| EMP003 | Andi Wijaya    | Finance     |
| EMP004 | Dewi Lestari   | Marketing   |
| EMP005 | Rizky Pratama  | Engineering |

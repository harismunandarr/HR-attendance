import React from "react";
import type { Employee } from "../types";

interface AttendanceFormProps {
    employees: Employee[];
    selectedEmp: string;
    setSelectedEmp: (id: string) => void;
    selectedEmployee?: Employee;
    loading: boolean;
    onPunch: (type: "IN" | "OUT") => void;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
    employees,
    selectedEmp,
    setSelectedEmp,
    selectedEmployee,
    loading,
    onPunch,
}) => {
    return (
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-5">Form Absensi</h2>

            <div className="space-y-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Pilih Karyawan</label>
                    <select
                        value={selectedEmp}
                        onChange={(e) => setSelectedEmp(e.target.value)}
                        className="w-full p-3 bg-white border-2 border-slate-200 rounded-lg text-sm focus:border-blue-600 outline-hidden transition-colors"
                    >
                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.id} – {emp.name} ({emp.department})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedEmployee && (
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-700 to-blue-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                            {selectedEmployee.name.charAt(0)}
                        </div>
                        <div>
                            <strong className="text-slate-800 text-base block">{selectedEmployee.name}</strong>
                            <p className="text-xs text-slate-500">
                                {selectedEmployee.department} · {selectedEmployee.id}
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <button
                        onClick={() => onPunch("IN")}
                        disabled={loading}
                        className="w-full py-3.5 px-6 rounded-lg font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none shadow-md"
                    >
                        {loading ? "⏳ Menyimpan..." : "🟢 Absen Masuk (IN)"}
                    </button>
                    <button
                        onClick={() => onPunch("OUT")}
                        disabled={loading}
                        className="w-full py-3.5 px-6 rounded-lg font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none shadow-md"
                    >
                        {loading ? "⏳ Menyimpan..." : "🔴 Absen Pulang (OUT)"}
                    </button>
                </div>
            </div>
        </section>
    );
};

import React from "react";
import type { AttendanceRecord } from "../types";
import { formatTime, formatDate, STATUS_CONFIG } from "../utils/utils";

interface AttendanceTableProps {
    title: string;
    data: AttendanceRecord[];
    type?: "today" | "report";
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({ title, data, type = "today" }) => {
    if (data.length === 0) {
        return (
            <section className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-2">{title}</h2>
                <p className="text-slate-500 text-sm">Belum ada data tersedia.</p>
            </section>
        );
    }

    return (
        <section className="bg-white md:border border-slate-200 rounded-xl md:p-6 md:shadow-sm overflow-hidden">
            <h2 className="text-lg font-bold text-slate-800 mb-5 px-4 md:px-0">{title}</h2>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 px-4">
                {data.map((row, i) => {
                    const s = STATUS_CONFIG[row.status];
                    return (
                        <div key={i} className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
                            <div className="flex justify-between items-start border-b border-slate-50 pb-2">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Karyawan</span>
                                    <div className="font-bold text-slate-800">{row.name}</div>
                                    <div className="text-[11px] text-slate-500 font-medium">{row.department} · <span className="font-mono">{row.employee_id}</span></div>
                                </div>
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs" style={{ color: s.color, background: s.bg }}>
                                    {s.label}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {type === "report" && (
                                    <div className="col-span-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase block mb-0.5">Tanggal</span>
                                        <span className="text-xs font-bold text-slate-700">{formatDate(row.date)}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-0.5">Jam Masuk</span>
                                    <span className="text-xs font-bold font-mono text-emerald-600">{formatTime(row.time_in)}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-0.5">Jam Pulang</span>
                                    <span className="text-xs font-bold font-mono text-rose-600">{formatTime(row.time_out)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            {type === "report" && <th className="px-4 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Tanggal</th>}
                            <th className="px-4 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">ID</th>
                            <th className="px-4 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Nama</th>
                            <th className="px-4 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Departemen</th>
                            <th className="px-4 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Jam Masuk</th>
                            <th className="px-4 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Jam Pulang</th>
                            <th className="px-4 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((row, i) => {
                            const s = STATUS_CONFIG[row.status];
                            return (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    {type === "report" && <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{formatDate(row.date)}</td>}
                                    <td className="px-4 py-4 font-mono text-slate-600 whitespace-nowrap">{row.employee_id}</td>
                                    <td className="px-4 py-4 font-bold text-slate-800">{row.name}</td>
                                    <td className="px-4 py-4 text-slate-600">{row.department}</td>
                                    <td className="px-4 py-4 font-mono text-emerald-600">{formatTime(row.time_in)}</td>
                                    <td className="px-4 py-4 font-mono text-rose-600">{formatTime(row.time_out)}</td>
                                    <td className="px-4 py-4">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: s.color, background: s.bg }}>
                                            {s.label}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

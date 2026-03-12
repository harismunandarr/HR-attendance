import React from "react";

interface SummaryTableProps {
    data: any[];
}

export const SummaryTable: React.FC<SummaryTableProps> = ({ data }) => {
    if (data.length === 0) return null;

    return (
        <section className="bg-white border border-slate-200 rounded-xl md:p-6 md:shadow-sm overflow-hidden">
            <h2 className="text-lg font-bold text-slate-800 mb-5 px-4 md:px-0">Total Kehadiran per Karyawan</h2>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 px-4">
                {data.map((row) => (
                    <div key={row.employee_id} className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                        <div>
                            <div className="font-bold text-slate-800 text-base">{row.name}</div>
                            <div className="text-[11px] text-slate-500 font-medium">
                                {row.department} · <span className="font-mono">{row.employee_id}</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className={`
                px-4 py-2 rounded-xl font-black text-sm
                ${row.total_hadir > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}
              `}>
                                {row.total_hadir} hr
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">ID Karyawan</th>
                            <th className="px-4 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Nama</th>
                            <th className="px-4 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Departemen</th>
                            <th className="px-4 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider text-center">Total Hadir</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((row) => (
                            <tr key={row.employee_id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-4 font-mono text-slate-600 whitespace-nowrap">{row.employee_id}</td>
                                <td className="px-4 py-4 font-bold text-slate-800">{row.name}</td>
                                <td className="px-4 py-4 text-slate-600">{row.department}</td>
                                <td className="px-4 py-4 text-center">
                                    <span className={`
                    px-4 py-1 rounded-full font-bold text-xs
                    ${row.total_hadir > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}
                  `}>
                                        {row.total_hadir} hari
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

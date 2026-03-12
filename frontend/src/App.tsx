import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  getEmployees,
  postAttendance,
  getTodayAttendance,
  getReport,
  getAbsentToday,
  getMonthlySummary,
} from "./api/api";
import type { AttendanceRecord, Employee, PunchType } from "./types";

// Components
import { Header } from "./components/Header";
import { Tabs } from "./components/Tabs";
import { AttendanceForm } from "./components/AttendanceForm";
import { AttendanceTable } from "./components/AttendanceTable";
import { SummaryTable } from "./components/SummaryTable";

type Tab = "absensi" | "laporan" | "ringkasan";

export default function App() {
  // ── useState 
  const [activeTab, setActiveTab] = useState<Tab>("absensi");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [todayList, setTodayList] = useState<AttendanceRecord[]>([]);
  const [absentList, setAbsentList] = useState<Employee[]>([]);

  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [reportData, setReportData] = useState<AttendanceRecord[]>([]);
  const [reportLoaded, setReportLoaded] = useState(false);

  const now = new Date();
  const [sumYear, setSumYear] = useState(String(now.getFullYear()));
  const [sumMonth, setSumMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [summaryData, setSummaryData] = useState<any[]>([]);

  // ── Helpers 
  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const loadToday = useCallback(async () => {
    const [list, absent] = await Promise.all([
      getTodayAttendance(),
      getAbsentToday(),
    ]);
    setTodayList(list);
    setAbsentList(absent);
  }, []);

  useEffect(() => {
    (async () => {
      const emps = await getEmployees();
      setEmployees(emps);
      if (emps.length > 0) setSelectedEmp(emps[0].id);
    })();
    loadToday();
  }, [loadToday]);

  const handlePunch = async (type: PunchType) => {
    if (!selectedEmp) return;
    setLoading(true);
    try {
      const res = await postAttendance(selectedEmp, type);
      showToast(res.message, true);
      await loadToday();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error ?? "Terjadi kesalahan"
        : "Terjadi kesalahan";
      showToast(msg, false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadReport = async () => {
    setLoading(true);
    try {
      const data = await getReport(startDate, endDate);
      setReportData(data);
      setReportLoaded(true);
    } catch {
      showToast("Gagal memuat laporan", false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSummary = async () => {
    setLoading(true);
    try {
      const res = await getMonthlySummary(sumYear, sumMonth);
      setSummaryData(res.data);
    } catch {
      showToast("Gagal memuat ringkasan", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "ringkasan" && summaryData.length === 0) {
      handleLoadSummary();
    }
  }, [activeTab, summaryData.length]);

  const selectedEmployee = employees.find((e) => e.id === selectedEmp);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      <Header />

      {/* ── Toast ── */}
      {toast && (
        <div className={`
          fixed top-6 right-6 z-100 flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-sm shadow-2xl animate-in slide-in-from-right-10 fade-in duration-300
          ${toast.ok ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}
        `}>
          <span className="text-lg">{toast.ok ? "✓" : "✕"}</span> {toast.msg}
        </div>
      )}

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-container mx-auto px-4 md:px-6 pt-8 space-y-8">

        {/* ═══ TAB: ABSENSI ═══ */}
        {activeTab === "absensi" && (
          <div className="space-y-6">
            <AttendanceForm
              employees={employees}
              selectedEmp={selectedEmp}
              setSelectedEmp={setSelectedEmp}
              selectedEmployee={selectedEmployee}
              loading={loading}
              onPunch={handlePunch}
            />

            {absentList.length > 0 && (
              <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">⚠️</span> Belum Absen Hari Ini
                  <span className="ml-auto bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-black">
                    {absentList.length} KARYAWAN
                  </span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {absentList.map((e) => (
                    <span key={e.id} className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs">
                      {e.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <AttendanceTable title="Rekap Absensi Hari Ini" data={todayList} />
          </div>
        )}

        {/* ═══ TAB: LAPORAN ═══ */}
        {activeTab === "laporan" && (
          <div className="space-y-6">
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Laporan Absensi</h2>
              <div className="flex flex-col md:flex-row items-stretch md:items-end gap-5">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dari Tanggal</label>
                  <input
                    type="date"
                    className="w-full p-3 bg-white border-2 border-slate-200 rounded-lg text-sm focus:border-blue-600 outline-hidden transition-colors"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sampai Tanggal</label>
                  <input
                    type="date"
                    className="w-full p-3 bg-white border-2 border-slate-200 rounded-lg text-sm focus:border-blue-600 outline-hidden transition-colors"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <button
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 px-8 rounded-lg active:scale-95 transition-all shadow-md disabled:opacity-50"
                  onClick={handleLoadReport}
                  disabled={loading}
                >
                  {loading ? "⏳ Memuat..." : "Tampilkan"}
                </button>
              </div>

              {reportLoaded && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm font-medium text-slate-500">
                      <span className="text-blue-700 font-bold">{reportData.length} record</span> ditemukan · {startDate} s/d {endDate}
                    </p>
                  </div>
                  <AttendanceTable title="Hasil Pencarian Laporan" data={reportData} type="report" />
                </div>
              )}
            </section>
          </div>
        )}

        {/* ═══ TAB: RINGKASAN BULANAN ═══ */}
        {activeTab === "ringkasan" && (
          <div className="space-y-6">
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-6 px-0">Filter Ringkasan</h2>
              <div className="flex flex-col md:flex-row items-stretch md:items-end gap-5">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tahun</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-white border-2 border-slate-200 rounded-lg text-sm focus:border-blue-600 outline-hidden transition-colors"
                    value={sumYear}
                    onChange={(e) => setSumYear(e.target.value)}
                    min="2020" max="2099"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bulan</label>
                  <select
                    className="w-full p-3 bg-white border-2 border-slate-200 rounded-lg text-sm focus:border-blue-600 outline-hidden transition-colors"
                    value={sumMonth}
                    onChange={(e) => setSumMonth(e.target.value)}
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = String(i + 1).padStart(2, "0");
                      const label = new Date(`2024-${m}-01`).toLocaleDateString("id-ID", { month: "long" });
                      return <option key={m} value={m}>{label}</option>;
                    })}
                  </select>
                </div>
                <button
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 px-8 rounded-lg active:scale-95 transition-all shadow-md disabled:opacity-50"
                  onClick={handleLoadSummary}
                  disabled={loading}
                >
                  {loading ? "⏳ Memuat..." : "Tampilkan"}
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <SummaryTable data={summaryData} />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

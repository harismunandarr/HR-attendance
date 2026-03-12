import React from "react";

export const Header: React.FC = () => {
    return (
        <header className="bg-linear-to-br from-blue-800 to-blue-950 text-white shadow-lg shadow-blue-900/30">
            <div className="max-container mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-3">
                    <span className="text-3xl md:text-4xl">⏱</span>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight">HRIS Attendance</h1>
                        <p className="text-xs md:text-sm text-blue-200/80">Human Resource Information System</p>
                    </div>
                </div>
                <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-full text-xs md:text-sm font-semibold backdrop-blur-sm w-full md:w-auto">
                    {new Date().toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </div>
            </div>
        </header>
    );
};

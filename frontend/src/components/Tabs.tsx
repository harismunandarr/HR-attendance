import React from "react";

interface TabsProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: "absensi", label: "Absensi", icon: "📋" },
        { id: "laporan", label: "Laporan", icon: "📊" },
        { id: "ringkasan", label: "Ringkasan", icon: "📅" },
    ];

    return (
        <nav className="bg-white border-b border-slate-200 flex px-6 overflow-x-auto scrollbar-hide sticky top-0 z-50 shadow-sm">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
            whitespace-nowrap px-6 py-4 text-sm font-bold transition-all border-b-3
            ${activeTab === tab.id
                            ? "text-blue-700 border-blue-700"
                            : "text-slate-500 border-transparent hover:text-blue-600"
                        }
          `}
                >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                </button>
            ))}
        </nav>
    );
};

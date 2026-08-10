import React from "react";
import { ActiveTab, Language } from "../types";
import { Camera, Recycle, Bell, User } from "lucide-react";

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab, language }) => {
  const isAr = language === "ar";

  const tabs = [
    {
      id: "home" as ActiveTab,
      labelAr: "الرئيسية",
      labelEn: "Home",
      icon: Recycle,
    },
    {
      id: "scan" as ActiveTab,
      labelAr: "الفحص الذكي",
      labelEn: "Smart Scan",
      icon: Camera,
    },
    {
      id: "updates" as ActiveTab,
      labelAr: "عن المنصة",
      labelEn: "About",
      icon: Bell,
    },
    {
      id: "profile" as ActiveTab,
      labelAr: "الحساب",
      labelEn: "Account",
      icon: User,
    },
  ];

  return (
    <nav className="md:hidden w-full shrink-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-2.5 shadow-lg sticky bottom-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-around sm:justify-center sm:gap-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-teal-700 to-cyan-600 text-white shadow-xs border border-cyan-500"
                  : "text-slate-500 hover:text-cyan-800 hover:bg-slate-100"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "scale-105" : ""}`} />
              <span className="text-[10px] font-bold mt-1 tracking-tight whitespace-nowrap">
                {isAr ? tab.labelAr : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

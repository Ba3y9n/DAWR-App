import React from "react";
import { ActiveTab, Language } from "../types";
import { Camera, Recycle, Bell, User, MapPin } from "lucide-react";

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
      id: "map" as ActiveTab,
      labelAr: "خريطة دور",
      labelEn: "Map",
      icon: MapPin,
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
    <>
      {/* Bottom Nav Bar — Mobile only, fixed at bottom, does NOT overlap content */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/98 backdrop-blur-lg border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around px-1 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer min-w-[52px] ${
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
      {/* Spacer to prevent page content from going under the fixed BottomNav */}
      <div className="md:hidden h-[68px] shrink-0" aria-hidden="true" />
    </>
  );

};

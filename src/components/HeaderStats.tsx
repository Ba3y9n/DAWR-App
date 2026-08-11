import React, { useState } from "react";
import { UserStats, Language, ActiveTab } from "../types";
import { Recycle, ArrowLeft, ArrowRight, Globe, Camera, Award, Bot, Bell, User, Menu, X, Sparkles, Leaf } from "lucide-react";

interface HeaderStatsProps {
  userStats: UserStats;
  language: Language;
  onToggleLanguage: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  cameraReady?: boolean;
  activeTab?: ActiveTab;
  onChangeTab?: (tab: ActiveTab) => void;
}

export const HeaderStats: React.FC<HeaderStatsProps> = ({
  userStats,
  language,
  onToggleLanguage,
  showBackButton,
  onBack,
  cameraReady = true,
  activeTab = "home",
  onChangeTab,
}) => {
  const isAr = language === "ar";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: "home" as ActiveTab, labelAr: "الرئيسية", labelEn: "Home", action: () => onChangeTab?.("home") },
    { id: "scan" as ActiveTab, labelAr: "الفحص الذكي", labelEn: "Smart Scan", action: () => onChangeTab?.("scan") },
    {
      id: "howItWorks" as any,
      labelAr: "كيف يعمل دَوْر؟",
      labelEn: "How DAWR Works",
      action: () => {
        onChangeTab?.("home");
        setTimeout(() => {
          document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      },
    },
    {
      id: "impact" as any,
      labelAr: "الأثر الدائري",
      labelEn: "Circular Impact",
      action: () => {
        onChangeTab?.("home");
        setTimeout(() => {
          document.getElementById("impact-section")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      },
    },
    { id: "updates" as ActiveTab, labelAr: "التحديثات", labelEn: "Updates", action: () => onChangeTab?.("updates") },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 w-full shadow-xs">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* 1. Right Side: Logo & Platform Identity */}
        <div className="flex items-center gap-3">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-emerald-900 border border-slate-200 transition-all active:scale-95 cursor-pointer shrink-0"
              title={isAr ? "الرجوع" : "Back"}
            >
              {isAr ? (
                <ArrowRight className="w-4 h-4 text-emerald-800" />
              ) : (
                <ArrowLeft className="w-4 h-4 text-emerald-800" />
              )}
            </button>
          )}

          <div 
            onClick={() => onChangeTab?.("home")}
            className="flex items-center gap-3 cursor-pointer group py-0.5"
          >
            <img 
              src="/assets/dawr_logo_new.png" 
              alt="DAWR Logo" 
              className="h-20 sm:h-24 max-h-24 w-auto object-contain flex-shrink-0 group-hover:scale-105 transition-transform duration-300 drop-shadow-2xs"
            />
          </div>
        </div>

        {/* 2. Center: Quick Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/80">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id || (link.id === "home" && activeTab === "home");
            return (
              <button
                key={link.id}
                onClick={link.action}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80"
                }`}
              >
                {isAr ? link.labelAr : link.labelEn}
              </button>
            );
          })}
        </nav>

        {/* 3. Left Side: Tools, Points & Account */}
        <div className="flex items-center gap-2">
          {/* Sustainability Points Glass Badge */}
          <div 
            onClick={() => onChangeTab?.("profile")}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-950 border border-emerald-200/90 shadow-2xs font-black text-xs cursor-pointer hover:border-emerald-400 transition-all"
            title={isAr ? "نقاط الاستدامة المكتسبة" : "Earned Eco Points"}
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{userStats.points} {isAr ? "نقطة دَوْر" : "DAWR pts"}</span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isAr ? "EN" : "عربي"}</span>
          </button>

          {/* Olive Green Main CTA Action Button */}
          <button
            onClick={() => onChangeTab?.("scan")}
            className="hidden xs:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 hover:from-emerald-900 hover:to-teal-900 text-white font-black text-xs shadow-md shadow-emerald-900/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-300" />
            <span>{isAr ? "افحص منتجاً الآن" : "Scan Product Now"}</span>
          </button>

          {/* User Account Button */}
          <button
            onClick={() => onChangeTab?.("profile")}
            className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
              activeTab === "profile"
                ? "bg-emerald-800 text-white border-emerald-700"
                : "bg-slate-100 hover:bg-emerald-50 text-slate-700 border-slate-200"
            }`}
            title={isAr ? "الحساب الشخصي" : "Account Profile"}
          >
            <User className="w-4 h-4" />
          </button>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 4. Mobile Menu Dropdown Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-white border-b border-slate-200 px-4 py-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 font-extrabold text-xs">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>{userStats.points} {isAr ? "نقطة استدامة" : "points"}</span>
            </div>
            <button
              onClick={() => {
                onChangeTab?.("home");
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white font-black text-xs shadow-sm"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isAr ? "افحص منتجك الآن" : "Scan Product"}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  link.action();
                  setMobileMenuOpen(false);
                }}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-right transition ${
                  activeTab === link.id ? "bg-emerald-800 text-white" : "bg-slate-50 text-slate-800 hover:bg-emerald-50"
                }`}
              >
                {isAr ? link.labelAr : link.labelEn}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

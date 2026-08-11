import React from "react";
import { Language, ActiveTab } from "../types";

interface FooterProps {
  language: Language;
  onChangeTab?: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onChangeTab }) => {
  const isAr = language === "ar";

  const handleLinkClick = (tab: ActiveTab, sectionId?: string) => {
    if (onChangeTab) {
      onChangeTab(tab);
      if (sectionId) {
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    }
  };

  return (
    <footer id="updates" className="w-full mt-auto border-t border-emerald-900/60 bg-gradient-to-b from-[#04291e] via-emerald-950 to-slate-950 text-white px-6 sm:px-12 md:px-16 pt-14 pb-12 shadow-xl rounded-none relative z-10 m-0">
      <div className="w-full max-w-7xl mx-auto space-y-10">

        {/* ── 4-Column Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-start">

          {/* Column 1: Brand Identity */}
          <div className="space-y-4">
            <img src="/assets/dawr_logo_new.png" alt="DAWR Logo" className="h-11 w-auto object-contain bg-white/90 p-1.5 rounded-xl shadow-sm" />
            <p className="text-sm font-semibold text-slate-300 leading-relaxed max-w-xs">
              {isAr
                ? "التحليل الدائري الذكي للمنتجات وتعزيز حلول الاستدامة."
                : "Smart circular analysis for products and sustainable solutions."}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-emerald-400 tracking-wider uppercase">
              {isAr ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="space-y-2.5">
              {[
                { ar: "الرئيسية",          en: "Home", tab: "home" as ActiveTab },
                { ar: "الفحص الذكي",       en: "Smart Scan", tab: "scan" as ActiveTab },
                { ar: "كيف يعمل دَوْر؟",   en: "How DAWR Works", tab: "home" as ActiveTab, section: "how-it-works" },
                { ar: "الأثر البيئي",       en: "Circular Impact", tab: "home" as ActiveTab, section: "impact-section" },
              ].map((link) => (
                <li key={link.en}>
                  <button
                    onClick={() => handleLinkClick(link.tab, link.section)}
                    className="text-sm text-slate-300 hover:text-emerald-400 cursor-pointer transition-colors duration-155 font-medium bg-transparent border-none p-0 text-start"
                  >
                    {isAr ? link.ar : link.en}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Help & Policies */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-emerald-400 tracking-wider uppercase">
              {isAr ? "المساعدة والسياسات" : "Help & Legal"}
            </h4>
            <ul className="space-y-2.5">
              {[
                { ar: "الأسئلة الشائعة",          en: "FAQs", tab: "updates" as ActiveTab },
                { ar: "سياسة الخصوصية",            en: "Privacy Policy", tab: "updates" as ActiveTab },
                { ar: "الشروط والأحكام",            en: "Terms & Conditions", tab: "updates" as ActiveTab },
                { ar: "سياسة الاستخدام العادل",    en: "Fair Use Policy", tab: "updates" as ActiveTab },
              ].map((link) => (
                <li key={link.en}>
                  <button
                    onClick={() => handleLinkClick(link.tab)}
                    className="text-sm text-slate-300 hover:text-emerald-400 cursor-pointer transition-colors duration-155 font-medium bg-transparent border-none p-0 text-start"
                  >
                    {isAr ? link.ar : link.en}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Social */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-emerald-400 tracking-wider uppercase">
              {isAr ? "تواصل معنا" : "Contact Us"}
            </h4>
            <ul className="space-y-2.5">
              {[
                { ar: "تويتر / X",     en: "Twitter / X" },
                { ar: "إنستغرام",      en: "Instagram" },
                { ar: "لينكدإن",       en: "LinkedIn" },
                { ar: "الدعم الفني",   en: "Technical Support" },
              ].map((link) => (
                <li key={link.en}>
                  <span className="text-sm text-slate-300 hover:text-emerald-400 cursor-pointer transition-colors duration-155 font-medium">
                    {isAr ? link.ar : link.en}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ── Green Separator + Copyright + Team Badges ── */}
        <div className="border-t border-emerald-800/50 pt-7 space-y-5 text-center">
          <p className="text-sm font-bold text-slate-400">
            {isAr ? "© 2026 DAWR - جميع الحقوق محفوظة" : "© 2026 DAWR - All rights reserved"}
          </p>

          {/* Development Team Badges */}
          <div className="space-y-3">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">
              {isAr ? "فريق التطوير" : "Development Team"}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mx-auto">
              {/* Bayan Almutiri with LinkedIn Anchor Link */}
              <a
                href="https://www.linkedin.com/in/bayan-almutairi-93a872333?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-900/40 border border-emerald-500/30 text-emerald-100 hover:scale-105 hover:border-emerald-400 hover:text-emerald-300 px-4 py-1.5 rounded-full text-xs font-black shadow-sm transition-all duration-200 cursor-pointer backdrop-blur-sm"
              >
                {isAr ? "بيان المطيري" : "Bayan Almutiri"}
              </a>

              {/* Other Members */}
              {[
                { ar: "متعب القرني",         en: "Mutaeb Alqarni" },
                { ar: "عبدالعزيز الشمري",   en: "Abdulaziz Alshammari" },
                { ar: "فيصل ال عبدالله",    en: "Faisal Al Abdullah" },
              ].map((member) => (
                <span
                  key={member.en}
                  className="bg-emerald-900/40 border border-emerald-500/30 text-emerald-100 hover:scale-105 hover:border-emerald-400 hover:text-white px-4 py-1.5 rounded-full text-xs font-black shadow-sm transition-all duration-200 cursor-default backdrop-blur-sm"
                >
                  {isAr ? member.ar : member.en}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

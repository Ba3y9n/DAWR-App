import React, { useState } from "react";
import { RotateCcw, Wrench, HeartHandshake, Tag, Recycle } from "lucide-react";

interface CircularHudLoopProps {
  language: "ar" | "en";
  onSelectPathway?: (pathwayId: string) => void;
}

export const CircularHudLoop: React.FC<CircularHudLoopProps> = ({ language, onSelectPathway }) => {
  const isAr = language === "ar";
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);

  const segments = [
    {
      id: "reuse",
      labelAr: "إعادة استخدام",
      labelEn: "Reuse",
      icon: RotateCcw,
    },
    {
      id: "repair",
      labelAr: "إصلاح",
      labelEn: "Repair",
      icon: Wrench,
    },
    {
      id: "donation",
      labelAr: "تبرع",
      labelEn: "Donation",
      icon: HeartHandshake,
    },
    {
      id: "resell",
      labelAr: "إعادة بيع",
      labelEn: "Resell",
      icon: Tag,
    },
    {
      id: "recycle",
      labelAr: "تدوير",
      labelEn: "Recycling",
      icon: Recycle,
    },
  ];

  return (
    <div className="relative w-full max-w-[480px] sm:max-w-[520px] aspect-square mx-auto flex items-center justify-center select-none" dir={isAr ? "rtl" : "ltr"}>
      
      {/* 1. Ambient Outer Glowing Background Halo */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/30 via-teal-400/20 to-emerald-400/30 blur-3xl animate-pulse pointer-events-none" />

      {/* 2. Slow Ambient Rotating SVG HUD Outer Ring (Open & Transparent Center) */}
      <div className="absolute inset-4 sm:inset-6 rounded-full border border-emerald-400/40 animate-[spin_45s_linear_infinite] pointer-events-none">
        <svg className="w-full h-full text-emerald-400/50 stroke-current" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" fill="none" strokeWidth="0.8" strokeDasharray="4 4" />
          <circle cx="50" cy="50" r="42" fill="none" strokeWidth="0.4" strokeDasharray="1 5" />
        </svg>
      </div>

      {/* 3. Outer Interactive SVG Arc Segments (5 Glowing Neon Arcs) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="highContrastGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* 5 SVG Arc Segments */}
        {segments.map((seg, idx) => {
          const angle = (idx * 360) / 5 - 90;
          const isActive = activeSegmentIndex === idx;
          return (
            <g key={seg.id} className="transition-all duration-300">
              <circle
                cx="100"
                cy="100"
                r="88"
                fill="none"
                stroke={isActive ? "url(#highContrastGlow)" : "rgba(52, 211, 153, 0.25)"}
                strokeWidth={isActive ? "6" : "2.5"}
                strokeDasharray="92 20"
                transform={`rotate(${angle} 100 100)`}
                className="transition-all duration-300"
              />
            </g>
          );
        })}
      </svg>

      {/* 4. 100% Hollow & Transparent Center Target Reticle */}
      <div className="absolute inset-24 sm:inset-28 rounded-full border border-emerald-400/20 pointer-events-none flex items-center justify-center">
        <div className="w-full h-[1px] bg-emerald-400/20" />
        <div className="h-full w-[1px] bg-emerald-400/20 absolute" />
      </div>

      {/* 5. 5 ENLARGED PERFECT CIRCULAR NODES (w-20 h-20 sm:w-24 sm:h-24) */}
      {segments.map((seg, idx) => {
        const radius = 152; // Orbit radius matching circle circumference line
        const angleRad = ((idx * 360) / 5 - 90) * (Math.PI / 180);
        const x = Math.cos(angleRad) * radius;
        const y = Math.sin(angleRad) * radius;

        const isActive = activeSegmentIndex === idx;
        const Icon = seg.icon;

        return (
          <button
            key={seg.id}
            onClick={() => {
              setActiveSegmentIndex(idx);
              if (onSelectPathway) onSelectPathway(seg.id);
            }}
            onMouseEnter={() => {
              setActiveSegmentIndex(idx);
            }}
            style={{
              transform: `translate(${x}px, ${y}px)`,
            }}
            className={`absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center p-2 text-center transition-all duration-300 cursor-pointer z-30 shadow-2xl backdrop-blur-md border-2 border-emerald-400/60 ${
              isActive
                ? "bg-emerald-400 text-slate-950 border-white shadow-[0_0_40px_#34d399] scale-115 ring-4 ring-emerald-400/70"
                : "bg-emerald-950/95 text-white hover:bg-emerald-900 hover:border-emerald-300 hover:scale-105"
            }`}
            title={isAr ? seg.labelAr : seg.labelEn}
          >
            <Icon className={`w-7 h-7 sm:w-8 sm:h-8 mb-0.5 shrink-0 ${isActive ? "animate-bounce text-slate-950" : "text-emerald-300"}`} />
            <span className={`text-[10px] sm:text-xs font-black tracking-tight leading-tight max-w-[74px] text-center ${isActive ? "text-slate-950 font-extrabold" : "text-white font-bold"}`}>
              {isAr ? seg.labelAr : seg.labelEn}
            </span>
          </button>
        );
      })}
    </div>
  );
};

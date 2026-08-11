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
    <div className="relative w-full max-w-[440px] aspect-square mx-auto flex items-center justify-center select-none" dir={isAr ? "rtl" : "ltr"}>
      
      {/* 1. Ambient Outer Glowing Background Halo */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/25 via-teal-400/15 to-emerald-400/25 blur-3xl animate-pulse pointer-events-none" />

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
          <linearGradient id="neonEmeraldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
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
                stroke={isActive ? "url(#neonEmeraldGlow)" : "rgba(52, 211, 153, 0.25)"}
                strokeWidth={isActive ? "5" : "2"}
                strokeDasharray="92 20"
                transform={`rotate(${angle} 100 100)`}
                className="transition-all duration-300"
              />
            </g>
          );
        })}
      </svg>

      {/* 4. 100% Hollow & Transparent Center Target Reticle */}
      <div className="absolute inset-20 sm:inset-24 rounded-full border border-emerald-400/20 pointer-events-none flex items-center justify-center">
        <div className="w-full h-[1px] bg-emerald-400/20" />
        <div className="h-full w-[1px] bg-emerald-400/20 absolute" />
      </div>

      {/* 5. 5 Perfect Circular Nodes Directly Centered on Circle Circumference Path */}
      {segments.map((seg, idx) => {
        const radius = 138; // Radius matching circle stroke line exactly
        const angleRad = ((idx * 360) / 5 - 90) * (Math.PI / 180);
        const x = Math.cos(angleRad) * radius;
        const y = Math.sin(angleRad) * radius;

        const isActive = activeSegmentIndex === idx;
        const Icon = seg.icon;

        return (
          <div
            key={seg.id}
            style={{
              transform: `translate(${x}px, ${y}px)`,
            }}
            className="absolute flex flex-col items-center justify-center z-30 transition-all duration-300 pointer-events-auto"
          >
            {/* Perfect Circular Node Button */}
            <button
              onClick={() => {
                setActiveSegmentIndex(idx);
                if (onSelectPathway) onSelectPathway(seg.id);
              }}
              onMouseEnter={() => {
                setActiveSegmentIndex(idx);
              }}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl backdrop-blur-md border-2 ${
                isActive
                  ? "bg-emerald-400 text-slate-950 border-white shadow-[0_0_35px_#34d399] scale-115 ring-4 ring-emerald-400/60"
                  : "bg-emerald-950/90 text-emerald-300 hover:bg-emerald-900 hover:text-white border-emerald-400/50 hover:border-emerald-300 hover:scale-105"
              }`}
              title={isAr ? seg.labelAr : seg.labelEn}
            >
              <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${isActive ? "animate-bounce text-slate-950" : "text-emerald-300"}`} />
            </button>

            {/* Clear Unclipped Bold Label Pill Below Circle */}
            <div className={`mt-1.5 px-3 py-0.5 rounded-full backdrop-blur-md border transition-all duration-300 ${
              isActive
                ? "bg-emerald-400 text-slate-950 font-black border-white shadow-[0_0_15px_#34d399] scale-105"
                : "bg-emerald-950/90 text-white font-bold border-emerald-500/40"
            }`}>
              <span className="text-xs sm:text-sm font-black whitespace-nowrap tracking-tight">
                {isAr ? seg.labelAr : seg.labelEn}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

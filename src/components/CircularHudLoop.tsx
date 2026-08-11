import React, { useState } from "react";
import { RotateCcw, Wrench, HeartHandshake, Tag, Recycle, Sparkles, ShieldCheck } from "lucide-react";

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
      score: 95,
      icon: RotateCcw,
      descriptionAr: "إعادة الاستخدام تمنح المنتج حياة جديدة توفر 90% من انبعاثات التصنيع.",
      descriptionEn: "Reusing extends product lifecycle & saves 90% carbon emissions.",
      badge: "الخيار الأفضل 🌟",
    },
    {
      id: "repair",
      labelAr: "إصلاح",
      labelEn: "Repair",
      score: 88,
      icon: Wrench,
      descriptionAr: "معالجة الأعطال البسيطة واستبدال القطع تزيد من العمر التشغيلي للمنتج.",
      descriptionEn: "Fixing faults early restores functionality & prevents e-waste.",
      badge: "توفير تكلفة ⚡",
    },
    {
      id: "donation",
      labelAr: "تبرع",
      labelEn: "Donation",
      score: 82,
      icon: HeartHandshake,
      descriptionAr: "إهداء المنتجات الصالحة للجمعيات المعتمدة يبني مجتمعاً متكافلاً.",
      descriptionEn: "Donating goods supports charitable initiatives & beneficiaries.",
      badge: "أثر مجتمعي 🤝",
    },
    {
      id: "resell",
      labelAr: "إعادة بيع",
      labelEn: "Resell",
      score: 76,
      icon: Tag,
      descriptionAr: "تحويل الأغراض المستعملة إلى قيمة مالية واستدامة واعدة.",
      descriptionEn: "Secondhand trade unlocks residual value & reduces demand.",
      badge: "عائد مالي 💰",
    },
    {
      id: "recycle",
      labelAr: "تدوير",
      labelEn: "Recycling",
      score: 70,
      icon: Recycle,
      descriptionAr: "فصل واستعادة المواد الأولية لإعادتها إلى خطوط التصنيع.",
      descriptionEn: "Recovering raw materials for industrial circular manufacturing.",
      badge: "استعادة مواد 🏭",
    },
  ];

  const currentSegment = segments[activeSegmentIndex];
  const CurrentIcon = currentSegment.icon;

  return (
    <div className="relative w-full max-w-[440px] aspect-square mx-auto flex items-center justify-center select-none" dir={isAr ? "rtl" : "ltr"}>
      
      {/* 1. Ambient Outer Glowing Background Halo */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-400/10 to-cyan-500/20 blur-3xl animate-pulse pointer-events-none" />

      {/* 2. Slow Ambient Rotating SVG HUD Outer Ring */}
      <div className="absolute inset-2 sm:inset-4 rounded-full border border-emerald-500/30 animate-[spin_50s_linear_infinite] pointer-events-none">
        <svg className="w-full h-full text-emerald-400/40 stroke-current" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" fill="none" strokeWidth="0.5" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="44" fill="none" strokeWidth="0.3" strokeDasharray="1 4" />
        </svg>
      </div>

      {/* 3. Outer Interactive SVG Arc Segments (5 Circular Arcs) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
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
              {/* Arc Segment Indicator Line */}
              <circle
                cx="100"
                cy="100"
                r="86"
                fill="none"
                stroke={isActive ? "url(#neonGlow)" : "rgba(16, 185, 129, 0.2)"}
                strokeWidth={isActive ? "4" : "2"}
                strokeDasharray="95 18"
                transform={`rotate(${angle} 100 100)`}
                className="transition-all duration-300"
              />
            </g>
          );
        })}
      </svg>

      {/* 4. Center Core Container with Centered Upcycled Product Image & Dynamic AI Info */}
      <div className="relative w-[58%] aspect-square rounded-full bg-slate-950/80 backdrop-blur-md border-2 border-emerald-500/40 p-3 shadow-2xl flex flex-col items-center justify-center text-center space-y-1.5 z-10 transition-all duration-300 group">
        
        {/* Reticle AI Target Lines Overlay */}
        <div className="absolute inset-2 rounded-full border border-emerald-400/20 pointer-events-none flex items-center justify-center">
          <div className="w-full h-[1px] bg-emerald-400/20" />
          <div className="h-full w-[1px] bg-emerald-400/20 absolute" />
        </div>

        {/* Product Image Core */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-emerald-400/60 shadow-lg shrink-0">
          <img
            src="/assets/dawr_hero_composition.jpg"
            alt="DAWR Circular Core"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />
        </div>

        {/* Dynamic Center HUD Information */}
        <div className="space-y-0.5 z-20">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-900/90 text-emerald-300 text-[10px] font-black border border-emerald-500/50 shadow-2xs">
            <Sparkles className="w-3 h-3 text-emerald-300" />
            <span>Score: {currentSegment.score}/100</span>
          </div>

          <h3 className="text-xs sm:text-sm font-black text-white tracking-tight">
            {isAr ? currentSegment.labelAr : currentSegment.labelEn}
          </h3>

          <p className="text-[10px] text-emerald-200 font-bold max-w-[130px] line-clamp-2 leading-tight">
            {isAr ? currentSegment.descriptionAr : currentSegment.descriptionEn}
          </p>
        </div>
      </div>

      {/* 5. 5 Orbiting Interactive Node Buttons (الأيقونات والمُسارات الـ 5) */}
      {segments.map((seg, idx) => {
        const radius = 132; // Distance from center in px
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
            className={`absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer z-30 shadow-xl ${
              isActive
                ? "bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/50 scale-110 border-2 border-white shadow-[0_0_25px_#10b981]"
                : "bg-emerald-950/90 text-emerald-300 hover:bg-emerald-900 hover:text-white border border-emerald-500/50 hover:scale-105"
            }`}
            title={isAr ? seg.labelAr : seg.labelEn}
          >
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? "animate-bounce" : ""}`} />
            <span className={`text-[9px] font-black tracking-tighter truncate max-w-[45px] ${isActive ? "text-slate-950" : "text-emerald-200"}`}>
              {isAr ? seg.labelAr : seg.labelEn}
            </span>
          </button>
        );
      })}
    </div>
  );
};

import React, { useState } from "react";
import {
  Leaf,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Package,
  Layers,
  Repeat,
  Calculator,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
} from "lucide-react";
import { Language } from "../types";

interface CircularImpactDashboardProps {
  language: Language;
}

export const CircularImpactDashboard: React.FC<CircularImpactDashboardProps> = ({ language }) => {
  const isAr = language === "ar";
  const [isMethodologyExpanded, setIsMethodologyExpanded] = useState<boolean>(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const methodologySteps = [
    {
      id: "product",
      titleAr: "المنتج",
      titleEn: "Product",
      icon: Package,
      tooltipAr: "نوع المنتج وفئته",
      tooltipEn: "Product type and category",
    },
    {
      id: "state_material",
      titleAr: "الحالة والمادة",
      titleEn: "State & Material",
      icon: Layers,
      tooltipAr: "حالته وتركيبه الأساسي",
      tooltipEn: "State and core material",
    },
    {
      id: "circular_path",
      titleAr: "المسار الدائري",
      titleEn: "Circular Pathway",
      icon: Repeat,
      tooltipAr: "الخيار الدائري المنفذ",
      tooltipEn: "Selected circular option",
    },
    {
      id: "impact_factor",
      titleAr: "معامل الأثر",
      titleEn: "Impact Factor",
      icon: Calculator,
      tooltipAr: "عامل مرجعي للتقدير",
      tooltipEn: "Reference factor for estimation",
    },
    {
      id: "estimated_impact",
      titleAr: "الأثر التقديري",
      titleEn: "Estimated Impact",
      icon: Leaf,
      tooltipAr: "النتيجة البيئية المقدرة",
      tooltipEn: "Estimated environmental outcome",
      strong: true,
    },
  ];

  const ArrowHorizontal = isAr ? ArrowLeft : ArrowRight;
  const flowDirectionClass = isAr ? "md:flex-row-reverse" : "md:flex-row";

  const kpiItems = [
    {
      id: "value_retention",
      metric: "80%",
      unit: "",
      titleAr: "الحفاظ على القيمة",
      titleEn: "Value Retention",
      descAr: "منتجات بقيت في دورة الاستخدام",
      descEn: "Products kept in active circular loop",
      badgeAr: "تقديري",
      badgeEn: "Estimated",
      tooltipAr: "يقيس القرارات التي تحافظ على استخدام المنتج وقيمته.",
      tooltipEn: "Measures decisions preserving product utility & value.",
    },
    {
      id: "life_extension",
      metric: "12",
      unit: isAr ? "منتجًا" : "items",
      titleAr: "منتجًا مُدّد عمره",
      titleEn: "Extended Life Products",
      descAr: "عبر الاستخدام أو الإصلاح",
      descEn: "Via reuse or repair pathways",
      badgeAr: "حسب القرارات المنفذة",
      badgeEn: "Based on Executed Decisions",
      tooltipAr: "المنتجات التي استمر استخدامها عبر إعادة الاستخدام أو الإصلاح.",
      tooltipEn: "Products remaining in service via upcycling or repair.",
    },
    {
      id: "climate_impact",
      metric: "18.5",
      unit: "kg CO₂e",
      titleAr: "أثر مناخي متجنب",
      titleEn: "Avoided Carbon Impact",
      descAr: "انبعاثات متجنبة تقديريًا",
      descEn: "Estimated avoided greenhouse emissions",
      badgeAr: "تقديري",
      badgeEn: "Estimated",
      tooltipAr: "تقدير للأثر المناخي المتجنب نتيجة القرار الدائري.",
      tooltipEn: "Estimated carbon footprint avoided per circular choice.",
    },
  ];

  return (
    <section 
      id="impact-section" 
      className="w-full relative py-12 my-8 bg-[#04291e] text-white shadow-xl border-y border-emerald-800/40 rounded-none overflow-hidden px-4 sm:px-8 md:px-16"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* 2. HEADER */}
        <div className="flex flex-col items-center justify-center text-center space-y-2.5 border-b border-emerald-800/40 pb-6 max-w-2xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-300 bg-emerald-900/80 px-3.5 py-1 rounded-full border border-emerald-500/30">
              <Leaf className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{isAr ? "مؤشرات الأثر الدائري" : "Circular Impact Metrics"}</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-200/90 bg-emerald-950/90 px-2.5 py-0.5 rounded-md border border-emerald-700/50">
              {isAr ? "بيانات تجريبية" : "Demo Data"}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight pt-1">
            {isAr ? "أثرك الدائري مع دَوْر" : "Your Circular Impact with DAWR"}
          </h2>

          <p className="text-xs sm:text-sm font-extrabold text-emerald-200/90">
            {isAr ? "من القرار إلى أثر قابل للقياس" : "From decision to measurable circular impact"}
          </p>
        </div>

        {/* 3. KPI CARDS (3 KPIs in Desktop Single Row with Thin Dividers) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 py-2">
          {kpiItems.map((kpi, idx) => (
            <div
              key={kpi.id}
              onMouseEnter={() => setActiveTooltip(kpi.id)}
              onMouseLeave={() => setActiveTooltip(null)}
              className={`flex flex-col items-center text-center space-y-2.5 px-4 transition-all duration-200 hover:-translate-y-1 group relative cursor-default ${
                idx > 0 ? "md:border-r md:border-emerald-800/40" : ""
              }`}
            >
              {/* Badge */}
              <span className="text-[10px] font-black text-emerald-300 bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-600/40 shadow-2xs">
                {isAr ? kpi.badgeAr : kpi.badgeEn}
              </span>

              {/* Number Metric */}
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md group-hover:text-emerald-300 transition-colors">
                {kpi.metric} {kpi.unit && <span className="text-base sm:text-lg text-emerald-300 font-bold">{kpi.unit}</span>}
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                {isAr ? kpi.titleAr : kpi.titleEn}
              </h3>

              {/* Description */}
              <p className="text-xs text-emerald-200/80 font-bold max-w-xs">
                {isAr ? kpi.descAr : kpi.descEn}
              </p>

              {/* Micro-interaction Tooltip */}
              {activeTooltip === kpi.id && (
                <div className="absolute -top-10 bg-slate-900/95 text-emerald-200 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-emerald-500/40 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap pointer-events-none">
                  {isAr ? kpi.tooltipAr : kpi.tooltipEn}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 6. METHODOLOGY TOGGLE LINK */}
        <div className="text-center pt-2">
          <button
            onClick={() => setIsMethodologyExpanded(!isMethodologyExpanded)}
            aria-expanded={isMethodologyExpanded}
            aria-label={isAr ? "كيف نقيس الأثر؟" : "How do we measure impact?"}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-emerald-200 hover:text-emerald-300 transition-colors py-2 px-4 rounded-xl border border-emerald-700/50 hover:border-emerald-400/70 bg-emerald-900/40 cursor-pointer backdrop-blur-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{isAr ? "كيف نقيس الأثر؟" : "How do we measure impact?"}</span>
            {isMethodologyExpanded ? (
              <ChevronUp className="w-4 h-4 text-emerald-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-emerald-300" />
            )}
          </button>
        </div>

        {/* INLINE EXPANDABLE METHODOLOGY SECTION */}
        {isMethodologyExpanded && (
          <div className="bg-emerald-900/50 border border-emerald-700/60 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="space-y-3 border-b border-emerald-800/60 pb-4">
              <div className="flex flex-col items-center justify-center text-center gap-2 mx-auto max-w-2xl">
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight text-center w-full">
                  {isAr ? "منهجية قياس الأثر" : "Impact Measurement Methodology"}
                </h3>
                <p className="text-sm sm:text-base font-bold text-emerald-200/90 max-w-2xl leading-6 text-center">
                  {isAr
                    ? "تقدّر دَوْر الأثر وفق خصائص المنتج وحالته والمسار الدائري المختار."
                    : "DAWR estimates impact based on product properties, condition, and selected circular pathway."}
                </p>
              </div>
            </div>

            {/* Visual Impact Measurement Flow */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {methodologySteps.map((step, index) => {
                const StepIcon = step.icon;
                const isStrong = !!step.strong;
                return (
                  <React.Fragment key={step.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-describedby={`${step.id}-tooltip`}
                      onMouseEnter={() => setActiveTooltip(step.id)}
                      onMouseLeave={() => setActiveTooltip(null)}
                      onFocus={() => setActiveTooltip(step.id)}
                      onBlur={() => setActiveTooltip(null)}
                      className={`group relative flex min-h-[148px] min-w-[170px] flex-1 flex-col items-center justify-center gap-4 rounded-3xl border px-5 py-5 text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950 ${
                        isStrong
                          ? "border-emerald-200/30 bg-emerald-100 text-slate-950"
                          : "border-emerald-800/60 bg-emerald-950/80 text-emerald-100 hover:border-emerald-300"
                      } hover:-translate-y-[2px] hover:border-emerald-300`}
                    >
                      <div
                        className={`inline-flex h-14 w-14 items-center justify-center rounded-3xl border px-3 text-emerald-200 ${
                          isStrong ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-emerald-700 bg-emerald-950/90"
                        }`}
                      >
                        <StepIcon className="h-6 w-6" />
                      </div>
                      <span className={`text-sm sm:text-base font-black tracking-tight ${isStrong ? "text-emerald-950" : "text-white"}`}>
                        {isAr ? step.titleAr : step.titleEn}
                      </span>
                      <span className={`absolute -bottom-10 left-1/2 z-20 hidden w-max -translate-x-1/2 rounded-full border border-emerald-300/20 bg-slate-950/95 px-3 py-1.5 text-[11px] font-bold text-emerald-200 shadow-lg ${
                        activeTooltip === step.id ? "inline-flex" : "opacity-0"
                      }`} id={`${step.id}-tooltip`}>
                        {isAr ? step.tooltipAr : step.tooltipEn}
                      </span>
                    </div>

                    {index < methodologySteps.length - 1 && (
                      <div className="flex items-center justify-center lg:px-2">
                        <span className="hidden lg:inline-flex text-emerald-400">
                          <ArrowHorizontal className="h-6 w-6" />
                        </span>
                        <span className="inline-flex lg:hidden text-emerald-400">
                          <ArrowDown className="h-6 w-6" />
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* 7. REFERENCES */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-emerald-200">
                {isAr ? "أطر القياس المرجعية" : "Reference Frameworks"}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Reference 1: CTI */}
                <a
                  href="https://www.wbcsd.org/actions/circular-transition-indicators/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 hover:border-emerald-400 transition flex items-center justify-between text-right cursor-pointer group"
                >
                  <div>
                    <h5 className="text-xs font-black text-white group-hover:text-emerald-300">
                      Circular Transition Indicators (CTI)
                    </h5>
                    <span className="text-[11px] font-bold text-emerald-300">WBCSD</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </a>

                {/* Reference 2: MCI */}
                <a
                  href="https://www.ellenmacarthurfoundation.org/material-circularity-indicator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 hover:border-emerald-400 transition flex items-center justify-between text-right cursor-pointer group"
                >
                  <div>
                    <h5 className="text-xs font-black text-white group-hover:text-emerald-300">
                      Material Circularity Indicator (MCI)
                    </h5>
                    <span className="text-[11px] font-bold text-emerald-300">Ellen MacArthur Foundation</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </a>
              </div>

              <p className="text-[11px] text-emerald-200/80 font-bold leading-relaxed pt-2 text-center mx-auto max-w-2xl">
                {isAr
                  ? "تسترشد منهجية دَوْر بمبادئ وأطر دولية لقياس الدائرية، ولا تمثل المؤشرات المعروضة تقييم CTI أو MCI رسميًا."
                  : "DAWR's methodology is guided by international circularity frameworks and does not constitute an official CTI or MCI evaluation."}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

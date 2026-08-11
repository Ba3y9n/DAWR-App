import React, { useState } from "react";
import { ProductAnalysis, Pathway, Language } from "../types";
import { VERIFIED_CHARITIES } from "../data/presetSamples";
import { 
  ArrowRight, 
  Recycle, 
  HeartHandshake, 
  Sparkles, 
  MapPin, 
  MessageSquare, 
  CheckCircle2, 
  Cloud, 
  Award,
  ExternalLink,
  Lightbulb,
  ShieldCheck,
  Building2,
  Wrench,
  RotateCcw,
  AlertTriangle,
  Leaf,
  Coins,
  Bot
} from "lucide-react";

interface CircularAnalysisScreenProps {
  analysis: ProductAnalysis;
  onBackToCamera: () => void;
  onOpenCreativeIdeas: () => void;
  onOpenMapModal: () => void;
  onOpenAiChat: () => void;
  onClaimPoints: (points: number, pathwayTitle: string) => void;
  language: Language;
}

export const CircularAnalysisScreen: React.FC<CircularAnalysisScreenProps> = ({
  analysis,
  onBackToCamera,
  onOpenCreativeIdeas,
  onOpenMapModal,
  onOpenAiChat,
  onClaimPoints,
  language,
}) => {
  const isAr = language === "ar";
  const [selectedPathway, setSelectedPathway] = useState<number>(1);
  const [claimed, setClaimed] = useState<boolean>(false);

  // Calculate circular SVG progress ring attributes
  const score = Math.min(100, Math.max(0, analysis.circularScore || 85));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine low vs high score dynamic theme
  const isLowScore = score < 50;
  const gaugeGradientStart = isLowScore ? "#f59e0b" : "#059669";
  const gaugeGradientEnd = isLowScore ? "#ea580c" : "#10b981";

  // Calculate condition & donation eligibility
  const conditionText = (analysis.condition || "").toLowerCase();
  const isDamagedOrDirty = 
    conditionText.includes("تالف") || 
    conditionText.includes("مكسور") || 
    conditionText.includes("محروق") || 
    conditionText.includes("ملطخ") || 
    conditionText.includes("متضرر") || 
    conditionText.includes("غير صالح") || 
    conditionText.includes("خراب") || 
    conditionText.includes("ممزق") || 
    (analysis.scores?.donation !== undefined && analysis.scores.donation < 30);

  const isDonationEligible = !isDamagedOrDirty && (analysis.scores?.donation ?? 50) >= 30 && analysis.recommended_action !== "disposal";

  const pathwaysList = Array.isArray(analysis.pathways) && analysis.pathways.length > 0 
    ? analysis.pathways 
    : (Array.isArray((analysis as any).recommended_pathways) && (analysis as any).recommended_pathways.length > 0 
        ? (analysis as any).recommended_pathways 
        : []);

  const handleClaim = () => {
    const pathway = pathwaysList.find((p: any) => p.rank === selectedPathway) || pathwaysList[0];
    const pointsNum = pathway ? (parseInt((pathway.points || "").replace(/\D/g, "")) || 50) : 50;
    setClaimed(true);
    onClaimPoints(pointsNum, pathway ? pathway.title : "مسار استدامي");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32 bg-slate-50/60 font-sans text-slate-900" dir={isAr ? "rtl" : "ltr"}>
      
      {/* Top Header Back Navigation & Result Title */}
      <div className="flex items-center justify-between border-b border-slate-200/90 pb-4">
        <button
          onClick={onBackToCamera}
          className="flex items-center gap-2 text-slate-800 hover:text-emerald-950 bg-white border border-slate-200 px-4 py-2 rounded-2xl text-xs font-black transition hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
        >
          <ArrowRight className={`w-4 h-4 text-emerald-700 ${isAr ? "rotate-0" : "rotate-180"}`} />
          <span>{isAr ? "الرجوع للفحص" : "Back to Scan"}</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-base font-extrabold text-emerald-950">{isAr ? "نتيجة الفحص الذكي" : "Smart Inspection Result"}</span>
          <span className="text-xs font-black text-emerald-900 bg-emerald-50 border border-emerald-300 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>
              {analysis.isRealGeminiAnalysis !== false
                ? (isAr ? "لوحة تحكم الذكاء الاصطناعي" : "Gemini AI Dashboard")
                : (isAr ? "لوحة تحكم القرار الدائري" : "Circular Dashboard")}
            </span>
          </span>
        </div>
      </div>

      {/* 4-Step Timeline Stepper Indicator */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3 max-w-3xl mx-auto text-xs font-black">
          <div className="flex items-center gap-2 text-emerald-900">
            <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-black">1</span>
            <span>{isAr ? "المنتج" : "Item"}</span>
          </div>
          <div className="flex-1 h-1 bg-emerald-400 rounded-full" />
          <div className="flex items-center gap-2 text-emerald-900">
            <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-black">2</span>
            <span>{isAr ? "التحليل" : "Analysis"}</span>
          </div>
          <div className="flex-1 h-1 bg-emerald-400 rounded-full" />
          <div className="flex items-center gap-2 text-emerald-900">
            <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-black">3</span>
            <span>{isAr ? "المسار المقترح" : "Pathway"}</span>
          </div>
          <div className="flex-1 h-1 bg-emerald-400 rounded-full" />
          <div className="flex items-center gap-2 text-emerald-900">
            <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-black">4</span>
            <span>{isAr ? "الإجراء المستدام" : "Action"}</span>
          </div>
        </div>
      </div>

      {/* 1️⃣ PRODUCT SUMMARY CARD & CORRECT IMPACT METRICS */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Product Details Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-4 border-b border-slate-100">
          {analysis.imagePreview ? (
            <img
              src={analysis.imagePreview}
              alt={analysis.productName || analysis.product}
              className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
              <Recycle className="w-10 h-10 text-emerald-700" />
            </div>
          )}

          <div className="space-y-2 flex-1 w-full">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 tracking-tight">
                {analysis.productName || analysis.product}
              </h2>
              {/* Smart Product Condition Badge */}
              <span className="text-xs font-black text-emerald-900 bg-emerald-100/90 border border-emerald-300 px-4 py-1.5 rounded-full shadow-2xs">
                {analysis.condition || (isAr ? "نفايات إلكترونية قابلة للتدوير" : "Recyclable E-Waste")}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs pt-1">
              <span className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 font-bold">
                {isAr ? "الخامة / المكونات: " : "Material: "}
                <strong className="text-emerald-950 font-black">{analysis.material || (isAr ? "بلاستيك ومكونات دقيقة" : "Plastic & Micro-components")}</strong>
              </span>
              <span className="bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold">
                {isAr ? "الحالة التشغيلية: " : "Operational Status: "}
                <strong className="text-emerald-950 font-black">{analysis.condition || (isAr ? "مستعمل بحالة جيدة" : "Good Condition")}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 3 Exact & Elegant Environmental Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Metric 1: CO2 Avoided */}
          <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? "تقليل الانبعاثات الكربونية" : "CO2 Emissions Saved"}</span>
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-950 block pt-0.5">
                {analysis.quickStats?.savedCo2 || "2.5"} <span className="text-xs font-bold text-emerald-800">{isAr ? "كجم CO2e" : "kg CO2e"}</span>
              </span>
            </div>
          </div>

          {/* Metric 2: Recyclable Component % */}
          <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Recycle className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{isAr ? "المكونات القابلة للتدوير" : "Recyclable Content"}</span>
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-950 block pt-0.5">
                {analysis.scores?.recycling || "85"}%
              </span>
            </div>
          </div>

          {/* Metric 3: Residual Value */}
          <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{isAr ? "القيمة المتبقية للمنتج" : "Product Residual Value"}</span>
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-950 block pt-0.5">
                {analysis.scores?.reuse ? `${analysis.scores.reuse * 2.5} ر.س` : "120 ر.س"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2️⃣ CIRCULAR SCORE GAUGE (GLASSMORPHISM & DYNAMIC COLOR THEME) */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
        <div className="text-sm font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
          <Recycle className="w-5 h-5 text-emerald-700" />
          <span>{isAr ? "مؤشر القرار الدائري الاستدامي" : "Circular Decision Score Gauge"}</span>
        </div>

        {/* Circular Ring Gauge */}
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center my-2">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              className="text-slate-100"
              fill="transparent"
            />
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="url(#dynamicGradient)"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              fill="transparent"
            />
            <defs>
              <linearGradient id="dynamicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gaugeGradientStart} />
                <stop offset="100%" stopColor={gaugeGradientEnd} />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {score}<span className="text-base font-bold text-slate-500">/100</span>
            </span>
            <span className="text-xs text-emerald-900 font-extrabold pt-1">
              Circular Score
            </span>
          </div>
        </div>

        {/* Dynamic Badge & Warning Notice based on score */}
        <div className="space-y-2 max-w-md mx-auto">
          {isLowScore ? (
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2 rounded-2xl text-xs font-black shadow-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{isAr ? "تحذير: يحتاج معالجة إلكترونية خاصة" : "Warning: Requires Special Processing"}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2 rounded-2xl text-xs font-black shadow-xs">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isAr ? "ممتاز: قابل لإعادة الاستخدام المباشر" : "Excellent: Eligible for Direct Reuse"}</span>
            </div>
          )}
          
          <p className="text-xs text-slate-600 font-bold leading-relaxed pt-1">
            {analysis.environmentalImpact || (isAr ? "يوفر هذا المنتج إمكانيات عالية لتدوير المواد والحفاظ على القيمة المستدامة." : "High circular potential for material preservation.")}
          </p>
        </div>
      </div>

      {/* 3️⃣ INTERACTIVE ANIMATED PROGRESS BARS BREAKDOWN */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>{isAr ? "تقييم إمكانيات الاقتصاد الدائري:" : "Circular Economy Potential Breakdown:"}</span>
          </h3>
          <span className="text-xs font-black text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {isAr ? "مسارات تفاعلية" : "Interactive Progress"}
          </span>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="space-y-4 text-xs">
          {/* Reuse */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-bold text-slate-900">
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-700" />
                <span>{isAr ? "إعادة الاستخدام (Reuse)" : "Reuse Pathway"}</span>
              </span>
              <span className="text-emerald-950 font-black text-sm">{analysis.scores?.reuse ?? 90}%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-1000 shadow-xs" style={{ width: `${analysis.scores?.reuse ?? 90}%` }}></div>
            </div>
          </div>

          {/* Repair */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-bold text-slate-900">
              <span className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-700" />
                <span>{isAr ? "الإصلاح والصيانة (Repair)" : "Repair & Upcycling"}</span>
              </span>
              <span className="text-cyan-950 font-black text-sm">{analysis.scores?.repair ?? 70}%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
              <div className="bg-gradient-to-r from-cyan-600 to-teal-400 h-full rounded-full transition-all duration-1000 shadow-xs" style={{ width: `${analysis.scores?.repair ?? 70}%` }}></div>
            </div>
          </div>

          {/* Donation */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-bold text-slate-900">
              <span className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-teal-700" />
                <span>{isAr ? "التبرع والإهداء (Donation)" : "Donation Potential"}</span>
              </span>
              <span className="text-teal-950 font-black text-sm">{analysis.scores?.donation ?? 95}%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-xs" style={{ width: `${analysis.scores?.donation ?? 95}%` }}></div>
            </div>
          </div>

          {/* Recycling */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-bold text-slate-900">
              <span className="flex items-center gap-2">
                <Recycle className="w-4 h-4 text-emerald-700" />
                <span>{isAr ? "إعادة التدوير (Recycling)" : "Industrial Recycling"}</span>
              </span>
              <span className="text-emerald-950 font-black text-sm">{analysis.scores?.recycling ?? 80}%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
              <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 h-full rounded-full transition-all duration-1000 shadow-xs" style={{ width: `${analysis.scores?.recycling ?? 80}%` }}></div>
            </div>
          </div>

          {/* Disposal Note */}
          <div className="pt-2 text-xs text-slate-700 flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 font-bold">
            <span className="flex items-center gap-2 text-rose-700 font-black">
              <AlertTriangle className="w-4 h-4" />
              <span>{isAr ? "التخلص والردم (Disposal)" : "Landfill Disposal"}</span>
            </span>
            <span className="text-slate-600 font-extrabold">{isAr ? "الملاذ الأخير المطلق" : "Absolute Last Resort"}</span>
          </div>
        </div>
      </div>

      {/* 4️⃣ RECOMMENDED PATHWAYS CARDS & WIDE ACTION BUTTONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-700" />
            <span>{isAr ? "المسارات المقترحة للقرار الدائري:" : "Recommended Circular Pathways:"}</span>
          </h3>
          <span className="text-xs text-slate-600 font-extrabold">
            {isAr ? "مرتبة حسَب الفائدة" : "Priority Ranked"}
          </span>
        </div>

        <div className="space-y-4">
          {pathwaysList.map((pathway: any, idx: number) => {
            const rank = pathway.rank || (idx + 1);
            const isSelected = selectedPathway === rank;

            return (
              <div
                key={pathway.rank}
                onClick={() => setSelectedPathway(pathway.rank)}
                className={`rounded-3xl border-2 p-5 transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? "bg-emerald-50/60 border-emerald-600 shadow-md scale-[1.01]"
                    : "bg-white border-slate-200 hover:border-emerald-400"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-emerald-900 text-white shadow-xs">
                      {pathway.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {isAr ? "الملائمة: " : "Fit: "}<strong className="text-emerald-950">{pathway.suitability}</strong>
                    </span>
                  </div>

                  {/* Prominent DAWR Points Badge */}
                  <span className="text-xs sm:text-sm font-black text-emerald-950 bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 rounded-xl shadow-xs">
                    +{pathway.points || "850"} {isAr ? "نقطة دَوْر" : "DAWR Points"}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5">
                  <h4 className="text-lg font-extrabold text-emerald-950 flex items-center gap-2">
                    {pathway.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-bold">
                    {pathway.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-black">
                  <span className="text-slate-500">
                    {isSelected ? (isAr ? "مسارك المفضل الحالي" : "Selected Route") : (isAr ? "انقر لاختيار المسار" : "Click to Select")}
                  </span>
                  <div className="flex items-center gap-1.5 text-emerald-900">
                    {isSelected && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-700" />}
                    <span>{isSelected ? (isAr ? "محدد" : "Selected") : (isAr ? "تحديد" : "Choose")}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Donation Rules - Hide charities if damaged/broken/dirty */}
      {isDonationEligible ? (
        <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
                  <span>{isAr ? "الجمعيات والمنصات الرسمية المعتمدة" : "Verified Official Donation Platforms"}</span>
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </h3>
                <p className="text-xs text-slate-600 font-bold">
                  {isAr ? "تبرع مباشرة عبر القنوات الوطنية المرخصة" : "Directly donate through licensed national channels"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {VERIFIED_CHARITIES.map((charity) => (
              <div
                key={charity.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-emerald-950">
                        {isAr ? charity.name : charity.nameEn}
                      </h4>
                      <span className="p-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 inline-block">
                      {isAr ? charity.category : charity.categoryEn}
                    </span>
                  </div>

                  {/* Direct External Link Button */}
                  <a
                    href={charity.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-xs shrink-0"
                    title={isAr ? `انتقل لموقع ${charity.name}` : `Visit ${charity.nameEn}`}
                  >
                    <span>{isAr ? "زيارة المنصة" : "Visit Site"}</span>
                    <ExternalLink className="w-4 h-4 text-white" />
                  </a>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-bold">
                  {isAr ? charity.description : charity.descriptionEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs sm:text-sm">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
            <span>{isAr ? "قسم التبرع غير متاح لهذا المنتج" : "Donation Not Eligible"}</span>
          </div>
          <p className="text-xs text-amber-900 font-bold leading-relaxed">
            {isAr
              ? `بناءً على التقييم البصري وتصنيف الحالة (${analysis.condition})، هذا المنتج غير صالح للتبرع المباشر للجمعيات الخيريّة لضمان السلامة والجودة. تم توجيه المنتج تلقائياً نحو مراكز الفرز، الإصلاح، أو التدوير الصناعي.`
              : `Based on the visual condition (${analysis.condition}), this product is not eligible for direct donation. It has been routed to recycling, sorting, or repair.`}
          </p>
        </div>
      )}

      {/* WIDE ACTION BUTTONS ROW */}
      <div className="space-y-3 pt-2">
        {/* Button 1: AI Upcycling */}
        <button
          onClick={onOpenCreativeIdeas}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 hover:from-emerald-900 hover:to-teal-900 text-white font-extrabold text-sm sm:text-base shadow-md flex items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer border border-emerald-500/30"
        >
          <Lightbulb className="w-5 h-5 text-emerald-300 shrink-0" />
          <span>{isAr ? "💡 بدائل إبداعية لاستخدامه بالذكاء الاصطناعي (AI Upcycling)" : "💡 Creative Upcycling Ideas (AI)"}</span>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Button 2: Ask Gemini AI */}
          <button
            onClick={onOpenAiChat}
            className="py-3.5 px-5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-300 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-xs"
          >
            <Bot className="w-4.5 h-4.5 text-teal-700 shrink-0" />
            <span>{isAr ? "🤖 استشر Gemini" : "🤖 Ask Gemini AI"}</span>
          </button>

          {/* Map Hubs Button */}
          <button
            onClick={onOpenMapModal}
            className="py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-xs"
          >
            <MapPin className="w-4.5 h-4.5 text-emerald-700 shrink-0" />
            <span>{isAr ? "خريطة نقاط الفرز" : "Recycling Hubs"}</span>
          </button>
        </div>
      </div>

      {/* Button 3: Start Next Step & Claim Points */}
      <div className="pt-2">
        <button
          onClick={handleClaim}
          disabled={claimed}
          className={`w-full py-4.5 px-6 rounded-2xl font-black text-sm sm:text-base shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer border ${
            claimed
              ? "bg-emerald-950 text-white border-emerald-700"
              : "bg-emerald-900 hover:bg-emerald-950 text-white hover:scale-[1.01] active:scale-[0.98] border-emerald-600 shadow-emerald-950/30"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span>
            {claimed
              ? (isAr ? "تم تنفيذ الخطوة وإضافة النقاط بنجاح!" : "Step Completed & Points Added!")
              : (isAr ? "🚀 ابدأ الخطوة التالية واكسب النقاط" : "🚀 Start Next Step & Claim Points")}
          </span>
        </button>
      </div>
    </div>
  );
};


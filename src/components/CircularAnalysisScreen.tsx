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
  Droplet, 
  Cloud, 
  Trash2, 
  Award,
  ExternalLink,
  Lightbulb,
  ShieldCheck,
  Building2,
  Share2,
  Wrench,
  RotateCcw,
  AlertTriangle
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
  const score = Math.min(100, Math.max(0, analysis.circularScore || 90));
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-28 bg-white">
      {/* Top Header Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToCamera}
          className="flex items-center gap-1.5 text-slate-800 hover:text-cyan-900 bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
        >
          <ArrowRight className="w-4 h-4 text-cyan-600" />
          <span>{isAr ? "الرجوع للكاميرا" : "Back to Camera"}</span>
        </button>

        <span className="text-xs font-bold text-cyan-900 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
          <span>
            {analysis.isRealGeminiAnalysis !== false
              ? (isAr ? "تحليل Gemini المباشر" : "Gemini AI Analysis")
              : (isAr ? "تحليل القرار الدائري" : "Circular Analysis")}
          </span>
        </span>
      </div>

      {/* Product Summary Card */}
      <div className="bg-white border border-cyan-100 rounded-3xl p-4 shadow-sm space-y-3 relative overflow-hidden">
        <div className="flex items-start gap-3">
          {analysis.imagePreview ? (
            <img
              src={analysis.imagePreview}
              alt={analysis.productName || analysis.product}
              className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center shrink-0">
              <Recycle className="w-8 h-8 text-cyan-600" />
            </div>
          )}

          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 leading-snug">
              {analysis.productName || analysis.product}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-cyan-50/60 text-slate-800 px-2.5 py-0.5 rounded-md border border-cyan-100 font-medium">
                {isAr ? "الحالة: " : "Condition: "}
                <strong className="text-cyan-900">{analysis.condition}</strong>
              </span>
              <span className="bg-teal-50/60 text-slate-800 px-2.5 py-0.5 rounded-md border border-teal-100 font-medium">
                {isAr ? "الخامة: " : "Material: "}
                <strong className="text-teal-900">{analysis.material}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Environmental Impact Quick Bar */}
        <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-2.5 flex items-center justify-around text-center text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-600 flex items-center justify-center gap-1 font-bold">
              <Cloud className="w-3 h-3 text-cyan-600" />
              {isAr ? "وفر الانبعاثات" : "CO₂ Saved"}
            </span>
            <span className="font-black text-cyan-900">{analysis.quickStats?.savedCo2 || "2.5 kg"}</span>
          </div>
          <div className="h-6 w-[1px] bg-cyan-200"></div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-600 flex items-center justify-center gap-1 font-bold">
              <Droplet className="w-3 h-3 text-sky-600" />
              {isAr ? "وفر المياه" : "Water Saved"}
            </span>
            <span className="font-black text-sky-900">{analysis.quickStats?.savedWater || "600 L"}</span>
          </div>
          <div className="h-6 w-[1px] bg-cyan-200"></div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-600 flex items-center justify-center gap-1 font-bold">
              <Trash2 className="w-3 h-3 text-teal-600" />
              {isAr ? "منع الردم" : "Diverted"}
            </span>
            <span className="font-black text-teal-900">{analysis.quickStats?.landfillDiverted || "0.5 kg"}</span>
          </div>
        </div>
      </div>

      {/* Circular Score Gauge Visual */}
      <div className="bg-white border border-cyan-200 rounded-3xl p-5 shadow-sm relative flex flex-col items-center justify-center text-center space-y-3">
        <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Recycle className="w-4 h-4 text-cyan-600" />
          <span>{isAr ? "مؤشر القرار الدائري الاستدامي" : "Circular Score Index"}</span>
        </div>

        {/* Circular Ring Gauge */}
        <div className="relative w-36 h-36 flex items-center justify-center my-1">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              className="text-gray-100"
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="url(#circularGradient)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              fill="transparent"
            />
            <defs>
              <linearGradient id="circularGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f766e" />
                <stop offset="50%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {score}<span className="text-sm font-bold text-cyan-600">/100</span>
            </span>
            <span className="text-[11px] text-cyan-800 font-extrabold flex items-center gap-0.5">
              <span>Circular Score</span>
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-black text-cyan-950 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-full inline-block">
            {analysis.scoreLabel}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto font-medium">
            {analysis.environmentalImpact}
          </p>
        </div>
      </div>

      {/* Structured Circular Breakdown Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>{isAr ? "تقييم إمكانيات الاقتصاد الدائري للمنتج:" : "Circular Pathways Score Breakdown:"}</span>
          </h3>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
            {isAr ? "أفضل مسار مقترح" : "Best Recommended"}
          </span>
        </div>

        {/* Breakdown Progress Bars Grid */}
        <div className="space-y-2.5 text-xs">
          {/* Reuse */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                {isAr ? "إعادة الاستخدام (Reuse)" : "Reuse Option"}
              </span>
              <span className="text-emerald-800 font-extrabold">{analysis.scores?.reuse ?? 90}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
              <div className="bg-emerald-700 h-full rounded-full transition-all duration-700" style={{ width: `${analysis.scores?.reuse ?? 90}%` }}></div>
            </div>
          </div>

          {/* Repair */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-cyan-600" />
                {isAr ? "الإصلاح والصيانة (Repair)" : "Repair & Upcycling"}
              </span>
              <span className="text-cyan-700 font-extrabold">{analysis.scores?.repair ?? 70}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
              <div className="bg-cyan-600 h-full rounded-full transition-all duration-700" style={{ width: `${analysis.scores?.repair ?? 70}%` }}></div>
            </div>
          </div>

          {/* Donation */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-teal-700" />
                {isAr ? "التبرع والإهداء (Donation)" : "Donation Potential"}
              </span>
              <span className="text-teal-800 font-extrabold">{analysis.scores?.donation ?? 95}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
              <div className="bg-teal-700 h-full rounded-full transition-all duration-700" style={{ width: `${analysis.scores?.donation ?? 95}%` }}></div>
            </div>
          </div>

          {/* Recycling */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Recycle className="w-3.5 h-3.5 text-emerald-700" />
                {isAr ? "إعادة التدوير (Recycling)" : "Industrial Recycling"}
              </span>
              <span className="text-emerald-700 font-extrabold">{analysis.scores?.recycling ?? 80}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
              <div className="bg-emerald-600 h-full rounded-full transition-all duration-700" style={{ width: `${analysis.scores?.recycling ?? 80}%` }}></div>
            </div>
          </div>

          {/* Disposal Note */}
          <div className="pt-1 text-[11px] text-slate-600 flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-200">
            <span className="flex items-center gap-1 text-rose-700 font-bold">
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isAr ? "التخلص والردم (Disposal)" : "Landfill Disposal"}</span>
            </span>
            <span className="text-slate-500 font-bold">{isAr ? "الملاذ الأخير المطلق" : "Absolute Last Resort"}</span>
          </div>
        </div>
      </div>

      {/* Ranked Pathways Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>{isAr ? "ترتيب المسارات المقترحة:" : "Ranked Sustainable Pathways:"}</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-bold">
            {isAr ? "مرتبة حسَب الفائدة" : "Priority Ranked"}
          </span>
        </div>

        <div className="space-y-3">
          {pathwaysList.map((pathway: any, idx: number) => {
            const rank = pathway.rank || (idx + 1);
            const isSelected = selectedPathway === rank;

            return (
              <div
                key={pathway.rank}
                onClick={() => setSelectedPathway(pathway.rank)}
                className={`rounded-2xl border p-4 transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? "bg-emerald-50 border-emerald-600 shadow-md"
                    : "bg-white border-gray-200 hover:border-emerald-500/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-800 text-white">
                      {pathway.badge}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {isAr ? "الملائمة: " : "Fit: "}{pathway.suitability}
                    </span>
                  </div>

                  <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                    {pathway.points}
                  </span>
                </div>

                <div className="mt-2.5 space-y-1">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    {pathway.title}
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {pathway.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-200 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500">
                    {isSelected ? (isAr ? "مسارك المفضل الحالي" : "Selected Route") : (isAr ? "انقر لاختيار المسار" : "Click to Select")}
                  </span>
                  <div className="flex items-center gap-1 text-emerald-800">
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
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
        <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-3xl p-4 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <span>{isAr ? "الجمعيات والمنصات الرسمية المعتمدة" : "Verified Official Donation Platforms"}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                </h3>
                <p className="text-[11px] text-slate-600 font-medium">
                  {isAr ? "تبرع مباشرة عبر القنوات الوطنية المرخصة" : "Directly donate through licensed national channels"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {VERIFIED_CHARITIES.map((charity) => (
              <div
                key={charity.id}
                className="bg-white border border-gray-200 rounded-2xl p-3.5 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-slate-900">
                        {isAr ? charity.name : charity.nameEn}
                      </h4>
                      <span className="p-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                        <ShieldCheck className="w-3 h-3" />
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                      {isAr ? charity.category : charity.categoryEn}
                    </span>
                  </div>

                  {/* Direct External Link Button */}
                  <a
                    href={charity.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95 shadow-xs shrink-0"
                    title={isAr ? `انتقل لموقع ${charity.name}` : `Visit ${charity.nameEn}`}
                  >
                    <span>{isAr ? "زيارة المنصة" : "Visit Site"}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </a>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {isAr ? charity.description : charity.descriptionEn}
                </p>

                {/* Accepted items tags */}
                <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-gray-100">
                  <span className="text-[10px] text-slate-500 font-bold pl-1">
                    {isAr ? "تستقبل:" : "Accepts:"}
                  </span>
                  {charity.acceptedItems.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold bg-gray-100 text-slate-700 px-2 py-0.5 rounded-md"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{isAr ? "قسم التبرع غير متاح لهذا المنتج" : "Donation Not Eligible"}</span>
          </div>
          <p className="text-xs text-amber-900 font-medium leading-relaxed">
            {isAr
              ? `بناءً على التقييم البصري وتصنيف الحالة (${analysis.condition})، هذا المنتج غير صالح للتبرع المباشر للجمعيات الخيريّة لضمان السلامة والجودة. تم توجيه المنتج تلقائياً نحو مراكز الفرز، الإصلاح، أو التدوير الصناعي.`
              : `Based on the visual condition (${analysis.condition}), this product is not eligible for direct donation. It has been routed to recycling, sorting, or repair.`}
          </p>
        </div>
      )}

      {/* Auxiliary Actions */}
      <div className="space-y-2.5 pt-1">
        <button
          onClick={onOpenCreativeIdeas}
          className="w-full py-3.5 px-5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
        >
          <Lightbulb className="w-4 h-4 text-emerald-300" />
          <span>{isAr ? "بدائل إبداعية لاستخدامه بالذكاء الاصطناعي (AI Upcycling)" : "Creative Upcycling Ideas (AI)"}</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenMapModal}
            className="py-2.5 px-3 rounded-xl bg-white border border-gray-200 hover:border-emerald-600 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>{isAr ? "خريطة نقاط الفرز" : "Recycling Hubs"}</span>
          </button>

          <button
            onClick={onOpenAiChat}
            className="py-2.5 px-3 rounded-xl bg-white border border-gray-200 hover:border-teal-600 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <MessageSquare className="w-4 h-4 text-teal-700" />
            <span>{isAr ? "استشر Gemini" : "Ask Gemini AI"}</span>
          </button>
        </div>
      </div>

      {/* Claim Points Button */}
      <div className="pt-2">
        <button
          onClick={handleClaim}
          disabled={claimed}
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            claimed
              ? "bg-emerald-900 text-white border border-emerald-700"
              : "bg-emerald-800 hover:bg-emerald-900 text-white active:scale-95 shadow-emerald-950/30"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>
            {claimed
              ? (isAr ? "تم اعتماد المسار وإضافة النقاط بنجاح!" : "Pathway Adopted & Points Added!")
              : (isAr ? "اعتمد هذا المسار واكسب النقاط" : "Adopt Route & Claim Points")}
          </span>
        </button>
      </div>
    </div>
  );
};

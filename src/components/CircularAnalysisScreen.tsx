import React, { useState } from "react";
import { ProductAnalysis, Pathway, Language } from "../types";
import { VERIFIED_CHARITIES, NEARBY_HUBS } from "../data/presetSamples";
import { 
  ArrowRight, 
  Recycle, 
  HeartHandshake, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  Award,
  Lightbulb,
  Wrench,
  RotateCcw,
  Coins,
  Bot,
  Compass,
  Check,
  Navigation,
  Layers
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
  const [userPoints, setUserPoints] = useState<number>(1250);

  // Dynamic filter for recycling hubs based on detected product name and material
  const getRelevantHubs = () => {
    const pName = (analysis.productName || analysis.product || "").toLowerCase();
    const mat = (analysis.material || "").toLowerCase();
    const query = `${pName} ${mat}`;

    if (query.includes("ملابس") || query.includes("ثوب") || query.includes("منسوج") || query.includes("قطن") || query.includes("قميص") || query.includes("نسيج")) {
      return {
        label: isAr ? "ملابس قطنية ومنسوجات" : "Cotton Clothing & Textiles",
        hubs: NEARBY_HUBS.filter(h => h.accepted.some(a => a.includes("ملابس") || a.includes("أنسجة") || a.includes("حقائب")))
      };
    }
    if (query.includes("بلاستيك") || query.includes("عبوة") || query.includes("زجاجة") || query.includes("قارورة") || query.includes("pet") || query.includes("مياه")) {
      return {
        label: isAr ? "عبوات بلاستيكية PET" : "PET Plastic Bottles",
        hubs: NEARBY_HUBS.filter(h => h.accepted.some(a => a.includes("بلاستيك") || a.includes("علب") || a.includes("PET")))
      };
    }
    if (query.includes("إلكتروني") || query.includes("جهاز") || query.includes("سماعة") || query.includes("هاتف") || query.includes("بطارية") || query.includes("شاحن")) {
      return {
        label: isAr ? "أجهزة وإلكترونيات مستدامة" : "E-Waste & Electronics",
        hubs: NEARBY_HUBS.filter(h => h.accepted.some(a => a.includes("هواتف") || a.includes("أجهزة") || a.includes("بطاريات") || a.includes("شواحن")))
      };
    }
    if (query.includes("كرتون") || query.includes("ورق") || query.includes("صندوق") || query.includes("مغلف")) {
      return {
        label: isAr ? "ورق وكرتون مقوى" : "Cardboard & Paper",
        hubs: NEARBY_HUBS.filter(h => h.accepted.some(a => a.includes("ورق") || a.includes("كرتون")))
      };
    }
    return {
      label: analysis.productName || (isAr ? "المنتج المفحوص" : "Inspected Product"),
      hubs: NEARBY_HUBS.slice(0, 3)
    };
  };

  const relevantHubsInfo = getRelevantHubs();

  // Circular Score attributes
  const score = Math.min(100, Math.max(0, analysis.circularScore || 88));

  const pathwaysList = Array.isArray(analysis.pathways) && analysis.pathways.length > 0 
    ? analysis.pathways 
    : (Array.isArray((analysis as any).recommended_pathways) && (analysis as any).recommended_pathways.length > 0 
        ? (analysis as any).recommended_pathways 
        : []);

  const topPathway = pathwaysList.find((p: any) => p.rank === selectedPathway) || pathwaysList[0] || {
    title: isAr ? "إعادة الاستخدام" : "Reuse",
    points: "+50",
    badge: isAr ? "الخيار الأفضل" : "Top Choice",
    description: isAr ? "المنتج ما زال قابلًا للاستخدام، يُنصح بإعادة استخدامه أو توجيهه إلى جهة تستفيد منه بدلاً من التخلص منه." : "Item is in good condition, reuse recommended."
  };

  const handleClaim = () => {
    if (claimed) return;
    const pointsNum = topPathway ? (parseInt((topPathway.points || "").replace(/\D/g, "")) || 25) : 25;
    setClaimed(true);
    setUserPoints(prev => prev + pointsNum);
    onClaimPoints(pointsNum, topPathway ? topPathway.title : "مسار استدامي");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32 bg-slate-50/70 font-sans text-slate-900" dir={isAr ? "rtl" : "ltr"}>
      
      {/* TOP NAV BAR */}
      <div className="flex items-center justify-between border-b border-slate-200/90 pb-4">
        <button
          onClick={onBackToCamera}
          className="flex items-center gap-2 text-slate-800 hover:text-emerald-950 bg-white border border-slate-200 px-4 py-2 rounded-2xl text-xs font-black transition hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
        >
          <ArrowRight className={`w-4 h-4 text-emerald-700 ${isAr ? "rotate-0" : "rotate-180"}`} />
          <span>{isAr ? "الرجوع للفحص الذكي" : "Back to Smart Scan"}</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-base font-extrabold text-emerald-950">{isAr ? "تقرير الفحص الذكي" : "Smart Inspection Report"}</span>
          <span className="text-xs font-black text-emerald-900 bg-emerald-50 border border-emerald-300 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>
              {analysis.isRealGeminiAnalysis !== false
                ? (isAr ? "تقرير الذكاء الاصطناعي" : "Gemini AI Report")
                : (isAr ? "تقرير القرار الدائري" : "Circular Report")}
            </span>
          </span>
        </div>
      </div>

      {/* 1️⃣ MAIN INSPECTION RESULT CARD */}
      <div className="bg-white border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1">
            {analysis.imagePreview ? (
              <img
                src={analysis.imagePreview}
                alt={analysis.productName || analysis.product}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-2 border-emerald-200/90 shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center shrink-0 shadow-sm">
                <Recycle className="w-12 h-12 text-emerald-700" />
              </div>
            )}

            <div className="space-y-2.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full shadow-2xs">
                  ✨ {isAr ? "ثقة التعرف: " : "Confidence: "}{analysis.confidenceScore || 96}%
                </span>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {analysis.material || (isAr ? "خامة مستدامة" : "Sustainable Material")}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight leading-tight">
                {analysis.productName || analysis.product}
              </h1>

              <p className="text-xs sm:text-sm text-slate-700 font-bold leading-relaxed max-w-2xl">
                {analysis.summary || (isAr ? "منتج محلل بالذكاء الاصطناعي مع تحديد المواد، الحالة التشغيلية، ومستوى الاستدامة الدائرية." : "AI Analyzed Product with exact material, condition, and circular route.")}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Attribute Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 text-center space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">{isAr ? "حالة المنتج" : "Condition"}</span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-950 block truncate">
              {analysis.condition || (isAr ? "ممتازة" : "Excellent")}
            </span>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-3.5 text-center space-y-1">
            <span className="text-[11px] font-bold text-slate-600 block">{isAr ? "إعادة الاستخدام" : "Reuse Eligibility"}</span>
            <span className="text-xs sm:text-sm font-black text-emerald-900 block truncate">
              ♻️ {isAr ? "متاح وموصى به" : "Available & Recommended"}
            </span>
          </div>

          <div className="bg-teal-50/60 border border-teal-200/90 rounded-2xl p-3.5 text-center space-y-1">
            <span className="text-[11px] font-bold text-slate-600 block">{isAr ? "إعادة التدوير" : "Recycling Eligibility"}</span>
            <span className="text-xs sm:text-sm font-black text-teal-900 block truncate">
              ♻️ {isAr ? "قابل للتدوير 100%" : "100% Recyclable"}
            </span>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-3.5 text-center space-y-1">
            <span className="text-[11px] font-bold text-slate-600 block">{isAr ? "مستوى الاستدامة" : "Sustainability Level"}</span>
            <span className="text-xs sm:text-sm font-black text-emerald-950 block truncate">
              🌿 {isAr ? "مرتفع جداً" : "Very High"}
            </span>
          </div>
        </div>
      </div>

      {/* 2️⃣ STATISTICS SECTION */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-700" />
          <span>{isAr ? "مؤشرات وإحصائيات الفحص الذكي:" : "Smart Inspection Statistics:"}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 text-center space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-slate-600 block">{isAr ? "دقة التعرف" : "Recognition Accuracy"}</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-950 block">
              {analysis.confidenceScore || 96}%
            </span>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${analysis.confidenceScore || 96}%` }} />
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 text-center space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-slate-600 block">{isAr ? "إعادة الاستخدام" : "Reuse Rate"}</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-950 block">
              {analysis.scores?.reuse || 88}%
            </span>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${analysis.scores?.reuse || 88}%` }} />
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 text-center space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-slate-600 block">{isAr ? "إعادة التدوير" : "Recycling Potential"}</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-950 block">
              {analysis.scores?.recycling || 94}%
            </span>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-teal-600 h-full rounded-full" style={{ width: `${analysis.scores?.recycling || 94}%` }} />
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 text-center space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-slate-600 block">{isAr ? "الأثر البيئي" : "CO2 Impact"}</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-900 block pt-1">
              {isAr ? "منخفض جداً" : "Low Impact"}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 block">{analysis.quickStats?.savedCo2 || "2.5"} kg CO2e</span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 text-center space-y-2 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-xs font-bold text-slate-600 block">{isAr ? "القيمة الدائرية" : "Circular Value"}</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-950 block pt-1">
              {isAr ? "مرتفع" : "High Value"}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 block">Score: {score}/100</span>
          </div>
        </div>
      </div>

      {/* 3️⃣ CIRCULAR POTENTIAL ASSESSMENT DASHBOARD */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-700" />
            <span>{isAr ? "تقييم الإمكانيات الدائرية للمنتج:" : "Circular Potential Assessment Dashboard:"}</span>
          </h3>
          <span className="text-xs font-black text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {isAr ? "لوحة التقييم الشاملة" : "Dashboard Metrics"}
          </span>
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <div className="flex justify-between font-bold text-slate-900">
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-700" />
                <span>{isAr ? "إعادة الاستخدام" : "Reuse Option"}</span>
              </span>
              <span className="text-emerald-950 font-black text-sm">90%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-1000 shadow-xs" style={{ width: "90%" }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-bold text-slate-900">
              <span className="flex items-center gap-2">
                <Recycle className="w-4 h-4 text-teal-700" />
                <span>{isAr ? "إعادة التدوير" : "Recycling Option"}</span>
              </span>
              <span className="text-emerald-950 font-black text-sm">82%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-500 h-full rounded-full transition-all duration-1000 shadow-xs" style={{ width: "82%" }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-bold text-slate-900">
              <span className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-700" />
                <span>{isAr ? "إعادة التصنيع / الإصلاح" : "Upcycling & Repair"}</span>
              </span>
              <span className="text-cyan-950 font-black text-sm">65%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
              <div className="bg-gradient-to-r from-cyan-600 to-teal-400 h-full rounded-full transition-all duration-1000 shadow-xs" style={{ width: "65%" }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-bold text-slate-900">
              <span className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-700" />
                <span>{isAr ? "التبرع والإهداء" : "Donation Potential"}</span>
              </span>
              <span className="text-emerald-950 font-black text-sm">95%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
              <div className="bg-gradient-to-r from-emerald-700 to-teal-500 h-full rounded-full transition-all duration-1000 shadow-xs" style={{ width: "95%" }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-bold text-slate-900">
              <span className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>{isAr ? "القيمة المتبقية" : "Residual Value Score"}</span>
              </span>
              <span className="text-amber-950 font-black text-sm">84%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
              <div className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-1000 shadow-xs" style={{ width: "84%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* 4️⃣ PROPOSED CIRCULAR DECISION CARD */}
      <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-3xl p-6 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/90 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-black shadow-xs">
              ♻️
            </div>
            <h3 className="text-base font-extrabold text-emerald-950">
              {isAr ? "القرار الدائري المقترح" : "Recommended Circular Decision"}
            </h3>
          </div>
          <span className="text-xs font-black text-emerald-900 bg-white border border-emerald-300 px-3.5 py-1 rounded-full">
            {topPathway.title}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-800 font-bold leading-relaxed pt-1">
          {isAr
            ? `المنتج (${analysis.productName || analysis.product}) ما زال قابلًا للاستخدام، لذلك يُنصح بإعادة استخدامه أو توجيهه إلى جهة تستفيد منه بدلاً من التخلص منه.`
            : `The product is in good condition, so it is recommended to reuse or donate it instead of disposal.`}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-black text-emerald-950">
          <span className="bg-white border border-emerald-200 px-3 py-1 rounded-xl shadow-2xs">
            {isAr ? "أولوية المسار: " : "Priority: "}
            <strong className="text-emerald-900">إعادة الاستخدام ← التبرع ← إعادة التدوير</strong>
          </span>
        </div>
      </div>

      {/* 5️⃣ PROPOSED PATHWAYS TIMELINE FLOW */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-700" />
            <span>{isAr ? "مخطط مسار القرار الدائري:" : "Circular Decision Flowchart:"}</span>
          </h3>
          <span className="text-xs font-black text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {isAr ? "مخطط تفاعلي" : "Interactive Flow"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1.5 relative">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-black text-xs mx-auto flex items-center justify-center">①</div>
            <h4 className="text-xs font-black text-slate-900">{isAr ? "الفحص الذكي" : "Smart Inspection"}</h4>
            <p className="text-[11px] text-slate-600 font-medium">{isAr ? "تحليل الصورة والمكونات" : "AI Image Analysis"}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1.5 relative">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-black text-xs mx-auto flex items-center justify-center">②</div>
            <h4 className="text-xs font-black text-slate-900">{isAr ? "تقييم الحالة" : "Condition Check"}</h4>
            <p className="text-[11px] text-slate-600 font-medium">{isAr ? "تحديد الجودة والخامة" : "Quality & Material"}</p>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 text-center space-y-1.5 relative shadow-xs scale-[1.02]">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-black text-xs mx-auto flex items-center justify-center shadow-xs">③</div>
            <h4 className="text-xs font-black text-emerald-950">{isAr ? "أفضل مسار" : "Best Route"}</h4>
            <span className="text-[10px] font-black text-emerald-900 bg-white border border-emerald-300 px-2 py-0.5 rounded-md inline-block">
              {topPathway.title}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1.5 relative">
            <div className="w-8 h-8 rounded-full bg-teal-800 text-white font-black text-xs mx-auto flex items-center justify-center">④</div>
            <h4 className="text-xs font-black text-slate-900">{isAr ? "إعادة التدوير / التبرع" : "Recycle / Donate"}</h4>
            <p className="text-[11px] text-slate-600 font-medium">{isAr ? "المسارات الإضافية" : "Secondary Routes"}</p>
          </div>
        </div>
      </div>

      {/* 6️⃣ CREATIVE IDEAS CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-emerald-700" />
            <span>{isAr ? "بدائل إبداعية لاستخدامه بالذكاء الاصطناعي (AI Upcycling):" : "Creative Upcycling Ideas (AI):"}</span>
          </h3>
          <button
            onClick={onOpenCreativeIdeas}
            className="text-xs font-black text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
          >
            {isAr ? "عرض كل الأفكار الإبداعية" : "View All Ideas"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-white border border-emerald-200/90 rounded-2xl p-4 space-y-2 shadow-2xs hover:border-emerald-400 transition">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
              <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">💡</span>
              <span>{isAr ? "فكرة 1: إعادة استخدام منزلي" : "Idea 1: Home Reuse"}</span>
            </div>
            <p className="text-xs text-slate-700 font-bold leading-relaxed">
              {isAr
                ? `تحويل المكونات إلى أدوات ديكورية أو حوافظ منزلية مستدامة بدلاً من التخلص منها.`
                : `Convert components into decorative sustainable home storage containers.`}
            </p>
          </div>

          <div className="bg-white border border-emerald-200/90 rounded-2xl p-4 space-y-2 shadow-2xs hover:border-emerald-400 transition">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
              <span className="p-1 rounded-lg bg-teal-100 text-teal-800">♻️</span>
              <span>{isAr ? "فكرة 2: تحسين وتجديد" : "Idea 2: Upcycling Repair"}</span>
            </div>
            <p className="text-xs text-slate-700 font-bold leading-relaxed">
              {isAr
                ? `إجراء تعديلات بسيطة وإصلاح الأجزاء المكسورة لاستعادة كفاءة التشغيل بنسبة 100%.`
                : `Perform simple repairs to restore operational efficiency.`}
            </p>
          </div>

          <div className="bg-white border border-emerald-200/90 rounded-2xl p-4 space-y-2 shadow-2xs hover:border-emerald-400 transition">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
              <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">🌱</span>
              <span>{isAr ? "فكرة 3: توجيه للجمعيات" : "Idea 3: Donation Routing"}</span>
            </div>
            <p className="text-xs text-slate-700 font-bold leading-relaxed">
              {isAr
                ? `إهداء المنتج للجمعيات الرسمية لتستفيد منه العائلات المحتاجة بشكل مباشر.`
                : `Donate product to official charities for direct community benefit.`}
            </p>
          </div>
        </div>
      </div>

      {/* 7️⃣ ASK DAWR AI ASSISTANT CARD */}
      <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black shrink-0">
            ✨
          </div>
          <div>
            <h3 className="text-base font-extrabold text-emerald-950">
              {isAr ? "استشر DAWR AI" : "Consult DAWR AI Assistant"}
            </h3>
            <p className="text-xs text-slate-600 font-bold">
              {isAr ? "لديك سؤال عن هذا المنتج؟ اسأل الذكاء الاصطناعي عن أفضل طريقة لإعادة استخدامه أو تدويره." : "Have a question about this item? Ask Gemini AI for optimal circular advice."}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAiChat}
          className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-2xs"
        >
          <Bot className="w-4.5 h-4.5 text-teal-700 shrink-0" />
          <span>{isAr ? "اسأل الذكاء الاصطناعي الآن" : "Ask Gemini AI Now"}</span>
        </button>
      </div>

      {/* 8️⃣ DYNAMIC RECYCLING HUBS MAP SECTION (خريطة نقاط الفرز المرتبطة بالمنتج ديناميكياً) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <span>{isAr ? "خريطة نقاط الفرز والتدوير:" : "Recycling Hubs Map:"}</span>
            </h3>
            <p className="text-xs font-black text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block">
              {isAr ? `نقاط الفرز المناسبة لـ: ${relevantHubsInfo.label}` : `Filtered Hubs for: ${relevantHubsInfo.label}`}
            </p>
          </div>

          <button
            onClick={onOpenMapModal}
            className="py-2.5 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>{isAr ? "عرض الخريطة التفاعلية بالكامل" : "View Interactive Map"}</span>
          </button>
        </div>

        {/* Dynamic Hub Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {relevantHubsInfo.hubs.map((hub) => (
            <div key={hub.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-slate-900">{hub.name}</h4>
                  <span className="text-[10px] font-extrabold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                    {hub.type}
                  </span>
                </div>
                <span className="text-xs font-black text-emerald-900 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0">
                  {hub.distance}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-bold leading-relaxed">{hub.address}</p>

              <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-200/60 text-[10px] text-slate-500 font-bold">
                <span>{isAr ? "تستقبل:" : "Accepts:"}</span>
                {hub.accepted.map((acc, idx) => (
                  <span key={idx} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                    {acc}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9️⃣ POINTS CLAIM SUCCESS STATE (إضافة النقاط برصيد متحرك) */}
      <div className="pt-2">
        {claimed ? (
          <div className="bg-emerald-950 text-white rounded-3xl p-6 shadow-xl space-y-4 border-2 border-emerald-600 animate-scaleUp text-center max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-md">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-emerald-300">
                {isAr ? "✓ تمت إضافة النقاط بنجاح!" : "✓ Points Added Successfully!"}
              </h3>
              <p className="text-2xl font-black text-white pt-1">
                +25 {isAr ? "نقطة ♻️" : "Points ♻️"}
              </p>
              <p className="text-xs text-emerald-200 font-bold pt-1">
                {isAr ? "أحسنت! ساهمت في اتخاذ قرار دائري أفضل." : "Great job! You made a better circular decision."}
              </p>
            </div>

            <div className="bg-emerald-900/90 border border-emerald-700 rounded-2xl p-3.5 max-w-sm mx-auto flex items-center justify-between text-xs font-black">
              <span className="text-emerald-300">{isAr ? "رصيدك الحالي:" : "Current Balance:"}</span>
              <span className="text-white text-base">{userPoints.toLocaleString()} {isAr ? "نقطة" : "Points"}</span>
            </div>
          </div>
        ) : (
          <button
            onClick={handleClaim}
            className="w-full py-4.5 px-6 rounded-3xl bg-emerald-900 hover:bg-emerald-950 text-white font-black text-base shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer border border-emerald-600 shadow-emerald-950/30"
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0" />
            <span>{isAr ? "🚀 ابدأ الخطوة التالية واكسب النقاط (+25 نقطة)" : "🚀 Start Next Step & Claim Points (+25 Points)"}</span>
          </button>
        )}
      </div>
    </div>
  );
};


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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32 bg-[#F8FAF9] font-sans text-slate-900" dir={isAr ? "rtl" : "ltr"}>
      
      {/* ① TOP HEADER NAV BAR */}
      <div className="flex items-center justify-between border-b border-slate-200/90 pb-4">
        <button
          onClick={onBackToCamera}
          className="flex items-center gap-2 text-slate-800 hover:text-emerald-950 bg-white border border-slate-200 px-4 py-2 rounded-2xl text-xs font-black transition hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <ArrowRight className={`w-4 h-4 text-emerald-700 ${isAr ? "rotate-0" : "rotate-180"}`} />
          <span>{isAr ? "الرجوع للفحص الذكي" : "Back to Smart Scan"}</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-base font-extrabold text-emerald-950">{isAr ? "نتيجة الفحص الذكي" : "Smart Inspection Result"}</span>
          <span className="text-xs font-black text-emerald-900 bg-emerald-50 border border-emerald-300 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>
              {analysis.isRealGeminiAnalysis !== false
                ? (isAr ? "لوحة الذكاء الاصطناعي" : "Gemini AI Dashboard")
                : (isAr ? "لوحة القرار الدائري" : "Circular Dashboard")}
            </span>
          </span>
        </div>
      </div>

      {/* ② HERO CARD: PRODUCT IMAGE + MAIN INSPECTION RESULT */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 left-0 h-2 bg-emerald-700 rounded-t-3xl" />
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 pt-2">
          <div className="w-full md:w-80 h-64 sm:h-72 bg-slate-50 border-2 border-emerald-200/80 rounded-3xl p-2.5 shadow-sm flex items-center justify-center shrink-0">
            {analysis.imagePreview ? (
              <img
                src={analysis.imagePreview}
                alt={analysis.productName || analysis.product}
                className="w-full h-full object-contain rounded-2xl"
              />
            ) : (
              <Recycle className="w-20 h-20 text-emerald-700" />
            )}
          </div>

          <div className="space-y-4 flex-1 w-full text-right">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <span className="text-xs font-black text-emerald-900 bg-emerald-100/90 border border-emerald-300 px-3.5 py-1.5 rounded-full shadow-2xs">
                ✨ {isAr ? "دقة التعرف: " : "Confidence: "}{analysis.confidenceScore || 96}%
              </span>
              <span className={`text-xs font-black px-3.5 py-1.5 rounded-full border ${score < 50 ? "bg-amber-100 text-amber-950 border-amber-300" : "bg-emerald-50 text-emerald-950 border-emerald-300"}`}>
                {score < 50 ? (isAr ? "⚠️ إمكانية دائرية: منخفضة" : "⚠️ Circular: Low") : (isAr ? "🌿 إمكانية دائرية: عالية جداً" : "🌿 Circular: High")}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight leading-tight">
                {analysis.productName || analysis.product}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-bold">
                {isAr ? "الخامة والمكونات: " : "Material: "}<strong className="text-slate-900">{analysis.material || (isAr ? "مواد قابلة للتدوير" : "Recyclable Materials")}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">{isAr ? "حالة المنتج" : "Condition"}</span>
                <span className="text-xs sm:text-sm font-black text-emerald-950 block truncate">
                  {analysis.condition || (isAr ? "جيد" : "Good")}
                </span>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-3.5 space-y-1">
                <span className="text-[11px] font-bold text-slate-600 block">{isAr ? "التقييم الدائري" : "Circular Score"}</span>
                <span className="text-xs sm:text-sm font-black text-emerald-950 block truncate">
                  {score}/100
                </span>
              </div>
            </div>

            <div className="bg-emerald-900 text-white rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-emerald-300 block">{isAr ? "♻️ القرار المقترح الرئيسي" : "♻️ Recommended Decision"}</span>
                <span className="text-sm sm:text-base font-black text-white block">{topPathway.title}</span>
              </div>
              <span className="text-xs font-black bg-emerald-800 text-emerald-100 border border-emerald-700 px-3 py-1.5 rounded-xl shrink-0">
                +{topPathway.points || "850"} {isAr ? "نقطة" : "pts"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ③ STATISTICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 text-center space-y-2 shadow-2xs">
          <span className="text-xs font-bold text-slate-600 block">{isAr ? "دقة التعرف" : "Accuracy"}</span>
          <span className="text-3xl font-black text-emerald-950 block">{analysis.confidenceScore || 96}%</span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-600 h-full rounded-full" style={{ width: `${analysis.confidenceScore || 96}%` }} /></div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 text-center space-y-2 shadow-2xs">
          <span className="text-xs font-bold text-slate-600 block">{isAr ? "إعادة الاستخدام" : "Reuse"}</span>
          <span className="text-3xl font-black text-emerald-950 block">{analysis.breakdown?.reuse ?? analysis.scores?.reuse ?? 88}%</span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-600 h-full rounded-full" style={{ width: `${analysis.breakdown?.reuse ?? analysis.scores?.reuse ?? 88}%` }} /></div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 text-center space-y-2 shadow-2xs">
          <span className="text-xs font-bold text-slate-600 block">{isAr ? "إعادة التدوير" : "Recycling"}</span>
          <span className="text-3xl font-black text-emerald-950 block">{analysis.breakdown?.recycling ?? analysis.scores?.recycling ?? 92}%</span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-teal-600 h-full rounded-full" style={{ width: `${analysis.breakdown?.recycling ?? analysis.scores?.recycling ?? 92}%` }} /></div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 text-center space-y-2 shadow-2xs">
          <span className="text-xs font-bold text-slate-600 block">{isAr ? "القيمة الدائرية" : "Circular Value"}</span>
          <span className="text-3xl font-black text-emerald-950 block">{score}<span className="text-sm font-bold text-slate-500">/100</span></span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-700 h-full rounded-full" style={{ width: `${score}%` }} /></div>
        </div>
      </div>

      {/* ④ CIRCULAR POTENTIAL ASSESSMENT DASHBOARD */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base sm:text-lg font-extrabold text-emerald-950 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-700" />
            <span>{isAr ? "تقييم الإمكانيات الدائرية" : "Circular Potential Assessment"}</span>
          </h3>
          <span className="text-xs font-black text-emerald-900 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            {isAr ? "مؤشرات تفاعلية" : "Interactive Progress"}
          </span>
        </div>
        <div className="space-y-4 text-xs">
          {['reuse', 'recycling', 'repair', 'donation'].map((key) => {
            const val = analysis.breakdown?.[key as keyof typeof analysis.breakdown] ?? analysis.scores?.[key as keyof typeof analysis.scores] ?? 50;
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span className="flex items-center gap-2 capitalize">{key}</span>
                  <span className="text-emerald-950 font-black text-sm">{val}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.max(2, val)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ⑤ PROPOSED CIRCULAR DECISION CARD */}
      <div className={`border-2 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden ${score < 50 ? "bg-amber-50/90 border-amber-300" : "bg-emerald-50/90 border-emerald-300"}`}>
        <div className={`absolute top-0 right-0 bottom-0 w-2 ${score < 50 ? "bg-amber-600" : "bg-emerald-700"}`} />
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl text-white flex items-center justify-center font-black ${score < 50 ? "bg-amber-700" : "bg-emerald-800"}`}>♻️</div>
            <div>
              <h3 className={`text-base font-extrabold ${score < 50 ? "text-amber-950" : "text-emerald-950"}`}>{isAr ? "القرار الدائري المقترح" : "Recommended Circular Decision"}</h3>
              <p className="text-xs text-slate-600 font-bold">{isAr ? "توصية موجهة بواسطة الذكاء الاصطناعي" : "AI Powered Decision"}</p>
            </div>
          </div>
          <span className={`text-sm font-extrabold bg-white border px-4 py-1.5 rounded-full ${score < 50 ? "text-amber-950 border-amber-300" : "text-emerald-950 border-emerald-300"}`}>{topPathway.title}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-800 font-bold leading-relaxed">{analysis.assessmentText || (isAr ? "تم تقييم المنتج لاستخلاص القرار الدائري الأمثل." : "Product visually evaluated to extract optimal decision.")}</p>
      </div>

      {/* ⑥ PROPOSED PATHWAYS CONNECTED FLOW (المسارات المقترحة للقرار الدائري) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base sm:text-lg font-extrabold text-emerald-950 flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-700" />
            <span>{isAr ? "المسارات المقترحة للقرار الدائري" : "Proposed Circular Pathways Flow"}</span>
          </h3>
          <span className="text-xs font-black text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {isAr ? "مخطط تفاعلي" : "Interactive Timeline"}
          </span>
        </div>

        {/* Connected Cards Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 relative">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-black text-xs mx-auto flex items-center justify-center">①</div>
            <h4 className="text-xs font-black text-slate-900">{isAr ? "الفحص الذكي" : "Smart Inspection"}</h4>
            <p className="text-[11px] text-slate-600 font-medium">{isAr ? "تحليل الصورة والمكونات" : "AI Image Analysis"}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-black text-xs mx-auto flex items-center justify-center">②</div>
            <h4 className="text-xs font-black text-slate-900">{isAr ? "تقييم الحالة" : "Condition Check"}</h4>
            <p className="text-[11px] text-slate-600 font-medium">{isAr ? "تحديد الجودة والخامة" : "Quality & Material"}</p>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 text-center space-y-1.5 shadow-xs scale-[1.02]">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-black text-xs mx-auto flex items-center justify-center shadow-xs">③</div>
            <h4 className="text-xs font-black text-emerald-950">{isAr ? "أفضل مسار" : "Best Route"}</h4>
            <span className="text-[10px] font-black text-emerald-900 bg-white border border-emerald-300 px-2 py-0.5 rounded-md inline-block">
              {topPathway.title}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1.5">
            <div className="w-8 h-8 rounded-full bg-teal-800 text-white font-black text-xs mx-auto flex items-center justify-center">④</div>
            <h4 className="text-xs font-black text-slate-900">{isAr ? "إعادة التدوير / التبرع" : "Recycle / Donate"}</h4>
            <p className="text-[11px] text-slate-600 font-medium">{isAr ? "المسارات الإضافية" : "Secondary Routes"}</p>
          </div>
        </div>
      </div>

      {/* ⑦ CREATIVE IDEAS CARDS (بدائل إبداعية لاستخدامه - بطاقات بيضاء بحدود خضراء ناعمة وليست أزراراً) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-emerald-700" />
            <span>{isAr ? "بدائل إبداعية لاستخدامه" : "Creative Upcycling Ideas"}</span>
          </h3>
          <button
            onClick={onOpenCreativeIdeas}
            className="text-xs font-black text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
          >
            {isAr ? "عرض التفاصيل" : "View Details"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-emerald-200/90 rounded-2xl p-4 space-y-2 shadow-2xs hover:border-emerald-400 transition">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
              <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">💡</span>
              <span>{isAr ? "فكرة 1: استغلال منزلي" : "Idea 1: Home Reuse"}</span>
            </div>
            <p className="text-xs text-slate-700 font-bold leading-relaxed">
              {isAr ? "تحويل المكونات إلى حوافظ أو أدوات منزلية مستدامة." : "Convert item into home storage tools."}
            </p>
          </div>

          <div className="bg-white border border-emerald-200/90 rounded-2xl p-4 space-y-2 shadow-2xs hover:border-emerald-400 transition">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
              <span className="p-1 rounded-lg bg-teal-100 text-teal-800">♻️</span>
              <span>{isAr ? "فكرة 2: تجديد وصيانة" : "Idea 2: Upcycling Repair"}</span>
            </div>
            <p className="text-xs text-slate-700 font-bold leading-relaxed">
              {isAr ? "إجراء تعديلات بسيطة لاستعادة كفاءة المنتج." : "Perform simple repairs to restore product utility."}
            </p>
          </div>

          <div className="bg-white border border-emerald-200/90 rounded-2xl p-4 space-y-2 shadow-2xs hover:border-emerald-400 transition">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
              <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">🌱</span>
              <span>{isAr ? "فكرة 3: توجيه مجتمعي" : "Idea 3: Community Route"}</span>
            </div>
            <p className="text-xs text-slate-700 font-bold leading-relaxed">
              {isAr ? "توجيه المنتج للجهات الخيرية لإتاحة الاستفادة للآخرين." : "Donate to official charities."}
            </p>
          </div>
        </div>
      </div>

      {/* ⑧ ASK AI ASSISTANT CARD (استشر AI) */}
      <div className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black shrink-0">
            ✨
          </div>
          <div>
            <h3 className="text-base font-extrabold text-emerald-950">
              {isAr ? "استشر DAWR AI" : "Consult DAWR AI"}
            </h3>
            <p className="text-xs text-slate-600 font-bold">
              {isAr ? "لديك سؤال عن المنتج أو أفضل طريقة للاستفادة منه؟" : "Have a question about this item or best circular strategy?"}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAiChat}
          className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-emerald-900 hover:bg-emerald-950 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-xs border border-emerald-700"
        >
          <Bot className="w-4.5 h-4.5 text-emerald-300 shrink-0" />
          <span>{isAr ? "اسأل DAWR AI" : "Ask DAWR AI"}</span>
        </button>
      </div>

      {/* ⑨ RECYCLING HUBS MAP SECTION (خريطة نقاط الفرز) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-extrabold text-emerald-950 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <span>{isAr ? "خريطة نقاط الفرز" : "Recycling Hubs Map"}</span>
            </h3>
            <p className="text-xs font-black text-emerald-900 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full inline-block">
              {isAr ? `نقاط مناسبة لهذا المنتج: ${relevantHubsInfo.label}` : `Filtered Hubs for: ${relevantHubsInfo.label}`}
            </p>
          </div>

          <button
            onClick={onOpenMapModal}
            className="py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-2xs cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-emerald-700" />
            <span>{isAr ? "عرض الخريطة بالكامل" : "View Map"}</span>
          </button>
        </div>

        {/* Dynamic Hub Cards */}
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

        {/* Direct Link to Standalone DAWR Map */}
        <div className="pt-2">
          <button
            onClick={() => {
              const cat = analysis.material.includes("قطن") || analysis.material.includes("ملابس") || analysis.material.includes("نسيج")
                ? "textiles"
                : analysis.material.includes("إلكترون") || analysis.material.includes("حاسوب") || analysis.material.includes("هاتف")
                ? "electronics"
                : analysis.material.includes("بلاستيك") || analysis.material.includes("PET")
                ? "plastics"
                : analysis.material.includes("ورق") || analysis.material.includes("كرتون")
                ? "paper"
                : "all";
              if (onOpenMapModal) onOpenMapModal(cat);
            }}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 hover:from-emerald-900 hover:to-teal-900 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.98] transition cursor-pointer border border-emerald-700"
          >
            <MapPin className="w-4.5 h-4.5 text-emerald-300 shrink-0" />
            <span>{isAr ? "📍 اعثر على أقرب جهة مناسبة في خريطة دور" : "📍 Find Nearest Recommended Hub on DAWR Map"}</span>
          </button>
        </div>
      </div>

      {/* ⑩ CLAIM POINTS / SUCCESS STATE CARD (إضافة النقاط) */}
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

import React, { useState } from "react";
import { UserStats, Language, ActiveTab } from "../types";
import { Sparkles, MapPin, Camera, RefreshCw, Trophy, ArrowRight, CheckCircle2, Leaf, Clock, Star, Flame, Lightbulb, Compass, ExternalLink, ChevronRight, Layers, Award } from "lucide-react";

interface UpdatesTabProps {
  userStats: UserStats;
  language: Language;
  onChangeTab?: (tab: ActiveTab, categoryFilter?: string) => void;
}

export const UpdatesTab: React.FC<UpdatesTabProps> = ({
  userStats,
  language,
  onChangeTab,
}) => {
  const isAr = language === "ar";
  const [activeFilterTab, setActiveFilterTab] = useState<string>("all");

  const filterTabs = [
    { id: "all", labelAr: "الكل", labelEn: "All" },
    { id: "dawr", labelAr: "تحديثات دَوْر", labelEn: "DAWR Updates" },
    { id: "sustainability", labelAr: "الاستدامة", labelEn: "Sustainability" },
    { id: "challenges", labelAr: "تحديات", labelEn: "Challenges" },
    { id: "hubs", labelAr: "جهات جديدة", labelEn: "New Hubs" },
  ];

  const recentSaudiHubs = [
    {
      name: "جمعية عيني لإعادة التدوير والخدمات البيئية",
      category: "ملابس ومنسوجات",
      city: "الرياض",
      type: "جمعية غير ربحية",
    },
    {
      name: "شركة التدوير العربية (Tadweer)",
      category: "إلكترونيات وأجهزة",
      city: "الرياض والدمام",
      type: "مراكز تدوير معتمدة",
    },
    {
      name: "جمعية كسوة لحفظ النعمة وإعادة الاستخدام",
      category: "ملابس ومقتنيات",
      city: "جدة والرياض",
      type: "نقاط التبرع والتجميع",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32 bg-[#F8FAF9] font-sans text-slate-900" dir={isAr ? "rtl" : "ltr"}>
      
      {/* Header Section */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-950 text-xs font-black border border-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isAr ? "مركز المستجدات والتفاعلات" : "DAWR Hub & Activity Feed"}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-emerald-950 tracking-tight">
              {isAr ? "آخر تحديثات دَوْر" : "Latest DAWR Updates"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-xl">
              {isAr ? "كل جديد في دَوْر، والاستدامة من حولك." : "Everything new in DAWR, and sustainability around you."}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-xs font-black text-emerald-900 shrink-0">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>{isAr ? "إصدار المنصة: V2.4 المستدام" : "Platform Release: V2.4"}</span>
          </div>
        </div>

        {/* 1. Interactive Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 border-t border-slate-100 scrollbar-none">
          {filterTabs.map((tab) => {
            const isActive = activeFilterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilterTab(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-emerald-900 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-emerald-50 text-slate-700 border border-slate-200/80"
                }`}
              >
                {isAr ? tab.labelAr : tab.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Featured Update Hero Card (⭐ التحديث الرئيسي) */}
      {(activeFilterTab === "all" || activeFilterTab === "dawr" || activeFilterTab === "hubs") && (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-emerald-700 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-right max-w-2xl z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-emerald-400 text-emerald-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                {isAr ? "جديد ✨" : "NEW ✨"}
              </span>
              <span className="text-xs font-bold text-emerald-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {isAr ? "هذا الأسبوع" : "This Week"}
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
              📍 {isAr ? "إطلاق خريطة دور التفاعلية للجهات والاستدامة" : "DAWR Interactive Sustainability Map Released"}
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100 font-bold leading-relaxed">
              {isAr
                ? "اعثر على أقرب جهة تمنح منتجك دوره التالي. دليل حقيقي وتفاعلي يربطك بمراكز التدوير معتمدة، جمعيات التبرع، ورش الإصلاح، ونقاط التجميع بالـ (كم) مع الاتجاهات المباشرة في Google Maps."
                : "Locate the nearest verified recycling hubs, donation centers, and repair shops across Saudi Arabia with live 1-click Google Maps routing."}
            </p>

            <div className="pt-2">
              <button
                onClick={() => onChangeTab?.("map")}
                className="px-6 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs sm:text-sm transition active:scale-95 flex items-center gap-2 shadow-md cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>{isAr ? "اكتشف خريطة دور الآن" : "Explore DAWR Map Now"}</span>
              </button>
            </div>
          </div>

          <div className="w-full md:w-72 h-44 rounded-2xl bg-emerald-900/60 border border-emerald-600/40 p-4 flex flex-col items-center justify-center text-center space-y-2 shrink-0 z-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-black text-2xl border border-emerald-400/30">
              🗺️
            </div>
            <span className="text-xs font-black text-white block">
              {isAr ? "+8 جهات موثقة بالرياض وجدة والدمام" : "+8 Verified Hubs"}
            </span>
            <span className="text-[10px] text-emerald-200 font-bold">
              {isAr ? "تحديث تلقائي بالمسافات الجغرافية" : "Live Distance Sorting"}
            </span>
          </div>
        </div>
      )}

      {/* 3. Small DAWR Updates Grid (تحديثات دَوْر) */}
      {(activeFilterTab === "all" || activeFilterTab === "dawr") && (
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-extrabold text-emerald-950 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-700" />
            <span>{isAr ? "أحدث تحسينات ومزايا المنصة" : "Platform Feature Enhancements"}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: AI Scan */}
            <div className="bg-white border border-slate-200/90 hover:border-emerald-300 rounded-3xl p-5 space-y-3 shadow-2xs transition hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black">
                  🤖
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {isAr ? "اليوم" : "Today"}
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900">
                {isAr ? "تحسينات جديدة على الفحص الذكي" : "Smart Inspection Upgrades"}
              </h3>
              <p className="text-xs text-slate-600 font-bold leading-relaxed">
                {isAr
                  ? "تجربة أوضح وأسرع لتحليل المنتجات بالذكاء الاصطناعي ومعرفة مسارها الدائري وتوليد أفكار فورية لإعادة تدويرها."
                  : "Faster AI material detection with high precision circular scores and creative upcycling guides."}
              </p>
              <button
                onClick={() => onChangeTab?.("scan")}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-900 text-xs font-black border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isAr ? "جرب الفحص الذكي" : "Try Smart Scan"}</span>
              </button>
            </div>

            {/* Card 2: New Hubs */}
            <div className="bg-white border border-slate-200/90 hover:border-emerald-300 rounded-3xl p-5 space-y-3 shadow-2xs transition hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-900 flex items-center justify-center font-black">
                  📍
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {isAr ? "هذا الأسبوع" : "This Week"}
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900">
                {isAr ? "جهات جديدة على خريطة دور" : "New Registered Sustainability Hubs"}
              </h3>
              <p className="text-xs text-slate-600 font-bold leading-relaxed">
                {isAr
                  ? "تمت إضافة جهات معتمدة جديدة في الرياض وجدة والشرقية تساعدك في إعطاء منتجاتك دورًا جديدًا."
                  : "Verified collection hubs added in Riyadh, Jeddah, Dammam, and Khobar for textiles and electronics."}
              </p>
              <button
                onClick={() => onChangeTab?.("map")}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-teal-50 text-teal-900 text-xs font-black border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-teal-700" />
                <span>{isAr ? "استكشف الجهات" : "Explore Hubs"}</span>
              </button>
            </div>

            {/* Card 3: Circular Pathways */}
            <div className="bg-white border border-slate-200/90 hover:border-emerald-300 rounded-3xl p-5 space-y-3 shadow-2xs transition hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black">
                  ♻️
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {isAr ? "منذ 3 أيام" : "3 days ago"}
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900">
                {isAr ? "مسارات دائرية وتحديات جديدة" : "New Circular Decision Pathways"}
              </h3>
              <p className="text-xs text-slate-600 font-bold leading-relaxed">
                {isAr
                  ? "اكتشف طرقًا جديدة لإعادة استخدام المنتجات والأثاث بدل التخلص منها، واحفظ نقاطك الاستدامية."
                  : "Discover new sustainable choices to reuse furniture and garments instead of sending them to landfills."}
              </p>
              <button
                onClick={() => onChangeTab?.("home")}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-900 text-xs font-black border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isAr ? "اكتشف المسارات" : "Explore Pathways"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Weekly Challenge Card (🎯 تحدي الأسبوع) */}
      {(activeFilterTab === "all" || activeFilterTab === "challenges") && (
        <div className="bg-white border-2 border-emerald-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-black text-xl shrink-0">
                🎯
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-200 inline-block">
                  {isAr ? "تحدي الأسبوع الفعّال" : "Active Weekly Challenge"}
                </span>
                <h3 className="text-base sm:text-xl font-black text-emerald-950">
                  {isAr ? "تحدي الملابس: أعطِ قطعة ملابس دورًا جديدًا" : "Textile Challenge: Give a Garment a New Cycle"}
                </h3>
              </div>
            </div>

            <button
              onClick={() => onChangeTab?.("map", "textiles")}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-950 text-white text-xs sm:text-sm font-black transition active:scale-95 flex items-center justify-center gap-2 shadow-md cursor-pointer border border-emerald-700 shrink-0"
            >
              <Trophy className="w-4 h-4 text-emerald-300" />
              <span>{isAr ? "🚀 ابدأ التحدي الآن" : "🚀 Start Challenge"}</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed">
            {isAr
              ? "هل لديك ملابس أو أقمشة لم تعد تستخدمها؟ اكتشف أقرب جهة معتمدة للتبرع أو إعادة التدوير هذا الأسبوع واحصل على نقاط استدامة إضافية لحسابك."
              : "Do you have unused clothing? Locate the nearest verified donation or textile recycling point this week."}
          </p>

          {/* Simple Clean Progress Bar */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-slate-800">
              <span>{isAr ? "تقدم المجتمع هذا الأسبوع:" : "Community Progress:"}</span>
              <span className="text-emerald-800">60% (300/500 قطعة)</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full w-[60%]" />
            </div>
          </div>
        </div>
      )}

      {/* 5. Sustainability Insights (🌱 من حولك) */}
      {(activeFilterTab === "all" || activeFilterTab === "sustainability") && (
        <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-3xl p-6 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-emerald-950">
            <Leaf className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-extrabold">{isAr ? "🌱 من حولك — هل تعلم؟" : "🌱 Sustainability Insight"}</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 font-bold leading-relaxed">
            {isAr
              ? "إعادة استخدام المنتج أو التبرع به قد تمنحه دورة حياة جديدة وتخفض الانبعاثات الكربونية الناتجة عن التصنيع الجديد بنسبة تصل إلى 80%، كما توفر آلاف اللترات من المياه."
              : "Reusing or donating products extends their lifecycle and reduces carbon manufacturing emissions by up to 80% while saving thousands of liters of water."}
          </p>
        </div>
      )}

      {/* 6. Product Circular Journey (♻️ أعطِ منتجك دورًا ثانيًا) */}
      {(activeFilterTab === "all" || activeFilterTab === "dawr") && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="space-y-1 text-right">
            <h3 className="text-base sm:text-lg font-extrabold text-emerald-950 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-700" />
              <span>{isAr ? "♻️ أعطِ منتجك دورًا ثانيًا — رحلة الاستدامة" : "♻️ Product Circular Journey"}</span>
            </h3>
            <p className="text-xs text-slate-600 font-bold">
              {isAr ? "كيف تعمل دور تحويل الهدر إلى قيمة مستدامة خطوة بخطوة:" : "Step-by-step how DAWR converts waste into value:"}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-center">
            <div 
              onClick={() => onChangeTab?.("scan")}
              className="bg-slate-50 border border-slate-200 hover:border-emerald-400 p-3 rounded-2xl space-y-1 cursor-pointer transition"
            >
              <span className="text-xl block">📦</span>
              <span className="text-xs font-black text-slate-900 block">{isAr ? "1. المنتج" : "1. Product"}</span>
            </div>

            <div 
              onClick={() => onChangeTab?.("scan")}
              className="bg-slate-50 border border-slate-200 hover:border-emerald-400 p-3 rounded-2xl space-y-1 cursor-pointer transition"
            >
              <span className="text-xl block">🤖</span>
              <span className="text-xs font-black text-slate-900 block">{isAr ? "2. فحص ذكي" : "2. AI Scan"}</span>
            </div>

            <div 
              onClick={() => onChangeTab?.("scan")}
              className="bg-slate-50 border border-slate-200 hover:border-emerald-400 p-3 rounded-2xl space-y-1 cursor-pointer transition"
            >
              <span className="text-xl block">📊</span>
              <span className="text-xs font-black text-slate-900 block">{isAr ? "3. تقييم الإمكانية" : "3. Evaluation"}</span>
            </div>

            <div 
              onClick={() => onChangeTab?.("home")}
              className="bg-slate-50 border border-slate-200 hover:border-emerald-400 p-3 rounded-2xl space-y-1 cursor-pointer transition"
            >
              <span className="text-xl block">🌿</span>
              <span className="text-xs font-black text-slate-900 block">{isAr ? "4. قرار دائري" : "4. Decision"}</span>
            </div>

            <div 
              onClick={() => onChangeTab?.("map")}
              className="bg-slate-50 border border-slate-200 hover:border-emerald-400 p-3 rounded-2xl space-y-1 cursor-pointer transition"
            >
              <span className="text-xl block">📍</span>
              <span className="text-xs font-black text-slate-900 block">{isAr ? "5. جهة مناسبة" : "5. Suitable Hub"}</span>
            </div>

            <div 
              onClick={() => onChangeTab?.("profile")}
              className="bg-emerald-100 border border-emerald-300 p-3 rounded-2xl space-y-1 cursor-pointer transition"
            >
              <span className="text-xl block">✨</span>
              <span className="text-xs font-black text-emerald-950 block">{isAr ? "6. دور جديد" : "6. New Life"}</span>
            </div>
          </div>
        </div>
      )}

      {/* 7. New Verified Saudi Hubs Section (📍 جهات جديدة) */}
      {(activeFilterTab === "all" || activeFilterTab === "hubs") && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <span>{isAr ? "📍 جهات جديدة تمت إضافتها مؤخراً" : "Recently Added Saudi Hubs"}</span>
            </h3>
            <button
              onClick={() => onChangeTab?.("map")}
              className="text-xs font-black text-emerald-800 hover:underline cursor-pointer"
            >
              {isAr ? "استكشف الخريطة" : "View Map"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {recentSaudiHubs.map((hub, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-2xs">
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md inline-block">
                  {hub.type}
                </span>
                <h4 className="text-xs font-black text-slate-900">{hub.name}</h4>
                <p className="text-[11px] text-slate-600 font-bold">
                  📍 {hub.city} — يستقبل: {hub.category}
                </p>
                <button
                  onClick={() => onChangeTab?.("map")}
                  className="w-full mt-1 py-2 px-3 rounded-xl bg-white border border-slate-200 text-emerald-900 text-xs font-black hover:bg-emerald-50 transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isAr ? "عرض على الخريطة" : "View on Map"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Bottom Reset / View All Button */}
      <div className="text-center pt-2">
        <button
          onClick={() => {
            setActiveFilterTab("all");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-black transition active:scale-95 shadow-md cursor-pointer inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4 text-emerald-300" />
          <span>{isAr ? "عرض جميع التحديثات والمبادرات" : "Show All Updates"}</span>
        </button>
      </div>
    </div>
  );
};

import React from "react";
import { Language, UserStats } from "../types";
import { Bell, ShieldAlert, Sparkles, TrendingUp, Leaf, Award, Recycle, CheckCircle2, ChevronRight, Newspaper } from "lucide-react";

interface UpdatesTabProps {
  userStats: UserStats;
  language: Language;
}

export const UpdatesTab: React.FC<UpdatesTabProps> = ({ userStats, language }) => {
  const isAr = language === "ar";

  const alerts = [
    {
      id: 1,
      titleAr: "حملة استرجاع الإلكترونيات في الرياض",
      titleEn: "Riyadh E-Waste Collection Campaign",
      dateAr: "اليوم",
      dateEn: "Today",
      descAr: "تضامن مع مركز التدوير الوطني لتسليم أجهزتك القديمة وحصولك على ضعف نقاط دوّر.",
      descEn: "Partner with National Recycling Center to hand in e-waste for double DAWR points.",
      tagAr: "تنبيه هامة",
      tagEn: "High Alert",
      priority: "high",
    },
    {
      id: 2,
      titleAr: "افتتاح 50 نقطة تدوير آلي جديدة (RVM)",
      titleEn: "50 New RVM Smart Kiosks Opened",
      dateAr: "قبل يومين",
      dateEn: "2 days ago",
      descAr: "تم إضافة نقاط تجميع العبوات البلاستيكية والألومنيوم في المجمعات التجارية الكبرى.",
      descEn: "Smart bottle and can return machines installed at major shopping malls.",
      tagAr: "تحديث شباك",
      tagEn: "New Feature",
      priority: "normal",
    },
    {
      id: 3,
      titleAr: "توزيع الحاويات الذكية للورق في الأحياء",
      titleEn: "Smart Paper Recycling Bins Distributed",
      dateAr: "هذا الأسبوع",
      dateEn: "This Week",
      descAr: "يمكنك الآن فرز الكرتون والكتب والجرائد في الحاويات الخضراء الجديدة القريبة منك.",
      descEn: "Sort cardboard, books, and newspapers in new green bins near you.",
      tagAr: "تحديث بيئي",
      tagEn: "Eco Update",
      priority: "normal",
    },
  ];

  const newsFeed = [
    {
      id: 1,
      titleAr: "المملكة تعلن عن إستراتيجية تحويل 82% من النفايات عن المرادم بحلول 2035",
      titleEn: "Saudi Arabia Targets 82% Waste Diversion from Landfills by 2035",
      sourceAr: "المركز الوطني لإدارة النفايات (موان)",
      sourceEn: "MWAN National Center",
      readTimeAr: "قراءة 3 دقائق",
      readTimeEn: "3 min read",
    },
    {
      id: 2,
      titleAr: "كيف تساهم إعادة استخدام المنسوجات في خفض انبعاثات الكربون؟",
      titleEn: "How Textile Reuse Cuts Global Carbon Emissions",
      sourceAr: "مجلة الاستدامة والدائرية",
      sourceEn: "Circular Economy Journal",
      readTimeAr: "قراءة 2 دقيقة",
      readTimeEn: "2 min read",
    },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] max-w-md mx-auto px-4 py-4 space-y-4 pb-28 bg-white">
      {/* Page Title Header */}
      <div className="flex items-center justify-between bg-white border border-gray-200 p-3.5 rounded-3xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-800 text-white rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">
              {isAr ? "التحديثات وسجل الأثر البيئي" : "Updates & Eco Impact Log"}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {isAr ? "متابعة التنبيهات والأخبار والدائرية" : "Track alerts, news, and circular metrics"}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
          {userStats.savedProductsCount} {isAr ? "منتج محفوظ" : "Saved"}
        </span>
      </div>

      {/* Impact Summary Metrics */}
      <div className="bg-emerald-800 text-white border border-emerald-700 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-emerald-700/60 pb-2">
          <span className="text-xs font-black flex items-center gap-1.5 text-emerald-100">
            <TrendingUp className="w-4 h-4 text-emerald-300" />
            <span>{isAr ? "أثرك البيئي التراكمي هذا الشهر" : "Your Monthly Eco Impact"}</span>
          </span>
          <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-md text-emerald-200">
            {isAr ? "محدث آلياً" : "Auto Updated"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10">
            <span className="text-lg font-black text-white block">{userStats.co2SavedKg} kg</span>
            <span className="text-[10px] text-emerald-200 font-medium">
              {isAr ? "وفر الانبعاثات" : "CO₂ Saved"}
            </span>
          </div>

          <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10">
            <span className="text-lg font-black text-white block">+{userStats.points}</span>
            <span className="text-[10px] text-emerald-200 font-medium">
              {isAr ? "نقاط دوّر" : "DAWR Points"}
            </span>
          </div>

          <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10">
            <span className="text-lg font-black text-white block">{userStats.savedProductsCount}</span>
            <span className="text-[10px] text-emerald-200 font-medium">
              {isAr ? "منتج منقذ" : "Saved Items"}
            </span>
          </div>
        </div>
      </div>

      {/* Environmental Alerts Section */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-emerald-700" />
          <span>{isAr ? "التنبيهات البيئية العاجلة" : "Urgent Environmental Alerts"}</span>
        </h3>

        <div className="space-y-2.5">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white border border-gray-200 rounded-2xl p-3.5 shadow-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {isAr ? alert.tagAr : alert.tagEn}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {isAr ? alert.dateAr : alert.dateEn}
                </span>
              </div>

              <h4 className="text-xs font-black text-slate-900">
                {isAr ? alert.titleAr : alert.titleEn}
              </h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {isAr ? alert.descAr : alert.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* News Feed Section */}
      <div className="space-y-2.5 pt-2">
        <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
          <Newspaper className="w-4 h-4 text-emerald-700" />
          <span>{isAr ? "مستجدات الاقتصاد الدائري والاستدامة" : "Circular Economy News"}</span>
        </h3>

        <div className="space-y-2">
          {newsFeed.map((news) => (
            <div
              key={news.id}
              className="bg-white border border-gray-200 rounded-2xl p-3 shadow-xs space-y-1 hover:border-emerald-500/50 transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-[10px] text-emerald-800 font-bold">
                <span>{isAr ? news.sourceAr : news.sourceEn}</span>
                <span className="text-slate-400 font-medium">{isAr ? news.readTimeAr : news.readTimeEn}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                {isAr ? news.titleAr : news.titleEn}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import {
  RotateCcw,
  Wrench,
  HeartHandshake,
  Recycle,
  Trash2,
  Plus,
  Sparkles,
  Award,
  Trophy,
  BarChart3,
  Users,
  Lightbulb,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  Send
} from "lucide-react";

interface LandingSectionsProps {
  language: "ar" | "en";
  onStartClick: () => void;
}

export const LandingSections: React.FC<LandingSectionsProps> = ({ language, onStartClick }) => {
  const isAr = language === "ar";

  // Selected Pathway Modal
  const [activePathwayModal, setActivePathwayModal] = useState<{
    title: string;
    icon: any;
    color: string;
    badge: string;
    desc: string;
    details: string;
    tips: string[];
  } | null>(null);

  // Selected Feature Modal
  const [activeFeatureModal, setActiveFeatureModal] = useState<{
    title: string;
    icon: any;
    color: string;
    desc: string;
    details: string;
  } | null>(null);

  // Pathways Data (clean names without "الخيار الأول", "الخيار الثاني" etc.)
  const pathways = [
    {
      id: "reuse",
      title: isAr ? "إعادة الاستخدام" : "Reuse",
      tagline: isAr ? "استخدم المنتج مرة أخرى بطريقة جديدة" : "Reuse the item in a new creative way",
      icon: RotateCcw,
      color: "teal",
      bgClass: "bg-teal-50/70 border-teal-200/80 hover:border-cyan-400",
      iconBg: "bg-teal-600 text-white",
      badgeText: isAr ? "استدامة قصوى (+88 نقطة)" : "Maximum Sustainability (+88 pts)",
      details: isAr
        ? "إعادة استخدام الأغراض والمنتجات بصورتها الأصلية أو تحويلها لأغراض منزلية نافعة توفر أكثر من 90% من انبعاثات التصنيع وتمنع استهلاك طاقة الإنتاج للبدائل الجديدة."
        : "Reusing items in their original form or repurposing them saves over 90% of manufacturing emissions.",
      tips: isAr
        ? [
            "تحويل العلب الزجاجية والصلبة إلى أوعية لحفظ الأغذية أو المنظمات.",
            "إعادة استخدام الأكواب كأصص نباتات منزلية تزين المساحات.",
            "استخدام أقمشة القمصان القديمة كحقائب تسوق صديقة للبيئة."
          ]
        : ["Repurpose jars into kitchen organizers", "Use plastic/ceramic cups as plant pots"]
    },
    {
      id: "repair",
      title: isAr ? "الإصلاح والصيانة" : "Repair",
      tagline: isAr ? "أصلح المنتج وأطل عمره الافتراضي" : "Fix the item to extend its lifespan",
      icon: Wrench,
      color: "sky",
      bgClass: "bg-sky-50/70 border-sky-200/80 hover:border-cyan-400",
      iconBg: "bg-sky-600 text-white",
      badgeText: isAr ? "تمديد العمر الافتراضي (+70 نقطة)" : "Life Extension (+70 pts)",
      details: isAr
        ? "معالجة الأعطال البسيطة واستبدال القطع التالفة بالقطع الأصلية تزيد من العمر التشغيلي للمنتج وتحد من تضخم النفايات الصلبة والإلكترونية."
        : "Fixing simple faults and replacing damaged parts extends life and minimizes electronic waste.",
      tips: isAr
        ? [
            "تدعيم الشواحن والأسلاك بغلاف انكماش حراري مقوى.",
            "استبدال بطاريات الأجهزة القديمة بدلاً من التخلص منها.",
            "صيانة خياطة الملابس والأحذية لدى الورش المحلية المعتمدة."
          ]
        : ["Reinforce cables with heat shrink tubing", "Replace old device batteries"]
    },
    {
      id: "donation",
      title: isAr ? "التبرع والمشاركة" : "Donation",
      tagline: isAr ? "شارك المنتج مع من يحتاجه" : "Share the item with those in need",
      icon: HeartHandshake,
      color: "cyan",
      bgClass: "bg-cyan-50/70 border-cyan-200/80 hover:border-cyan-400",
      iconBg: "bg-cyan-600 text-white",
      badgeText: isAr ? "تكافل مجتمعي (+60 نقطة)" : "Community Impact (+60 pts)",
      details: isAr
        ? "ربط المنتجات الصالحة للاستخدام بالجمعيات الخيرية والمنصات الرسمية (مثل منصة إحسان وكسوة) لتسليمها فوراً للمستفيدين وبناء مجتمع متكافل."
        : "Connect donatable goods directly to official platforms like Ehsan and Kiswa for community benefit.",
      tips: isAr
        ? [
            "غسل وتغليف الملابس والأثاث قبل تسليمها.",
            "استخدام حاويات الجمع الذكية الموزعة في الأحياء.",
            "طلب الاستلام المباشر عبر التطبيقات الخيرية المعتمدة."
          ]
        : ["Clean and package items before donation", "Use smart drop-off bins"]
    },
    {
      id: "recycling",
      title: isAr ? "إعادة التدوير" : "Recycling",
      tagline: isAr ? "دوّر المنتج بالطريقة الصحيحة" : "Recycle the item properly",
      icon: Recycle,
      color: "blue",
      bgClass: "bg-blue-50/70 border-blue-200/80 hover:border-cyan-400",
      iconBg: "bg-blue-600 text-white",
      badgeText: isAr ? "تحويل صناعي (+40 نقطة)" : "Industrial Conversion (+40 pts)",
      details: isAr
        ? "فرز الخامات البلاستيكية والورقية والزجاجية في الحاويات الصفراء أو أجهزة RVM الذكية لإعادتها إلى المصانع وتحويلها إلى حبيبات خام جديدة."
        : "Sort plastics, paper, and metals into RVM machines or yellow recycling bins for factory reprocessing.",
      tips: isAr
        ? [
            "شطف العبوات من بقايا السوائل قبل إيداعها.",
            "فصل الأغطية البلاستيكية والشرائح المعدنية.",
            "إيداع البلاستيك والمعادن في آلات الفرز الذكية RVM حاصدة النقاط."
          ]
        : ["Rinse containers before bin deposit", "Separate plastic caps and metal lids"]
    },
    {
      id: "disposal",
      title: isAr ? "التخلص الآمن" : "Safe Disposal",
      tagline: isAr ? "آخر خيار عندما لا تنفع الخيارات السابقة" : "Last resort when other options fail",
      icon: Trash2,
      color: "slate",
      bgClass: "bg-slate-50 border-slate-200 hover:border-slate-400",
      iconBg: "bg-slate-600 text-white",
      badgeText: isAr ? "المرادم المعتمدة بيئياً" : "Eco-Certified Landfills",
      details: isAr
        ? "عند تعذر كافة خيارات التدوير والتبرع والإصلاح، يتم وضع المادة غير القابلة للفرز في المرادم الآمنة المعالجة بيئياً لحماية التربة والمياه الجوفية."
        : "When items cannot be reused or recycled, place them in eco-certified municipal waste bins.",
      tips: isAr
        ? [
            "عزل المواد الخطرة كالبطاريات عن النفايات العادية.",
            "التأكد من إغلاق أكياس النفايات المحكمة."
          ]
        : ["Isolate hazardous batteries", "Seal waste bags tightly"]
    }
  ];

  // Key Features Data
  const keyFeatures = [
    {
      id: "score",
      title: isAr ? "Circular Score" : "Circular Score",
      desc: isAr
        ? "مؤشر يوضح أفضلية الخيارات المتاحة لكل منتج بناءً على تحليل ذكي"
        : "An intelligent metric showing the best circular pathway score for each product",
      icon: Award,
      color: "cyan",
      details: isAr
        ? "يقيس المحرك الذكي في دَوْر مدى قابلية المادة لإعادة الاستخدام والإصلاح والتبرع والتدوير بمدى يترواح من 0 إلى 100، مما يساعدك على اتخاذ القرار الأنسب بيئياً."
        : "Measures material reusability, repairability, and recyclability from 0 to 100 to guide your choice."
    },
    {
      id: "challenges",
      title: isAr ? "تحديات أسبوعية" : "Weekly Challenges",
      desc: isAr
        ? "تحديات ممتعة تحفزك على اتخاذ قرارات مستدامة"
        : "Fun engaging challenges motivating you to make sustainable decisions",
      icon: Trophy,
      color: "sky",
      details: isAr
        ? "شارك في التحديات المجتمعية كتقليل البلاستيك أحادي الاستخدام وإصلاح المنسوجات القديمة، واحصد الألقاب والشارات البيئية المميزة."
        : "Participate in weekly community challenges to eliminate single-use plastics and earn badges."
    },
    {
      id: "impact",
      title: isAr ? "أثري البيئي" : "My Eco Impact",
      desc: isAr
        ? "تابع تأثيرك الحقيقي على البيئة مع إحصائيات مفصلة"
        : "Track your real-world environmental savings with detailed live stats",
      icon: BarChart3,
      color: "teal",
      details: isAr
        ? "سجل رقمي يحسب الانبعاثات الكربونية المحفوظة (كجم CO2) واللترات المحمية من المياه وعدد الأغراض التي تم تحويل مسارها عن المرادم."
        : "A live personal dashboard tracking saved CO2 emissions, protected water litres, and diverted items."
    },
    {
      id: "points",
      title: isAr ? "نظام النقاط" : "Rewards & Points",
      desc: isAr
        ? "اكسب نقاطاً مع كل قرار مستدام واستبدلها بمكافآت"
        : "Earn points with every eco decision and redeem them for rewards",
      icon: Sparkles,
      color: "blue",
      details: isAr
        ? "تحصل على 25 إلى 88 نقطة دَوْر مع كل عملية فحص واتخاذ مسار دائري، والتي ترفع من مستواك وترتبك في لوحة الشرف الوطنية."
        : "Earn 25 to 88 points per scanned item and climb the national sustainability leaderboard."
    },
    {
      id: "alternatives",
      title: isAr ? "بدائل ذكية" : "Smart Alternatives",
      desc: isAr
        ? "اقتراحات إبداعية لإعادة استخدام المنتجات بطرق جديدة"
        : "Creative upcycling ideas to repurpose items in fresh ways",
      icon: Lightbulb,
      color: "cyan",
      details: isAr
        ? "يقدم التطبيق خطط عمل مرحلية مبتكرة تحول العلب الخزفية والقمصان والأسلاك إلى تحف ومنظمات مفيدة للمنزل والمكتب."
        : "Get instant step-by-step upcycling plans turning old shirts, ceramic cups, and boxes into beautiful organizers."
    },
    {
      id: "community",
      title: isAr ? "مجتمع مستدام" : "Sustainable Community",
      desc: isAr
        ? "تواصل مع أشخاص آخرين يشاركون نفس القيم البيئية"
        : "Connect with like-minded pioneers across the region",
      icon: Users,
      color: "indigo",
      details: isAr
        ? "مجتمع متفاعل يضم أبطال البيئة في المملكة لمشاركة أفكار الابتكار وتبادل الأغراض الصالحة والتكافل بيئياً."
        : "An interactive hub for eco ambassadors to share upcycling tips and exchange goods."
    }
  ];

  return (
    <div className="w-full bg-white space-y-8 pt-2 pb-6">
      {/* 1. Interactive Circular Pathways Section (المسارات الدائرية) */}
      <section className="px-4 space-y-3">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            <Recycle className="w-4 h-4 text-cyan-600" />
            <span>{isAr ? "المسارات الدائرية" : "Circular Pathways"}</span>
          </div>
          <h2 className="text-lg font-black text-slate-900">
            {isAr ? "اختر المسار الأفضل لمنتجك" : "Choose the Best Pathway for Your Product"}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {isAr ? "انقر على أي مسار لاستكشاف كيفية تطبيقه والأثر البيئي المكتسب" : "Click on any pathway to learn more"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {pathways.map((path) => {
            const Icon = path.icon;
            return (
              <div
                key={path.id}
                onClick={() =>
                  setActivePathwayModal({
                    title: path.title,
                    icon: Icon,
                    color: path.color,
                    badge: path.badgeText,
                    desc: path.tagline,
                    details: path.details,
                    tips: path.tips
                  })
                }
                className={`p-3.5 rounded-2xl border ${path.bgClass} transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between gap-3`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2.5 rounded-xl ${path.iconBg} shrink-0 shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <h3 className="text-xs font-black text-slate-900 truncate">
                      {path.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 font-medium truncate">
                      {path.tagline}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1 text-slate-400 hover:text-cyan-700">
                  <Plus className="w-4 h-4 bg-white p-0.5 rounded-full border border-slate-300" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Key Features Grid Section (المميزات الرئيسية) - 3 in row 1, 3 in row 2 */}
      <section className="px-4 space-y-4 pt-2">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isAr ? "المميزات الرئيسية" : "Key Features"}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {isAr ? "كل ما تحتاجه لتصبح بطلاً في الاقتصاد الدائري" : "Everything You Need to Become an Eco Hero"}
          </p>
        </div>

        {/* 3 cards per row Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {keyFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() =>
                  setActiveFeatureModal({
                    title: feat.title,
                    icon: Icon,
                    color: feat.color,
                    desc: feat.desc,
                    details: feat.details
                  })
                }
                className="bg-white border border-cyan-100 hover:border-cyan-400 p-4 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center justify-center group-hover:scale-105 transition">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">
                    {feat.desc}
                  </p>
                </div>
                <div className="pt-1 flex items-center justify-between text-xs font-bold text-teal-800 border-t border-slate-100">
                  <span>{isAr ? "اقرأ المزيد" : "Read More"}</span>
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Official Darker Teal Footer (أسفل الصفحة) */}
      <footer className="mt-10 border-t border-teal-900 bg-gradient-to-b from-teal-900 via-cyan-950 to-slate-950 text-white px-5 pt-8 pb-24 rounded-t-3xl shadow-xl space-y-6">
        <div className="grid grid-cols-3 gap-4 text-start">
          {/* Column 1: الرئيسية */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-cyan-300 tracking-wider">
              {isAr ? "الرئيسية" : "Home"}
            </h4>
            <ul className="space-y-1.5 text-xs font-medium text-slate-300">
              <li className="hover:text-cyan-300 cursor-pointer transition">{isAr ? "عن المشروع" : "About Project"}</li>
              <li className="hover:text-cyan-300 cursor-pointer transition">{isAr ? "التطبيق" : "App Features"}</li>
              <li className="hover:text-cyan-300 cursor-pointer transition">{isAr ? "المساعدة" : "Help Center"}</li>
            </ul>
          </div>

          {/* Column 2: المساعدة */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-cyan-300 tracking-wider">
              {isAr ? "المساعدة" : "Support"}
            </h4>
            <ul className="space-y-1.5 text-xs font-medium text-slate-300">
              <li className="hover:text-cyan-300 cursor-pointer transition">{isAr ? "الأسئلة الشائعة" : "FAQs"}</li>
              <li className="hover:text-cyan-300 cursor-pointer transition">{isAr ? "الدعم الفني" : "Technical Support"}</li>
              <li className="hover:text-cyan-300 cursor-pointer transition">{isAr ? "الشروط والأحكام" : "Terms & Conditions"}</li>
            </ul>
          </div>

          {/* Column 3: تابعنا */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-cyan-300 tracking-wider">
              {isAr ? "تابعنا" : "Follow Us"}
            </h4>
            <ul className="space-y-1.5 text-xs font-medium text-slate-300">
              <li className="hover:text-cyan-300 cursor-pointer transition">{isAr ? "تويتر / X" : "Twitter / X"}</li>
              <li className="hover:text-cyan-300 cursor-pointer transition">{isAr ? "إنستجرام" : "Instagram"}</li>
              <li className="hover:text-cyan-300 cursor-pointer transition">{isAr ? "لينكدإن" : "LinkedIn"}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-teal-800/80 pt-4 text-center">
          <p className="text-xs font-bold text-cyan-200/80">
            {isAr ? "© 2026 DAWR - جميع الحقوق محفوظة" : "© 2026 DAWR - All rights reserved"}
          </p>
        </div>
      </footer>

      {/* Pathway Detail Popup Modal */}
      {activePathwayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-800 text-white">
                  <activePathwayModal.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {activePathwayModal.title}
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-800">
                    {activePathwayModal.badge}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActivePathwayModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              {activePathwayModal.details}
            </p>

            <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl">
              <h4 className="text-[11px] font-black text-slate-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
                <span>{isAr ? "نصائح تطبيق المسار:" : "Action Tips:"}</span>
              </h4>
              <ul className="space-y-1 text-[11px] text-slate-600 font-medium">
                {activePathwayModal.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-800 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                setActivePathwayModal(null);
                onStartClick();
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition cursor-pointer"
            >
              {isAr ? "فحص منتج بهذا المسار" : "Scan Product for this Route"}
            </button>
          </div>
        </div>
      )}

      {/* Feature Detail Popup Modal */}
      {activeFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-800 text-white">
                  <activeFeatureModal.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  {activeFeatureModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveFeatureModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              {activeFeatureModal.details}
            </p>

            <button
              onClick={() => setActiveFeatureModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
            >
              {isAr ? "حسناً، فهمت" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Leaf
} from "lucide-react";

interface LandingSectionsProps {
  language: "ar" | "en";
  onStartClick: () => void;
}

export const LandingSections: React.FC<LandingSectionsProps> = ({ language, onStartClick }) => {
  const isAr = language === "ar";

  // Selected Pathway ID for Inline Details Area (default to first pathway "reuse")
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>("reuse");
  const [hoveredPathwayId, setHoveredPathwayId] = useState<string | null>(null);

  // Selected Feature Modal
  const [activeFeatureModal, setActiveFeatureModal] = useState<{
    title: string;
    icon: any;
    color: string;
    desc: string;
    details: string;
  } | null>(null);

  // 5 Circular Pathways Data
  const circularPathways = [
    {
      id: "reuse",
      stepNumber: "01",
      actionTitleAr: "أطِل عمره",
      actionTitleEn: "Extend Life",
      subTitleAr: "استخدمه من جديد",
      subTitleEn: "Reuse Creative Way",
      badgeTextAr: "استدامة قصوى (+88 نقطة)",
      badgeTextEn: "Max Sustainability (+88 pts)",
      icon: RotateCcw,
      descriptionAr: "إعادة استخدام الأغراض والمنتجات بصورتها الأصلية توفر أكثر من 90% من انبعاثات التصنيع وتمنع استهلاك طاقة الإنتاج للبدائل الجديدة.",
      tipsAr: ["تحويل العلب إلى منظمات بأشكال عصرية.", "استخدام الأكواب القديمة كأصص نباتات.", "استخدام أقمشة القمصان كحقائب صديقة للبيئة."],
      accentColor: "emerald",
      isLastResort: false,
    },
    {
      id: "repair",
      stepNumber: "02",
      actionTitleAr: "أصلحه",
      actionTitleEn: "Repair It",
      subTitleAr: "العطل ليس النهاية",
      subTitleEn: "Fix Faults Early",
      badgeTextAr: "تمديد العمر (+70 نقطة)",
      badgeTextEn: "Life Extension (+70 pts)",
      icon: Wrench,
      descriptionAr: "معالجة الأعطال البسيطة واستبدال القطع التالفة بالقطع الأصلية تزيد العمر التشغيلي وتحد من تضخم النفايات الصلبة والإلكترونية.",
      tipsAr: ["تدعيم الأسلاك والشواحن بغلاف انكماش مقوى.", "استبدال بطاريات الأجهزة القديمة بدلاً من التخلص منها."],
      accentColor: "teal",
      isLastResort: false,
    },
    {
      id: "transfer",
      stepNumber: "03",
      actionTitleAr: "مرّره",
      actionTitleEn: "Pass Along",
      subTitleAr: "امنحه دَوْرًا جديدًا",
      subTitleEn: "Share with Others",
      badgeTextAr: "تكافل مجتمعي (+60 نقطة)",
      badgeTextEn: "Community Sharing (+60 pts)",
      icon: HeartHandshake,
      descriptionAr: "ربط الأغراض الصالحة بالجمعيات الخيرية والمنصات التنموية المعتمدة (مثل منصة إحسان وكسوة) لتسليمها فوراً للمستفيدين وبناء مجتمع متكافل.",
      tipsAr: ["غسل وتغليف الملابس والأثاث قبل تسليمها.", "طلب الاستلام المباشر عبر التطبيقات المعتمدة."],
      accentColor: "cyan",
      isLastResort: false,
    },
    {
      id: "recover",
      stepNumber: "04",
      actionTitleAr: "استعد مواده",
      actionTitleEn: "Recover Materials",
      subTitleAr: "أعد مواده للدورة",
      subTitleEn: "Recycle Correctly",
      badgeTextAr: "تحويل صناعي (+40 نقطة)",
      badgeTextEn: "Material Recovery (+40 pts)",
      icon: Recycle,
      descriptionAr: "فرز الخامات البلاستيكية والورقية والزجاجية في أجهزة RVM الذكية أو الحاويات المخصصة لإعادتها كخامات أولية إلى المصانع.",
      tipsAr: ["شطف العبوات من بقايا السوائل قبل إيداعها.", "إيداع المعادن في آلات الفرز الذكية RVM حاصدة النقاط."],
      accentColor: "blue",
      isLastResort: false,
    },
    {
      id: "disposal",
      stepNumber: "05",
      actionTitleAr: "تخلّص بأمان",
      actionTitleEn: "Safe Disposal",
      subTitleAr: "الخيار الأخير",
      subTitleEn: "Last Resort Only",
      badgeTextAr: "معالجة بيئية آمنة",
      badgeTextEn: "Eco Landfills",
      icon: ShieldAlert,
      descriptionAr: "عند تعذر كافة خيارات التدوير والتبرع والإصلاح، يتم وضع المادة غير القابلة للفرز في الحاويات المخصصة لحماية البيئة والمياه الجوفية.",
      tipsAr: ["عزل المواد الخطرة كالبطاريات عن النفايات العادية.", "التأكد من إحكام إغلاق أكياس النفايات."],
      accentColor: "slate",
      isLastResort: true,
    },
  ];

  // Active Selected Pathway Object
  const activePathway = circularPathways.find((p) => p.id === selectedPathwayId) || circularPathways[0];

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
    <div className="w-full bg-white space-y-12 pt-2 pb-0">
      {/* Container for Middle Content Sections */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 1. DAWR Interactive Circular Journey (كيف يعمل دَوْر؟) */}
        <section id="how-it-works" className="space-y-6 scroll-mt-24">
        {/* Section Header */}
        <div className="text-center space-y-1.5 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isAr ? "لكل منتج دَوْر آخر" : "Every Item Has Another Round"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-extrabold">
            {isAr ? "نحافظ على قيمته أولاً... والتخلص آخر خيار." : "We preserve its value first... Disposal is the absolute last resort."}
          </p>
        </div>

        {/* Desktop Connected Journey Flow (Hidden on Mobile) */}
        <div className="hidden lg:block relative pt-4 pb-2">
          {/* Connector Line Path with DAWR Pulse Glow */}
          <div className="absolute top-16 left-12 right-12 h-1 bg-slate-200 rounded-full z-0 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-500 rounded-full shadow-[0_0_8px_#10b981]" 
              style={{
                width: selectedPathwayId === "disposal" ? "100%" : `${(circularPathways.findIndex(p => p.id === selectedPathwayId) + 1) * 25}%`
              }}
            />
          </div>

          {/* 5 Journey Nodes Layout */}
          <div className="relative z-10 grid grid-cols-5 gap-3">
            {circularPathways.map((path) => {
              const Icon = path.icon;
              const isSelected = selectedPathwayId === path.id;
              const isHovered = hoveredPathwayId === path.id;
              const isDimmed = hoveredPathwayId !== null && !isHovered;

              return (
                <div
                  key={path.id}
                  onClick={() => setSelectedPathwayId(path.id)}
                  onMouseEnter={() => setHoveredPathwayId(path.id)}
                  onMouseLeave={() => setHoveredPathwayId(null)}
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedPathwayId(path.id)}
                  className={`flex flex-col items-center text-center p-4 rounded-3xl border transition-all duration-300 cursor-pointer outline-none relative ${
                    path.isLastResort
                      ? isSelected
                        ? "bg-slate-900 border-slate-700 text-white shadow-xl scale-[1.03]"
                        : "bg-slate-50 border-slate-300 text-slate-700 hover:border-slate-500 hover:bg-slate-100"
                      : isSelected
                      ? "bg-emerald-900 text-white border-emerald-600 shadow-xl scale-[1.03] ring-2 ring-emerald-400/30"
                      : "bg-white border-slate-200 text-slate-900 hover:border-emerald-400 hover:bg-emerald-50/40"
                  } ${isDimmed ? "opacity-75 scale-95" : "opacity-100"} ${
                    isHovered ? "-translate-y-1.5 shadow-md" : ""
                  }`}
                >
                  {/* Step Number Circle */}
                  <div className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center border mb-2 transition-transform duration-300 ${
                    isSelected
                      ? "bg-emerald-400 text-emerald-950 border-white"
                      : path.isLastResort
                      ? "bg-slate-200 text-slate-800 border-slate-300"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}>
                    {path.stepNumber}
                  </div>

                  {/* SVG Vector Icon Node Container */}
                  <div className={`p-3 rounded-2xl mb-3 transition-transform duration-300 ${
                    isHovered ? "scale-110 rotate-3" : "scale-100"
                  } ${
                    isSelected
                      ? "bg-white/10 text-emerald-300"
                      : path.isLastResort
                      ? "bg-slate-200 text-slate-700"
                      : "bg-emerald-100 text-emerald-800"
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className={`text-sm font-black tracking-tight ${isSelected ? "text-white" : "text-slate-900"}`}>
                    {isAr ? path.actionTitleAr : path.actionTitleEn}
                  </h3>
                  <p className={`text-[11px] font-extrabold pt-0.5 ${isSelected ? "text-emerald-200" : "text-emerald-800"}`}>
                    {isAr ? path.subTitleAr : path.subTitleEn}
                  </p>

                  {/* Last Resort Label for Node 05 */}
                  {path.isLastResort && (
                    <span className="mt-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 border border-slate-300">
                      {isAr ? "الخيار الأخير" : "Last Resort"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Vertical Connected Journey Flow (Hidden on Desktop) */}
        <div className="lg:hidden space-y-3">
          {circularPathways.map((path) => {
            const Icon = path.icon;
            const isSelected = selectedPathwayId === path.id;

            return (
              <div
                key={path.id}
                onClick={() => setSelectedPathwayId(path.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  path.isLastResort
                    ? isSelected
                      ? "bg-slate-900 border-slate-700 text-white shadow-md"
                      : "bg-slate-50 border-slate-300 text-slate-800"
                    : isSelected
                    ? "bg-emerald-900 border-emerald-600 text-white shadow-md"
                    : "bg-white border-slate-200 text-slate-900 hover:border-emerald-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-emerald-400 text-emerald-950" : "bg-slate-100 text-slate-700"
                  }`}>
                    {path.stepNumber}
                  </div>

                  <div className={`p-2 rounded-xl shrink-0 ${
                    isSelected ? "bg-white/15 text-emerald-300" : "bg-emerald-50 text-emerald-800"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className={`text-xs sm:text-sm font-black ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {isAr ? path.actionTitleAr : path.actionTitleEn}
                    </h3>
                    <p className={`text-[11px] font-extrabold ${isSelected ? "text-emerald-200" : "text-emerald-800"}`}>
                      {isAr ? path.subTitleAr : path.subTitleEn}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-xs font-black">
                  {path.isLastResort && (
                    <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full border border-slate-300">
                      الخيار الأخير
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Interactive Inline Details Card Area (NO POPUP!) */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-900 text-emerald-300 shadow-xs">
                <activePathway.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    المرحلة {activePathway.stepNumber}
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    {isAr ? activePathway.actionTitleAr : activePathway.actionTitleEn} — {isAr ? activePathway.subTitleAr : activePathway.subTitleEn}
                  </h3>
                </div>
                <span className="text-xs font-extrabold text-teal-800 block pt-0.5">
                  {isAr ? activePathway.badgeTextAr : activePathway.badgeTextEn}
                </span>
              </div>
            </div>

            {/* Direct Primary Interactive Action Button */}
            <button
              onClick={onStartClick}
              className="w-full sm:w-auto py-3 px-7 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-800 hover:to-teal-800 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/20 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer border border-emerald-400/30 group"
            >
              <Sparkles className="w-4 h-4 text-emerald-300 group-hover:rotate-12 transition-transform" />
              <span>{isAr ? "افحص منتجك الآن" : "Scan Item for this Route"}</span>
              <ArrowLeft className={`w-4 h-4 ${isAr ? "rotate-0 group-hover:-translate-x-1" : "rotate-180 group-hover:translate-x-1"} transition-transform`} />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
            {isAr ? activePathway.descriptionAr : activePathway.descriptionAr}
          </p>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{isAr ? "نصائح تطبيق المسار:" : "Action Tips:"}</span>
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-medium pt-1">
              {activePathway.tipsAr.map((tip, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      </div>

      {/* 2. Main Features Section (الأثر الدائري) */}
      <section id="circular-impact" className="w-full py-12 bg-white text-slate-900 px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="w-full max-w-7xl mx-auto space-y-6 text-center">
          <div className="space-y-1.5 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{isAr ? "خصائص المنصة" : "Platform Features"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isAr ? "الأثر الدائري والخصائص" : "Circular Impact & Features"}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-800 font-extrabold">
              {isAr ? "كل ما تحتاجه لتصبح بطلاً في الاقتصاد الدائري" : "Everything You Need to Become an Eco Hero"}
            </p>
          </div>

          {/* Minimal Clean Eco Badges Grid with White/Light Background & Black Text */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-2">
            {keyFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.id}
                  onClick={() => setActiveFeatureModal({
                    title: feat.title,
                    icon: feat.icon,
                    color: feat.color,
                    desc: feat.desc,
                    details: feat.details
                  })}
                  className="flex flex-col items-center justify-center text-center gap-2 p-4 rounded-2xl bg-emerald-50/50 hover:bg-emerald-100/60 border border-emerald-200/80 text-slate-900 font-black text-xs sm:text-sm shadow-2xs transition-all duration-300 cursor-pointer hover:scale-[1.03] group"
                >
                  <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4 text-emerald-700 shrink-0" />
                  </div>
                  <span className="text-slate-900 font-black tracking-tight">{feat.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Official Full-Bleed Darker Teal Footer (التحديثات والروابط) */}
      <footer id="updates" className="w-full mt-16 border-t border-teal-900 bg-gradient-to-b from-teal-900 via-cyan-950 to-slate-950 text-white px-6 sm:px-12 md:px-20 pt-12 pb-24 shadow-xl space-y-8 rounded-none scroll-mt-24">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between border-b border-teal-800/60 pb-6">
            <img src="/assets/dawr_logo_new.png" alt="DAWR Logo" className="h-10 w-auto object-contain bg-white/90 p-1.5 rounded-xl shadow-xs" />
            <span className="text-xs font-bold text-teal-200">
              {isAr ? "منصة الاقتصاد الدائري الذكية في المملكة" : "Saudi Smart Circular Economy Platform"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-6 text-start">
            {/* Column 1: الرئيسية */}
            <div className="space-y-3">
              <h4 className="text-sm sm:text-base font-black text-cyan-300 tracking-wider">
                {isAr ? "الرئيسية" : "Home"}
              </h4>
              <ul className="space-y-2 text-sm font-bold text-white">
                <li className="hover:text-cyan-300 cursor-pointer transition">{isAr ? "عن المشروع" : "About Project"}</li>
                <li className="hover:text-cyan-300 cursor-pointer transition">{isAr ? "التطبيق" : "App Features"}</li>
                <li className="hover:text-cyan-300 cursor-pointer transition">{isAr ? "المساعدة" : "Help Center"}</li>
              </ul>
            </div>

            {/* Column 2: المساعدة */}
            <div className="space-y-3">
              <h4 className="text-sm sm:text-base font-black text-cyan-300 tracking-wider">
                {isAr ? "المساعدة" : "Support"}
              </h4>
              <ul className="space-y-2 text-sm font-bold text-white">
                <li className="hover:text-cyan-300 cursor-pointer transition">{isAr ? "الأسئلة الشائعة" : "FAQs"}</li>
                <li className="hover:text-cyan-300 cursor-pointer transition">{isAr ? "الدعم الفني" : "Technical Support"}</li>
                <li className="hover:text-cyan-300 cursor-pointer transition">{isAr ? "الشروط والأحكام" : "Terms & Conditions"}</li>
              </ul>
            </div>

            {/* Column 3: تابعنا */}
            <div className="space-y-3">
              <h4 className="text-sm sm:text-base font-black text-cyan-300 tracking-wider">
                {isAr ? "تابعنا" : "Follow Us"}
              </h4>
              <ul className="space-y-2 text-sm font-bold text-white">
                <li className="hover:text-cyan-300 cursor-pointer transition">{isAr ? "تويتر / X" : "Twitter / X"}</li>
                <li className="hover:text-cyan-300 cursor-pointer transition">{isAr ? "إنستجرام" : "Instagram"}</li>
                <li className="hover:text-cyan-300 cursor-pointer transition">{isAr ? "لينكدإن" : "LinkedIn"}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-teal-800/80 pt-6 text-center space-y-4">
            <p className="text-sm font-bold text-cyan-200/90">
              {isAr ? "© 2026 DAWR - جميع الحقوق محفوظة" : "© 2026 DAWR - All rights reserved"}
            </p>

            {/* Development Team Badges */}
            <div className="pt-2 space-y-2">
              <span className="text-xs font-black text-emerald-300 uppercase tracking-widest block">
                {isAr ? "فريق التطوير" : "Development Team"}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mx-auto pt-1">
                <span className="bg-teal-900/70 border border-teal-600/50 text-cyan-200 hover:text-white hover:border-emerald-400 px-4 py-1.5 rounded-full text-xs font-black shadow-xs transition-all cursor-default backdrop-blur-xs">
                  {isAr ? "بيان المطيري" : "Bayan Almutiri"}
                </span>
                <span className="bg-teal-900/70 border border-teal-600/50 text-cyan-200 hover:text-white hover:border-emerald-400 px-4 py-1.5 rounded-full text-xs font-black shadow-xs transition-all cursor-default backdrop-blur-xs">
                  {isAr ? "متعب القرني" : "Mutaeb Alqarni"}
                </span>
                <span className="bg-teal-900/70 border border-teal-600/50 text-cyan-200 hover:text-white hover:border-emerald-400 px-4 py-1.5 rounded-full text-xs font-black shadow-xs transition-all cursor-default backdrop-blur-xs">
                  {isAr ? "عبدالعزيز الشمري" : "Abdulaziz Alshammari"}
                </span>
                <span className="bg-teal-900/70 border border-teal-600/50 text-cyan-200 hover:text-white hover:border-emerald-400 px-4 py-1.5 rounded-full text-xs font-black shadow-xs transition-all cursor-default backdrop-blur-xs">
                  {isAr ? "فيصل ال عبدالله" : "Faisal Al Abdullah"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

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

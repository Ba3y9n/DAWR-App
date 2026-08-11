import React, { useState } from "react";
import { UserStats, Language, ActiveTab } from "../types";
import { 
  Sparkles, 
  MapPin, 
  Camera, 
  RefreshCw, 
  Trophy, 
  ArrowUpRight, 
  CheckCircle2, 
  Leaf, 
  Clock, 
  Star, 
  Flame, 
  Award,
  Target,
  Wrench,
  HandHeart,
  PackageCheck,
  LockKeyhole,
  Info,
  Medal,
  X
} from "lucide-react";

interface UpdatesTabProps {
  userStats: UserStats;
  language: Language;
  onChangeTab?: (tab: ActiveTab, categoryFilter?: string) => void;
}

interface Challenge {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  rewardPoints: number;
  iconKey: "wrench" | "handHeart" | "recycle";
  status: "available" | "active" | "completed";
}

export const UpdatesTab: React.FC<UpdatesTabProps> = ({
  userStats,
  language,
  onChangeTab,
}) => {
  const isAr = language === "ar";

  // Local Points override for instant visual feedback on challenge claims
  const [localBonusPoints, setLocalBonusPoints] = useState<number>(0);
  const totalDisplayPoints = userStats.points + localBonusPoints;

  // Active Weekly Challenge Simulation State
  const [weeklyProgress, setWeeklyProgress] = useState<number>(1);
  const [weeklyStatus, setWeeklyStatus] = useState<"available" | "active" | "completed">("active");

  // Other Challenges State
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: "repair_challenge",
      titleAr: "أصلحه",
      titleEn: "Repair It",
      descAr: "أصلح منتجًا بدل استبداله (ملابس، أجهزة، أثاث)",
      descEn: "Repair an item instead of replacing it (clothing, electronics, furniture)",
      rewardPoints: 70,
      iconKey: "wrench",
      status: "available"
    },
    {
      id: "pass_challenge",
      titleAr: "مرّره",
      titleEn: "Pass It On",
      descAr: "امنح منتجًا صالحًا للاستخدام دورًا جديدًا بالتبرع أو الإهداء",
      descEn: "Give a usable item a new round by donating or gifting it",
      rewardPoints: 60,
      iconKey: "handHeart",
      status: "active"
    },
    {
      id: "reclaim_challenge",
      titleAr: "استعد مواده",
      titleEn: "Reclaim Materials",
      descAr: "وجّه منتجًا تالفًا أو خامة للاسترداد والتدوير المناسب",
      descEn: "Route a damaged item or material to proper reclamation and recycling",
      rewardPoints: 40,
      iconKey: "recycle",
      status: "completed"
    }
  ]);

  // Dialog Modal State
  const [dialogData, setDialogData] = useState<{
    isOpen: boolean;
    title: string;
    points: number;
  }>({
    isOpen: false,
    title: "",
    points: 0
  });

  // Icon Mapper
  const iconMap = {
    wrench: Wrench,
    handHeart: HandHeart,
    recycle: RefreshCw
  };

  // Start a challenge
  const handleStartChallenge = (id: string) => {
    setChallenges(prev => 
      prev.map(c => c.id === id ? { ...c, status: "active" } : c)
    );
  };

  // Complete a challenge
  const handleCompleteChallenge = (id: string, reward: number, title: string) => {
    setChallenges(prev => 
      prev.map(c => c.id === id ? { ...c, status: "completed" } : c)
    );
    setLocalBonusPoints(prev => prev + reward);
    setDialogData({
      isOpen: true,
      title: title,
      points: reward
    });
  };

  // Simulate weekly progress scan
  const handleSimulateWeeklyScan = () => {
    if (weeklyStatus !== "active") return;
    const nextVal = weeklyProgress + 1;
    if (nextVal >= 3) {
      setWeeklyProgress(3);
      setWeeklyStatus("completed");
      setLocalBonusPoints(prev => prev + 150);
      setDialogData({
        isOpen: true,
        title: isAr ? "تحدي الأسبوع: أنقذ 3 منتجات من الهدر" : "Weekly Challenge: Save 3 Items from Waste",
        points: 150
      });
    } else {
      setWeeklyProgress(nextVal);
    }
  };

  // Restart weekly challenge for sandbox replay
  const handleResetWeeklyChallenge = () => {
    setWeeklyProgress(0);
    setWeeklyStatus("active");
  };

  // Navigate to Scan
  const handleNavigateToScan = () => {
    onChangeTab?.("scan");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Navigate to Map
  const handleNavigateToMap = () => {
    onChangeTab?.("map");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Navigate to Methodology on Home Tab
  const handleScrollToMethodology = (e: React.MouseEvent) => {
    e.preventDefault();
    onChangeTab?.("home");
    setTimeout(() => {
      document.getElementById("impact-section")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  // Scroll to Choose Your Challenge section
  const handleScrollToChallenges = () => {
    document.getElementById("choose-challenge-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-32 bg-[#F8FAF9] font-sans text-slate-900" dir={isAr ? "rtl" : "ltr"}>
      
      {/* 1. HERO SECTION — تحديات دَوْر */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4 text-right flex-1">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-black border border-emerald-200">
              <Target className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{isAr ? "مركز تحديات دَوْر" : "DAWR Challenges Hub"}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight leading-tight">
              {isAr ? "تحديات دَوْر" : "DAWR Challenges"}
            </h1>
            
            <p className="text-sm sm:text-base text-slate-700 font-medium max-w-xl leading-relaxed">
              {isAr 
                ? "حوّل قراراتك اليومية إلى أثر دائري قابل للقياس."
                : "Turn your daily choices into measurable circular impact."}
            </p>

            {/* Level and Title Indicator */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 bg-emerald-950 text-emerald-100 px-4 py-2 rounded-2xl text-xs font-black border border-emerald-800">
                <Medal className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {isAr ? `المستوى 3 • ${userStats.levelTitle || "صانع أثر"}` : `Level 3 • ${userStats.levelTitle || "Impact Maker"}`}
                </span>
              </div>
              
              <div className="flex-1 w-full sm:max-w-xs space-y-1.5">
                <div className="flex justify-between text-[11px] font-black text-slate-500">
                  <span>{isAr ? "المستوى التالي" : "Next Level"}</span>
                  <span>75%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <div className="h-full bg-emerald-600 rounded-full w-[75%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary Metrics Dashboard */}
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto shrink-0 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col items-center justify-center text-center p-2.5 space-y-1">
              <Flame className="w-5 h-5 text-emerald-600" />
              <span className="text-lg font-black text-slate-900 leading-none">2</span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-500">
                {isAr ? "تحديات نشطة" : "Active"}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-2.5 space-y-1 border-x border-emerald-100">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span className="text-lg font-black text-slate-900 leading-none">{totalDisplayPoints}</span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-500">
                {isAr ? "نقاط دَوْر" : "DAWR Pts"}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-2.5 space-y-1">
              <Trophy className="w-5 h-5 text-emerald-600" />
              <span className="text-lg font-black text-slate-900 leading-none">3</span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-500">
                {isAr ? "مكتملة" : "Completed"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED WEEKLY CHALLENGE */}
      <section className="bg-white border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <Target className="w-7 h-7" />
            </div>
            <div className="space-y-1 text-right">
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-200">
                {isAr ? "تحدي الأسبوع" : "Weekly Challenge"}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {isAr ? "أنقذ 3 منتجات من الهدر" : "Save 3 Items from Waste"}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {weeklyStatus === "active" && (
              <button
                onClick={handleSimulateWeeklyScan}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 text-xs sm:text-sm font-black transition duration-150 active:scale-95 flex items-center justify-center gap-2 border border-emerald-300"
              >
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>{isAr ? "محاكاة فحص منتج" : "Simulate Item Scan"}</span>
              </button>
            )}
            
            {weeklyStatus === "completed" && (
              <button
                onClick={handleResetWeeklyChallenge}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition duration-150 flex items-center justify-center gap-1.5 border border-slate-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isAr ? "إعادة التحدي للرملية" : "Replay Sandbox"}</span>
              </button>
            )}

            {weeklyStatus === "available" ? (
              <button
                onClick={() => setWeeklyStatus("active")}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-950 text-white text-xs sm:text-sm font-black transition duration-150 active:scale-95 shadow-md flex items-center justify-center gap-2 border border-emerald-700 shrink-0"
              >
                <Trophy className="w-4 h-4 text-emerald-300" />
                <span>{isAr ? "ابدأ التحدي" : "Start Challenge"}</span>
              </button>
            ) : weeklyStatus === "active" ? (
              <button
                onClick={handleNavigateToScan}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-950 text-white text-xs sm:text-sm font-black transition duration-150 active:scale-95 shadow-md flex items-center justify-center gap-2 border border-emerald-700 shrink-0"
              >
                <Camera className="w-4 h-4 text-emerald-300" />
                <span>{isAr ? "أكمل التحدي" : "Complete Challenge"}</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-black border border-emerald-200 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? "مكتمل" : "Completed"}</span>
              </span>
            )}
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
          {isAr
            ? "اختر 3 منتجات لم تعد تحتاجها، ودَع دَوْر يحدد لها أفضل مسار دائري."
            : "Choose 3 products you no longer need and let DAWR determine their optimal circular path."}
        </p>

        {/* Dynamic Progress Indicator */}
        <div className="bg-[#F8FAF9] border border-slate-200 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm font-black text-slate-800">
            <span>{isAr ? "تقدم التحدي الأسبوعي:" : "Weekly Challenge Progress:"}</span>
            <span className="text-emerald-800">{weeklyProgress} / 3 {isAr ? "منتجات" : "Items"}</span>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-200/50">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${(weeklyProgress / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Reward and Clock Metadata bar */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-black text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? "+150 نقطة دَوْر" : "+150 DAWR Points"}</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? "4 أيام متبقية" : "4 days remaining"}</span>
          </div>
        </div>
      </section>

      {/* 3. CHALLENGE CARDS — اختر تحديك */}
      <section id="choose-challenge-section" className="space-y-6 scroll-mt-24">
        <div className="space-y-1.5 text-right">
          <h2 className="text-xl sm:text-2xl font-black text-emerald-955 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-700" />
            <span>{isAr ? "اختر تحديك" : "Choose Your Challenge"}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-bold">
            {isAr ? "خطوة صغيرة اليوم، أثر أكبر غدًا." : "Small step today, bigger impact tomorrow."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {challenges.map((feat) => {
            const Icon = iconMap[feat.iconKey];
            return (
              <div
                key={feat.id}
                className="group flex flex-col justify-between p-6 bg-white border border-emerald-100 rounded-3xl shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-emerald-300 transition-all duration-300 relative"
              >
                <div className="space-y-4">
                  {/* Icon Circle */}
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Title and Desc */}
                  <div className="space-y-1.5 text-right">
                    <h3 className="text-lg font-extrabold text-emerald-950 tracking-tight">
                      {isAr ? feat.titleAr : feat.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed">
                      {isAr ? feat.descAr : feat.descEn}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-5 border-t border-slate-100 mt-5">
                  {/* Metadata & Status */}
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-emerald-700 inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-emerald-600" />
                      {isAr ? `+${feat.rewardPoints} نقطة` : `+${feat.rewardPoints} Pts`}
                    </span>
                    
                    {feat.status === "completed" ? (
                      <span className="text-emerald-800 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {isAr ? "مكتمل" : "Completed"}
                      </span>
                    ) : feat.status === "active" ? (
                      <span className="text-emerald-955 inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {isAr ? "قيد التنفيذ" : "Active"}
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        {isAr ? "متاح" : "Available"}
                      </span>
                    )}
                  </div>

                  {/* Call to action */}
                  {feat.status === "available" ? (
                    <button
                      onClick={() => handleStartChallenge(feat.id)}
                      className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-950 font-black text-xs transition border border-slate-200/90 cursor-pointer text-center"
                    >
                      {isAr ? "ابدأ التحدي" : "Start Challenge"}
                    </button>
                  ) : feat.status === "active" ? (
                    <button
                      onClick={() => handleCompleteChallenge(feat.id, feat.rewardPoints, isAr ? feat.titleAr : feat.titleEn)}
                      className="w-full py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-black text-xs transition shadow-md border border-emerald-700 cursor-pointer text-center"
                    >
                      {isAr ? "إكمال التحدي" : "Complete Challenge"}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs border border-slate-200/50 cursor-default text-center"
                    >
                      {isAr ? "مكتمل بنجاح" : "Completed"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. COMMUNITY IMPACT */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-1.5 text-right">
          <h2 className="text-xl sm:text-2xl font-black text-emerald-955 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-700" />
            <span>{isAr ? "أثرنا هذا الأسبوع" : "Our Impact This Week"}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-bold">
            {isAr ? "قرارات صغيرة تصنع أثرًا جماعيًا." : "Small choices make collective impact."}
          </p>
        </div>

        {/* 3 KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#F8FAF9] border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 block leading-tight">342</span>
              <span className="text-xs text-slate-600 font-bold">
                {isAr ? "منتجًا مُنقذًا من الهدر" : "Products saved from waste"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#F8FAF9] border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 block leading-tight">186</span>
              <span className="text-xs text-slate-600 font-bold">
                {isAr ? "قرار إعادة استخدام أو إصلاح" : "Reuse or repair decisions"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#F8FAF9] border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <Leaf className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-slate-900 leading-tight">≈128 kg CO₂e</span>
                <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                  {isAr ? "تقديري" : "Est."}
                </span>
              </div>
              <span className="text-xs text-slate-600 font-bold">
                {isAr ? "أثر مناخي متجنب" : "Avoided carbon impact"}
              </span>
            </div>
          </div>
        </div>

        {/* Footnote & Info methodology link */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-600 font-bold">
            {isAr 
              ? "تُحتسب تقديرات الأثر وفق منهجية قياس دَوْر." 
              : "Impact estimates are calculated according to DAWR methodology."}
          </span>
          <a
            href="#impact-section"
            onClick={handleScrollToMethodology}
            className="inline-flex items-center gap-1 font-black text-emerald-800 hover:text-emerald-950 transition hover:underline"
          >
            <Info className="w-4 h-4" />
            <span>{isAr ? "كيف نقيس الأثر؟" : "How do we measure impact?"}</span>
          </a>
        </div>
      </section>

      {/* 5. MY ACHIEVEMENTS */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-1.5 text-right">
          <h2 className="text-xl sm:text-2xl font-black text-emerald-955 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-700" />
            <span>{isAr ? "إنجازاتي" : "My Achievements"}</span>
          </h2>
        </div>

        {/* Compact stats row */}
        <div className="flex flex-wrap items-center gap-6 bg-[#F8FAF9] border border-slate-200 p-4 rounded-2xl text-xs font-black text-slate-700">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span>3 {isAr ? "تحديات مكتملة" : "Completed Challenges"}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? "يومان متتاليان" : "2-Day Streak"}</span>
          </div>
        </div>

        {/* Badge List */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Badge 1: First Circular Decision */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 transition shadow-2xs">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0 border border-emerald-100">
              <Award className="w-5.5 h-5.5" />
            </div>
            <div className="text-right">
              <h4 className="text-sm font-black text-slate-900">
                {isAr ? "أول قرار دائري" : "First Circular Choice"}
              </h4>
              <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {isAr ? "مفتوحة" : "Unlocked"}
              </span>
            </div>
          </div>

          {/* Badge 2: Product Savior */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 transition shadow-2xs">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0 border border-emerald-100">
              <PackageCheck className="w-5.5 h-5.5" />
            </div>
            <div className="text-right">
              <h4 className="text-sm font-black text-slate-900">
                {isAr ? "منقذ المنتجات" : "Product Savior"}
              </h4>
              <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {isAr ? "مفتوحة" : "Unlocked"}
              </span>
            </div>
          </div>

          {/* Badge 3: Repair Hero (Locked) */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 transition shadow-2xs relative group cursor-help">
            <div className="w-11 h-11 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 shrink-0 border border-slate-300">
              <LockKeyhole className="w-5.5 h-5.5" />
            </div>
            <div className="text-right">
              <h4 className="text-sm font-black text-slate-400">
                {isAr ? "بطل الإصلاح" : "Repair Hero"}
              </h4>
              <span className="text-[10px] text-slate-500 font-extrabold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {isAr ? "مقفلة" : "Locked"}
              </span>
            </div>

            {/* Custom Premium CSS Tooltip */}
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-56 p-2.5 rounded-xl bg-slate-900 text-white text-xs font-black shadow-xl border border-slate-800 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-30 text-center leading-normal">
              {isAr ? "أكمل 5 قرارات إصلاح للحصول على هذه الشارة." : "Complete 5 repair decisions to unlock this badge."}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
            </div>
          </div>
        </div>
      </section>

      {/* 6. NEXT BEST ACTION */}
      <section className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 text-right">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-extrabold text-emerald-950">
                {isAr ? "خطوتك التالية" : "Your Next Step"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                {weeklyStatus === "completed" 
                  ? (isAr ? "أكملت جميع التحديات الأسبوعية النشطة!" : "You have completed all active weekly challenges!")
                  : (isAr ? "أنت على بُعد منتج واحد من إكمال تحدي الأسبوع." : "You are 1 product away from completing the weekly challenge.")}
              </p>
            </div>
          </div>

          <div>
            {weeklyStatus === "completed" ? (
              <button
                onClick={handleScrollToChallenges}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-950 text-white text-xs sm:text-sm font-black transition duration-150 active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isAr ? "اختر تحديًا آخر" : "Choose another challenge"}</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-300" />
              </button>
            ) : (
              <button
                onClick={handleNavigateToScan}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white text-xs sm:text-sm font-black transition duration-150 active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isAr ? "افحص منتجًا الآن" : "Scan an Item Now"}</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-300" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 7. MAP SUPPORT */}
      <section className="bg-emerald-950 border border-emerald-800 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 text-right text-white">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-extrabold text-emerald-300">
                {isAr ? "جهات تساعدك على إكمال التحدي" : "Hubs helping you complete challenges"}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
                {isAr ? "اعثر على أقرب جهة للإصلاح أو التبرع أو الاسترداد." : "Find the nearest repair, donation, or reclamation hub."}
              </p>
            </div>
          </div>

          <div>
            <button
              onClick={handleNavigateToMap}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 text-xs sm:text-sm font-black transition duration-150 active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer border border-white/20"
            >
              <span>{isAr ? "استكشف خريطة دَوْر" : "Explore DAWR Map"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. COMPLETION DIALOG MODAL */}
      {dialogData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 text-center relative">
            
            {/* Close Button */}
            <button
              onClick={() => setDialogData(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900">
                {isAr ? "أحسنت! أكملت التحدي" : "Well Done! Challenge Completed"}
              </h3>
              <p className="text-xs text-slate-500 font-bold truncate max-w-xs mx-auto">
                {dialogData.title}
              </p>
            </div>

            {/* Points Reward Box */}
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-5 py-2.5 rounded-2xl text-emerald-900 font-black text-base shadow-sm">
              <Star className="w-5 h-5 text-emerald-600" />
              <span>+{dialogData.points} {isAr ? "نقطة دَوْر" : "DAWR Pts"}</span>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-xs mx-auto">
              {isAr 
                ? "أضفنا نقاط الجائزة لحسابك، ونشكر إسهامك في استمرار مسارات المنتجات الدائرية."
                : "Reward points have been added to your account. Thank you for championing circularity."}
            </p>

            <button
              onClick={() => {
                setDialogData(prev => ({ ...prev, isOpen: false }));
                onChangeTab?.("profile");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full py-3.5 rounded-2xl bg-emerald-900 hover:bg-emerald-950 text-white font-black text-xs sm:text-sm transition shadow-md border border-emerald-700 cursor-pointer"
            >
              {isAr ? "شاهد أثري" : "View My Impact"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

import React from "react";
import { UserStats, UserProfile, Language } from "../types";
import { User, Award, Sparkles, Globe, ShieldCheck, Settings, Bookmark, LogIn, LogOut, RefreshCw, UserCheck, Recycle, Leaf, ArrowRight } from "lucide-react";

interface ProfileTabProps {
  userStats: UserStats;
  currentUserProfile: UserProfile | null;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  userStats,
  currentUserProfile,
  onOpenAuthModal,
  onSignOut,
  language,
  onToggleLanguage,
}) => {
  const isAr = language === "ar";

  const historyItems = currentUserProfile?.scansHistory?.length
    ? currentUserProfile.scansHistory
    : [
        {
          productName: isAr ? "قميص قطني أبيض" : "White Cotton Shirt",
          material: isAr ? "نسيج قطني" : "Cotton Fabric",
          actionTaken: isAr ? "تم التبرع لمنصة إحسان" : "Donated via Ehsan",
          circularScore: 92,
          pointsEarned: 50,
          date: isAr ? "أمس" : "Yesterday",
        },
        {
          productName: isAr ? "صندوق كرتون مقوى" : "Cardboard Packaging",
          material: isAr ? "كرتون ألياف" : "Fiber Packaging",
          actionTaken: isAr ? "فرز حاوية الورق" : "Paper Recycling Bin",
          circularScore: 88,
          pointsEarned: 45,
          date: isAr ? "قبل 3 أيام" : "3 days ago",
        },
      ];

  const displayName = currentUserProfile?.fullName?.trim() 
    || currentUserProfile?.email?.split('@')[0] 
    || (isAr ? "عضو دَوْر" : "DAWR Member");

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32 bg-[#F8FAF9] font-sans text-slate-900" dir={isAr ? "rtl" : "ltr"}>
      
      {/* 1. Header SaaS Welcome Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-2 bg-emerald-700 rounded-t-3xl" />
        
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-900 text-white border-2 border-emerald-500 flex items-center justify-center shrink-0 shadow-md font-black text-2xl sm:text-3xl">
            {displayName.charAt(0)}
          </div>

          <div className="space-y-1 text-right">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-3xl font-black text-emerald-950 tracking-tight">
                {isAr ? `مرحبًا ${displayName} 👋` : `Welcome ${displayName} 👋`}
              </h1>
              <span className="text-xs font-black text-emerald-900 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isAr ? "حساب موثق" : "Verified Account"}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-bold">
              {currentUserProfile?.email || (isAr ? "حسابك الشخصي في منصة دَوْر للاقتصاد الدائري" : "Your DAWR Circular Economy Profile")}
            </p>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-black border border-emerald-200 mt-1">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>{currentUserProfile?.levelTitle || userStats.levelTitle}</span>
            </div>
          </div>
        </div>

        {/* Account Switcher / Auth Actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
          {currentUserProfile ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuthModal}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-2xs border border-slate-200"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isAr ? "تبديل الحساب" : "Switch Account"}</span>
              </button>
              <button
                onClick={onSignOut}
                className="px-4 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-black transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isAr ? "تسجيل الخروج" : "Sign Out"}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-950 text-white text-xs sm:text-sm font-black transition active:scale-95 flex items-center justify-center gap-2 shadow-md cursor-pointer border border-emerald-700"
            >
              <LogIn className="w-4.5 h-4.5 text-emerald-300" />
              <span>{isAr ? "إنشاء حساب / تسجيل الدخول" : "Create Account / Sign In"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Responsive Stats Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">


        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 text-center space-y-1.5 shadow-2xs">
          <span className="text-xs font-bold text-slate-600 block">{isAr ? "المنتجات المحفوظة" : "Diverted Items"}</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-950 block">
            {currentUserProfile?.savedProductsCount ?? userStats.savedProductsCount}
          </span>
          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
            {isAr ? "محمية من المرادم" : "Diverted from Landfill"}
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 text-center space-y-1.5 shadow-2xs">
          <span className="text-xs font-bold text-slate-600 block">{isAr ? "الأثر البيئي (CO2)" : "Saved CO2 Emissions"}</span>
          <span className="text-2xl sm:text-3xl font-black text-teal-950 block">
            {userStats.co2SavedKg} <span className="text-xs font-bold">kg</span>
          </span>
          <span className="text-[10px] font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md inline-block">
            {isAr ? "انبعاثات محمية" : "Saved Emissions"}
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 text-center space-y-1.5 shadow-2xs">
          <span className="text-xs font-bold text-slate-600 block">{isAr ? "المستوى الحالي" : "Current Rank"}</span>
          <span className="text-sm sm:text-base font-black text-emerald-950 block pt-1 truncate">
            {currentUserProfile?.levelTitle || userStats.levelTitle}
          </span>
          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
            {isAr ? "بطل الاستدامة" : "Eco Ambassador"}
          </span>
        </div>
      </div>

      {/* 3. Main Dashboard Content Area: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (1 col): Settings & Account Preferences */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-extrabold text-slate-900">
                {isAr ? "إعدادات التطبيق والهوية" : "Settings & Preferences"}
              </h3>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe className="w-4.5 h-4.5 text-emerald-700" />
                <span className="text-xs font-bold text-slate-800">
                  {isAr ? "لغة التطبيق (Language)" : "App Language"}
                </span>
              </div>
              <button
                onClick={onToggleLanguage}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-black border border-slate-200 transition active:scale-95 cursor-pointer"
              >
                {isAr ? "العربية (AR)" : "English (EN)"}
              </button>
            </div>

            {/* Account Status Info */}
            <div className="space-y-2 text-xs">
              <span className="text-slate-500 font-bold block">{isAr ? "معلومات الحساب:" : "Account Info:"}</span>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
                <p className="font-extrabold text-slate-800">
                  {isAr ? "الاسم: " : "Name: "}<strong className="text-emerald-950">{displayName}</strong>
                </p>
                <p className="font-extrabold text-slate-800">
                  {isAr ? "البريد: " : "Email: "}<strong className="text-emerald-950">{currentUserProfile?.email || (isAr ? "زائر" : "Guest")}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns (2 cols): My Circular Decisions & History Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-extrabold text-emerald-950 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-emerald-700" />
                <span>{isAr ? "قراراتي الدائرية وسجل الفحص" : "My Saved Circular Decisions"}</span>
              </h3>
              <span className="text-xs font-black text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {historyItems.length} {isAr ? "عنصر محفوظ" : "items"}
              </span>
            </div>

            {/* Circular Items List */}
            {historyItems.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Recycle className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">
                  {isAr ? "لا توجد قرارات دائرية محفوظة بعد. ابدأ بفحص منتجاتك الآن!" : "No saved circular decisions yet. Start scanning your products!"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {historyItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200/80 hover:border-emerald-300 rounded-2xl p-4 transition shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">
                          {item.productName}
                        </h4>
                        {item.circularScore && (
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-200">
                            Score: {item.circularScore}/100
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-900 font-bold">
                        {item.actionTaken || item.material}
                      </p>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                      <span className="text-xs font-black text-emerald-900 bg-white border border-emerald-200 px-3 py-1 rounded-xl shadow-2xs">
                        +{item.pointsEarned || 50} {isAr ? "نقطة" : "pts"}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">
                        {item.date || "مؤخراً"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

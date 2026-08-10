import React from "react";
import { UserStats, UserProfile, Language } from "../types";
import { User, Award, Sparkles, Globe, ShieldCheck, Settings, Bookmark, LogIn, LogOut, RefreshCw, UserCheck } from "lucide-react";

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

  const displayName = currentUserProfile?.fullName || (isAr ? "مستكشف دَوْر" : "DAWR Explorer");

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] max-w-md mx-auto px-4 py-4 space-y-4 pb-28 bg-white">
      {/* Profile Card Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white border-2 border-emerald-600 flex items-center justify-center shrink-0 shadow-sm font-black text-xl">
              {displayName.charAt(0)}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black text-slate-900">
                  أهلاً، {displayName} 👋
                </h2>
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              </div>
              <p className="text-xs text-slate-500 font-bold">
                {currentUserProfile?.email || (isAr ? "حساب موثق في منصة دَوْر" : "Verified DAWR Account")}
              </p>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-extrabold border border-emerald-300 mt-1">
                <Award className="w-3 h-3 text-emerald-700" />
                <span>{currentUserProfile?.levelTitle || userStats.levelTitle}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Switcher / Sign In Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {currentUserProfile ? (
            <div className="flex items-center gap-2 w-full justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <UserCheck className="w-4 h-4" />
                <span>{isAr ? "الحساب المستقل نشط" : "Profile Active"}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuthModal}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold transition active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAr ? "تبديل الحساب" : "Switch User"}</span>
                </button>
                <button
                  onClick={onSignOut}
                  className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-extrabold transition active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isAr ? "خروج" : "Sign Out"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500 font-bold">
                {isAr ? "أنت تتصفح كزائر حالياً" : "Browsing as Guest"}
              </span>
              <button
                onClick={onOpenAuthModal}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black transition active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{isAr ? "تسجيل الدخول / حساب جديد" : "Sign In / Register"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-center text-xs">
          <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-200 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-bold block">
              {isAr ? "نقاط الاقتصاد الدائري" : "Circular Points"}
            </span>
            <span className="text-base font-black text-emerald-800">
              +{currentUserProfile?.points ?? userStats.points}
            </span>
          </div>

          <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-200 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-bold block">
              {isAr ? "المنتجات المحفوظة من الردم" : "Diverted Products"}
            </span>
            <span className="text-base font-black text-emerald-800">
              {currentUserProfile?.savedProductsCount ?? userStats.savedProductsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 space-y-3 shadow-xs">
        <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 border-b border-gray-100 pb-2">
          <Settings className="w-4 h-4 text-emerald-700" />
          <span>{isAr ? "إعدادات التطبيق والهوية" : "Application & Preferences"}</span>
        </h3>

        {/* Language Toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-slate-800">
              {isAr ? "لغة التطبيق (Language)" : "App Language"}
            </span>
          </div>
          <button
            onClick={onToggleLanguage}
            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-900 text-xs font-black border border-slate-200 transition active:scale-95 cursor-pointer"
          >
            {isAr ? "العربية (AR)" : "English (EN)"}
          </button>
        </div>
      </div>

      {/* Saved Products History */}
      <div className="space-y-2.5 pt-1">
        <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
          <Bookmark className="w-4 h-4 text-emerald-700" />
          <span>{isAr ? "سجل المنتجات والمسارات المحفوظة للمستخدم" : "Saved Circular Products History"}</span>
        </h3>

        <div className="space-y-2">
          {historyItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-2xl p-3 shadow-xs flex items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-slate-900">
                  {item.productName}
                </h4>
                <p className="text-[10px] text-emerald-800 font-bold">
                  {item.actionTaken || item.material}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-black text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 block">
                  +{item.pointsEarned || 50}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {item.date || "مؤخراً"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

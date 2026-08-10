import React from "react";
import { UserStats } from "../types";
import { Award, Sparkles, Leaf, X, ShieldCheck, Trophy, Flame } from "lucide-react";

interface LeaderboardDrawerProps {
  userStats: UserStats;
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardDrawer: React.FC<LeaderboardDrawerProps> = ({
  userStats,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const COMMUNITY_LEADERS = [
    { rank: 1, name: "سارة العتيبي 🥇", points: "450+", saved: "38 منتجاً", badge: "سفير بطل الاستدامة" },
    { rank: 2, name: "أحمد الغامدي 🥈", points: "320+", saved: "29 منتجاً", badge: "خبير التدوير" },
    { rank: 3, name: "أنت (حسابك) 🥉", points: `+${userStats.points}`, saved: `${userStats.savedProductsCount} منتجاً`, badge: userStats.levelTitle },
    { rank: 4, name: "مريم الشمري", points: "115+", saved: "12 منتجاً", badge: "مبتدئ الاستدامة" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">إحصائيات نقاط دوّر - Leaderboard</h3>
              <p className="text-xs text-slate-400">إنجازك الأسبوعي في منع النفايات</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* User Score Card */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-2">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">مستواك الحالي</span>
            <div className="text-3xl font-black text-amber-300 flex items-center justify-center gap-1">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span>+{userStats.points}</span>
            </div>
            <p className="text-xs text-slate-300">
              أنقذت <strong className="text-emerald-300 font-bold">{userStats.savedProductsCount} منتجاً</strong> هذا الشهر ومنعت وصولها للمطامر!
            </p>
          </div>

          {/* Community Leaderboard List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>أوائل المساهمين هذا الشهر:</span>
            </h4>

            <div className="space-y-2">
              {COMMUNITY_LEADERS.map((leader) => (
                <div
                  key={leader.rank}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs transition ${
                    leader.rank === 3
                      ? "bg-emerald-950/60 border-emerald-400 shadow-md shadow-emerald-950/30"
                      : "bg-slate-950/60 border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-amber-400">
                      {leader.rank}
                    </span>
                    <div>
                      <h5 className="font-bold text-white flex items-center gap-1">
                        <span>{leader.name}</span>
                      </h5>
                      <span className="text-[10px] text-slate-400 block">{leader.badge}</span>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="font-black text-amber-300 text-sm block">{leader.points}</span>
                    <span className="text-[10px] text-emerald-400">{leader.saved}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

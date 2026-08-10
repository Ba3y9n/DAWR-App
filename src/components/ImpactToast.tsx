import React, { useEffect } from "react";
import { Sparkles, Award } from "lucide-react";

interface ImpactToastProps {
  pointsGained: number;
  pathwayTitle: string;
  onClose: () => void;
  isAr?: boolean;
}

export const ImpactToast: React.FC<ImpactToastProps> = ({ pointsGained, pathwayTitle, onClose, isAr = true }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-16 inset-x-4 max-w-md mx-auto z-50 animate-bounce-short">
      <div className="bg-emerald-800 text-white p-3.5 rounded-2xl shadow-xl border border-emerald-600 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-900 flex items-center justify-center shrink-0 border border-emerald-700">
          <Sparkles className="w-5 h-5 text-amber-300" />
        </div>

        <div className="flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
            <Award className="w-4 h-4" />
            <span>
              {isAr ? `تهانينا! كسبت +${pointsGained} نقطة دوّر` : `Congratulations! +${pointsGained} DAWR points`}
            </span>
          </div>
          <p className="text-xs text-emerald-100 line-clamp-1 font-medium">
            {isAr ? `اعتمــدت: ${pathwayTitle}` : `Adopted: ${pathwayTitle}`}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 px-2.5 text-emerald-100 hover:text-white bg-emerald-950 rounded-lg text-xs font-bold border border-emerald-800"
        >
          {isAr ? "تم" : "OK"}
        </button>
      </div>
    </div>
  );
};

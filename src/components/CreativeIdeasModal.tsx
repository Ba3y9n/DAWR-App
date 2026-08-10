import React, { useState, useEffect } from "react";
import { CreativeIdea } from "../types";
import { Lightbulb, X, Sparkles, Wrench, Clock, Check, Copy } from "lucide-react";

interface CreativeIdeasModalProps {
  productName: string;
  material: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CreativeIdeasModal: React.FC<CreativeIdeasModalProps> = ({
  productName,
  material,
  isOpen,
  onClose,
}) => {
  const [ideas, setIdeas] = useState<CreativeIdea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/creative-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, material }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ideas && data.ideas.length > 0) {
            setIdeas(data.ideas);
          } else {
            setIdeas([
              {
                title: "حقيبة تسوق قماشية متينة",
                description: "قص الجزء العلوي والأكمام لخياطة حقيبة يد بيئية تحل محل الأكياس البلاستيكية.",
                difficulty: "سهل (10 دقائق)",
                materialsNeeded: "مقص، إبرة وخيط بسيط"
              },
              {
                title: "غطاء وسادة ديكوري أنيق",
                description: "تحويل الجزء المزود بأزرار إلى غطاء وسادة فريد يسهل فتحه وغسله بدون خياطة معقدة.",
                difficulty: "متوسط (15 دقيقة)",
                materialsNeeded: "مقص وحشوة وسادة"
              },
              {
                title: "فوط تنظيف ومسح أسطح فائقة الامتصاص",
                description: "تقطيع القماش لمربعات متساوية واستخدامها لمسح الزجاج والشاشات بدون إحداث خدوش.",
                difficulty: "سهل جداً (3 دقائق)",
                materialsNeeded: "مقص فقط"
              }
            ]);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load creative ideas:", err);
          setLoading(false);
        });
    }
  }, [isOpen, productName, material]);

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden relative">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 text-white dark:bg-emerald-900 dark:text-emerald-300 rounded-xl">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">أفكار وبدائل إبداعية (DIY)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[220px]">{productName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-emerald-700 dark:text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">جاري ابتـكار أفكار إبداعية عبر Gemini AI...</p>
            </div>
          ) : (
            ideas.map((idea, index) => (
              <div
                key={index}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{idea.title}</span>
                  </h4>
                  <button
                    onClick={() => handleCopy(`${idea.title}\n${idea.description}`, index)}
                    className="p-1.5 text-slate-400 hover:text-emerald-800 dark:hover:text-emerald-400 transition"
                    title="نسخ الفكرة"
                  >
                    {copiedIndex === index ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {idea.description}
                </p>

                <div className="flex items-center gap-3 pt-2 text-[11px] border-t border-slate-200 dark:border-slate-900 font-bold">
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>الصعوبة: {idea.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <Wrench className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                    <span>المطلوب: {idea.materialsNeeded}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

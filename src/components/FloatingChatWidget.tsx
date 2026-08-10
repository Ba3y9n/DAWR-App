import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, User, MessageSquare, Minimize2, Maximize2 } from "lucide-react";
import { Language } from "../types";

interface FloatingChatWidgetProps {
  language: Language;
  productName?: string;
}

interface Message {
  sender: "user" | "gemini";
  text: string;
}

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
  language,
  productName = "منتج عام",
}) => {
  const isAr = language === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const defaultWelcome = isAr
    ? `مرحباً بك! أنا مساعد دَوْر الذكي. كيف يمكنني مساعدتك في الفرز، التبرع، أو إصلاح المنتجات اليوم؟`
    : `Welcome! I am your DAWR Smart Assistant. How can I help you with sorting, donation, or repair today?`;

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "gemini",
      text: defaultWelcome,
    },
  ]);
  const [inputText, setInputText] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isSending, isOpen]);

  const quickPrompts = isAr
    ? [
        "كيف أجهز الملابس للتبرع؟",
        "طريقة إصلاح الشواحن القديمة",
        "تحويل قميص إلى حقيبة تسوق",
        "رموز الفرز الذكي للبلاستيك",
      ]
    : [
        "How to prepare clothes for donation?",
        "How to repair old chargers?",
        "Turn a t-shirt into a tote bag",
        "Plastic recycling numbers guide",
      ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isSending) return;

    const userMsg = query.trim();
    if (!textToSend) setInputText("");
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg, productName }),
      });
      const data = await res.json();

      let reply = data.reply;
      if (!reply) {
        reply = isAr
          ? `• افصل أجزاء المنتج وقُم بتنظيفه جيداً.\n• سلّم المنسوجات أو البلاستيك لأقرب نقطة فرز ذكية.`
          : `• Clean and separate item components.\n• Drop off at the nearest smart collection point.`;
      }

      setMessages((prev) => [...prev, { sender: "gemini", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "gemini",
          text: isAr
            ? "نصيحة دَوْر: الحفاظ على جودة الأغراض وتخزينها في مكان جاف يضمن إعادة استخدامها لأطول فترة ممكنة."
            : "DAWR Tip: Storing items dry preserves their condition for donation and upcycling.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white rounded-3xl shadow-2xl border border-emerald-200/90 flex flex-col overflow-hidden transition-all duration-300 ${
            isExpanded
              ? "bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:w-[500px] h-[85vh] max-h-[700px]"
              : "bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[500px] max-h-[75vh]"
          }`}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>{isAr ? "مساعد دَوْر الذكي" : "DAWR Smart Assistant"}</span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </h3>
                <p className="text-[11px] text-emerald-200 font-medium">
                  {isAr ? "دليل الفرز، التبرع والإصلاح المباشر" : "Live Sorting & Circular Guidance"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800/60 rounded-xl transition cursor-pointer"
                title={isExpanded ? (isAr ? "تصغير" : "Minimize") : (isAr ? "تكبير" : "Expand")}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800/60 rounded-xl transition cursor-pointer"
                title={isAr ? "إغلاق" : "Close"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="p-4 overflow-y-auto space-y-3.5 flex-1 bg-slate-50/50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    m.sender === "user"
                      ? "bg-emerald-800 text-white"
                      : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                  }`}
                >
                  {m.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] font-medium whitespace-pre-line shadow-2xs ${
                    m.sender === "user"
                      ? "bg-emerald-800 text-white rounded-tr-none font-semibold"
                      : "bg-white border border-gray-200 text-slate-900 rounded-tl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold animate-pulse px-2 pt-1">
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? "جاري كتابة الإجابة..." : "Thinking..."}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Bar */}
          <div className="px-3 py-2 bg-slate-100/80 border-t border-gray-200 overflow-x-auto flex gap-1.5 shrink-0">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="whitespace-nowrap text-[11px] font-bold bg-white text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-500 border border-gray-200 px-2.5 py-1 rounded-lg transition active:scale-95 shrink-0 cursor-pointer shadow-2xs"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-gray-200 bg-white flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                isAr
                  ? "اكتب سؤالك بخصوص الفرز أو الإصلاح..."
                  : "Ask about sorting or repair..."
              }
              className="flex-1 bg-slate-50 border border-gray-300 focus:border-emerald-700 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none placeholder:text-slate-400 font-medium"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isSending}
              className="p-2.5 bg-emerald-800 hover:bg-emerald-900 text-white disabled:opacity-40 rounded-xl font-bold transition active:scale-95 cursor-pointer shadow-xs shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button anchored at Bottom Right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 p-3.5 sm:p-4 rounded-full bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group flex items-center gap-2.5 border-2 border-emerald-400/40 cursor-pointer"
        title={isAr ? "مساعد دَوْر الذكي" : "DAWR AI Assistant"}
      >
        <div className="relative">
          <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-300 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-emerald-950 animate-ping" />
        </div>
        <span className="hidden md:inline font-black text-xs pr-1">
          {isAr ? "مساعد دَوْر" : "DAWR Assistant"}
        </span>
      </button>
    </>
  );
};

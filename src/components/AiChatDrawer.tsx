import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Bot, User, HelpCircle, Lightbulb } from "lucide-react";
import { Language } from "../types";

interface AiChatDrawerProps {
  productName?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isTabMode?: boolean;
  language: Language;
}

interface Message {
  sender: "user" | "gemini";
  text: string;
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({
  productName = "منتج عام",
  isOpen = true,
  onClose,
  isTabMode = false,
  language,
}) => {
  const isAr = language === "ar";

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
    scrollToBottom();
  }, [messages, isSending]);

  if (!isTabMode && !isOpen) return null;

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
          ? `• افصل أجزاء المنتج وقُم بتنظيفه جيدا.\n• سلّم المنسوجات أو البلاستيك لأقرب نقطة فرز ذكية.`
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

  const content = (
    <div className="flex flex-col h-full w-full bg-white border-0 md:border md:border-gray-200 md:rounded-3xl overflow-hidden shadow-xs">
      {/* 1. Header */}
      <div className="p-3.5 sm:p-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-800 text-white rounded-2xl shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>{isAr ? "مساعد دَوْر الذكي" : "DAWR Smart Assistant"}</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {isAr ? "استشارات دائرية ودليل الفرز والإصلاح" : "Circular Guidance & Repair Directions"}
            </p>
          </div>
        </div>
        {!isTabMode && onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Message History Area */}
      <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-white">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                m.sender === "user"
                  ? "bg-emerald-800 text-white"
                  : "bg-emerald-100 text-emerald-900 border border-emerald-200"
              }`}
            >
              {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] font-medium whitespace-pre-line shadow-2xs ${
                m.sender === "user"
                  ? "bg-emerald-800 text-white rounded-tr-none font-semibold"
                  : "bg-slate-50 border border-gray-200 text-slate-900 rounded-tl-none"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold animate-pulse px-2 pt-1">
            <Sparkles className="w-4 h-4" />
            <span>{isAr ? "جاري كتابة الإجابة المباشرة..." : "Generating smart response..."}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Suggestions Bar */}
      <div className="px-3.5 py-2.5 bg-gray-50 border-t border-gray-200 overflow-x-auto flex gap-2 no-scrollbar shrink-0">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="whitespace-nowrap text-[11px] font-bold bg-white text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-500 border border-gray-200 px-3 py-1.5 rounded-xl transition active:scale-95 shrink-0 cursor-pointer shadow-2xs"
          >
            {p}
          </button>
        ))}
      </div>

      {/* 4. Bottom Sticky Input Bar */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-white flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={
            isAr
              ? "اكتب سؤالك بخصوص الفرز، التبرع، أو الإصلاح..."
              : "Ask a question about sorting, donation, or repair..."
          }
          className="flex-1 bg-gray-50 border border-gray-300 focus:border-emerald-700 text-slate-900 text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none placeholder:text-slate-400 font-medium"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isSending}
          className="p-3 bg-emerald-800 hover:bg-emerald-900 text-white disabled:opacity-40 rounded-xl font-bold transition active:scale-95 cursor-pointer shadow-xs shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (isTabMode) {
    return (
      <div className="flex flex-col h-full w-full max-w-md mx-auto">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-2 sm:p-4">
      <div className="w-full max-w-md h-[85vh] sm:h-[80vh]">{content}</div>
    </div>
  );
};

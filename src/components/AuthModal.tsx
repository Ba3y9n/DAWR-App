import React, { useState } from "react";
import { UserProfile, Language } from "../types";
import { signUpUser, signInUser, signInWithGoogle } from "../lib/firebase";
import { User, Mail, Lock, LogIn, UserPlus, Sparkles, X, CheckCircle2, AlertCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
  language: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  language,
}) => {
  const isAr = language === "ar";
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      if (mode === "signup") {
        if (!fullName.trim()) {
          setErrorMsg(isAr ? "يرجى كتابة الاسم الكامل" : "Please enter your full name");
          setIsLoading(false);
          return;
        }
        if (!email.trim() || !password.trim()) {
          setErrorMsg(isAr ? "يرجى تعبئة جميع الحقول المطلوبة" : "Please fill all required fields");
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg(isAr ? "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل" : "Password must be at least 6 characters.");
          setIsLoading(false);
          return;
        }
        const profile = await signUpUser(email, password, fullName);
        if (profile) {
          onSuccess(profile);
          onClose();
        }
      } else {
        if (!email.trim() || !password.trim()) {
          setErrorMsg(isAr ? "يرجى أدخل البريد وكلمة المرور" : "Please enter email and password");
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg(isAr ? "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل" : "Password must be at least 6 characters.");
          setIsLoading(false);
          return;
        }
        const profile = await signInUser(email, password);
        if (profile) {
          onSuccess(profile);
          onClose();
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setErrorMsg(isAr ? "البريد الإلكتروني مستخدم بالفعل. يمكنك تسجيل الدخول." : "Email already in use. Please sign in.");
      } else if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        setErrorMsg(isAr ? "بيانات الدخول غير صحيحة" : "Invalid login credentials.");
      } else if (err.code === "auth/weak-password") {
        setErrorMsg(isAr ? "كلمة المرور ضعيفة (6 أحرف على الأقل)" : "Password must be at least 6 characters.");
      } else {
        setErrorMsg(isAr ? "حدث خطأ أثناء الاتصال. يرجى المحاولة لاحقاً." : "Authentication error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setIsLoading(true);
    try {
      const profile = await signInWithGoogle();
      if (profile) {
        onSuccess(profile);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(isAr ? "تعذر تسجيل الدخول عبر Google." : "Google sign in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (name: string, demoEmail: string) => {
    setErrorMsg("");
    setIsLoading(true);
    try {
      // Try sign in or sign up
      let profile = null;
      try {
        profile = await signInUser(demoEmail, "Dawr123456!");
      } catch {
        profile = await signUpUser(demoEmail, "Dawr123456!", name);
      }
      if (profile) {
        onSuccess(profile);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(isAr ? "تعذر تسجيل دخول الحساب التجريبي" : "Demo login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-2xl bg-slate-100 text-slate-500 hover:text-slate-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {mode === "signup"
              ? isAr
                ? "إنشاء حساب في دَوْر"
                : "Create DAWR Account"
              : isAr
              ? "تسجيل الدخول إلى دَوْر"
              : "Sign In to DAWR"}
          </h2>
          <p className="text-xs text-slate-500 font-medium max-w-xs">
            {isAr
              ? "احفظ نقاطك الاستدامية وسجل الفرز والحلول الدائرية في حسابك الخاص."
              : "Track your circular points and personalized sustainability history."}
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="mb-5 bg-emerald-50/80 border border-emerald-200/80 p-3 rounded-2xl space-y-2">
          <span className="text-[11px] font-extrabold text-emerald-900 block text-center">
            {isAr ? "⚡ دخول سريع بنقرة واحدة (حسابات تجريبية):" : "⚡ Fast Demo Account Switch:"}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("بيان المطيري", "bayan.almutairi@dawr.sa")}
              className="py-2 px-3 rounded-xl bg-white border border-emerald-300 text-slate-900 text-xs font-black hover:bg-emerald-100 transition shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isAr ? "بيان المطيري" : "Bayan Al-Mutairi"}</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("فهد الدوسري", "fahad.aldosari@dawr.sa")}
              className="py-2 px-3 rounded-xl bg-white border border-emerald-300 text-slate-900 text-xs font-black hover:bg-emerald-100 transition shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isAr ? "فهد الدوسري" : "Fahad Al-Dosari"}</span>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-700 block">
                {isAr ? "الاسم الكامل" : "Full Name"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isAr ? "أدخل الاسم الكامل" : "Enter Full Name"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 pr-9 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <User className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-extrabold text-slate-700 block">
              {isAr ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 pr-9 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-extrabold text-slate-700 block">
              {isAr ? "كلمة المرور" : "Password"}
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 pr-9 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {mode === "signup" ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{isLoading ? (isAr ? "جاري إنشاء الحساب..." : "Creating Account...") : isAr ? "إنشاء حساب الآن" : "Create Account"}</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? (isAr ? "جاري الدخول..." : "Signing In...") : isAr ? "تسجيل الدخول" : "Sign In"}</span>
              </>
            )}
          </button>
        </form>

        {/* Mode Switch Footer */}
        <div className="mt-5 text-center text-xs font-bold border-t border-slate-100 pt-4">
          {mode === "signup" ? (
            <p className="text-slate-600">
              {isAr ? "لديك حساب بالفعل؟ " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg("");
                }}
                className="text-emerald-800 font-extrabold underline cursor-pointer"
              >
                {isAr ? "تسجيل الدخول" : "Sign In"}
              </button>
            </p>
          ) : (
            <p className="text-slate-600">
              {isAr ? "ليس لديك حساب؟ " : "Don't have an account? "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg("");
                }}
                className="text-emerald-800 font-extrabold underline cursor-pointer"
              >
                {isAr ? "إنشاء حساب جديد" : "Create New Account"}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

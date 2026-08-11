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
  const [mode, setMode] = useState<"signup" | "signin">("signup");
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
          setErrorMsg(isAr ? "يرجى كتابة الاسم" : "Please enter your name");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-2xl bg-slate-100 text-slate-500 hover:text-slate-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Welcome Header */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-emerald-300 flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
            {isAr ? "مرحبًا بك في دور" : "Welcome to DAWR"}
          </h2>
          <p className="text-xs text-slate-600 font-bold max-w-xs mx-auto">
            {isAr ? "منصة الاقتصاد الدائري والاستدامة الذكية" : "Smart Circular Economy & Sustainability Platform"}
          </p>
        </div>

        {/* Tab Switcher: إنشاء حساب vs تسجيل الدخول */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl mb-5 border border-slate-200/80">
          <button
            type="button"
            onClick={() => { setMode("signup"); setErrorMsg(""); }}
            className={`py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              mode === "signup"
                ? "bg-emerald-900 text-white shadow-xs"
                : "text-slate-700 hover:text-emerald-900"
            }`}
          >
            {isAr ? "إنشاء حساب" : "Sign Up"}
          </button>

          <button
            type="button"
            onClick={() => { setMode("signin"); setErrorMsg(""); }}
            className={`py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              mode === "signin"
                ? "bg-emerald-900 text-white shadow-xs"
                : "text-slate-700 hover:text-emerald-900"
            }`}
          >
            {isAr ? "تسجيل الدخول" : "Sign In"}
          </button>
        </div>

        {/* Fast Demo Accounts Bar */}
        <div className="mb-4 bg-emerald-50/80 border border-emerald-200/80 p-3 rounded-2xl space-y-2">
          <span className="text-[11px] font-extrabold text-emerald-900 block text-center">
            {isAr ? "⚡ تجربة فورية باسم المستخدم الحقيقي:" : "⚡ Fast Demo Account Login:"}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("بيان", "bayan@dawr.app")}
              className="py-2 px-3 rounded-xl bg-white border border-emerald-300 text-slate-900 text-xs font-black hover:bg-emerald-100 transition shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isAr ? "بيان" : "Bayan"}</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("متعب القرني", "mutaeb@dawr.app")}
              className="py-2 px-3 rounded-xl bg-white border border-emerald-300 text-slate-900 text-xs font-black hover:bg-emerald-100 transition shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isAr ? "متعب القرني" : "Mutaeb"}</span>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <div className="space-y-1 text-right">
              <label className="text-xs font-extrabold text-slate-800 block">
                {isAr ? "الاسم" : "Name"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isAr ? "اكتب اسمك (مثال: بيان)" : "Enter your name"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3.5 pr-9 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
                />
                <User className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
              </div>
            </div>
          )}

          <div className="space-y-1 text-right">
            <label className="text-xs font-extrabold text-slate-800 block">
              {isAr ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3.5 pr-9 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
            </div>
          </div>

          <div className="space-y-1 text-right">
            <label className="text-xs font-extrabold text-slate-800 block">
              {isAr ? "كلمة المرور" : "Password"}
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3.5 pr-9 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-emerald-900 hover:bg-emerald-950 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 border border-emerald-700 mt-2"
          >
            {mode === "signup" ? (
              <>
                <UserPlus className="w-4 h-4 text-emerald-300" />
                <span>{isLoading ? (isAr ? "جاري إنشاء الحساب..." : "Creating Account...") : (isAr ? "إنشاء الحساب" : "Create Account")}</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-emerald-300" />
                <span>{isLoading ? (isAr ? "جاري الدخول..." : "Signing In...") : (isAr ? "تسجيل الدخول" : "Sign In")}</span>
              </>
            )}
          </button>
        </form>

        {/* Social Logins: Google & Apple */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center space-y-3">
          <span className="text-[11px] font-extrabold text-slate-500 block">
            {mode === "signup"
              ? (isAr ? "أو التسجيل باستخدام" : "Or sign up with")
              : (isAr ? "أو المتابعة باستخدام" : "Or continue with")}
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-extrabold flex items-center justify-center gap-2 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            {/* Apple Button */}
            <button
              type="button"
              onClick={() => handleDemoLogin("مستخدم Apple", "apple.user@dawr.app")}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.13-9.74-1.93-14.76-6.17-3.38-2.88-7.23-7.58-11.54-14.1-6.17-9.37-11.12-20.09-14.86-32.17-3.74-12.08-5.61-23.75-5.61-35.01 0-15.61 3.95-28.53 11.84-38.76 7.89-10.23 17.65-15.48 29.28-15.75 4.67 0 9.87 1.15 15.6 3.45 5.73 2.3 9.86 3.45 12.39 3.45 2.12 0 6.36-1.19 12.72-3.56 6.36-2.37 11.75-3.48 16.17-3.33 13.09.64 23.47 5.54 31.13 14.7-11.69 7.07-17.41 16.73-17.15 28.98.26 9.69 3.94 17.84 11.05 24.45 7.11 6.61 15.61 10.3 25.5 11.07-2.61 7.7-6.07 15.5-10.38 23.39zM119.22 31.08c0-7.3 2.65-14.31 7.95-21.03 5.3-6.72 12.07-10.66 20.31-11.83.26 1.03.39 1.93.39 2.7 0 7.33-2.65 14.41-7.95 21.24-5.3 6.83-12.16 10.8-20.58 11.91-.04-.9-.12-1.89-.12-2.99z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>
        </div>

        {/* Bottom Switch Link */}
        <div className="mt-4 text-center text-xs font-bold border-t border-slate-100 pt-3">
          {mode === "signup" ? (
            <p className="text-slate-600">
              {isAr ? "لديك حساب بالفعل؟ " : "Already have an account? "}
              <button
                type="button"
                onClick={() => { setMode("signin"); setErrorMsg(""); }}
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
                onClick={() => { setMode("signup"); setErrorMsg(""); }}
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

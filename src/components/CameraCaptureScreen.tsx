import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, RefreshCw, Sparkles, Zap, Search, HelpCircle, AlertCircle, CheckCircle2, ArrowRight, Recycle, Leaf, Target } from "lucide-react";
import { PRESET_SAMPLES } from "../data/presetSamples";
import { Language, ActiveTab } from "../types";
import { LandingSections } from "./LandingSections";

interface CameraCaptureScreenProps {
  onAnalyzeSample: (presetId: string) => void;
  onAnalyzeCustom: (imageBase64?: string, textPrompt?: string) => void;
  isAnalyzing: boolean;
  analysisError?: string | null;
  language: Language;
  activeTab?: ActiveTab;
  onNavigateToScan?: () => void;
}

export const CameraCaptureScreen: React.FC<CameraCaptureScreenProps> = ({
  onAnalyzeSample,
  onAnalyzeCustom,
  isAnalyzing,
  analysisError,
  language,
  activeTab = "home",
  onNavigateToScan,
}) => {
  const isAr = language === "ar";
  const [useLiveCamera, setUseLiveCamera] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [manualText, setManualText] = useState<string>("");
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanSectionRef = useRef<HTMLDivElement>(null);

  const scrollToScan = () => {
    if (scanSectionRef.current) {
      scanSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Initialize or stop camera stream
  useEffect(() => {
    if (useLiveCamera) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          setCameraStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setCameraError(null);
        })
        .catch((err) => {
          console.warn("Camera access failed or unavailable:", err);
          setCameraError(
            isAr
              ? "عذراً، تعذر الوصول للكاميرا الحية. يمكنك رفع صورة أو تجربة العينات السريعة."
              : "Camera access unavailable. You can upload an image or choose a preset sample."
          );
          setUseLiveCamera(false);
        });
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }
    }

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [useLiveCamera]);

  const compressImage = (base64Str: string, maxDim = 800): Promise<string> => {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.onload = () => {
          try {
            let targetW = img.width;
            let targetH = img.height;
            if (targetW > maxDim || targetH > maxDim) {
              if (targetW > targetH) {
                targetH = Math.round((targetH * maxDim) / targetW);
                targetW = maxDim;
              } else {
                targetW = Math.round((targetW * maxDim) / targetH);
                targetH = maxDim;
              }
            }
            const canvas = document.createElement("canvas");
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, targetW, targetH);
              resolve(canvas.toDataURL("image/jpeg", 0.80));
            } else {
              resolve(base64Str);
            }
          } catch {
            resolve(base64Str);
          }
        };
        img.onerror = () => resolve(base64Str);
        img.src = base64Str;
      } catch {
        resolve(base64Str);
      }
    });
  };

  // Capture current frame from live camera video feed safely
  const handleCaptureFromCamera = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      setCameraError(null);
      if (useLiveCamera && videoRef.current && cameraStream) {
        const maxDim = 800;
        let targetW = videoRef.current.videoWidth || 640;
        let targetH = videoRef.current.videoHeight || 480;
        if (targetW > maxDim || targetH > maxDim) {
          if (targetW > targetH) {
            targetH = Math.round((targetH * maxDim) / targetW);
            targetW = maxDim;
          } else {
            targetW = Math.round((targetW * maxDim) / targetH);
            targetH = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, targetW, targetH);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.80);
          setCapturedImage(dataUrl);
          onAnalyzeCustom(dataUrl, manualText || undefined);
        } else {
          setCameraError(
            isAr
              ? "تعذر التقاط صورة من الكاميرا الحية."
              : "Failed to capture frame from live camera."
          );
        }
      } else if (capturedImage) {
        // User already uploaded or captured a photo
        onAnalyzeCustom(capturedImage, manualText || undefined);
      } else {
        // Prompt user to select photo or open camera
        setCameraError(
          isAr
            ? "يرجى اختيار صورة من جهازك أو فتح الكاميرا الحية لالتقاط صورة أولاً."
            : "Please select an image file or open the live camera first."
        );
      }
    } catch (err: any) {
      console.error("Camera capture error:", err);
      setCameraError(
        isAr
          ? "حدث خطأ أثناء التقاط الكاميرا. يرجى محاولة رفع صورة بدلاً عن ذلك."
          : "Camera capture failed. Please try uploading an image instead."
      );
    }
  };

  // Handle uploaded photo from file input safely with event prevention & error boundaries
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setCameraError(
          isAr
            ? "عذراً، يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP)."
            : "Please select a valid image file (JPG, PNG, WEBP)."
        );
        return;
      }

      setCameraError(null);
      const reader = new FileReader();

      reader.onerror = () => {
        setCameraError(
          isAr
            ? "تعذر قراءة ملف الصورة. يرجى المحاولة مرة أخرى."
            : "Failed to read image file. Please try again."
        );
      };

      reader.onloadend = async () => {
        try {
          const rawResult = reader.result as string;
          if (!rawResult) return;
          const compressed = await compressImage(rawResult, 800);
          setCapturedImage(compressed);
          onAnalyzeCustom(compressed, manualText || undefined);
        } catch (err: any) {
          console.error("Compression error:", err);
          setCameraError(
            isAr
              ? "حدث خطأ أثناء ضغط الصورة. يرجى تجربة صورة أخرى."
              : "Image processing error. Please try another image."
          );
        }
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("File upload error:", err);
      setCameraError(
        isAr
          ? "حدث خطأ غير متوقع أثناء رفع الملف."
          : "Unexpected error during file upload."
      );
    }
  };

  const handleSampleClick = (presetId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedSampleId(presetId);
    const sampleObj = PRESET_SAMPLES.find((s) => s.id === presetId);
    if (sampleObj?.sampleImage) {
      setCapturedImage(sampleObj.sampleImage);
    }
    onAnalyzeSample(presetId);
  };

  // If we are in "scan" tab mode, render the Smart Scan Camera & Preset Demo Samples page
  if (activeTab === "scan") {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 bg-white">
        {/* Smart Scan Header Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-700/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-inner">
              <Camera className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                {isAr ? "الفحص الذكي وتوجيه المنتج" : "AI Smart Product Scan & Guidance"}
              </h2>
              <p className="text-xs text-emerald-200 font-medium">
                {isAr ? "صوّر منتجك بالكاميرا أو ارفع صورة للحصول على التحليل الدائري المباشر" : "Snap a photo or upload an image for instant circular AI analysis"}
              </p>
            </div>
          </div>
        </div>

        {/* Camera Viewfinder Frame */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-800/30 bg-slate-900 shadow-xl aspect-[4/3] max-w-3xl mx-auto flex flex-col items-center justify-center group">
          {/* Decorative Camera Target Corners */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg z-10"></div>
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg z-10"></div>
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg z-10"></div>
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-lg z-10"></div>

          {/* Laser Scanner Animation */}
          {(isAnalyzing || useLiveCamera) && (
            <div className="absolute inset-x-0 top-0 h-full pointer-events-none z-30 overflow-hidden">
              <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_0_25px_#10b981,0_0_12px_#06b6d4] animate-scan z-30" />
              {isAnalyzing && (
                <>
                  <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[1px] z-20" />
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-slate-950/90 border border-emerald-500/60 text-emerald-300 text-[11px] font-black tracking-wide flex items-center gap-2 shadow-xl z-30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{isAr ? "مسح بصري مباشر بالليزر..." : "Live Laser Scanning..."}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Camera View Area */}
          {useLiveCamera ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : capturedImage ? (
            <div className="relative w-full h-full">
              <img src={capturedImage} alt="Captured Product" className="w-full h-full object-cover" />
              {!isAnalyzing && (
                <button
                  onClick={() => setCapturedImage(null)}
                  className="absolute top-3 right-3 bg-slate-900/80 border border-slate-700 text-white p-2 rounded-full hover:bg-slate-800 transition shadow-md cursor-pointer z-10"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : isAnalyzing ? (
            <div className="relative w-full h-full">
              <img
                src="https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=500&auto=format&fit=crop&q=80"
                alt="Scanning Product"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 z-0">
              <div className="w-16 h-16 rounded-2xl bg-emerald-800/20 border border-emerald-500/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <Camera className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-white">
                  {isAr ? "التقط صورة أو قم برفع ملف" : "Take a photo or upload a file"}
                </p>
              </div>

              {/* Toggle Camera / Upload Buttons */}
              <div className="flex items-center gap-2 pt-2 z-10">
                <button
                  type="button"
                  onClick={() => setUseLiveCamera(true)}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 font-bold shadow-sm cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-100" />
                  <span>{isAr ? "الكاميرا الحية" : "Live Camera"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs bg-teal-600 hover:bg-teal-700 text-white border border-teal-500 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 font-bold shadow-sm cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-teal-100" />
                  <span>{isAr ? "رفع صورة" : "Upload File"}</span>
                </button>
              </div>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {cameraError && (
            <div className="absolute bottom-2 inset-x-2 bg-amber-950/90 border border-amber-500/40 text-amber-200 text-[11px] p-2 rounded-xl text-center z-20">
              {cameraError}
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-col items-center justify-center space-y-3 max-w-3xl mx-auto">
          {analysisError && (
            <div className="w-full bg-rose-50 border border-rose-300 text-rose-800 p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p>{analysisError}</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => handleCaptureFromCamera(e)}
            disabled={isAnalyzing}
            className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 hover:from-emerald-900 hover:to-teal-900 text-white font-black text-base sm:text-lg shadow-xl shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
                <span>{isAr ? "جاري تحليل الخامات بالذكاء الاصطناعي..." : "Analyzing Materials with Gemini AI..."}</span>
              </>
            ) : (
              <>
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <span>{isAr ? "صوّر منتجك وتعرّف على المسار الدائري" : "Scan Item & Discover Route Path"}</span>
              </>
            )}
          </button>

          {/* Text Search Input */}
          <div className="w-full relative">
            <input
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && manualText.trim()) {
                  onAnalyzeCustom(undefined, manualText);
                }
              }}
              placeholder={isAr ? "أو اكتب اسم المنتج أو الملاحظات هنا..." : "Or type product name here..."}
              className="w-full bg-white border border-emerald-200 focus:border-emerald-600 text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-3 pl-10 focus:outline-none placeholder:text-slate-400 font-medium shadow-xs"
            />
            <button
              onClick={() => manualText.trim() && onAnalyzeCustom(undefined, manualText)}
              className="absolute left-3 top-3 text-slate-400 hover:text-emerald-700 p-1 cursor-pointer"
              title={isAr ? "بحث وتحليل" : "Search"}
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Demo Samples Grid Section */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>{isAr ? "عينات للتجربة السريعة" : "Quick Demo Samples"}</span>
            </h3>
            <span className="text-xs text-emerald-800 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {isAr ? "اختر منتجاً للتجربة المباشرة بنقرة واحدة" : "One-click Demo Analysis"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {PRESET_SAMPLES.map((sample) => {
              const isSelected = selectedSampleId === sample.id;
              return (
                <button
                  key={sample.id}
                  onClick={() => handleSampleClick(sample.id)}
                  disabled={isAnalyzing}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer text-center space-y-2 group ${
                    isSelected
                      ? "bg-emerald-50 border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
                      : "bg-white border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/40"
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <img src={sample.sampleImage} alt={sample.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="w-full">
                    <h4 className="text-xs font-black text-slate-900 truncate">{sample.name}</h4>
                    <span className="text-[10px] text-emerald-800 font-extrabold block truncate pt-0.5">
                      {sample.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Otherwise render Home View with Hero, How DAWR Works, Recent Decisions Grid, and Landing Sections
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12 bg-white">
      {/* 1. Full-Width Hero Portal Banner */}
      <section className="w-full relative min-h-[46vh] sm:min-h-[52vh] flex flex-col justify-center rounded-3xl overflow-hidden shadow-xl border border-emerald-200/60 bg-emerald-950 px-6 sm:px-12 md:px-16 py-10 sm:py-14">
        {/* Vivid Sustainable Nature Background Image */}
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-95 transform scale-105"
        />
        {/* Soft Light Overlay for Clear & Vivid Background View */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/45 via-emerald-900/30 to-black/20" />

        {/* Right-Aligned Text & Action Buttons Container */}
        <div className="relative z-10 flex flex-col items-start text-right space-y-4 max-w-3xl">
          {/* Brand Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/85 border border-emerald-400/40 text-emerald-200 text-xs font-black tracking-wide shadow-md backdrop-blur-xs">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? "لا ترمِه... أعطه دَوْرًا آخر" : "Don't throw it away... Give it another round"}</span>
          </div>

          {/* Main Value Proposition Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
            {isAr ? "قبل أن ترميه... دَوْر يعرف قيمته" : "Before throwing it... DAWR knows its value"}
          </h1>

          {/* Explanatory Paragraph */}
          <p className="text-sm sm:text-base md:text-lg text-white font-extrabold leading-relaxed max-w-2xl drop-shadow-md">
            {isAr
              ? "صوّر أي منتج، ودع الذكاء الاصطناعي يحلل حالته وخامته ويقترح أفضل مسار دائري له قبل أن يتحول إلى نفايات."
              : "Scan any product with AI to analyze its condition and materials, discovering the optimum circular route."}
          </p>

          {/* Circular Pathways Pill List */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold text-emerald-100">
            <span className="bg-emerald-900/80 border border-emerald-500/40 px-3 py-1 rounded-xl shadow-xs">إعادة استخدام</span>
            <span>•</span>
            <span className="bg-emerald-900/80 border border-emerald-500/40 px-3 py-1 rounded-xl shadow-xs">إصلاح</span>
            <span>•</span>
            <span className="bg-emerald-900/80 border border-emerald-500/40 px-3 py-1 rounded-xl shadow-xs">تبرع</span>
            <span>•</span>
            <span className="bg-emerald-900/80 border border-emerald-500/40 px-3 py-1 rounded-xl shadow-xs">إعادة بيع</span>
            <span>•</span>
            <span className="bg-emerald-900/80 border border-emerald-500/40 px-3 py-1 rounded-xl shadow-xs">تدوير</span>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-3 pt-3 w-full sm:w-auto">
            <button
              onClick={() => onNavigateToScan?.()}
              className="py-3.5 px-7 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40"
            >
              <Camera className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{isAr ? "افحص منتجًا الآن" : "Scan Product Now"}</span>
            </button>

            <button
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="py-3.5 px-6 rounded-2xl bg-emerald-950/80 hover:bg-emerald-950 text-white border border-emerald-400/40 font-bold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xs"
            >
              <span>{isAr ? "شاهد كيف يعمل" : "See How It Works"}</span>
              <ArrowRight className={`w-4 h-4 ${isAr ? "rotate-180" : "rotate-0"}`} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Phase 5 — How DAWR Works Stepper Section (كيف يعمل دَوْر؟) */}
      <section id="how-it-works" className="space-y-6 pt-4 scroll-mt-24">
        <div className="text-center space-y-1.5 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAr ? "دليل الفحص" : "Scanning Guide"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isAr ? "كيف يعمل دَوْر؟" : "How DAWR Works"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {isAr ? "4 خطوات ذكية للوصول إلى أفضل قرار دائري وحفظ قيمة المنتجات" : "4 simple AI-powered steps to make optimum circular decisions"}
          </p>
        </div>

        {/* 4-Step Stepper Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all space-y-3 relative group">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center border border-emerald-300">
                01
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <Camera className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{isAr ? "صوّر المنتج" : "Snap Item"}</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1">
                {isAr ? "التقط صورة بالكاميرا الحية أو ارفع ملف من جهازك." : "Take a live photo or upload an image file."}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all space-y-3 relative group">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-900 font-black text-xs flex items-center justify-center border border-teal-300">
                02
              </span>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{isAr ? "يحلله الذكاء الاصطناعي" : "AI Vision Analysis"}</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1">
                {isAr ? "نموذج Gemini يكتشف الخامات وحالة المنتج الدقيقة." : "Gemini Vision detects item materials and exact state."}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all space-y-3 relative group">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center border border-emerald-300">
                03
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <Recycle className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{isAr ? "دَوْر يقارن المسارات" : "Compare Pathways"}</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1">
                {isAr ? "مقارنة خيارات إعادة الاستخدام، الإصلاح، التبرع، والتدوير." : "Evaluates reuse, repair, donation, and recycling options."}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all space-y-3 relative group">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center border border-amber-300">
                04
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{isAr ? "تحصل على أفضل قرار" : "Get Best Decision"}</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1">
                {isAr ? "تنفيذ المسار الأنسب وحصد نقاط استدامة حسابك." : "Execute the recommended route & claim DAWR points."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Phase 6 — Previous Decisions Section (آخر قراراتك الدائرية) */}
      <section id="previous-decisions" className="space-y-5 pt-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-700" />
              <span>{isAr ? "آخر قراراتك الدائرية" : "Your Recent Circular Decisions"}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium pt-0.5">
              {isAr ? "قرارات ونماذج حقيقية لمؤشرات الاستدامة والمسارات البيئية المنفذة" : "Real examples of circular score indexes and executed eco routes"}
            </p>
          </div>
          <button
            onClick={() => onNavigateToScan?.()}
            className="text-xs font-black text-emerald-800 hover:text-emerald-900 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>{isAr ? "تجربة فحص جديد" : "Scan New Item"}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : "rotate-0"}`} />
          </button>
        </div>

        {/* Modern Eco-Cards Responsive Grid for Recent Decisions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {PRESET_SAMPLES.slice(0, 4).map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSampleClick(sample.id)}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-emerald-500 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group p-4"
            >
              <div>
                {/* Unified Aspect-Ratio Full Width Image with Badges */}
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 mb-3.5">
                  <img
                    src={sample.sampleImage}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Top Right Material Badge */}
                  <span className="absolute top-2.5 right-2.5 text-[10px] sm:text-[11px] font-black px-3 py-1 rounded-full bg-slate-900/85 text-emerald-300 backdrop-blur-md border border-emerald-400/30 shadow-md">
                    {sample.badge}
                  </span>
                  {/* Top Left Circular Score Glass Badge */}
                  <span className="absolute top-2.5 left-2.5 text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-950/90 text-white backdrop-blur-md border border-emerald-400/40 shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>{sample.circularScore}</span>
                  </span>
                </div>

                {/* Product Name & Pathway */}
                <div className="space-y-1">
                  <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight group-hover:text-emerald-800 transition-colors">
                    {sample.name}
                  </h4>
                  <p className="text-xs font-extrabold text-teal-800 flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{sample.routeAr}</span>
                  </p>
                </div>
              </div>

              {/* Action Button at Card Bottom */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="w-full py-2.5 px-4 rounded-2xl bg-emerald-50 group-hover:bg-emerald-800 text-emerald-900 group-hover:text-white font-extrabold text-xs transition-all duration-300 flex items-center justify-between shadow-2xs group-hover:shadow-md border border-emerald-200/80 group-hover:border-emerald-700">
                  <span>{isAr ? "عرض المسار البيئي" : "View Eco Pathway"}</span>
                  <ArrowRight className={`w-4 h-4 ${isAr ? "rotate-180 group-hover:-translate-x-1" : "rotate-0 group-hover:translate-x-1"} transition-transform`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Phase 7 & 8 — Circular Impact & Gamification Section */}
      <section id="impact-section" className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/60 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-800/80 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-600/40">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? "مؤشرات الأثر البيئي" : "Environmental Impact Stats"}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white pt-2">
              {isAr ? "أثر قرارات الاستدامة في منصة دَوْر" : "Sustainability Impact Index"}
            </h3>
          </div>
          <div className="bg-emerald-950/90 border border-emerald-500/40 px-4 py-2 rounded-2xl text-xs font-bold text-emerald-200">
            🍃 {isAr ? "تحصل على +50 نقطة دَوْر عند كل قرار دائري منفّذ" : "Earn +50 DAWR points per circular decision"}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-emerald-950/60 border border-emerald-700/40 p-4 rounded-2xl space-y-1">
            <span className="text-xs text-emerald-300 font-bold block">{isAr ? "وفورات الانبعاثات الحالية" : "CO2 Avoided"}</span>
            <span className="text-2xl font-black text-white">18.5 {isAr ? "كجم CO2e" : "kg CO2e"}</span>
          </div>
          <div className="bg-emerald-950/60 border border-emerald-700/40 p-4 rounded-2xl space-y-1">
            <span className="text-xs text-emerald-300 font-bold block">{isAr ? "المنتجات المستفادة" : "Products Saved"}</span>
            <span className="text-2xl font-black text-white">15 {isAr ? "منتجاً" : "items"}</span>
          </div>
          <div className="bg-emerald-950/60 border border-emerald-700/40 p-4 rounded-2xl space-y-1">
            <span className="text-xs text-emerald-300 font-bold block">{isAr ? "رصيد نقاط دَوْر" : "DAWR Points"}</span>
            <span className="text-2xl font-black text-emerald-300">270 {isAr ? "نقطة دَوْر" : "DAWR pts"}</span>
          </div>
        </div>
      </section>

      {/* 5. Landing Sections (Circular Economy Pillars, Ecosystem & Features) */}
      <LandingSections
        language={language}
        onAnalyzeClick={() => onNavigateToScan?.()}
      />
    </div>
  );
};


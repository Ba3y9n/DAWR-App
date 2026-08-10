import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, RefreshCw, Sparkles, Zap, Search, HelpCircle, AlertCircle, CheckCircle2, ArrowRight, Recycle, Leaf } from "lucide-react";
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

  // Otherwise render Home View with Hero, Recent Analyzed Samples Grid, and Landing Sections
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12 bg-white">
      {/* 1. Full-Width Hero Portal Banner */}
      <section className="w-full relative min-h-[42vh] sm:min-h-[48vh] flex flex-col justify-center rounded-3xl overflow-hidden shadow-xl border border-emerald-200/60 bg-emerald-950 px-8 sm:px-14 md:px-20 py-10 sm:py-14">
        {/* Clear & Vivid Sustainable Nature Background Image */}
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-85 transform scale-105"
        />
        {/* Soft Light Overlay for Vividness */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/45 via-emerald-900/30 to-black/20" />

        {/* Right-Aligned Banner Titles Container */}
        <div className="relative z-10 flex flex-col items-start text-right space-y-2 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg">
            {isAr ? "دَوْر - DAWR" : "DAWR Platform"}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-black text-emerald-200 drop-shadow-md">
            {isAr ? "لا ترمِه... أعطه دَوْرًا آخر" : "Don't throw it away... Give it another round"}
          </p>
        </div>
      </section>

      {/* 2. White Area Below Hero: Description & Prominent Action Button */}
      <div className="text-center px-4 space-y-5 py-2">
        <p className="text-sm sm:text-base md:text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed font-medium">
          {isAr
            ? "افحص أي منتج بالكاميرا فوراً للتعرف على خاماته واستكشاف المسار البيئي الأفضل: إعادة استخدام، إصلاح، تبرع، أو تدوير."
            : "Scan any product with your camera to analyze materials and discover the best eco pathway."}
        </p>

        <div className="flex justify-center pt-1">
          <button
            onClick={() => onNavigateToScan?.()}
            className="w-full max-w-xs sm:max-w-sm py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 hover:from-emerald-900 hover:to-teal-900 text-white font-black text-base sm:text-lg shadow-xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>{isAr ? "أبدأ الآن ←" : "Start Now ←"}</span>
            <ArrowRight className={`w-5 h-5 ${isAr ? "rotate-180" : "rotate-0"}`} />
          </button>
        </div>
      </div>

      {/* 3. Recent Analyzed Samples Grid Section (Home Page Feature) */}
      <section className="space-y-5 pt-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-700" />
              <span>{isAr ? "عينات سريعة مفحوصة سابقاً" : "Recent Analyzed Samples"}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium pt-0.5">
              {isAr ? "نماذج حقيقية لمؤشرات الاستدامة والمسارات البيئية الذكية" : "Real examples of circular score indexes and eco routes"}
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

        {/* Elegant Card Grid for Recent Samples */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRESET_SAMPLES.slice(0, 4).map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSampleClick(sample.id)}
              className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all duration-300 flex flex-col justify-between space-y-3 cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={sample.sampleImage} alt={sample.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2 right-2 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-900/90 text-white backdrop-blur-xs">
                    {sample.badge}
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">{sample.name}</h4>
                  <p className="text-xs text-emerald-800 font-bold pt-0.5">
                    {isAr ? "مؤشر الاستدامة الدائرية: 85/100" : "Circular Score: 85/100"}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-teal-800 flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5" />
                  {isAr ? "إعادة استخدام وتبرع" : "Reuse & Donate"}
                </span>
                <span className="text-xs font-black text-emerald-800 group-hover:translate-x-1 transition-transform">
                  {isAr ? "عرض التحليل ←" : "View Analysis →"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Landing Sections (Circular Economy Pillars, Ecosystem & Features) */}
      <LandingSections
        language={language}
        onAnalyzeClick={() => onNavigateToScan?.()}
      />
    </div>
  );
};


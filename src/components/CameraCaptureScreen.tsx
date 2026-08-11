import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, RefreshCw, Sparkles, Zap, Search, HelpCircle, AlertCircle, CheckCircle2, ArrowRight, Recycle, Leaf, Target, ShieldCheck } from "lucide-react";
import { PRESET_SAMPLES } from "../data/presetSamples";
import { Language, ActiveTab } from "../types";
import { LandingSections } from "./LandingSections";
import { CircularHudLoop } from "./CircularHudLoop";
import { CircularImpactDashboard } from "./CircularImpactDashboard";

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
  const [scanningCardId, setScanningCardId] = useState<string | null>(null);

  const handleCardScan = (sampleId: string) => {
    if (scanningCardId) return;
    setScanningCardId(sampleId);
    setTimeout(() => {
      setScanningCardId(null);
      handleSampleClick(sampleId);
      onNavigateToScan?.();
    }, 1800);
  };

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

  // If we are in "scan" tab mode, render the Premium Clean Smart Scan Page
  if (activeTab === "scan") {
    return (
      <div className="w-full bg-slate-50/70 min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans text-slate-900" dir={isAr ? "rtl" : "ltr"}>
        
        {/* 1. TOP HERO AREA FOR SMART SCAN PAGE (2-Column Layout) */}
        <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-right flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-xs font-black shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isAr ? "مدعوم بالذكاء الاصطناعي" : "AI-Powered"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-950 tracking-tight leading-tight">
              {isAr ? "اكتشف دَوْر منتجك التالي" : "Discover Your Item's Next Round"}
            </h1>
            <h2 className="text-base sm:text-lg font-bold text-slate-700 leading-relaxed">
              {isAr ? "أضف صورة، ودع الذكاء الاصطناعي يحدد أفضل مسار دائري له." : "Add a photo, and let AI determine its optimal circular path."}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed pt-0.5">
              {isAr
                ? "ارفع صورة المنتج أو استخدم الكاميرا، وسيقوم الذكاء الاصطناعي بتحليل حالته ومكوناته وقيمته المتبقية واقتراح أفضل خيار مستدام."
                : "Upload an image or use camera. AI evaluates condition, components, residual value, and recommends the best sustainable option."}
            </p>
          </div>

          {/* Decorative Photorealistic Composition Card in Expanded Container */}
          <div className="relative w-full md:w-96 lg:w-[420px] h-48 sm:h-56 md:h-60 rounded-3xl overflow-hidden bg-white/90 border border-emerald-200/90 shadow-md flex items-center justify-center p-2 shrink-0 group">
            <img 
              src="/assets/dawr_hero_composition.jpg" 
              alt="DAWR Circular Product Composition" 
              className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* 2. ENLARGED & GLOWING PROGRESS STEPS (1 أضف المنتج ➔ 2 تحليل دَوْر ➔ 3 القرار الدائري) */}
        <div className="max-w-7xl mx-auto bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className={`flex items-center gap-3 ${capturedImage ? "text-emerald-900 font-bold" : "text-emerald-950 font-black"}`}>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-black shadow-md border-2 border-emerald-500 transition-all ${capturedImage ? "bg-emerald-100 text-emerald-900 border-emerald-400" : "bg-emerald-900 text-white ring-4 ring-emerald-200/70 scale-105"}`}>
                1
              </div>
              <span className="text-sm sm:text-base font-extrabold">{isAr ? "أضف المنتج" : "Add Product"}</span>
            </div>

            {/* Glowing Animated Progress Line 1 */}
            <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${capturedImage ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shadow-[0_0_12px_#10b981] animate-pulse" : "bg-slate-200"}`} />

            {/* Step 2 */}
            <div className={`flex items-center gap-3 ${isAnalyzing ? "text-emerald-950 font-black" : capturedImage ? "text-slate-900 font-bold" : "text-slate-500"}`}>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-black shadow-sm border-2 transition-all ${isAnalyzing ? "bg-emerald-900 text-white animate-pulse border-emerald-400 ring-4 ring-emerald-200/70 scale-105" : capturedImage ? "bg-emerald-100 text-emerald-900 border-emerald-400" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                2
              </div>
              <span className="text-sm sm:text-base font-extrabold">{isAr ? "تحليل دَوْر" : "DAWR Analysis"}</span>
            </div>

            {/* Glowing Animated Progress Line 2 */}
            <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${isAnalyzing ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shadow-[0_0_12px_#10b981] animate-pulse" : "bg-slate-200"}`} />

            {/* Step 3 */}
            <div className="flex items-center gap-3 text-slate-500">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 border-2 border-slate-200 text-slate-500 flex items-center justify-center text-sm sm:text-base font-black shadow-2xs">
                3
              </div>
              <span className="text-sm sm:text-base font-extrabold">{isAr ? "القرار الدائري" : "Circular Decision"}</span>
            </div>
          </div>
        </div>

        {/* 3. 12-COLUMN LAYOUT (LEFT: MAIN SCAN / UPLOAD / PREVIEW ZONE, RIGHT: SIDEBAR) */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: UPLOAD / CAMERA / PREVIEW / QUICK DEMOS (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">

            {/* MOBILE SPECIFIC CAMERA-FIRST ACTION BAR */}
            <div className="block sm:hidden bg-emerald-950 text-white rounded-2xl p-4 text-center space-y-3 shadow-md">
              <h3 className="text-base font-black">{isAr ? "صوّر منتجك واكتشف دَوْره التالي" : "Scan item for circular path"}</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUseLiveCamera(true)}
                  className="flex-1 py-3 px-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isAr ? "فتح الكاميرا" : "Open Camera"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 px-3 rounded-xl bg-emerald-900 text-white border border-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isAr ? "اختيار من الصور" : "Pick Photo"}</span>
                </button>
              </div>
            </div>

            {/* MAIN UPLOAD / CAMERA / PREVIEW ZONE */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden">
              
              {/* INLINE LIVE CAMERA MODE (DESKTOP / MOBILE ON-DEMAND) */}
              {useLiveCamera ? (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] border-2 border-emerald-600 shadow-md">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    
                    {/* Laser Scanner Laser Effect */}
                    <div className="absolute inset-x-0 top-0 h-full pointer-events-none overflow-hidden">
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_15px_#10b981] animate-scan" />
                    </div>

                    {/* Camera Action Overlay */}
                    <div className="absolute bottom-4 inset-x-4 flex items-center justify-between gap-3 z-20">
                      <button
                        type="button"
                        onClick={() => setUseLiveCamera(false)}
                        className="py-2.5 px-4 rounded-xl bg-slate-900/90 text-white border border-slate-700 text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                      >
                        {isAr ? "إلغاء" : "Cancel"}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleCaptureFromCamera(e)}
                        className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{isAr ? "التقط الصورة" : "Capture Photo"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : capturedImage ? (
                /* PRODUCT PREVIEW STATE */
                <div className="space-y-5">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-[4/3] max-h-80 mx-auto shadow-xs group">
                    <img src={capturedImage} alt="Product Preview" className="w-full h-full object-cover" />
                    
                    {/* Scanning Overlay when analyzing */}
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
                        <div className="w-12 h-12 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
                        <div className="space-y-1">
                          <p className="text-sm sm:text-base font-black text-white">{isAr ? "جاري تحليل المنتج…" : "Analyzing Product…"}</p>
                          <p className="text-xs text-emerald-200 font-medium leading-relaxed max-w-sm">
                            {isAr
                              ? "يقوم دور بفحص الصورة وتحديد نوع المنتج وحالته والمواد وأفضل مسار دائري."
                              : "DAWR is analyzing product type, condition, materials, and optimal circular path."}
                          </p>
                        </div>
                      </div>
                    )}

                    {!isAnalyzing && (
                      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="py-1.5 px-3 rounded-xl bg-white/90 hover:bg-white text-slate-800 border border-slate-200 text-xs font-bold shadow-xs cursor-pointer"
                        >
                          {isAr ? "تغيير الصورة" : "Change Image"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCapturedImage(null)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs cursor-pointer"
                          title={isAr ? "حذف الصورة" : "Remove"}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Primary CTA for Analysis */}
                  <button
                    type="button"
                    onClick={(e) => handleCaptureFromCamera(e)}
                    disabled={isAnalyzing}
                    className="w-full py-4 px-6 rounded-2xl bg-emerald-900 hover:bg-emerald-950 text-white font-black text-base shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin text-white" />
                        <span>{isAr ? "جاري تحليل دَوْر..." : "Analyzing..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        <span>{isAr ? "بدء الفحص" : "Start Inspection"}</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* EXPANDED DESKTOP DEFAULT DRAG & DROP UPLOAD ZONE */
                <div className="space-y-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full min-h-[360px] sm:min-h-[390px] border-2 border-dashed border-emerald-300/90 hover:border-emerald-600 bg-emerald-50/20 hover:bg-emerald-50/40 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="w-18 h-18 rounded-3xl bg-emerald-100/90 border border-emerald-200 flex items-center justify-center text-emerald-800 group-hover:scale-105 transition-transform shadow-2xs">
                      <Upload className="w-10 h-10" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-black text-emerald-950">
                        {isAr ? "أضف صورة المنتج" : "Add Product Image"}
                      </h3>
                      <p className="text-sm sm:text-lg text-slate-700 font-bold max-w-sm">
                        {isAr ? "اسحب الصورة هنا أو اخترها من جهازك" : "Drag and drop or select file from your device"}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500 font-extrabold pt-1">
                        <span>{isAr ? "الحد الأقصى 10MB • JPG, PNG" : "Max 10MB • JPG, PNG"}</span>
                      </div>
                    </div>

                    {/* Primary & Secondary Action CTAs */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 w-full justify-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-emerald-900 hover:bg-emerald-950 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <Upload className="w-5 h-5" />
                        <span>{isAr ? "⬆️ رفع صورة" : "⬆️ Upload Image"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUseLiveCamera(true)}
                        className="py-3.5 px-6 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-2xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-emerald-700" />
                        <span>{isAr ? "📷 استخدام الكاميرا" : "📷 Use Camera"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Security Disclaimer */}
                  <div className="text-center pt-1">
                    <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{isAr ? "صورتك آمنة وتستخدم للتحليل فقط" : "Your image is secure and used strictly for analysis"}</span>
                    </p>
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

              {/* Error Messages */}
              {cameraError && (
                <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold p-3.5 rounded-xl text-center flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}
              {analysisError && (
                <div className="bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold p-3.5 rounded-xl text-center flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{analysisError}</span>
                </div>
              )}

              {/* Manual Text Notes Search Field */}
              <div className="pt-2 border-t border-slate-100 relative">
                <input
                  type="text"
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && manualText.trim()) {
                      onAnalyzeCustom(undefined, manualText);
                    }
                  }}
                  placeholder={isAr ? "أو اكتب اسم المنتج والملاحظات هنا..." : "Or type product notes..."}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 text-slate-800 text-xs rounded-xl px-4 py-2.5 pl-10 focus:outline-none placeholder:text-slate-400 font-medium"
                />
                <button
                  onClick={() => manualText.trim() && onAnalyzeCustom(undefined, manualText)}
                  className="absolute left-3 top-4 text-slate-400 hover:text-emerald-700 p-1 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* DEMO SAMPLES QUICK PRESETS GRID */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>{isAr ? "عينات سريعة للتجربة" : "Quick Presets"}</span>
                </h3>
                <span className="text-xs text-emerald-800 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {isAr ? "نقرة واحدة للتحليل" : "One-click Demo"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_SAMPLES.map((sample) => {
                  const isSelected = selectedSampleId === sample.id;
                  return (
                    <button
                      key={sample.id}
                      onClick={() => handleSampleClick(sample.id)}
                      disabled={isAnalyzing}
                      className={`flex flex-col items-center p-3 rounded-2xl border transition-all cursor-pointer text-center space-y-2 group ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-600 shadow-xs"
                          : "bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <img src={sample.sampleImage} alt={sample.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="w-full space-y-0.5">
                        <h4 className="text-xs font-black text-slate-900 truncate">{sample.name}</h4>
                        <span className="text-[10px] text-emerald-800 font-extrabold block truncate">
                          {sample.badge}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SIDEBAR (HOW IT WORKS & PRIVACY TRUST BADGE) (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">

            {/* HOW DAWR WORKS SIDE PANEL (COMPACT VERTICAL EXTENSION) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5 lg:max-w-none max-w-md mx-auto w-full">
              <h3 className="text-lg font-black text-emerald-950 border-b border-slate-100 pb-3 flex items-center justify-center gap-2 text-center">
                <Leaf className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>{isAr ? "كيف يعمل دَوْر؟ 🍃" : "How DAWR Works 🍃"}</span>
              </h3>

              <div className="space-y-3.5">
                {[
                  {
                    num: 1,
                    titleAr: "أضف صورة المنتج",
                    titleEn: "Add Product Photo",
                    descAr: "التقط صورة واضحة للمنتج أو اخترها من معرض الصور.",
                    descEn: "Take a photo or pick an image from your gallery."
                  },
                  {
                    num: 2,
                    titleAr: "التحليل الذكي",
                    titleEn: "AI Smart Analysis",
                    descAr: "نفهم المنتج، حالته، مواده وقابليته للاستدامة.",
                    descEn: "AI identifies materials, exact condition and sustainability potential."
                  },
                  {
                    num: 3,
                    titleAr: "توصية المسار الأفضل",
                    titleEn: "Optimal Pathway",
                    descAr: "نقترح أفضل قرار دائري يحافظ على قيمة المنتج.",
                    descEn: "Recommends best reuse, repair, donation, or recycling route."
                  },
                  {
                    num: 4,
                    titleAr: "تعرّف على الأثر",
                    titleEn: "Environmental Impact",
                    descAr: "اعرف أثر قرارك البيئي بطريقة واضحة.",
                    descEn: "View CO2 saved and your sustainability score."
                  },
                ].map((step) => (
                  <div key={step.num} className="flex flex-col items-center text-center p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/90 space-y-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white font-black text-sm flex items-center justify-center shadow-md border border-emerald-400/40 ring-2 ring-emerald-100 shrink-0">
                      {step.num}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm sm:text-base font-bold text-emerald-950">
                        {isAr ? step.titleAr : step.titleEn}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-xs mx-auto">
                        {isAr ? step.descAr : step.descEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PRIVACY MESSAGE TRUST CARD */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 space-y-2.5 text-emerald-950 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>{isAr ? "خصوصيتك مهمة" : "Your Privacy Matters"}</span>
              </div>
              <p className="text-sm text-slate-700 font-medium leading-relaxed">
                {isAr
                  ? "لا نشارك صورك مع أي جهة خارج دَوْر."
                  : "We do not share your images with any third party outside DAWR."}
              </p>
            </div>
          </div>
        </div>

        {/* 4. BOTTOM BRAND LINE BANNER (Full-Bleed Soft Glass Banner) */}
        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-200 text-center">
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 shadow-2xs">
            <p className="text-xs sm:text-sm font-extrabold text-emerald-950 tracking-wide">
              {isAr ? "💡 كل منتج له دَوْر، ودَوْر لكل منتج." : "💡 Every product has a role, and DAWR for every product."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise render Home View with Hero, How DAWR Works, Recent Decisions Grid, and Landing Sections
  return (
    <div className="w-full bg-white space-y-12 pb-12">
      {/* 1. Full-Bleed 100% Width Hero Portal Banner (min-h-[85vh] Portal Height) */}
      <section className="w-full relative min-h-[80vh] sm:min-h-[85vh] lg:min-h-[88vh] flex flex-col justify-center rounded-none overflow-hidden shadow-xl border-b border-emerald-800/40 bg-emerald-950 px-6 sm:px-12 md:px-20 py-16 sm:py-24">
        {/* Vivid Sustainable Nature / Industrial Circular Facility Background Image */}
        <div 
          className="absolute inset-0 bg-[url('/assets/dawr_hero_banner_new.jpg')] bg-cover bg-center opacity-95 transform scale-105"
        />
        {/* Soft Light Overlay for Clear & Vivid Background View */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/45 via-emerald-900/30 to-black/20" />

        {/* 2-Column Grid Hero Container (Right: Main Value Headline & Text, Left: Futuristic Circular HUD Loop) */}
        <div className="w-full max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* Right Column: Text & Primary Action Buttons (7 Columns) — order-2 on mobile (below circle) */}
          <div className="lg:col-span-7 flex flex-col items-start text-right space-y-5 order-2 lg:order-1">
            {/* Main Value Proposition Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
              {isAr ? "قبل أن ترميه... دَوْر يعرف قيمته" : "Before throwing it... DAWR knows its value"}
            </h1>

            {/* Explanatory Paragraph */}
            <p className="text-sm sm:text-base md:text-lg text-white font-extrabold leading-relaxed max-w-2xl drop-shadow-md">
              {isAr
                ? "صوّر منتجك، ودع الذكاء الاصطناعي يحدد أفضل مسار دائري له."
                : "Snap a photo of your item, and let AI determine its best circular route."}
            </p>

            {/* Action Button */}
            <div className="pt-3 w-full sm:w-auto">
              <button
                onClick={() => onNavigateToScan?.()}
                className="py-4 px-9 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-emerald-950/60 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer border-2 border-white"
              >
                <Camera className="w-5 h-5 text-slate-950 shrink-0" />
                <span>{isAr ? "افحص منتجًا الآن" : "Scan Product Now"}</span>
              </button>
            </div>
          </div>

          {/* Left Column: Hero Interactive Circular HUD Loop — order-1 on mobile (shown first) */}
          <div className="lg:col-span-5 flex items-center justify-center pt-2 lg:pt-0 order-1 lg:order-2">
            {/* Wrapper shrinks the circle on mobile only */}
            <div className="w-full max-w-[240px] sm:max-w-none">
              <CircularHudLoop
                language={language}
                onSelectPathway={() => onNavigateToScan?.()}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Container for Middle Content Sections */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 2. Phase 5 — How DAWR Works Stepper Section (كيف يعمل دَوْر؟) */}
        <section id="how-it-works" className="space-y-6 pt-4 scroll-mt-24">
          <div className="text-center space-y-1.5 max-w-2xl mx-auto">
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
                <h3 className="text-base sm:text-lg font-black text-emerald-950">{isAr ? "صوّر المنتج" : "Snap Item"}</h3>
                <p className="text-sm text-slate-700 font-medium leading-relaxed pt-1.5">
                  {isAr ? "التقط صورة بالكاميرا الحية أو ارفع ملف من جهازك." : "Take a live photo or upload an image file."}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-900 font-black text-sm flex items-center justify-center border border-teal-300">
                  02
                </span>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-emerald-950">{isAr ? "يحلله الذكاء الاصطناعي" : "AI Vision Analysis"}</h3>
                <p className="text-sm text-slate-700 font-medium leading-relaxed pt-1.5">
                  {isAr ? "نموذج Gemini يكتشف الخامات وحالة المنتج الدقيقة." : "Gemini Vision detects item materials and exact state."}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-900 font-black text-sm flex items-center justify-center border border-emerald-300">
                  03
                </span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <Recycle className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-emerald-950">{isAr ? "دَوْر يقارن المسارات" : "Compare Pathways"}</h3>
                <p className="text-sm text-slate-700 font-medium leading-relaxed pt-1.5">
                  {isAr ? "مقارنة خيارات إعادة الاستخدام، الإصلاح، التبرع، والتدوير." : "Evaluates reuse, repair, donation, and recycling options."}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center border border-amber-300">
                  04
                </span>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-emerald-950">{isAr ? "تحصل على أفضل قرار" : "Get Best Decision"}</h3>
                <p className="text-sm text-slate-700 font-medium leading-relaxed pt-1.5">
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
            {PRESET_SAMPLES.slice(0, 4).map((sample) => {
              const isScanningThisCard = scanningCardId === sample.id;
              return (
                <div
                  key={sample.id}
                  onClick={() => handleCardScan(sample.id)}
                  className={`bg-white rounded-3xl border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group p-4 relative ${
                    isScanningThisCard ? "border-emerald-500 ring-2 ring-emerald-400/40" : "border-slate-200/90 hover:border-emerald-500"
                  }`}
                >
                  <div>
                    {/* Unified Aspect-Ratio Full Width Image with Badges & Scanning Overlay */}
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 mb-3.5">
                      <img
                        src={sample.sampleImage}
                        alt={sample.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          isScanningThisCard ? "scale-110 blur-[1px]" : "group-hover:scale-105"
                        }`}
                      />

                      {/* Laser Scanning Animation Overlay */}
                      {isScanningThisCard && (
                        <>
                          {/* Laser Scanning Moving Line */}
                          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 shadow-[0_0_15px_#34d399] z-30 animate-scan pointer-events-none" />
                          
                          {/* Dark Glassmorphism Overlay */}
                          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs z-20 flex flex-col items-center justify-center text-center p-3 transition-all duration-300">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-900/90 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-xl animate-pulse mb-2">
                              <Sparkles className="w-5 h-5 animate-spin" />
                            </div>
                            <span className="text-[11px] font-black text-white bg-emerald-950/90 px-3 py-1 rounded-full border border-emerald-400/40 shadow-md flex items-center gap-1.5">
                              <span>{isAr ? "جاري قراءة المسار البيئي..." : "Scanning route..."}</span>
                            </span>
                          </div>
                        </>
                      )}

                      {/* Top Right Material Badge */}
                      <span className="absolute top-2.5 right-2.5 text-[10px] sm:text-[11px] font-black px-3 py-1 rounded-full bg-slate-900/85 text-emerald-300 backdrop-blur-md border border-emerald-400/30 shadow-md z-10">
                        {sample.badge}
                      </span>
                      {/* Top Left Circular Score Glass Badge */}
                      <span className="absolute top-2.5 left-2.5 text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-950/90 text-white backdrop-blur-md border border-emerald-400/40 shadow-md flex items-center gap-1 z-10">
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardScan(sample.id);
                      }}
                      disabled={isScanningThisCard}
                      className={`w-full py-2.5 px-4 rounded-2xl font-extrabold text-xs transition-all duration-300 flex items-center justify-between shadow-2xs group-hover:shadow-md border cursor-pointer ${
                        isScanningThisCard
                          ? "bg-emerald-900 text-white border-emerald-700"
                          : "bg-emerald-50 group-hover:bg-emerald-800 text-emerald-900 group-hover:text-white border-emerald-200/80 group-hover:border-emerald-700 active:scale-95"
                      }`}
                    >
                      <span>
                        {isScanningThisCard
                          ? (isAr ? "جاري الفحص..." : "Scanning...")
                          : (isAr ? "عرض المسار البيئي" : "View Eco Pathway")}
                      </span>
                      <ArrowRight className={`w-4 h-4 ${isAr ? "rotate-180 group-hover:-translate-x-1" : "rotate-0 group-hover:translate-x-1"} transition-transform`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* 4. Circular Impact Dashboard (أثرك الدائري مع دَوْر) */}
      <CircularImpactDashboard language={language} />

      {/* 5. Landing Sections (Circular Economy Pillars, Ecosystem & Features) */}
      <LandingSections
        language={language}
        onStartClick={() => onNavigateToScan?.()}
      />
    </div>
  );
};


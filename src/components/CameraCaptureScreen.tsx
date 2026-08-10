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

  // If we are in "scan" tab mode, render the Premium Clean Smart Scan Page
  if (activeTab === "scan") {
    return (
      <div className="w-full bg-slate-50/70 min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans text-slate-900" dir={isAr ? "rtl" : "ltr"}>
        
        {/* 1. TOP HERO AREA FOR SMART SCAN PAGE */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="space-y-3 text-right flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isAr ? "تحليل ذكي بالذكاء الاصطناعي" : "AI Smart Analysis"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {isAr ? "افحص منتجك بذكاء" : "Scan Your Item Smartly"}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium max-w-xl leading-relaxed">
              {isAr
                ? "ارفع صورة منتجك أو استخدم الكاميرا، ودَع دور يحلل حالته ويقترح أفضل مسار دائري له."
                : "Upload your item photo or use camera, and let DAWR analyze its condition to recommend the optimum circular path."}
            </p>
          </div>

          {/* Decorative Photorealistic Composition */}
          <div className="relative w-full md:w-80 h-40 sm:h-44 rounded-2xl overflow-hidden bg-white border border-emerald-100/90 shadow-xs flex items-center justify-center p-1 shrink-0 group">
            <img 
              src="/assets/dawr_hero_composition.jpg" 
              alt="DAWR Circular Product Composition" 
              className="w-full h-full object-cover rounded-xl group-hover:scale-102 transition-transform duration-500"
            />
          </div>
        </div>

        {/* 2. PROGRESS STEPS (01 أضف المنتج ➔ 02 تحليل دَوْر ➔ 03 القرار الدائري) */}
        <div className="max-w-7xl mx-auto bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between gap-2 max-w-3xl mx-auto">
            {/* Step 1 */}
            <div className={`flex items-center gap-2 ${capturedImage ? "text-emerald-700 font-bold" : "text-emerald-950 font-black"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${capturedImage ? "bg-emerald-100 text-emerald-800" : "bg-emerald-900 text-white"}`}>
                01
              </div>
              <span className="text-xs sm:text-sm font-extrabold">{isAr ? "أضف المنتج" : "Add Product"}</span>
            </div>

            <div className={`flex-1 h-0.5 ${capturedImage ? "bg-emerald-500" : "bg-slate-200"}`} />

            {/* Step 2 */}
            <div className={`flex items-center gap-2 ${isAnalyzing ? "text-emerald-950 font-black" : capturedImage ? "text-slate-800 font-bold" : "text-slate-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${isAnalyzing ? "bg-emerald-900 text-white animate-pulse" : capturedImage ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-400"}`}>
                02
              </div>
              <span className="text-xs sm:text-sm font-extrabold">{isAr ? "تحليل دَوْر" : "DAWR Analysis"}</span>
            </div>

            <div className="flex-1 h-0.5 bg-slate-200" />

            {/* Step 3 */}
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-black">
                03
              </div>
              <span className="text-xs sm:text-sm font-extrabold">{isAr ? "القرار الدائري" : "Circular Decision"}</span>
            </div>
          </div>
        </div>

        {/* 3. 12-COLUMN LAYOUT (LEFT: MAIN SCAN / UPLOAD / PREVIEW ZONE, RIGHT: SIDEBAR) */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: UPLOAD / CAMERA / PREVIEW / QUICK DEMOS (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">

            {/* MOBILE SPECIFIC CAMERA-FIRST ACTION BAR */}
            <div className="block sm:hidden bg-emerald-900 text-white rounded-2xl p-4 text-center space-y-3">
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
                  className="flex-1 py-3 px-3 rounded-xl bg-emerald-800 text-white border border-emerald-600 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
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
                      <div className="absolute inset-0 bg-emerald-950/50 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
                        <div className="w-12 h-12 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
                        <div className="space-y-1">
                          <p className="text-sm font-black text-white">{isAr ? "جاري تحليل الخامات بالذكاء الاصطناعي..." : "Analyzing with AI..."}</p>
                          <div className="text-xs text-emerald-200 font-medium animate-pulse">
                            <span>{isAr ? "نتعرف على المنتج ونحلل حالته ومواده..." : "Identifying product materials..."}</span>
                          </div>
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
                        <span>{isAr ? "ابدأ تحليل دَوْر بالذكاء الاصطناعي" : "Analyze Product with AI"}</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* CLEAN DESKTOP DEFAULT UPLOAD ZONE */
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/20 rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-800 group-hover:scale-105 transition-transform shadow-2xs">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900">
                      {isAr ? "أضف صورة المنتج" : "Upload Product Image"}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      {isAr ? "اسحب الصورة هنا أو اخترها من جهازك" : "Drag and drop or select file from your device"}
                    </p>
                    <p className="text-[11px] text-slate-400 font-bold pt-1">
                      {isAr ? "الصيغ المدعومة: JPG • PNG • WEBP" : "Supported formats: JPG • PNG • WEBP"}
                    </p>
                  </div>

                  {/* Primary & Secondary Action CTAs */}
                  <div className="flex items-center gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-3 px-6 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isAr ? "رفع صورة" : "Upload Image"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseLiveCamera(true)}
                      className="py-3 px-5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-emerald-700" />
                      <span>{isAr ? "استخدام الكاميرا" : "Use Camera"}</span>
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
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isAr ? "عينات سريعة للتجربة" : "Quick Presets"}</span>
                </h3>
                <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {isAr ? "نقرة واحدة للتحليل" : "One-click Demo"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PRESET_SAMPLES.map((sample) => {
                  const isSelected = selectedSampleId === sample.id;
                  return (
                    <button
                      key={sample.id}
                      onClick={() => handleSampleClick(sample.id)}
                      disabled={isAnalyzing}
                      className={`flex flex-col items-center p-2.5 rounded-2xl border transition-all cursor-pointer text-center space-y-1.5 group ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-600 shadow-xs"
                          : "bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <img src={sample.sampleImage} alt={sample.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="w-full">
                        <h4 className="text-[11px] font-black text-slate-900 truncate">{sample.name}</h4>
                        <span className="text-[9px] text-emerald-800 font-extrabold block truncate">
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

            {/* HOW DAWR WORKS SIDE PANEL */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-5">
              <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>{isAr ? "كيف يعمل دَوْر؟" : "How DAWR Works"}</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-black text-xs shrink-0">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-900">{isAr ? "أضف صورة المنتج" : "Add Product Photo"}</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      {isAr ? "التقط صورة واضحة للمنتج أو اخترها من معرض الصور." : "Take a photo or pick an image."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-black text-xs shrink-0">
                    2
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-900">{isAr ? "التحليل الذكي" : "AI Smart Analysis"}</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      {isAr ? "نفهم المنتج، حالته، مواده وقابليته للاستدامة." : "AI identifies materials and exact condition."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-black text-xs shrink-0">
                    3
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-900">{isAr ? "توصية المسار الأفضل" : "Optimal Pathway"}</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      {isAr ? "نقترح أفضل قرار دائري يحافظ على قيمة المنتج." : "Recommends best reuse, repair, donation, or recycling route."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-black text-xs shrink-0">
                    4
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-900">{isAr ? "تعرّف على الأثر" : "Environmental Impact"}</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      {isAr ? "اعرف أثر قرارك البيئي بطريقة واضحة." : "View CO2 saved and sustainability score."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* PRIVACY MESSAGE TRUST CARD */}
            <div className="bg-emerald-950 text-white rounded-3xl p-5 space-y-2.5 border border-emerald-800/50 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAr ? "خصوصيتك مهمة" : "Your Privacy Matters"}</span>
              </div>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                {isAr
                  ? "تُستخدم صورتك للتحليل الفوري فقط وفق سياسة المنصة والأنظمة المعتمدة."
                  : "Your image is used strictly for instant AI analysis in compliance with platform policies."}
              </p>
            </div>
          </div>
        </div>

        {/* 4. BOTTOM BRAND LINE BANNER */}
        <div className="max-w-7xl mx-auto pt-4 border-t border-slate-200 text-center">
          <p className="text-xs font-black text-slate-500 tracking-wide">
            {isAr ? "لا ترمِه... أعطه دَوْرًا آخر." : "Don't throw it away... Give it another round."}
          </p>
        </div>
      </div>
    );
  }

  // Otherwise render Home View with Hero, How DAWR Works, Recent Decisions Grid, and Landing Sections
  return (
    <div className="w-full bg-white space-y-12 pb-12">
      {/* 1. Full-Bleed 100% Width Hero Portal Banner (min-h-[85vh] Portal Height) */}
      <section className="w-full relative min-h-[80vh] sm:min-h-[85vh] lg:min-h-[88vh] flex flex-col justify-center rounded-none overflow-hidden shadow-xl border-b border-emerald-800/40 bg-emerald-950 px-6 sm:px-12 md:px-20 py-16 sm:py-24">
        {/* Vivid Sustainable Nature Background Image */}
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-95 transform scale-105"
        />
        {/* Soft Light Overlay for Clear & Vivid Background View */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/45 via-emerald-900/30 to-black/20" />

        {/* Right-Aligned Text & Action Buttons Container inside Max-W-7xl */}
        <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col items-start text-right space-y-4">
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

      {/* Container for Middle Content Sections */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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
      </div>

      {/* 4. Full-Bleed 100% Width Clean Impact Dashboard Banner (أثر قرارات الاستدامة) */}
      <section 
        id="impact-section" 
        className="w-full relative py-12 my-8 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-xl border-y border-emerald-800/40 rounded-none overflow-hidden px-6 sm:px-12 md:px-20"
      >
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Top Row: Section Title & Gamification Badge */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-300 bg-emerald-950/80 px-3.5 py-1 rounded-full border border-emerald-500/30">
                <Leaf className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isAr ? "مؤشرات الأثر البيئي الوطنية" : "Environmental Impact Stats"}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
                {isAr ? "أثر قرارات الاستدامة في منصة دَوْر" : "Sustainability Impact Index"}
              </h3>
            </div>

            <div className="inline-flex items-center gap-2 bg-emerald-950/90 border border-emerald-400/30 px-4 py-2 rounded-2xl text-xs font-extrabold text-emerald-200 shadow-md backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isAr ? "تحصل على +50 نقطة دَوْر عند كل قرار دائري منفّذ" : "Earn +50 DAWR points per circular decision"}</span>
            </div>
          </div>

          {/* Clean Minimal Stats Row (3 Metrics with Vertical Dividers & No Inner Boxes) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 py-2">
            {/* Stat 1: CO2 Avoided */}
            <div className="flex flex-col items-center text-center space-y-1 md:border-l md:border-white/10 px-4">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
                18.5 <span className="text-base sm:text-lg text-emerald-300 font-bold">{isAr ? "كجم CO2e" : "kg CO2e"}</span>
              </span>
              <span className="text-xs sm:text-sm text-emerald-200/90 font-extrabold pt-1">
                {isAr ? "وفورات الانبعاثات الكربونية الحالية" : "CO2 Emissions Avoided"}
              </span>
            </div>

            {/* Stat 2: Products Saved */}
            <div className="flex flex-col items-center text-center space-y-1 md:border-l md:border-white/10 px-4">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
                15 <span className="text-base sm:text-lg text-emerald-300 font-bold">{isAr ? "منتجاً" : "items"}</span>
              </span>
              <span className="text-xs sm:text-sm text-emerald-200/90 font-extrabold pt-1">
                {isAr ? "المنتجات المستفادة وتحويل مسارها" : "Products Saved & Diverted"}
              </span>
            </div>

            {/* Stat 3: DAWR Points */}
            <div className="flex flex-col items-center text-center space-y-1 px-4">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-300 tracking-tight drop-shadow-md">
                270 <span className="text-base sm:text-lg text-white font-bold">{isAr ? "نقطة دَوْر" : "DAWR pts"}</span>
              </span>
              <span className="text-xs sm:text-sm text-emerald-200/90 font-extrabold pt-1">
                {isAr ? "رصيد نقاط دَوْر الاستدامة المكتسبة" : "Earned Sustainability DAWR Points"}
              </span>
            </div>
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


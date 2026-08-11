import React, { useState, useEffect } from "react";
import { ProductAnalysis, UserStats, ActiveTab, Language, ThemeMode, UserProfile } from "./types";
import { HeaderStats } from "./components/HeaderStats";
import { CameraCaptureScreen } from "./components/CameraCaptureScreen";
import { CircularAnalysisScreen } from "./components/CircularAnalysisScreen";
import { CreativeIdeasModal } from "./components/CreativeIdeasModal";
import { RecyclingMapModal } from "./components/RecyclingMapModal";
import { FloatingChatWidget } from "./components/FloatingChatWidget";
import { AiChatDrawer } from "./components/AiChatDrawer";
import { UpdatesTab } from "./components/UpdatesTab";
import { ProfileTab } from "./components/ProfileTab";
import { BottomNav } from "./components/BottomNav";
import { ImpactToast } from "./components/ImpactToast";
import { AuthModal } from "./components/AuthModal";
import { PRESET_SAMPLES } from "./data/presetSamples";
import { Smartphone, Laptop } from "lucide-react";
import { auth, listenUserProfile, addScanAndRewardToUser, signOutUser, ensureUserProfile } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { DawrMapScreen } from "./components/DawrMapScreen";

export default function App() {
  // Language State (Pure White Theme enforced)
  const [language, setLanguage] = useState<Language>("ar");

  // Authentication & Real User Profile State
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [selectedMapCategory, setSelectedMapCategory] = useState<string | null>(null);

  // User Stats State
  const [userStats, setUserStats] = useState<UserStats>({
    points: 220,
    savedProductsCount: 15,
    levelTitle: language === "ar" ? "المستكشف الدائري" : "Circular Explorer",
    co2SavedKg: 42.5,
  });

  // Active Analysis State
  const [analysisData, setAnalysisData] = useState<ProductAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Modals State
  const [isCreativeModalOpen, setIsCreativeModalOpen] = useState<boolean>(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);
  const [isAiChatModalOpen, setIsAiChatModalOpen] = useState<boolean>(false);
  const [toastData, setToastData] = useState<{ points: number; title: string } | null>(null);

  // Device Frame View State for desktop preview
  const [isMobileFrameMode, setIsMobileFrameMode] = useState<boolean>(true);

  // Apply RTL/LTR and enforce pure white theme
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.documentElement.classList.remove("dark");
    document.body.classList.remove("dark");
  }, [language]);

  // Firebase Auth listener for real user session isolation
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Ensure profile exists in Firestore and start listening
        const profile = await ensureUserProfile(user);
        setCurrentUserProfile(profile);

        if (unsubscribeProfile) unsubscribeProfile();
        unsubscribeProfile = listenUserProfile(user.uid, (updated) => {
          if (updated) {
            setCurrentUserProfile(updated);
            setUserStats({
              points: updated.points,
              savedProductsCount: updated.savedProductsCount,
              levelTitle: updated.levelTitle,
              co2SavedKg: updated.co2SavedKg,
            });
          }
        });
      } else {
        if (unsubscribeProfile) unsubscribeProfile();
        setCurrentUserProfile(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === "ar" ? "en" : "ar"));
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUserProfile(null);
  };

  // Helper to record scan in Firestore database and award points for active user
  const recordScanAndAwardPoints = (analysisItem: any, previewImage?: string) => {
    const prodName = analysisItem.productName || analysisItem.product || "منتج مفحوص بالكاميرا";
    const mat = analysisItem.material || "خامات قابلة لإعادة الاستخدام والتدوير";
    const scoreVal = analysisItem.circularScore || analysisItem.circular_score || 88;

    const scanRecord = {
      productName: prodName,
      material: mat,
      actionTaken: "تحليل الاستدامة والفرز الذكي",
      circularScore: scoreVal,
      pointsEarned: 25,
      date: language === "ar" ? "الآن" : "Just now",
    };

    if (currentUserProfile?.uid) {
      addScanAndRewardToUser(currentUserProfile.uid, scanRecord, 25, 1.5);
    } else {
      setUserStats((prev) => ({
        ...prev,
        points: prev.points + 25,
        savedProductsCount: prev.savedProductsCount + 1,
        co2SavedKg: +(prev.co2SavedKg + 1.5).toFixed(1),
      }));
    }
  };

  // Handle Preset Sample Selection
  const handleAnalyzeSample = async (presetId: string) => {
    const selectedPreset = PRESET_SAMPLES.find((s) => s.id === presetId);
    if (selectedPreset?.sampleImage) {
      handleAnalyzeCustom(selectedPreset.sampleImage, selectedPreset.name);
    }
  };

  // Handle Custom Photo / Text Analysis with Gemini
  const handleAnalyzeCustom = async (imageBase64?: string, textPrompt?: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const fetchPromise = fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, customPrompt: textPrompt }),
      });

      const [res] = await Promise.all([fetchPromise, minDelayPromise]);

      let result: any = {};
      try {
        result = await res.json();
      } catch {
        result = { success: false, error: "تعذر فك استجابة الخادم" };
      }

      if (res.ok && result.success && result.data) {
        const finalData = {
          ...result.data,
          circularScore: result.data.circularScore || result.data.circular_score || 50,
          circular_score: result.data.circularScore || result.data.circular_score || 50,
          imagePreview: imageBase64 || "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=500&auto=format&fit=crop&q=80",
        };
        setAnalysisData(finalData);
        recordScanAndAwardPoints(finalData, imageBase64);
      } else {
        const errorMsg = result.error || (language === "ar" ? "فشل التحليل البصري بواسطة نموذج Gemini" : "Visual analysis failed via Gemini model");
        setAnalysisError(errorMsg);
      }
    } catch (err: any) {
      console.error("Analysis request error:", err);
      setAnalysisError(err?.message || (language === "ar" ? "حدث خطأ أثناء الاتصال بنموذج Gemini" : "Error connecting to Gemini model"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load user data from Firestore on mount
  useEffect(() => {
    fetch("/api/firestore/user?userId=default_user")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUserStats({
            points: data.user.points ?? 120,
            savedProductsCount: data.user.savedProductsCount ?? 15,
            levelTitle: data.user.levelTitle || (language === "ar" ? "سفير الاستدامة (مستوى 3)" : "Sustainability Ambassador (Lvl 3)"),
            co2SavedKg: data.user.co2SavedKg ?? 42.5,
          });
        }
      })
      .catch((err) => console.warn("Firestore initial load fallback:", err));
  }, [language]);

  // Claim Pathway Points & Log Impact
  const handleClaimPoints = (pointsNum: number, pathwayTitle: string) => {
    setUserStats((prev) => ({
      ...prev,
      points: prev.points + pointsNum,
      savedProductsCount: prev.savedProductsCount + 1,
      co2SavedKg: parseFloat((prev.co2SavedKg + 2.5).toFixed(1)),
    }));
    setToastData({ points: pointsNum, title: pathwayTitle });
  };

  return (
    <div className="min-h-screen font-['Cairo',sans-serif] flex flex-col justify-start relative overflow-x-hidden bg-slate-50 text-slate-900">
      {/* App Envelope Container */}
      <div
        id="app-root"
        className="w-full min-h-screen flex flex-col bg-white text-slate-900 relative"
      >
        {/* Top Header */}
        <HeaderStats
          userStats={userStats}
          currentUserProfile={currentUserProfile}
          language={language}
          onToggleLanguage={handleToggleLanguage}
          showBackButton={activeTab !== "home" || analysisData !== null}
          onBack={() => {
            if (analysisData !== null) {
              setAnalysisData(null);
            } else if (activeTab !== "home") {
              setActiveTab("home");
            }
          }}
          cameraReady={!isAnalyzing}
          activeTab={activeTab}
          onChangeTab={(tab) => {
            setActiveTab(tab);
            if (tab === "home") {
              setAnalysisData(null);
            }
          }}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onSignOut={handleSignOut}
        />

        {/* Main Tab View Controller */}
        <main className="flex-1 w-full relative">
          {activeTab === "home" && (
            <>
              {!analysisData ? (
                <CameraCaptureScreen
                  onAnalyzeSample={handleAnalyzeSample}
                  onAnalyzeCustom={handleAnalyzeCustom}
                  isAnalyzing={isAnalyzing}
                  analysisError={analysisError}
                  language={language}
                  activeTab="home"
                  onNavigateToScan={() => setActiveTab("scan")}
                />
              ) : (
                <CircularAnalysisScreen
                  analysis={analysisData}
                  onBackToCamera={() => setAnalysisData(null)}
                  onOpenCreativeIdeas={() => setIsCreativeModalOpen(true)}
                  onOpenMapModal={(categoryFilter) => {
                    setSelectedMapCategory(categoryFilter || null);
                    setActiveTab("map");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onOpenAiChat={() => setIsAiChatModalOpen(true)}
                  onClaimPoints={handleClaimPoints}
                  language={language}
                />
              )}
            </>
          )}

          {activeTab === "scan" && (
            <>
              {!analysisData ? (
                <CameraCaptureScreen
                  onAnalyzeSample={handleAnalyzeSample}
                  onAnalyzeCustom={handleAnalyzeCustom}
                  isAnalyzing={isAnalyzing}
                  analysisError={analysisError}
                  language={language}
                  activeTab="scan"
                  onNavigateToScan={() => setActiveTab("scan")}
                />
              ) : (
                <CircularAnalysisScreen
                  analysis={analysisData}
                  onBackToCamera={() => setAnalysisData(null)}
                  onOpenCreativeIdeas={() => setIsCreativeModalOpen(true)}
                  onOpenMapModal={(categoryFilter) => {
                    setSelectedMapCategory(categoryFilter || null);
                    setActiveTab("map");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onOpenAiChat={() => setIsAiChatModalOpen(true)}
                  onClaimPoints={handleClaimPoints}
                  language={language}
                />
              )}
            </>
          )}

          {activeTab === "map" && (
            <DawrMapScreen
              language={language}
              selectedCategoryFilter={selectedMapCategory}
              onClearCategoryFilter={() => setSelectedMapCategory(null)}
              onNavigateToScan={() => setActiveTab("scan")}
            />
          )}

          {activeTab === "updates" && (
            <UpdatesTab
              userStats={userStats}
              language={language}
              onChangeTab={(tab, categoryFilter) => {
                if (categoryFilter && tab === "map") {
                  setSelectedMapCategory(categoryFilter);
                }
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}

          {activeTab === "profile" && (
            <ProfileTab
              userStats={userStats}
              currentUserProfile={currentUserProfile}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onSignOut={handleSignOut}
              language={language}
              onToggleLanguage={handleToggleLanguage}
            />
          )}

          {/* Floating AI Assistant Widget anchored on all pages */}
          <FloatingChatWidget
            language={language}
            productName={analysisData?.productName}
          />
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => {
            setActiveTab(tab);
          }}
          language={language}
        />
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(profile) => {
          setCurrentUserProfile(profile);
          setUserStats({
            points: profile.points,
            savedProductsCount: profile.savedProductsCount,
            levelTitle: profile.levelTitle,
            co2SavedKg: profile.co2SavedKg,
          });
        }}
        language={language}
      />

      {/* Modals */}
      <CreativeIdeasModal
        productName={analysisData?.productName || (language === "ar" ? "منتجك" : "Your Product")}
        material={analysisData?.material || "عامة"}
        isOpen={isCreativeModalOpen}
        onClose={() => setIsCreativeModalOpen(false)}
      />

      <RecyclingMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
      />

      {isAiChatModalOpen && (
        <AiChatDrawer
          productName={analysisData?.productName || (language === "ar" ? "منتجك" : "Your Product")}
          isOpen={isAiChatModalOpen}
          onClose={() => setIsAiChatModalOpen(false)}
          language={language}
        />
      )}

      {/* Notification Toast */}
      {toastData && (
        <ImpactToast
          pointsGained={toastData.points}
          pathwayTitle={toastData.title}
          onClose={() => setToastData(null)}
          isAr={language === "ar"}
        />
      )}
    </div>
  );
}

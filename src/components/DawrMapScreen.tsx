import React, { useState, useMemo } from "react";
import { SustainabilityHub, Language } from "../types";
import { SAUDI_SUSTAINABILITY_HUBS } from "../data/saudiHubsData";
import { MapPin, Navigation, Search, Filter, Phone, ExternalLink, CheckCircle2, XCircle, Sparkles, RefreshCw, ShieldCheck, Star, Clock, Layers, ArrowRight, Building2, Leaf } from "lucide-react";

interface DawrMapScreenProps {
  language: Language;
  selectedCategoryFilter?: string | null;
  onClearCategoryFilter?: () => void;
  onNavigateToScan?: () => void;
}

export const DawrMapScreen: React.FC<DawrMapScreenProps> = ({
  language,
  selectedCategoryFilter,
  onClearCategoryFilter,
  onNavigateToScan,
}) => {
  const isAr = language === "ar";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(selectedCategoryFilter || "all");
  const [activeType, setActiveType] = useState<string>("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedHub, setSelectedHub] = useState<SustainabilityHub | null>(SAUDI_SUSTAINABILITY_HUBS[0]);

  const categories = [
    { id: "all", labelAr: "الكل", labelEn: "All Materials" },
    { id: "textiles", labelAr: "ملابس ومنسوجات", labelEn: "Textiles & Clothing" },
    { id: "electronics", labelAr: "إلكترونيات وأجهزة", labelEn: "Electronics" },
    { id: "plastics", labelAr: "عبوات PET / بلاستيك", labelEn: "Plastics & PET" },
    { id: "paper", labelAr: "ورق وكرتون", labelEn: "Paper & Cardboard" },
    { id: "furniture", labelAr: "أثاث وديكور", labelEn: "Furniture" },
    { id: "appliances", labelAr: "أجهزة منزلية", labelEn: "Home Appliances" },
    { id: "metals", labelAr: "معادن وزجاج وبطاريات", labelEn: "Metals & Glass" },
  ];

  const entityTypes = [
    { id: "all", labelAr: "جميع الأنواع", labelEn: "All Types" },
    { id: "recycling", labelAr: "مراكز إعادة التدوير", labelEn: "Recycling Centers" },
    { id: "ngo", labelAr: "جمعيات غير ربحية", labelEn: "Non-Profits" },
    { id: "donation", labelAr: "نقاط التبرع", labelEn: "Donation Points" },
    { id: "repair", labelAr: "مراكز الإصلاح", labelEn: "Repair Hubs" },
    { id: "reuse", labelAr: "إعادة الاستخدام", labelEn: "Reuse Hubs" },
    { id: "collection", labelAr: "نقاط التجميع الذكية", labelEn: "Smart Drop-Offs" },
  ];

  // Geolocation Handler
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert(isAr ? "متصفحك لا يدعم تحديد الموقع الجغرافي" : "Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setIsLocating(false);
      },
      (err) => {
        console.warn(err);
        setIsLocating(false);
        alert(isAr ? "تم تعذر جلب موقعك، تم تفعيل الموقع التفاعلي الرياض" : "Could not retrieve exact location, using default Riyadh region");
      },
      { timeout: 10000 }
    );
  };

  // Distance calculation helper (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  // Filtered & Distance Sorted Hubs
  const filteredHubs = useMemo(() => {
    return SAUDI_SUSTAINABILITY_HUBS.map((hub) => {
      let distance = hub.distanceKm;
      if (userLocation) {
        distance = calculateDistance(userLocation.lat, userLocation.lng, hub.latitude, hub.longitude);
      }
      return { ...hub, distanceKm: distance };
    })
      .filter((hub) => {
        const matchesCategory = activeCategory === "all" || hub.category === activeCategory;
        const matchesType = activeType === "all" || hub.type === activeType;
        const matchesSearch =
          !searchQuery.trim() ||
          hub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hub.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hub.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hub.acceptedMaterials.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesType && matchesSearch;
      })
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [activeCategory, activeType, searchQuery, userLocation]);

  const bestRecommendedHub = filteredHubs[0] || SAUDI_SUSTAINABILITY_HUBS[0];

  return (
    <div className="w-full min-h-screen bg-[#F8FAF9] text-slate-900 font-sans pb-32" dir={isAr ? "rtl" : "ltr"}>
      
      {/* 1. Header Banner */}
      <div className="bg-white border-b border-slate-200/80 pt-8 pb-6 px-4 sm:px-6 lg:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-950 text-xs font-black border border-emerald-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isAr ? "دليل الاستدامة الوطني بالمملكة" : "Saudi Sustainability Map"}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-emerald-950 tracking-tight">
                {isAr ? "خريطة دَوْر" : "DAWR Map"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-xl">
                {isAr
                  ? "اكتشف أين يأخذ منتجك دوره التالي. ابحث عن أقرب مراكز التدوير، جمعيات التبرع، ورش الإصلاح، ونقاط التجميع التفاعلية في المملكة."
                  : "Discover where your product takes its next cycle. Locate recycling centers, charities, repair shops, and collection points across Saudi Arabia."}
              </p>
            </div>

            {/* Geolocation Button */}
            <button
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="px-5 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-950 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center gap-2 border border-emerald-700 shrink-0"
            >
              <Navigation className={`w-4 h-4 text-emerald-300 ${isLocating ? "animate-spin" : ""}`} />
              <span>{isLocating ? (isAr ? "جاري تحديد الموقع..." : "Locating...") : isAr ? "📍 استخدم موقعي الحالي" : "📍 Use My Location"}</span>
            </button>
          </div>

          {/* Smart Scan Recommendation Top Banner */}
          {selectedCategoryFilter && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-emerald-300 flex items-center justify-center font-black shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-black text-emerald-900 block">
                    {isAr ? "🎯 نتيجة الفحص الذكي محددة تلقائياً:" : "🎯 Smart Scan Recommendation Active:"}
                  </span>
                  <p className="text-xs font-black text-emerald-950">
                    {isAr ? `تصفح أحدث الجهات المخصصة لفئة (${categories.find(c => c.id === selectedCategoryFilter)?.labelAr || selectedCategoryFilter})` : `Filtered for ${selectedCategoryFilter}`}
                  </p>
                </div>
              </div>

              {onClearCategoryFilter && (
                <button
                  onClick={onClearCategoryFilter}
                  className="text-xs font-black text-slate-600 hover:text-slate-900 underline cursor-pointer shrink-0"
                >
                  {isAr ? "عرض جميع الأقسام" : "Clear Filter"}
                </button>
              )}
            </div>
          )}

          {/* 2. Controls: Search Bar & Filters */}
          <div className="space-y-3 pt-2">
            {/* Search Input */}
            <div className="relative w-full max-w-2xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? "ابحث عن جهة أو مادة (مثال: ملابس، إلكترونيات، كرتون، جمعية عيني...)" : "Search by entity or material..."}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 pr-10 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-700 shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute top-3.5 right-3.5" />
            </div>

            {/* Material Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-black text-slate-500 shrink-0 ml-1">
                {isAr ? "المادة:" : "Material:"}
              </span>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition shrink-0 cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-emerald-900 text-white shadow-2xs"
                      : "bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200"
                  }`}
                >
                  {isAr ? cat.labelAr : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Entity Type Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-black text-slate-500 shrink-0 ml-1">
                {isAr ? "نوع الجهة:" : "Type:"}
              </span>
              {entityTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveType(t.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold transition shrink-0 cursor-pointer ${
                    activeType === t.id
                      ? "bg-teal-900 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80"
                  }`}
                >
                  {isAr ? t.labelAr : t.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Best Option Recommendation Card */}
      {bestRecommendedHub && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-700">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center shrink-0 font-black text-xl border border-white/10">
                ♻️
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[11px] font-black text-emerald-300 uppercase tracking-wider block">
                  {isAr ? "🌟 الخيار الأقوى والأنسب لمنتجك" : "🌟 Best Recommendation Match"}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {bestRecommendedHub.name}
                </h3>
                <p className="text-xs text-emerald-100 font-bold">
                  📍 {bestRecommendedHub.address} — <strong className="text-white">{bestRecommendedHub.distanceKm} كم</strong>
                </p>
              </div>
            </div>

            <a
              href={bestRecommendedHub.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0"
            >
              <Navigation className="w-4 h-4" />
              <span>{isAr ? "فتح الاتجاهات المباشرة" : "Get Directions"}</span>
            </a>
          </div>
        </div>
      )}

      {/* 4. Main Interactive Dual Layout (Desktop 60% Map / 40% List) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Interactive Map Visual Box (Desktop 7 cols / Mobile Top) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm space-y-3 flex flex-col h-[480px] sm:h-[560px] relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 px-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <h3 className="text-sm font-black text-slate-900">
                {isAr ? "الخريطة التفاعلية ونقاط التجميع" : "Interactive Map"}
              </h3>
            </div>
            <span className="text-xs font-extrabold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {filteredHubs.length} {isAr ? "جهة متاحة" : "hubs"}
            </span>
          </div>

          {/* Map Canvas Frame with Real Street Map Tiles */}
          <div className="w-full flex-1 rounded-2xl bg-slate-950 relative overflow-hidden border border-slate-200/80 flex items-center justify-center">
            {/* Real Street Map Tiles Iframe Layer */}
            <iframe
              title="Saudi Arabia Interactive Map"
              width="100%"
              height="100%"
              className="absolute inset-0 w-full h-full border-0 z-0 opacity-85 hover:opacity-100 transition-opacity"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                selectedHub ? selectedHub.longitude - 0.08 : (userLocation ? userLocation.lng - 0.15 : 46.55)
              }%2C${
                selectedHub ? selectedHub.latitude - 0.08 : (userLocation ? userLocation.lat - 0.15 : 24.58)
              }%2C${
                selectedHub ? selectedHub.longitude + 0.08 : (userLocation ? userLocation.lng + 0.15 : 46.85)
              }%2C${
                selectedHub ? selectedHub.latitude + 0.08 : (userLocation ? userLocation.lat + 0.15 : 24.85)
              }&layer=mapnik&marker=${selectedHub ? `${selectedHub.latitude}%2C${selectedHub.longitude}` : "24.7136%2C46.6753"}`}
            />

            {/* Custom Interactive Pins Overlay on Map Top */}
            <div className="absolute top-3 right-3 left-3 flex flex-wrap items-center gap-2 z-20 pointer-events-auto">
              {filteredHubs.slice(0, 6).map((hub) => {
                const isSelected = selectedHub?.id === hub.id;
                return (
                  <button
                    key={hub.id}
                    onClick={() => setSelectedHub(hub)}
                    className={`px-3 py-1.5 rounded-xl transition transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-1.5 border text-xs font-black cursor-pointer ${
                      isSelected
                        ? "bg-emerald-900 text-white border-emerald-400 ring-2 ring-emerald-400/50"
                        : "bg-white/95 backdrop-blur-md text-slate-900 border-slate-300 hover:bg-emerald-50"
                    }`}
                  >
                    <span>📍</span>
                    <span className="max-w-[100px] truncate">{hub.name}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                      {hub.distanceKm} كم
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Hub Card Overlay */}
            {selectedHub && (
              <div className="absolute bottom-3 right-3 left-3 bg-white/95 backdrop-blur-md border-2 border-emerald-600 p-4 rounded-2xl shadow-xl z-30 space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                    {selectedHub.typeAr}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    ⏱️ {selectedHub.openingHours}
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900 truncate">
                  {selectedHub.name}
                </h4>
                <p className="text-xs text-slate-600 font-bold truncate">
                  📍 {selectedHub.address}
                </p>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                  <span className="text-xs font-black text-emerald-950">
                    المسافة: {selectedHub.distanceKm} كم
                  </span>
                  <a
                    href={selectedHub.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-black text-xs shadow-2xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{isAr ? "فتح في Google Maps" : "Open Google Maps"}</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hub Cards List Column (Desktop 5 cols / Mobile Bottom) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-700" />
              <span>{isAr ? "الجهات والمراكز القريبة" : "Nearby Hubs"}</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">
              {isAr ? "مرتبة حسب الأقرب" : "Sorted by distance"}
            </span>
          </div>

          {filteredHubs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3 shadow-2xs">
              <Search className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-500">
                {isAr ? "لم نجد جهات مطابقة لفلاتر البحث الحالية. جرب تغيير الفلتر أو المادة." : "No matching hubs found for this search filter."}
              </p>
              <button
                onClick={() => { setActiveCategory("all"); setActiveType("all"); setSearchQuery(""); }}
                className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-950 font-black text-xs cursor-pointer hover:bg-emerald-200 transition"
              >
                {isAr ? "إعادة ضبط الفلاتر" : "Reset Filters"}
              </button>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[540px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredHubs.map((hub) => {
                const isSelected = selectedHub?.id === hub.id;
                return (
                  <div
                    key={hub.id}
                    onClick={() => setSelectedHub(hub)}
                    className={`bg-white border rounded-3xl p-5 transition shadow-2xs cursor-pointer space-y-3 ${
                      isSelected
                        ? "border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/20"
                        : "border-slate-200/90 hover:border-emerald-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-300">
                            {hub.typeAr}
                          </span>
                          {hub.verified && (
                            <span className="text-[10px] font-black text-emerald-700 flex items-center gap-0.5">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {isAr ? "جهة موثقة" : "Verified"}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-slate-900">
                          {hub.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-bold">
                          📍 {hub.address}
                        </p>
                      </div>

                      <div className="text-left shrink-0">
                        <span className="text-xs font-black text-emerald-950 bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200 block">
                          {hub.distanceKm} كم
                        </span>
                      </div>
                    </div>

                    {/* What this place accepts/rejects */}
                    <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl space-y-1.5 text-xs">
                      <span className="font-extrabold text-slate-700 block">
                        {isAr ? "ماذا يقبل هذا المكان؟" : "What this place accepts:"}
                      </span>
                      <div className="space-y-1">
                        {hub.materialsStatus.map((m, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] font-extrabold">
                            <span className={m.accepted ? "text-emerald-950" : "text-slate-500"}>
                              {m.material}
                            </span>
                            {m.accepted ? (
                              <span className="text-emerald-700 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {isAr ? "يستقبل" : "Accepts"}
                              </span>
                            ) : (
                              <span className="text-slate-400 flex items-center gap-0.5">
                                <XCircle className="w-3.5 h-3.5" />
                                {isAr ? "لا يستقبل" : "Rejects"}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Links */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {hub.openingHours}
                      </span>

                      <div className="flex items-center gap-2">
                        {hub.phone && (
                          <a
                            href={`tel:${hub.phone}`}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title={isAr ? "اتصال" : "Call"}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <a
                          href={hub.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-black text-xs shadow-2xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5 text-emerald-300" />
                          <span>{isAr ? "الاتجاهات" : "Directions"}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo, useEffect, useRef } from "react";
import { SustainabilityHub, Language } from "../types";
import { SAUDI_SUSTAINABILITY_HUBS } from "../data/saudiHubsData";
import { 
  MapPin, 
  Navigation, 
  Search, 
  SlidersHorizontal, 
  Phone, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  Building2, 
  Locate, 
  ChevronDown, 
  ChevronUp,
  Map as MapIcon,
  List as ListIcon,
  AlertCircle
} from "lucide-react";

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
  
  // Interactive UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTypeTab, setActiveTypeTab] = useState<string>("all"); // all, reuse, repair, donation, recycling
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Advanced filters
  const [filterMaterial, setFilterMaterial] = useState<string>("all");
  const [filterCity, setFilterCity] = useState<string>("all");
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState<boolean>(false);
  const [filterOpenOnly, setFilterOpenOnly] = useState<boolean>(false);
  const [filterMaxDistance, setFilterMaxDistance] = useState<number>(50); // in km
  
  // Geolocation and navigation
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Selected Hub
  const [selectedHub, setSelectedHub] = useState<SustainabilityHub | null>(SAUDI_SUSTAINABILITY_HUBS[0]);
  const [expandedHubId, setExpandedHubId] = useState<string | null>(null);

  // Mobile layout state: tab switcher between map and list
  const [mobileViewMode, setMobileViewMode] = useState<"map" | "list">("map");

  const listContainerRef = useRef<HTMLDivElement>(null);

  // Contextual smart override if redirected from scanner
  useEffect(() => {
    if (selectedCategoryFilter) {
      setFilterMaterial(selectedCategoryFilter);
      setActiveTypeTab("all");
    }
  }, [selectedCategoryFilter]);

  const categories = [
    { id: "all", labelAr: "كل المواد", labelEn: "All Materials" },
    { id: "textiles", labelAr: "ملابس ومنسوجات", labelEn: "Textiles & Clothing" },
    { id: "electronics", labelAr: "إلكترونيات وأجهزة", labelEn: "Electronics" },
    { id: "plastics", labelAr: "عبوات PET / بلاستيك", labelEn: "Plastics & PET" },
    { id: "paper", labelAr: "ورق وكرتون", labelEn: "Paper & Cardboard" },
    { id: "furniture", labelAr: "أثاث وديكور", labelEn: "Furniture" },
    { id: "appliances", labelAr: "أجهزة منزلية", labelEn: "Home Appliances" },
    { id: "metals", labelAr: "معادن وزجاج وبطاريات", labelEn: "Metals & Glass" },
  ];

  const cities = [
    { id: "all", labelAr: "جميع المدن", labelEn: "All Cities" },
    { id: "الرياض", labelAr: "الرياض", labelEn: "Riyadh" },
    { id: "جدة", labelAr: "جدة", labelEn: "Jeddah" },
    { id: "الدمام", labelAr: "الدمام", labelEn: "Dammam" },
  ];

  // Geolocation Handler
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(isAr ? "متصفحك لا يدعم تحديد الموقع الجغرافي." : "Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setIsLocating(false);
      },
      (err) => {
        console.warn("Geolocation failure:", err);
        setIsLocating(false);
        setLocationError(isAr ? "تعذر تحديد موقعك. يمكنك البحث يدويًا." : "Could not retrieve your location. You can search manually.");
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
      let distance = hub.distanceKm || 3.5; // demo fallback
      if (userLocation) {
        distance = calculateDistance(userLocation.lat, userLocation.lng, hub.latitude, hub.longitude);
      }
      return { ...hub, distanceKm: distance };
    })
      .filter((hub) => {
        // 1. Text Search query filter
        const matchesSearch =
          !searchQuery.trim() ||
          hub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hub.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hub.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hub.acceptedMaterials.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

        // 2. Type Tab Filter
        let matchesTypeTab = true;
        if (activeTypeTab === "reuse") {
          matchesTypeTab = hub.type === "reuse";
        } else if (activeTypeTab === "repair") {
          matchesTypeTab = hub.type === "repair";
        } else if (activeTypeTab === "donation") {
          matchesTypeTab = hub.type === "donation" || hub.type === "ngo";
        } else if (activeTypeTab === "recycling") {
          matchesTypeTab = hub.type === "recycling" || hub.type === "collection";
        }

        // 3. Material category filter
        const matchesMaterial = filterMaterial === "all" || hub.category === filterMaterial;

        // 4. City filter
        const matchesCity = filterCity === "all" || hub.city.includes(filterCity) || filterCity.includes(hub.city);

        // 5. Verified only filter
        const matchesVerified = !filterVerifiedOnly || hub.verified;

        // 6. Distance filter
        const matchesDistance = hub.distanceKm <= filterMaxDistance;

        return matchesSearch && matchesTypeTab && matchesMaterial && matchesCity && matchesVerified && matchesDistance;
      })
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [searchQuery, activeTypeTab, filterMaterial, filterCity, filterVerifiedOnly, filterMaxDistance, userLocation]);

  // Synchronized Selection
  const handleSelectHub = (hub: SustainabilityHub, highlightMarker = true) => {
    setSelectedHub(hub);
    setExpandedHubId(hub.id);

    // Smooth scroll list card into view
    if (listContainerRef.current) {
      const element = document.getElementById(`hub-card-${hub.id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  };

  const handleToggleDetails = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedHubId(prev => prev === id ? null : id);
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAF9] text-slate-900 font-sans pb-32" dir={isAr ? "rtl" : "ltr"}>
      
      {/* 1. HERO COMPACT */}
      <section className="bg-white border-b border-slate-200/80 pt-6 pb-5 px-4 sm:px-6 lg:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5 text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-950 text-xs font-black border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isAr ? "دليل الاستدامة الذكي" : "Smart Circular Finder"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-955 tracking-tight leading-tight">
              {isAr ? "خريطة دَوْر" : "DAWR Map"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-xl leading-relaxed">
              {isAr ? "اعثر على أفضل جهة لتنفيذ قرارك الدائري." : "Find the best circular decision outlet."}
            </p>
          </div>
        </div>
      </section>

      {/* 2. SMART SEARCH & FILTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-4">
        
        {/* Search Bar Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          {/* Main search bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحث عن منتج، مادة أو جهة..." : "Search for product, material, or hub..."}
              className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-2xl py-3 px-4 pr-10 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none shadow-2xs placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute top-4 right-3.5" />
          </div>

          {/* Locate Button */}
          <button
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-emerald-950 border border-slate-300 font-black text-xs sm:text-sm shadow-2xs hover:scale-[1.01] active:scale-[0.99] transition duration-150 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Locate className={`w-4 h-4 text-emerald-700 ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? (isAr ? "تحديد الموقع..." : "Locating...") : isAr ? "تحديد موقعي" : "Locate Me"}</span>
          </button>
        </div>

        {/* Location Denied Warning */}
        {locationError && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold p-3 rounded-xl flex items-center gap-2 max-w-2xl">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Contextual Smart Scan Banner */}
        {selectedCategoryFilter && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs max-w-3xl">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4.5 h-4.5 text-emerald-700 shrink-0" />
              <div className="text-right">
                <span className="text-[10px] font-black text-emerald-900 block">
                  {isAr ? "مصفى بناءً على فحص منتجك:" : "Filtered for scan recommendation:"}
                </span>
                <p className="text-xs font-black text-emerald-950">
                  {isAr 
                    ? `أفضل الجهات المناسبة لـ (${categories.find(c => c.id === selectedCategoryFilter)?.labelAr || selectedCategoryFilter})` 
                    : `Optimal hubs matching your scan of ${selectedCategoryFilter}`}
                </p>
              </div>
            </div>
            {onClearCategoryFilter && (
              <button
                onClick={onClearCategoryFilter}
                className="text-xs font-black text-emerald-800 hover:text-emerald-900 underline cursor-pointer shrink-0"
              >
                {isAr ? "عرض الكل" : "Clear Filter"}
              </button>
            )}
          </div>
        )}

        {/* Single Row of Main Filters + More */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", labelAr: "الكل", labelEn: "All" },
            { id: "reuse", labelAr: "إعادة استخدام", labelEn: "Reuse" },
            { id: "repair", labelAr: "إصلاح", labelEn: "Repair" },
            { id: "donation", labelAr: "تبرع", labelEn: "Donate" },
            { id: "recycling", labelAr: "استرداد مواد", labelEn: "Material Recovery" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTypeTab(tab.id)}
              className={`px-4.5 py-2 rounded-xl text-xs font-black transition shrink-0 cursor-pointer ${
                activeTypeTab === tab.id
                  ? "bg-emerald-900 text-white shadow-2xs"
                  : "bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200"
              }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}

          {/* Advanced Filters Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4.5 py-2 rounded-xl text-xs font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer border ${
              showAdvancedFilters 
                ? "bg-slate-900 text-white border-slate-800 shadow-2xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isAr ? "المزيد" : "More"}</span>
          </button>
        </div>

        {/* Collapsible Advanced Filters Drawer Panel */}
        {showAdvancedFilters && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* 1. Material Selector */}
            <div className="space-y-1.5 text-right">
              <label className="text-[11px] font-black text-slate-500 block">
                {isAr ? "نوع المادة" : "Material Type"}
              </label>
              <select
                value={filterMaterial}
                onChange={(e) => setFilterMaterial(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-extrabold text-slate-800 focus:outline-none"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{isAr ? c.labelAr : c.labelEn}</option>
                ))}
              </select>
            </div>

            {/* 2. City Selector */}
            <div className="space-y-1.5 text-right">
              <label className="text-[11px] font-black text-slate-500 block">
                {isAr ? "المدينة" : "City"}
              </label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-extrabold text-slate-800 focus:outline-none"
              >
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{isAr ? c.labelAr : c.labelEn}</option>
                ))}
              </select>
            </div>

            {/* 3. Distance Radius Slider */}
            <div className="space-y-1.5 text-right">
              <div className="flex justify-between text-[11px] font-black text-slate-500">
                <span>{isAr ? "المسافة القصوى" : "Max Distance"}</span>
                <span>{filterMaxDistance} كم</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={filterMaxDistance}
                onChange={(e) => setFilterMaxDistance(Number(e.target.value))}
                className="w-full accent-emerald-800 cursor-pointer pt-2"
              />
            </div>

            {/* 4. Filters Checkbox Switches */}
            <div className="flex items-center gap-4 justify-start pt-4 sm:pt-2 sm:col-span-2 lg:col-span-1">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterVerifiedOnly}
                  onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
                  className="rounded border-slate-300 accent-emerald-800 w-4.5 h-4.5 cursor-pointer"
                />
                <span>{isAr ? "موثقة فقط" : "Verified Only"}</span>
              </label>
            </div>
          </div>
        )}
      </section>

      {/* Mobile View Switcher Tab (Only on screens below lg) */}
      <div className="max-w-7xl mx-auto px-4 mt-6 lg:hidden flex justify-center">
        <div className="inline-flex bg-white border border-slate-200 p-1 rounded-2xl shadow-2xs">
          <button
            onClick={() => setMobileViewMode("map")}
            className={`px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
              mobileViewMode === "map"
                ? "bg-emerald-900 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>{isAr ? "عرض الخريطة" : "Map View"}</span>
          </button>
          <button
            onClick={() => setMobileViewMode("list")}
            className={`px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
              mobileViewMode === "list"
                ? "bg-emerald-900 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <ListIcon className="w-4 h-4" />
            <span>
              {isAr ? `النتائج (${filteredHubs.length})` : `Results (${filteredHubs.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* 3. DUAL LAYOUT GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT/RIGHT COLUMN: HUB RESULTS PANEL (Desktop 35% width, hidden on mobile if map view active) */}
          <div 
            className={`lg:col-span-4 flex flex-col space-y-4 ${
              mobileViewMode === "list" ? "block" : "hidden lg:flex"
            }`}
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider">
                {isAr ? "النتائج القريبة" : "Nearby Outlets"}
              </h3>
              <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {filteredHubs.length} {isAr ? "موقع متاح" : "outlets found"}
              </span>
            </div>

            {/* Empty State */}
            {filteredHubs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-2xs">
                <Search className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-xs sm:text-sm font-bold text-slate-600 leading-relaxed">
                  {isAr 
                    ? "لم نجد جهة مطابقة. جرّب توسيع المسافة أو تغيير نوع المسار." 
                    : "No matching hubs. Try expanding radius or resetting search filters."}
                </p>
                <button
                  onClick={() => {
                    setFilterMaterial("all");
                    setActiveTypeTab("all");
                    setSearchQuery("");
                    setFilterCity("all");
                    setFilterMaxDistance(50);
                    setFilterVerifiedOnly(false);
                  }}
                  className="px-5 py-3 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black text-xs sm:text-sm transition cursor-pointer"
                >
                  {isAr ? "إعادة ضبط الفلاتر" : "Reset Filters"}
                </button>
              </div>
            ) : (
              /* Results Scroll List */
              <div 
                ref={listContainerRef}
                className="space-y-4 max-h-[640px] overflow-y-auto pr-1.5 scrollbar-thin scroll-smooth"
              >
                {filteredHubs.map((hub, idx) => {
                  const isSelected = selectedHub?.id === hub.id;
                  const isExpanded = expandedHubId === hub.id;
                  const isRecommended = idx === 0; // First item is recommended

                  return (
                    <div
                      key={hub.id}
                      id={`hub-card-${hub.id}`}
                      onClick={() => handleSelectHub(hub, true)}
                      className={`bg-white border rounded-3xl p-5 transition shadow-2xs hover:shadow-md cursor-pointer space-y-4 relative ${
                        isSelected
                          ? "border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/10"
                          : "border-slate-200/90 hover:border-emerald-300"
                      }`}
                    >
                      {/* Recommended badge overlay */}
                      {isRecommended && (
                        <span className="absolute -top-2.5 right-4 bg-emerald-950 text-emerald-300 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-800 shadow-sm">
                          ✦ {isAr ? "موصى به لدَوْر" : "Recommended by DAWR"}
                        </span>
                      )}

                      {/* Card Content Top row */}
                      <div className="flex items-start justify-between gap-3 pt-1">
                        <div className="space-y-1 text-right">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-black bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded border border-emerald-200">
                              {hub.typeAr}
                            </span>
                            {hub.verified && (
                              <span className="text-[10px] font-black text-emerald-700 flex items-center gap-0.5">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>{isAr ? "موثقة" : "Verified"}</span>
                              </span>
                            )}
                            {isRecommended && (
                              <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">
                                94% {isAr ? "تطابق" : "match"}
                              </span>
                            )}
                          </div>
                          
                          <h4 className="text-base font-black text-slate-900 group-hover:text-emerald-900 transition-colors">
                            {hub.name}
                          </h4>
                          
                          {/* Recommended chips reason */}
                          {isRecommended && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[9px] font-black text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {isAr ? "يقبل المادة" : "Accepts material"}
                              </span>
                              <span className="text-[9px] font-black text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {isAr ? "الأقرب" : "Closest"}
                              </span>
                              <span className="text-[9px] font-black text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {isAr ? "متاح الآن" : "Open now"}
                              </span>
                            </div>
                          )}

                          <p className="text-xs text-slate-500 font-bold">
                            📍 {hub.address}
                          </p>
                        </div>

                        {/* Distance Badge */}
                        <div className="text-left shrink-0">
                          <span className="text-xs font-black text-emerald-950 bg-[#F8FAF9] border border-slate-200 px-2.5 py-1 rounded-xl block">
                            {hub.distanceKm} كم
                          </span>
                        </div>
                      </div>

                      {/* Expanded Section (Progressive Disclosure) */}
                      {isExpanded && (
                        <div className="bg-[#F8FAF9] border border-slate-200/80 p-4 rounded-2xl space-y-3 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                          {/* Phone & Hours */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{hub.openingHours}</span>
                            </span>
                            {hub.phone && (
                              <a href={`tel:${hub.phone}`} className="flex items-center gap-1 text-emerald-800 hover:underline">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span dir="ltr">{hub.phone}</span>
                              </a>
                            )}
                          </div>

                          {/* Full Accepted status */}
                          <div className="space-y-1.5 border-t border-slate-200/60 pt-2.5">
                            <span className="font-extrabold text-slate-700 block">
                              {isAr ? "حالة المواد المقبولة:" : "Material intake status:"}
                            </span>
                            <div className="grid grid-cols-1 gap-1">
                              {hub.materialsStatus.map((m, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[11px] font-extrabold">
                                  <span className={m.accepted ? "text-emerald-950" : "text-slate-400"}>
                                    • {m.material}
                                  </span>
                                  {m.accepted ? (
                                    <span className="text-emerald-700 flex items-center gap-0.5">
                                      <CheckCircle2 className="w-3 h-3" />
                                      {isAr ? "يستقبل" : "Accepts"}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 flex items-center gap-0.5">
                                      <XCircle className="w-3 h-3" />
                                      {isAr ? "لا يستقبل" : "Rejects"}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Card Action bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <button
                          onClick={(e) => handleToggleDetails(hub.id, e)}
                          className="text-xs font-black text-slate-500 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer bg-transparent border-none p-1"
                        >
                          <span>{isAr ? "التفاصيل" : "Details"}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>

                        <a
                          href={hub.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-black text-xs shadow-2xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5 text-emerald-300" />
                          <span>{isAr ? "الاتجاهات" : "Directions"}</span>
                        </a>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* LEFT/RIGHT COLUMN: INTERACTIVE GEOSPATIAL MAP (Desktop 65% width, hidden on mobile if list view active) */}
          <div 
            className={`lg:col-span-8 bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm space-y-3 flex flex-col h-[520px] sm:h-[600px] relative overflow-hidden ${
              mobileViewMode === "map" ? "block" : "hidden lg:flex"
            }`}
          >
            {/* Map Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 px-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-black text-slate-900">
                  {isAr ? "الخريطة ونقاط الفرز" : "Map & Collection Points"}
                </h3>
              </div>
              <span className="text-xs font-black text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {filteredHubs.length} {isAr ? "جهة متاحة" : "hubs"}
              </span>
            </div>

            {/* Map Frame Container */}
            <div className="w-full flex-1 rounded-2xl bg-slate-950 relative overflow-hidden border border-slate-200/80 flex items-center justify-center">
              <iframe
                title="Saudi Arabia Interactive Map"
                width="100%"
                height="100%"
                className="absolute inset-0 w-full h-full border-0 z-0 opacity-90 hover:opacity-100 transition-opacity"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  selectedHub ? selectedHub.longitude - 0.04 : (userLocation ? userLocation.lng - 0.1 : 46.6)
                }%2C${
                  selectedHub ? selectedHub.latitude - 0.04 : (userLocation ? userLocation.lat - 0.1 : 24.65)
                }%2C${
                  selectedHub ? selectedHub.longitude + 0.04 : (userLocation ? userLocation.lng + 0.1 : 46.8)
                }%2C${
                  selectedHub ? selectedHub.latitude + 0.04 : (userLocation ? userLocation.lat + 0.1 : 24.85)
                }&layer=mapnik&marker=${selectedHub ? `${selectedHub.latitude}%2C${selectedHub.longitude}` : "24.7136%2C46.6753"}`}
              />

              {/* Map pins container overlay (Horizontal list of available pins) */}
              <div className="absolute top-3 right-3 left-3 flex flex-wrap items-center gap-2 z-20 pointer-events-auto max-h-[140px] overflow-y-auto scrollbar-none pr-1">
                {filteredHubs.slice(0, 8).map((hub, idx) => {
                  const isSelected = selectedHub?.id === hub.id;
                  const isRecommended = idx === 0;
                  return (
                    <button
                      key={hub.id}
                      onClick={() => handleSelectHub(hub, false)}
                      className={`px-3 py-1.5 rounded-xl transition transform hover:scale-[1.03] active:scale-95 shadow-md flex items-center gap-1.5 border text-[11px] font-black cursor-pointer ${
                        isSelected
                          ? "bg-emerald-900 text-white border-emerald-400 ring-2 ring-emerald-400/50"
                          : "bg-white/95 backdrop-blur-md text-slate-900 border-slate-300 hover:bg-emerald-50"
                      } ${isRecommended && !isSelected ? "ring-2 ring-emerald-300/40" : ""}`}
                    >
                      <span>📍</span>
                      <span className="max-w-[85px] truncate">{hub.name}</span>
                      <span className="text-[9px] text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded">
                        {hub.distanceKm} كم
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Hub Map Card Overlay */}
              {selectedHub && (
                <div className="absolute bottom-3 right-3 left-3 bg-white/95 backdrop-blur-md border border-emerald-500 p-4.5 rounded-2xl shadow-xl z-30 space-y-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        {selectedHub.typeAr}
                      </span>
                      {selectedHub.verified && (
                        <span className="text-[9px] font-black text-emerald-700 flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{isAr ? "موثقة" : "Verified"}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{selectedHub.openingHours}</span>
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-black text-slate-900 truncate">
                    {selectedHub.name}
                  </h4>
                  <p className="text-xs text-slate-600 font-bold truncate">
                    📍 {selectedHub.address}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-black text-emerald-950">
                      {isAr ? "المسافة:" : "Distance:"} {selectedHub.distanceKm} كم
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleDetails(selectedHub.id, e)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{isAr ? "التفاصيل" : "Details"}</span>
                      </button>
                      <a
                        href={selectedHub.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-black text-xs shadow-2xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{isAr ? "الاتجاهات" : "Directions"}</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

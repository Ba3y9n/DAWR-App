import React, { useState } from "react";
import { NEARBY_HUBS } from "../data/presetSamples";
import { MapPin, X, Navigation, Clock, ExternalLink, Compass } from "lucide-react";

interface RecyclingMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecyclingMapModal: React.FC<RecyclingMapModalProps> = ({ isOpen, onClose }) => {
  const [selectedCity, setSelectedCity] = useState<string>("buraidah");
  const [filter, setFilter] = useState<string>("all");
  const [selectedHubId, setSelectedHubId] = useState<number>(1);

  if (!isOpen) return null;

  const cityFilteredHubs = selectedCity === "all" 
    ? NEARBY_HUBS 
    : NEARBY_HUBS.filter((h) => h.city === selectedCity);

  const filteredHubs = filter === "all" 
    ? cityFilteredHubs 
    : cityFilteredHubs.filter((h) => h.type.includes(filter));

  const activeHub = NEARBY_HUBS.find((h) => h.id === selectedHubId) || filteredHubs[0] || NEARBY_HUBS[0];

  const mapQuery = activeHub 
    ? encodeURIComponent(`${activeHub.googleMapsQuery || activeHub.name} ${activeHub.address}`)
    : encodeURIComponent("نقاط فرز وإعادة تدوير بريدة السعودية");

  const mapIframeUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const openGoogleMapsDirections = (hubName: string, hubAddress: string) => {
    const dest = encodeURIComponent(`${hubName} ${hubAddress}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50/70 dark:bg-slate-950/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 text-white dark:bg-emerald-900 dark:text-emerald-300 rounded-xl shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">خريطة نقاط الفرز والجمعيات</h3>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium">مواقع نقاط التجميع والجمعيات المعتمدة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* City Switcher Bar */}
        <div className="px-3 py-2 bg-emerald-800 text-white dark:bg-emerald-950/90 border-b border-emerald-900 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold shrink-0">
            <Compass className="w-4 h-4 text-emerald-300 animate-spin" style={{ animationDuration: '10s' }} />
            <span className="hidden sm:inline">اختر المدينة:</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => { setSelectedCity("buraidah"); setSelectedHubId(1); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                selectedCity === "buraidah"
                  ? "bg-white text-emerald-900 shadow-xs"
                  : "bg-emerald-700/60 text-emerald-100 hover:bg-emerald-700"
              }`}
            >
              بريدة (القصيم)
            </button>
            <button
              onClick={() => { setSelectedCity("riyadh"); setSelectedHubId(5); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                selectedCity === "riyadh"
                  ? "bg-white text-emerald-900 shadow-xs"
                  : "bg-emerald-700/60 text-emerald-100 hover:bg-emerald-700"
              }`}
            >
              الرياض
            </button>
            <button
              onClick={() => setSelectedCity("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                selectedCity === "all"
                  ? "bg-white text-emerald-900 shadow-xs"
                  : "bg-emerald-700/60 text-emerald-100 hover:bg-emerald-700"
              }`}
            >
              جميع المناطق
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-xl whitespace-nowrap transition font-bold cursor-pointer ${
              filter === "all"
                ? "bg-emerald-800 text-white dark:bg-emerald-700"
                : "bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
            }`}
          >
            الكل ({cityFilteredHubs.length})
          </button>
          <button
            onClick={() => setFilter("تبرع")}
            className={`px-3 py-1 rounded-xl whitespace-nowrap transition font-bold cursor-pointer ${
              filter === "تبرع"
                ? "bg-emerald-800 text-white dark:bg-emerald-700"
                : "bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
            }`}
          >
            التبرع والملابس
          </button>
          <button
            onClick={() => setFilter("إلكترونيات")}
            className={`px-3 py-1 rounded-xl whitespace-nowrap transition font-bold cursor-pointer ${
              filter === "إلكترونيات"
                ? "bg-emerald-800 text-white dark:bg-emerald-700"
                : "bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
            }`}
          >
            إلكترونيات
          </button>
          <button
            onClick={() => setFilter("بلاستيك")}
            className={`px-3 py-1 rounded-xl whitespace-nowrap transition font-bold cursor-pointer ${
              filter === "بلاستيك"
                ? "bg-emerald-800 text-white dark:bg-emerald-700"
                : "bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
            }`}
          >
            بلاستيك وعلب
          </button>
        </div>

        {/* Live Interactive Google Maps Embed Container */}
        <div className="w-full h-48 sm:h-52 bg-slate-900 relative border-b border-slate-200 dark:border-slate-800 shrink-0">
          <iframe
            title="Google Maps Recycling Points"
            src={mapIframeUrl}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
          <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-500/40 text-emerald-300 text-[10px] font-black flex items-center gap-1 shadow-md">
            <Navigation className="w-3 h-3 text-emerald-400" />
            <span>خريطة تفاعلية: {activeHub ? activeHub.name : "نقاط الفرز"}</span>
          </div>
        </div>

        {/* List of Hubs */}
        <div className="p-3.5 overflow-y-auto space-y-2.5 flex-1 max-h-[260px]">
          {filteredHubs.map((hub) => {
            const isSelected = hub.id === selectedHubId;
            return (
              <div
                key={hub.id}
                onClick={() => setSelectedHubId(hub.id)}
                className={`border rounded-2xl p-3 transition space-y-2 cursor-pointer ${
                  isSelected
                    ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                      <span>{hub.name}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                      )}
                    </h4>
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold">{hub.type}</span>
                  </div>
                  <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800 shrink-0">
                    {hub.distance}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <span>{hub.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{hub.hours}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/80 dark:border-slate-900">
                  <div className="flex flex-wrap gap-1">
                    {hub.accepted.map((acc, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800"
                      >
                        {acc}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openGoogleMapsDirections(hub.name, hub.address);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition active:scale-95 shadow-xs shrink-0 cursor-pointer"
                  >
                    <span>الاتجاهات</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

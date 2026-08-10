import { PresetSample, CharityPlatform } from "../types";

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: "shirt",
    name: "قميص قطني",
    badge: "منسوجات",
    color: "emerald",
    bgGradient: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
    sampleImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "cardboard",
    name: "كرتون تغليف",
    badge: "ورق وكرتون",
    color: "amber",
    bgGradient: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
    sampleImage: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "electronics",
    name: "جهاز إلكتروني",
    badge: "إلكترونيات",
    color: "blue",
    bgGradient: "from-blue-500/20 to-indigo-500/10 border-blue-500/30",
    sampleImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "plastic",
    name: "قارورة بلاستيك",
    badge: "بلاستيك PET",
    color: "cyan",
    bgGradient: "from-cyan-500/20 to-sky-500/10 border-cyan-500/30",
    sampleImage: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "book",
    name: "كتاب ورقي",
    badge: "ورق مطبوع",
    color: "purple",
    bgGradient: "from-purple-500/20 to-violet-500/10 border-purple-500/30",
    sampleImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80"
  }
];

export const NEARBY_HUBS = [
  {
    id: 1,
    name: "مركز كسوة الخيري - فرع بريدة / القصيم",
    city: "buraidah",
    cityName: "بريدة (القصيم)",
    type: "تبرع وإعادة استخدام",
    distance: "1.1 كم",
    address: "طريق الملك عبدالمجيد - حي النهضة، بريدة",
    googleMapsQuery: "مشروع كسوة الخيري بريدة القصيم",
    lat: 26.3592,
    lng: 43.9818,
    phone: "+966 16 388 1234",
    hours: "8:00 ص - 10:00 م",
    accepted: ["ملابس", "أحذية", "أنسجة منزلية", "حقائب"]
  },
  {
    id: 2,
    name: "آلة استرجاع العبوات الذكية (RVM Bottle Hub) - العثيم مول بريدة",
    city: "buraidah",
    cityName: "بريدة (القصيم)",
    type: "تدوير بلاستيك وألومنيوم",
    distance: "0.6 كم",
    address: "طريق عثمان بن عفان - العثيم مول، بريدة",
    googleMapsQuery: "العثيم مول بريدة",
    lat: 26.3725,
    lng: 43.9650,
    phone: "متاح 24/7",
    hours: "24 ساعة",
    accepted: ["عبوات بلاستيك PET", "علب غازية ألومنيوم"]
  },
  {
    id: 3,
    name: "نقطة تجميع النفايات الإلكترونية (E-Waste Hub) - مجمع الاتصالات ببريدة",
    city: "buraidah",
    cityName: "بريدة (القصيم)",
    type: "تدوير إلكترونيات",
    distance: "1.8 كم",
    address: "شارع الخبيب - مجمع الاتصالات، بريدة",
    googleMapsQuery: "شارع الخبيب بريدة",
    lat: 26.3312,
    lng: 43.9680,
    phone: "+966 16 322 9900",
    hours: "9:00 ص - 9:00 م",
    accepted: ["شواحن", "هواتف", "أجهزة منزلية", "بطاريات"]
  },
  {
    id: 4,
    name: "حاوية الفرز الأخضر للورق والكرتون - حديقة الملك خالد بريدة",
    city: "buraidah",
    cityName: "بريدة (القصيم)",
    type: "تدوير ورق",
    distance: "0.4 كم",
    address: "طريق الملك فهد - حديقة الملك خالد، بريدة",
    googleMapsQuery: "حديقة الملك خالد بريدة",
    lat: 26.3450,
    lng: 43.9720,
    phone: "حاوية إيداع مفتوحة",
    hours: "24 ساعة",
    accepted: ["كرتون مقوى", "أوراق", "جرائد", "كتب قديمة"]
  },
  {
    id: 5,
    name: "مركز كسوة الخيري - الرياض",
    city: "riyadh",
    cityName: "الرياض",
    type: "تبرع وإعادة استخدام",
    distance: "1.2 كم",
    address: "شارع التخصصي - حي المعذر، الرياض",
    googleMapsQuery: "مشروع كسوة الخيري الرياض",
    lat: 24.6900,
    lng: 46.6800,
    phone: "+966 11 400 1234",
    hours: "8:00 ص - 10:00 م",
    accepted: ["ملابس", "أحذية", "أنسجة منزلية", "حقائب"]
  },
  {
    id: 6,
    name: "نقطة تجميع النفايات الإلكترونية - طريق الملك فهد الرياض",
    city: "riyadh",
    cityName: "الرياض",
    type: "تدوير إلكترونيات",
    distance: "2.5 كم",
    address: "طريق الملك فهد - مجمع العليا التكنولوجي، الرياض",
    googleMapsQuery: "طريق الملك فهد العليا الرياض",
    lat: 24.7136,
    lng: 46.6753,
    phone: "+966 11 488 9900",
    hours: "9:00 ص - 8:00 م",
    accepted: ["شواحن", "هواتف", "أجهزة منزلية", "بطاريات"]
  }
];

export const VERIFIED_CHARITIES: CharityPlatform[] = [
  {
    id: "ehsan",
    name: "منصة إحسان الوطنية للعمل الخيري",
    nameEn: "Ehsan National Charity Platform",
    description: "المنصة الوطنية المعتمدة لتمكين وتسهيل التبرع وإيصال الفائض للجمعيات الأهلية المسجلة رسمياً.",
    descriptionEn: "Official national platform empowering donations and distributing surplus to registered charities.",
    category: "منصة وطنية شاملة",
    categoryEn: "National Platform",
    websiteUrl: "https://ehsan.sa",
    logoText: "EHSAN",
    verifiedBadge: true,
    acceptedItems: ["ملابس", "أثاث", "أجهزة إلكترونية", "كتب", "فائض طعام"]
  },
  {
    id: "kiswa",
    name: "مشروع كسوة الخيري للملابس والأنسجة",
    nameEn: "Kiswa Clothing Charity Project",
    description: "مشروع رسمي متكامل لجمع وإعادة تدوير وإهداء الفائض من الملابس والمستلزمات للجمهور والجمعيات.",
    descriptionEn: "Official project for collecting, recycling, and donating surplus clothing and textiles.",
    category: "كسوة وملابس",
    categoryEn: "Clothing & Apparel",
    websiteUrl: "https://kiswa.org.sa",
    logoText: "KISWA",
    verifiedBadge: true,
    acceptedItems: ["ملابس رجالية ونسائية", "أحذية", "حقائب", "بطانيات وأغطية"]
  },
  {
    id: "tabarru",
    name: "منصة تبرع الوطنية",
    nameEn: "Tabarru Official Platform",
    description: "المنصة الرسمية المعتمدة من وزارة الموارد البشرية والتنمية الاجتماعية لتوجيه التبرعات العينية والمادية.",
    descriptionEn: "Official platform under the Ministry of Human Resources for in-kind donations.",
    category: "منصة حكوكية رسمية",
    categoryEn: "Governmental Portal",
    websiteUrl: "https://donations.sa",
    logoText: "TABARRU",
    verifiedBadge: true,
    acceptedItems: ["أثاث وأجهزة", "مستلزمات مدرسية", "أجهزة حاسوب", "ملابس"]
  },
  {
    id: "albirr",
    name: "جمعية البر الخيرية",
    nameEn: "Al Birr Charity Association",
    description: "جمعية خيرية معتمدة تدعم الأسر المتعففة وتستقبل الأثاث والمستلزمات الكهربائية والمنزلية السليمة.",
    descriptionEn: "Certified charity association supporting families with furniture, electronics, and goods.",
    category: "جمعية أهلية معتمدة",
    categoryEn: "Community NGO",
    websiteUrl: "https://albir.org.sa",
    logoText: "ALBIRR",
    verifiedBadge: true,
    acceptedItems: ["أثاث منزلي", "أجهزة كهربائية", "أواني منزلية", "ملابس"]
  }
];

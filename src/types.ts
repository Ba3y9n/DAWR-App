export interface Pathway {
  rank: number;
  badge: string;
  badgeColor: string;
  title: string;
  category: string;
  description: string;
  points: string;
  suitability: string;
  actionText?: string;
}

export interface QuickStats {
  savedCo2: string;
  savedWater: string;
  landfillDiverted: string;
}

export interface CircularScores {
  reuse: number;
  repair: number;
  donation: number;
  recycling: number;
}

export interface ProductAnalysis {
  product: string;
  productName: string;
  condition: string;
  material: string;
  circularScore: number;
  circular_score?: number;
  scoreLabel: string;
  environmentalImpact: string;
  assessmentText?: string;
  quickStats: QuickStats;
  metrics?: QuickStats;
  scores: CircularScores;
  breakdown?: CircularScores;
  recommended_action: "donation" | "reuse" | "repair" | "recycling" | "disposal" | string;
  pathways: Pathway[];
  imagePreview?: string;
  isRealGeminiAnalysis?: boolean;
}

export interface CreativeIdea {
  title: string;
  description: string;
  difficulty: string;
  materialsNeeded: string;
}

export interface UserStats {
  points: number;
  savedProductsCount: number;
  levelTitle: string;
  co2SavedKg: number;
}

export interface ScanHistoryItem {
  id?: string;
  productName: string;
  material: string;
  actionTaken?: string;
  circularScore: number;
  pointsEarned: number;
  date: string;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  points: number;
  savedProductsCount: number;
  levelTitle: string;
  co2SavedKg: number;
  scansHistory?: ScanHistoryItem[];
  completedChallenges?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PresetSample {
  id: string;
  name: string;
  icon?: string;
  badge: string;
  color: string;
  bgGradient: string;
  sampleImage: string;
}

export interface CharityPlatform {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: string;
  categoryEn: string;
  websiteUrl: string;
  logoText: string;
  verifiedBadge: boolean;
  acceptedItems: string[];
}

export type ActiveTab = "home" | "scan" | "updates" | "profile";
export type Language = "ar" | "en";
export type ThemeMode = "light" | "dark";

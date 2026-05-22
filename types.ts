
export enum AppView {
  WELCOME = 'welcome',
  DISCLAIMER = 'disclaimer',
  INSTRUCTIONS = 'instructions',
  DASHBOARD = 'dashboard',
  DIAGNOSIS = 'diagnosis',
  TRACKER = 'tracker',
  GUIDANCE = 'guidance',
  WELLNESS = 'wellness',
  COMMUNITY = 'community',
  JOURNEY = 'journey',
  EVOLUTION = 'evolution',
  SETTINGS = 'settings',
}

export interface SpiritualInventoryItem {
  id: string;
  name: string;
  category: 'mental' | 'emocional' | 'espiritual' | 'sombra';
  weight: number;
}

export interface UserProfile {
  name: string;
  email?: string;
  phone?: string;
  startDate: string | null;
  awakeningScore: number;
  hasSeenWarning: boolean;
  hasAcceptedTerms?: boolean;
  isOnPath: boolean;
  favoriteActivities?: string[];
}

export interface DailyLog {
  date: string;
  spiritualPractices: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  reflection: string;
  energyLevel: number; // 1-5
  awarenessLevel: number; // 1-5
  synchronicities?: string;
  shadowObservations?: string;
  foodRecord?: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
    waterGlasses: number;
    fastingHours?: number; // 0-24
  };
  completedActions: {
    purification: boolean;
    nourishment: boolean;
    movement: boolean;
    nature: boolean;
    presence: boolean;
    shadowWork: boolean;
    study: boolean;
    gratitude: boolean;
    journaling?: boolean;
    journeyTask?: boolean;
    dailyChallenge?: boolean;
    alignmentConfirmed?: boolean;
  };
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: number;
}

export interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  video?: string;
  caption?: string;
  likes: number;
  comments: number;
  commentList?: Comment[];
  timestamp: number;
}

export interface Ritual {
  type: string;
  title: string;
  elements: string[];
  process: string[];
  purpose: string;
}

export interface Recipe {
  title: string;
  type: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: string;
}

export interface DailyContent {
  motivation: string;
  dailyChallenge: string;
  menu: Recipe[];
}

export interface DailyInsight {
  oracleMessage: string;
  dailyExercise: string;
  dailyRitual: Ritual;
  shadowPrompt: string;
}

export interface JourneyDay {
  day: number;
  title: string;
  theme: string;
  description: string;
  task: string;
  reflection: string;
  completed: boolean;
}

export interface JourneyProgress {
  currentDay: number;
  days: JourneyDay[];
  lastCompletedDate: string | null;
}

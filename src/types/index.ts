export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  date_of_birth?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  date_of_birth?: string;
  weight_kg?: number;
  height_cm?: number;
  cycle_length_avg: number;
  period_length_avg: number;
  timezone: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CycleEntry {
  id: string;
  user_id: string;
  period_start: string;
  period_end?: string;
  cycle_length?: number;
  notes?: string;
  created_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  flow_intensity?: 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
  symptoms: string[];
  mood: string[];
  energy_level?: number;
  pain_level?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  date: string;
  mood: string;
  energy: number;
  anxiety_level: number;
  notes?: string;
  created_at: string;
}

export interface NutritionLog {
  id: string;
  user_id: string;
  date: string;
  water_ml: number;
  meals: MealEntry[];
  calories_total?: number;
  created_at: string;
  updated_at: string;
}

export interface MealEntry {
  id: string;
  name: string;
  calories?: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  nutrients?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
}

export interface SleepLog {
  id: string;
  user_id: string;
  date: string;
  sleep_start: string;
  sleep_end: string;
  duration_hours: number;
  quality: number;
  notes?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image_url?: string;
  audio_url?: string;
}

export interface HealthInsight {
  id: string;
  type: 'cycle' | 'mood' | 'nutrition' | 'sleep' | 'general';
  title: string;
  description: string;
  icon: string;
  color: string;
  date: string;
}

export type FlowIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type SymptomCategory =
  | 'cramps'
  | 'bloating'
  | 'headache'
  | 'backache'
  | 'breast_tenderness'
  | 'acne'
  | 'fatigue'
  | 'nausea'
  | 'mood_swings'
  | 'insomnia'
  | 'hot_flashes'
  | 'spotting'
  | 'discharge_changes';

export type MoodType =
  | 'happy'
  | 'calm'
  | 'sad'
  | 'anxious'
  | 'irritable'
  | 'sensitive'
  | 'energetic'
  | 'tired'
  | 'focused'
  | 'overwhelmed';


export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  weight: number; // in kg
  height: number; // in cm
  activityLevel: string;
  avatar: string;
  username: string;
}

export interface NutritionGoals {
  calories: number;
  protein: number; // in g
  carbs: number; // in g
  fat: number; // in g
}

export interface MealLog {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';
  foods: Food[];
  timestamp: Date;
  photo?: string;
}

export interface Food {
  id: string;
  name: string;
  quantity: number; // in g
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium?: number;
  fiber?: number;
  sugar?: number;
}

export interface HealthData {
  glycemia?: string;
  cholesterol?: string;
  triglycerides?: string;
  hypertension?: boolean;
  foodIntolerances?: string;
  digestiveIssues?: string;
  additionalHealthInfo?: string;
  familyHypertension?: boolean;
  familyDiabetes?: boolean;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: MealLog[];
  waterGlasses: number;
  streakDay: number;
  eatsPoints: number;
}

export interface ReminderTimes {
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
}

export interface UserSettings {
  sound: boolean;
  vibration: boolean;
  animations: boolean;
  motivationalMessages: boolean;
  audioExercises: boolean;
  email?: string;
  phone?: string;
  password?: string;
  reminderTime?: string;
  newsNotifications: boolean;
}

export interface UserState {
  profile: UserProfile;
  nutritionGoals: NutritionGoals;
  dailyLogs: DailyLog[];
  currentStreak: number;
  totalEatsPoints: number;
  healthData?: HealthData;
  settings?: UserSettings;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface UserContextType {
  user: UserState;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateNutritionGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  updateHealthData?: (data: Partial<HealthData>) => Promise<void>;
  logMeal: (meal: MealLog) => Promise<void>;
  incrementWater: () => Promise<void>;
  getTodayLog: () => DailyLog;
  getDailyCalories: () => number;
  getDailyProtein: () => number;
  getDailyCarbs: () => number;
  getDailyFat: () => number;
  getTodayMealsByType: (type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink') => MealLog[];
  calculateGoalsBasedOnObjective: (objective: string) => NutritionGoals;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, profile: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

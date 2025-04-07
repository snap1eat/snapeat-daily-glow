
export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  activityLevel: string;
  avatar: string;
  username: string;
  healthGoals: string[]; // Add healthGoals array
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Food {
  id: string;
  name: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium: number;
  fiber: number;
  sugar: number;
}

export interface MealLog {
  id?: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';
  foods: Food[];
  timestamp: Date;
  photo?: string;
}

export interface DailyLog {
  date: string;
  meals: MealLog[];
  waterGlasses: number;
  streakDay: number;
  eatsPoints: number;
}

export interface UserSettings {
  sound: boolean;
  vibration: boolean;
  animations: boolean;
  motivationalMessages: boolean;
  newsNotifications: boolean;
  email?: string;
  phone?: string;
  password?: string;
  reminderTime?: string;
}

export interface HealthData {
  weight: number;
  height: number;
  bloodPressure: string;
  cholesterol: number;
}

export interface UserState {
  profile: UserProfile;
  nutritionGoals: NutritionGoals;
  dailyLogs: DailyLog[];
  currentStreak: number;
  totalEatsPoints: number;
  settings: UserSettings;
  healthData?: HealthData;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface UserContextType {
  user: UserState;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateNutritionGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
  updateHealthData: (data: Partial<HealthData>) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  logMeal: (meal: MealLog) => Promise<void>;
  incrementWater: () => Promise<void>;
  decrementWater: () => Promise<void>;
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

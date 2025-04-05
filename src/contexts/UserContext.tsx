
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { StorageService } from '../services/storage-service';

// Define types for our context data
interface UserProfile {
  name: string;
  age: number;
  gender: string;
  weight: number; // in kg
  height: number; // in cm
  activityLevel: string;
  avatar: string;
  username: string;
}

interface NutritionGoals {
  calories: number;
  protein: number; // in g
  carbs: number; // in g
  fat: number; // in g
}

interface MealLog {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';
  foods: Food[];
  timestamp: Date;
  photo?: string; // Added photo property
}

interface Food {
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

interface HealthData {
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

interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: MealLog[];
  waterGlasses: number;
  streakDay: number;
  eatsPoints: number;
}

interface UserState {
  profile: UserProfile;
  nutritionGoals: NutritionGoals;
  dailyLogs: DailyLog[];
  currentStreak: number;
  totalEatsPoints: number;
  healthData?: HealthData;
  settings?: UserSettings; // Added settings
}

interface UserSettings {
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

interface UserContextType {
  user: UserState;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateNutritionGoals: (goals: Partial<NutritionGoals>) => void;
  updateHealthData?: (data: Partial<HealthData>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  logMeal: (meal: MealLog) => void;
  incrementWater: () => void;
  getTodayLog: () => DailyLog;
  getDailyCalories: () => number;
  getDailyProtein: () => number;
  getDailyCarbs: () => number;
  getDailyFat: () => number;
  getTodayMealsByType: (type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink') => MealLog[];
  calculateGoalsBasedOnObjective: (objective: string) => NutritionGoals;
  logout: () => void;
}

// Default values
const defaultProfile: UserProfile = {
  name: '',
  age: 30,
  gender: 'no-answer',
  weight: 70,
  height: 170,
  activityLevel: 'moderate',
  avatar: '',
  username: 'HealthyPineapple123',
};

const defaultNutritionGoals: NutritionGoals = {
  calories: 2000,
  protein: 100,
  carbs: 250,
  fat: 70,
};

const defaultSettings: UserSettings = {
  sound: true,
  vibration: true,
  animations: true,
  motivationalMessages: true,
  audioExercises: false,
  newsNotifications: true,
};

// Create context with default values
const UserContext = createContext<UserContextType>({
  user: {
    profile: defaultProfile,
    nutritionGoals: defaultNutritionGoals,
    dailyLogs: [],
    currentStreak: 0,
    totalEatsPoints: 0,
    settings: defaultSettings,
  },
  updateProfile: () => {},
  updateNutritionGoals: () => {},
  updateSettings: () => {},
  logMeal: () => {},
  incrementWater: () => {},
  getTodayLog: () => ({
    date: new Date().toISOString().split('T')[0],
    meals: [],
    waterGlasses: 0,
    streakDay: 0,
    eatsPoints: 0,
  }),
  getDailyCalories: () => 0,
  getDailyProtein: () => 0,
  getDailyCarbs: () => 0,
  getDailyFat: () => 0,
  getTodayMealsByType: () => [],
  calculateGoalsBasedOnObjective: () => defaultNutritionGoals,
  logout: () => {},
});

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from Storage if available
  const [user, setUser] = useState<UserState>(() => {
    // Default values, will be overridden if stored data exists
    return {
      profile: defaultProfile,
      nutritionGoals: defaultNutritionGoals,
      dailyLogs: [{
        date: new Date().toISOString().split('T')[0],
        meals: [],
        waterGlasses: 0,
        streakDay: 1,
        eatsPoints: 0,
      }],
      currentStreak: 1,
      totalEatsPoints: 0,
      settings: defaultSettings,
    };
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load data from Storage on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to get data from Capacitor Storage
        const storedUser = await StorageService.get<UserState>('snapeat_user');
        
        if (storedUser) {
          // Make sure we parse dates correctly from Storage
          if (storedUser.dailyLogs) {
            storedUser.dailyLogs.forEach((log: DailyLog) => {
              if (log.meals) {
                log.meals.forEach((meal: MealLog) => {
                  meal.timestamp = new Date(meal.timestamp);
                });
              }
            });
          }
          // Ensure settings is initialized
          if (!storedUser.settings) {
            storedUser.settings = defaultSettings;
          }
          setUser(storedUser);
        } else {
          // If no data in Capacitor Storage, try from localStorage for web version
          const localStorageUser = localStorage.getItem('snapeat_user');
          if (localStorageUser) {
            const parsedUser = JSON.parse(localStorageUser);
            // Make sure we parse dates correctly
            if (parsedUser.dailyLogs) {
              parsedUser.dailyLogs.forEach((log: DailyLog) => {
                if (log.meals) {
                  log.meals.forEach((meal: MealLog) => {
                    meal.timestamp = new Date(meal.timestamp);
                  });
                }
              });
            }
            // Ensure settings is initialized
            if (!parsedUser.settings) {
              parsedUser.settings = defaultSettings;
            }
            setUser(parsedUser);
            
            // Also save to Capacitor Storage for consistency
            await StorageService.set('snapeat_user', parsedUser);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save to Storage whenever user state changes
  useEffect(() => {
    if (!isLoading) {
      const saveData = async () => {
        try {
          await StorageService.set('snapeat_user', user);
          // Also save to localStorage for web version
          localStorage.setItem('snapeat_user', JSON.stringify(user));
        } catch (error) {
          console.error('Error saving user data:', error);
        }
      };

      saveData();
    }
  }, [user, isLoading]);

  // Calculate nutrition goals based on objective
  const calculateGoalsBasedOnObjective = (objective: string): NutritionGoals => {
    const { weight, height, age, gender, activityLevel } = user.profile;
    let bmr = 0;
    
    // Calculate BMR using Mifflin-St Jeor Equation
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Activity multiplier
    let activityMultiplier = 1.2; // Sedentary
    switch(activityLevel) {
      case 'light': activityMultiplier = 1.375; break;
      case 'moderate': activityMultiplier = 1.55; break;
      case 'active': activityMultiplier = 1.725; break;
      case 'extra_active': activityMultiplier = 1.9; break;
    }
    
    let calories = Math.round(bmr * activityMultiplier);
    
    // Adjust calories based on objective
    switch(objective) {
      case 'weight_loss': calories -= 500; break; // Deficit for weight loss
      case 'weight_gain': calories += 500; break; // Surplus for weight gain
      case 'muscle_gain': calories += 300; break; // Smaller surplus for lean muscle gain
    }
    
    // Calculate macros based on objective
    let protein = 0;
    let fat = 0;
    let carbs = 0;
    
    switch(objective) {
      case 'weight_loss':
        protein = Math.round(weight * 2.2); // Higher protein during weight loss (g)
        fat = Math.round(weight * 0.4); // Moderate fat (g)
        carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4); // Remainder carbs
        break;
      case 'muscle_gain':
        protein = Math.round(weight * 1.6); // High protein for muscle building (g)
        fat = Math.round(calories * 0.25 / 9); // 25% of calories from fat
        carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4); // Remainder carbs
        break;
      case 'maintain':
      default:
        protein = Math.round(weight * 1.2); // Moderate protein (g)
        fat = Math.round(calories * 0.3 / 9); // 30% of calories from fat
        carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4); // Remainder carbs
    }
    
    // Ensure values are positive and reasonable
    calories = Math.max(1200, calories);
    protein = Math.max(50, protein);
    fat = Math.max(30, fat);
    carbs = Math.max(50, carbs);
    
    return { calories, protein, carbs, fat };
  };

  // Update user profile
  const updateProfile = (profile: Partial<UserProfile>) => {
    setUser(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...profile,
      },
    }));
  };

  // Update nutrition goals
  const updateNutritionGoals = (goals: Partial<NutritionGoals>) => {
    setUser(prev => ({
      ...prev,
      nutritionGoals: {
        ...prev.nutritionGoals,
        ...goals,
      },
    }));
  };

  // Update settings
  const updateSettings = (settings: Partial<UserSettings>) => {
    setUser(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settings,
      }
    }));
  };

  // Update health data
  const updateHealthData = (data: Partial<HealthData>) => {
    setUser(prev => ({
      ...prev,
      healthData: {
        ...prev.healthData,
        ...data,
      },
    }));
  };

  // Get today's log
  const getTodayLog = (): DailyLog => {
    const today = new Date().toISOString().split('T')[0];
    const todayLog = user.dailyLogs.find(log => log.date === today);
    
    if (todayLog) {
      return todayLog;
    }

    // If no log for today, create one
    const newLog: DailyLog = {
      date: today,
      meals: [],
      waterGlasses: 0,
      streakDay: user.currentStreak + 1,
      eatsPoints: 0,
    };

    setUser(prev => ({
      ...prev,
      dailyLogs: [...prev.dailyLogs, newLog],
      currentStreak: prev.currentStreak + 1,
    }));

    return newLog;
  };

  // Log a meal - Modified to allow multiple meals of the same type
  const logMeal = (meal: MealLog) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedLogs = user.dailyLogs.map(log => {
      if (log.date === today) {
        // Always add the meal, don't replace existing meals
        return {
          ...log,
          meals: [...log.meals, meal],
          eatsPoints: log.eatsPoints + 10,
        };
      }
      return log;
    });

    setUser(prev => ({
      ...prev,
      dailyLogs: updatedLogs,
      totalEatsPoints: prev.totalEatsPoints + 10,
    }));
  };

  // Increment water glasses
  const incrementWater = () => {
    const today = new Date().toISOString().split('T')[0];
    const updatedLogs = user.dailyLogs.map(log => {
      if (log.date === today) {
        return {
          ...log,
          waterGlasses: Math.min(log.waterGlasses + 1, 8), // Cap at 8 glasses
        };
      }
      return log;
    });

    setUser(prev => ({
      ...prev,
      dailyLogs: updatedLogs,
    }));
  };

  // Get daily nutritional totals
  const getDailyCalories = (): number => {
    const todayLog = getTodayLog();
    return todayLog.meals.reduce((total, meal) => {
      return total + meal.foods.reduce((mealTotal, food) => mealTotal + food.calories, 0);
    }, 0);
  };

  const getDailyProtein = (): number => {
    const todayLog = getTodayLog();
    return todayLog.meals.reduce((total, meal) => {
      return total + meal.foods.reduce((mealTotal, food) => mealTotal + food.protein, 0);
    }, 0);
  };

  const getDailyCarbs = (): number => {
    const todayLog = getTodayLog();
    return todayLog.meals.reduce((total, meal) => {
      return total + meal.foods.reduce((mealTotal, food) => mealTotal + food.carbs, 0);
    }, 0);
  };

  const getDailyFat = (): number => {
    const todayLog = getTodayLog();
    return todayLog.meals.reduce((total, meal) => {
      return total + meal.foods.reduce((mealTotal, food) => mealTotal + food.fat, 0);
    }, 0);
  };

  // Get all meals of a specific type for today
  const getTodayMealsByType = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink'): MealLog[] => {
    const todayLog = getTodayLog();
    return todayLog.meals.filter(meal => meal.type === type);
  };

  // Logout function
  const logout = () => {
    // Clear user data from state
    setUser({
      profile: defaultProfile,
      nutritionGoals: defaultNutritionGoals,
      dailyLogs: [{
        date: new Date().toISOString().split('T')[0],
        meals: [],
        waterGlasses: 0,
        streakDay: 1,
        eatsPoints: 0,
      }],
      currentStreak: 1,
      totalEatsPoints: 0,
      settings: defaultSettings,
    });
    
    // Clear storage
    localStorage.removeItem('snapeat_user');
    StorageService.remove('snapeat_user');
  };

  return (
    <UserContext.Provider
      value={{
        user,
        updateProfile,
        updateNutritionGoals,
        updateHealthData,
        updateSettings,
        logMeal,
        incrementWater,
        getTodayLog,
        getDailyCalories,
        getDailyProtein,
        getDailyCarbs,
        getDailyFat,
        getTodayMealsByType,
        calculateGoalsBasedOnObjective,
        logout,
      }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-snapeat-green mx-auto"></div>
            <p className="mt-4 text-snapeat-green">Cargando...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => useContext(UserContext);

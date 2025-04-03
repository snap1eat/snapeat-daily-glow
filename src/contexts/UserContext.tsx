
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

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
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Food[];
  timestamp: Date;
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
}

interface UserContextType {
  user: UserState;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateNutritionGoals: (goals: Partial<NutritionGoals>) => void;
  logMeal: (meal: MealLog) => void;
  incrementWater: () => void;
  getTodayLog: () => DailyLog;
  getDailyCalories: () => number;
  getDailyProtein: () => number;
  getDailyCarbs: () => number;
  getDailyFat: () => number;
  getTodayMealByType: (type: 'breakfast' | 'lunch' | 'dinner' | 'snack') => MealLog | null;
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

// Create context with default values
const UserContext = createContext<UserContextType>({
  user: {
    profile: defaultProfile,
    nutritionGoals: defaultNutritionGoals,
    dailyLogs: [],
    currentStreak: 0,
    totalEatsPoints: 0,
  },
  updateProfile: () => {},
  updateNutritionGoals: () => {},
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
  getTodayMealByType: () => null,
});

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from localStorage if available
  const [user, setUser] = useState<UserState>(() => {
    const savedUser = localStorage.getItem('snapeat_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Make sure we parse dates correctly from localStorage
      if (parsedUser.dailyLogs) {
        parsedUser.dailyLogs.forEach((log: DailyLog) => {
          if (log.meals) {
            log.meals.forEach((meal: MealLog) => {
              meal.timestamp = new Date(meal.timestamp);
            });
          }
        });
      }
      return parsedUser;
    }
    
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
    };
  });

  // Save to localStorage whenever user state changes
  useEffect(() => {
    localStorage.setItem('snapeat_user', JSON.stringify(user));
  }, [user]);

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

  // Log a meal
  const logMeal = (meal: MealLog) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedLogs = user.dailyLogs.map(log => {
      if (log.date === today) {
        // Replace meal if it exists, otherwise add it
        const existingMealIndex = log.meals.findIndex(m => m.type === meal.type);
        if (existingMealIndex >= 0) {
          const updatedMeals = [...log.meals];
          updatedMeals[existingMealIndex] = meal;
          return {
            ...log,
            meals: updatedMeals,
            eatsPoints: log.eatsPoints + 10,
          };
        } else {
          return {
            ...log,
            meals: [...log.meals, meal],
            eatsPoints: log.eatsPoints + 10,
          };
        }
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

  // Get meal by type for today
  const getTodayMealByType = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack'): MealLog | null => {
    const todayLog = getTodayLog();
    return todayLog.meals.find(meal => meal.type === type) || null;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        updateProfile,
        updateNutritionGoals,
        logMeal,
        incrementWater,
        getTodayLog,
        getDailyCalories,
        getDailyProtein,
        getDailyCarbs,
        getDailyFat,
        getTodayMealByType,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => useContext(UserContext);

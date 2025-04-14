
import { createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  DailyLog, 
  MealLog, 
  NutritionGoals, 
  UserContextType, 
  UserProfile, 
  UserSettings,
  HealthData
} from '@/types/user';
import { calculateGoalsBasedOnObjective } from '@/utils/nutritionUtils';
import useUserData from '@/hooks/useUserData';
import { useDailyLogs } from '@/hooks/useDailyLogs';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { useNutritionTracking } from '@/hooks/useNutritionTracking';
import { useWaterTracking } from '@/hooks/useWaterTracking';
import { useAuthManagement } from '@/hooks/useAuthManagement';

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user, setUser } = useUserData();
  
  // Extract functionality into custom hooks
  const { getTodayLog } = useDailyLogs(user, setUser);
  
  const { 
    updateProfile, 
    updateNutritionGoals, 
    updateHealthData, 
    updateSettings 
  } = useProfileManagement(user, setUser);
  
  const {
    logMeal,
    getDailyCalories,
    getDailyProtein,
    getDailyCarbs,
    getDailyFat,
    getTodayMealsByType
  } = useNutritionTracking(user, setUser, getTodayLog);
  
  const { 
    incrementWater, 
    decrementWater 
  } = useWaterTracking(user, setUser);
  
  const { 
    login, 
    signup, 
    logout 
  } = useAuthManagement(user, setUser);

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
        decrementWater,
        getTodayLog,
        getDailyCalories,
        getDailyProtein,
        getDailyCarbs,
        getDailyFat,
        getTodayMealsByType,
        calculateGoalsBasedOnObjective: (objective) => calculateGoalsBasedOnObjective(user.profile, objective),
        login,
        signup,
        logout,
      }}
    >
      {user.isLoading ? (
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

export const useUser = () => useContext(UserContext);

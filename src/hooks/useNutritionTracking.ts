
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MealLog, DailyLog, Food } from '@/types/user';
import * as UserService from '@/services/user-service';
import { StorageService } from '@/services/storage-service';

export const useNutritionTracking = (
  user: any,
  setUser: React.Dispatch<React.SetStateAction<any>>,
  getTodayLog: () => DailyLog
) => {
  const { toast } = useToast();

  const logMeal = async (meal: MealLog) => {
    try {
      console.log("Logging meal:", meal);
      
      const today = new Date().toISOString().split('T')[0];
      let pointsEarned = 10;
      
      if (!user.isAuthenticated) {
        const updatedLogs = user.dailyLogs.map(log => {
          if (log.date === today) {
            return {
              ...log,
              meals: [...log.meals, meal],
              eatsPoints: log.eatsPoints + pointsEarned,
            };
          }
          return log;
        });

        setUser(prev => ({
          ...prev,
          dailyLogs: updatedLogs,
          totalEatsPoints: prev.totalEatsPoints + pointsEarned,
        }));
        
        const userData = { ...user, dailyLogs: updatedLogs, totalEatsPoints: user.totalEatsPoints + pointsEarned };
        StorageService.set('snapeat_user', JSON.stringify(userData));
        
        console.log("Meal logged locally");
        return;
      }
      
      const userId = await UserService.getCurrentUserId();
      
      // Save meal to database
      const mealData = await UserService.saveMeal(userId, meal);
      
      // Update local state with the saved meal data
      const updatedLogs = user.dailyLogs.map(log => {
        if (log.date === today) {
          return {
            ...log,
            meals: [...log.meals, { ...meal, id: mealData.id }],
            eatsPoints: log.eatsPoints + pointsEarned,
          };
        }
        return log;
      });

      setUser(prev => ({
        ...prev,
        dailyLogs: updatedLogs,
        totalEatsPoints: prev.totalEatsPoints + pointsEarned,
      }));
      
      console.log("Meal logged successfully, state updated");
    } catch (error) {
      console.error("Error logging meal:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar la comida",
      });
    }
  };

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

  const getTodayMealsByType = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink'): MealLog[] => {
    const todayLog = getTodayLog();
    return todayLog.meals.filter(meal => meal.type === type);
  };

  return {
    logMeal,
    getDailyCalories,
    getDailyProtein,
    getDailyCarbs,
    getDailyFat,
    getTodayMealsByType
  };
};

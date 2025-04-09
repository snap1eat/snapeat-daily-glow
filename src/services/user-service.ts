import { supabase } from '@/integrations/supabase/client';
import { DailyLog, Food, MealLog, NutritionGoals, UserProfile, UserSettings } from '@/types/user';
import { Json } from '@/integrations/supabase/types';

export const getCurrentUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  return user.id;
};

export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: profile.name,
      age: profile.age,
      gender: profile.gender,
      weight: profile.weight,
      height: profile.height,
      activity_level: profile.activityLevel,
      avatar_url: profile.avatar,
      health_goal: profile.healthGoals?.length ? profile.healthGoals[0] : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
    
  if (error) throw error;
};

export const updateNutritionGoals = async (userId: string, goals: Partial<NutritionGoals>) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      daily_calorie_goal: goals.calories,
      daily_protein_goal: goals.protein,
      daily_carbs_goal: goals.carbs,
      daily_fats_goal: goals.fat,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
    
  if (error) throw error;
};

export const getUserSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const updateUserSettings = async (userId: string, settings: Partial<UserSettings>, currentReminderTimes: any) => {
  let reminderTimes = currentReminderTimes;
  
  if (settings.reminderTime) {
    reminderTimes.breakfast = settings.reminderTime;
  }
  
  const reminderTimesJson = JSON.stringify(reminderTimes) as unknown as Json;
  
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      id: userId,
      sound_effects: settings.sound,
      vibration: settings.vibration,
      animations: settings.animations,
      motivation_messages: settings.motivationalMessages,
      audio_exercises: settings.audioExercises,
      notification_reminders: true,
      notification_news: settings.newsNotifications,
      reminder_times: reminderTimesJson,
      updated_at: new Date().toISOString(),
    });
    
  if (error) throw error;
};

export const saveMeal = async (userId: string, meal: MealLog) => {
  const totalCalories = meal.foods.reduce((sum, food) => sum + food.calories, 0);
  const totalProtein = meal.foods.reduce((sum, food) => sum + food.protein, 0);
  const totalCarbs = meal.foods.reduce((sum, food) => sum + food.carbs, 0);
  const totalFats = meal.foods.reduce((sum, food) => sum + food.fat, 0);
  const totalFiber = meal.foods.reduce((sum, food) => sum + (food.fiber || 0), 0);
  const totalSodium = meal.foods.reduce((sum, food) => sum + (food.sodium || 0), 0);
  const totalSugar = meal.foods.reduce((sum, food) => sum + (food.sugar || 0), 0);
  const totalQuantity = meal.foods.reduce((sum, food) => sum + food.quantity, 0);
  
  const mealTypeMapping: Record<string, string> = {
    'breakfast': 'desayuno',
    'lunch': 'almuerzo',
    'dinner': 'cena',
    'snack': 'snack'
  };
  
  const spanishMealType = mealTypeMapping[meal.type] || meal.type;
  
  const foodsJson = meal.foods.map(food => ({
    name: food.name,
    quantity: food.quantity,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    fiber: food.fiber || 0,
    sodium: food.sodium || 0,
    sugar: food.sugar || 0
  }));
  
  const { data: mealData, error: mealError } = await supabase
    .from('meals')
    .insert({
      user_id: userId,
      meal_type: spanishMealType,
      total_quantity: totalQuantity,
      total_calories: totalCalories,
      total_protein: totalProtein,
      total_carbs: totalCarbs,
      total_fats: totalFats,
      total_fiber: totalFiber,
      total_sodium: totalSodium,
      total_sugar: totalSugar,
      foods: foodsJson,
      image_url: meal.photo,
      input_method: 'manual',
      date: meal.timestamp.toISOString().split('T')[0],
      created_at: meal.timestamp.toISOString()
    })
    .select()
    .single();
  
  if (mealError) throw mealError;
  
  return mealData;
};

export const updateWaterIntake = async (userId: string, date: string, glasses: number) => {
  try {
    const { data, error: fetchError } = await supabase
      .rpc('get_water_log', { 
        user_id_param: userId, 
        date_param: date 
      });
    
    if (fetchError) throw fetchError;
    
    const existingLogs = data as Array<{
      id: string;
      user_id: string;
      date: string;
      glasses: number;
      created_at: string;
      updated_at: string;
    }>;
    
    if (existingLogs && existingLogs.length > 0) {
      const { error: updateError } = await supabase
        .rpc('update_water_log', { 
          log_id_param: existingLogs[0].id, 
          glasses_param: glasses, 
          updated_at_param: new Date().toISOString()
        });
      
      if (updateError) throw updateError;
    } else {
      const { error: createError } = await supabase
        .rpc('create_water_log', {
          user_id_param: userId,
          date_param: date,
          glasses_param: glasses
        });
      
      if (createError) throw createError;
    }
  } catch (error) {
    console.error("Error updating water intake:", error);
    throw error;
  }
};

export const incrementWaterIntake = async (userId: string, date: string) => {
  try {
    const { data, error: fetchError } = await supabase
      .rpc('get_water_log', { 
        user_id_param: userId, 
        date_param: date 
      });
    
    if (fetchError) throw fetchError;
    
    const existingLogs = data as Array<{
      id: string;
      user_id: string;
      date: string;
      glasses: number;
      created_at: string;
      updated_at: string;
    }>;
    
    const currentGlasses = existingLogs && existingLogs.length > 0 ? existingLogs[0].glasses : 0;
    await updateWaterIntake(userId, date, currentGlasses + 1);
  } catch (error) {
    console.error("Error incrementing water:", error);
    throw error;
  }
};

export const decrementWaterIntake = async (userId: string, date: string) => {
  try {
    const { data, error: fetchError } = await supabase
      .rpc('get_water_log', { 
        user_id_param: userId, 
        date_param: date 
      });
    
    if (fetchError) throw fetchError;
    
    const existingLogs = data as Array<{
      id: string;
      user_id: string;
      date: string;
      glasses: number;
      created_at: string;
      updated_at: string;
    }>;
    
    const currentGlasses = existingLogs && existingLogs.length > 0 ? existingLogs[0].glasses : 0;
    if (currentGlasses > 0) {
      await updateWaterIntake(userId, date, currentGlasses - 1);
    }
  } catch (error) {
    console.error("Error decrementing water:", error);
    throw error;
  }
};

export const fetchUserLogs = async (userId: string, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    const { data: mealsData, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .order('date', { ascending: false });
  
    if (mealsError) throw mealsError;
    
    const { data, error: waterError } = await supabase
      .rpc('get_water_logs_for_user', { 
        user_id_param: userId, 
        start_date_param: startDateStr 
      });
  
    if (waterError) throw waterError;
    
    const waterData = data as Array<{
      id: string;
      user_id: string;
      date: string;
      glasses: number;
      created_at: string;
      updated_at: string;
    }>;
    
    const logsByDate: Record<string, any> = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      logsByDate[dateStr] = {
        date: dateStr,
        waterGlasses: 0,
        meals: [],
        streakDay: 0,
        eatsPoints: 0
      };
    }
    
    if (waterData && Array.isArray(waterData)) {
      waterData.forEach((water: any) => {
        if (water && typeof water === 'object' && 'date' in water) {
          const dateStr = water.date as string;
          if (logsByDate[dateStr]) {
            logsByDate[dateStr].waterGlasses = water.glasses as number;
          }
        }
      });
    }
    
    if (mealsData) {
      mealsData.forEach((meal: any) => {
        if (meal && typeof meal === 'object' && 'date' in meal && 'foods' in meal) {
          const dateStr = meal.date as string;
          if (logsByDate[dateStr]) {
            const mealFoods = meal.foods as any[];
            const foods = mealFoods ? mealFoods.map((item: any) => ({
              id: crypto.randomUUID(),
              name: item.name,
              quantity: item.quantity,
              calories: item.calories,
              protein: item.protein,
              carbs: item.carbs,
              fat: item.fat || item.fats,
              fiber: item.fiber,
              sodium: item.sodium,
              sugar: item.sugar
            })) : [];
            
            const mealTypeMapping: Record<string, string> = {
              'desayuno': 'breakfast',
              'almuerzo': 'lunch',
              'cena': 'dinner',
              'snack': 'snack'
            };
            
            const englishMealType = mealTypeMapping[meal.meal_type as string] || meal.meal_type;
            
            logsByDate[dateStr].meals.push({
              id: meal.id,
              type: englishMealType as any,
              foods,
              timestamp: new Date(meal.created_at as string),
              photo: meal.image_url
            });
            
            logsByDate[dateStr].eatsPoints += 10;
          }
        }
      });
    }
    
    const dateKeys = Object.keys(logsByDate).sort().reverse();
    let consecutiveDays = 0;
    
    for (const dateStr of dateKeys) {
      const log = logsByDate[dateStr];
      
      if (log.meals.length > 0 || log.waterGlasses > 0) {
        consecutiveDays++;
        log.streakDay = consecutiveDays;
      } else {
        break;
      }
    }
    
    return Object.values(logsByDate);
  } catch (error) {
    console.error("Error fetching user logs:", error);
    throw error;
  }
};

export const fetchUserMeals = async (userId: string, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    const { data: mealsData, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .order('created_at', { ascending: false });
  
    if (mealsError) throw mealsError;
    
    return mealsData.map((meal: any) => {
      const mealFoods = meal.foods as any[];
      const foods = mealFoods ? mealFoods.map((item: any) => ({
        id: crypto.randomUUID(),
        name: item.name,
        quantity: item.quantity,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat || item.fats,
        fiber: item.fiber,
        sodium: item.sodium,
        sugar: item.sugar
      })) : [];
      
      const mealTypeMapping: Record<string, string> = {
        'desayuno': 'breakfast',
        'almuerzo': 'lunch',
        'cena': 'dinner',
        'snack': 'snack'
      };
      
      const englishMealType = mealTypeMapping[meal.meal_type as string] || meal.meal_type;
      
      return {
        id: meal.id,
        user_id: meal.user_id,
        meal_type: englishMealType,
        total_calories: meal.total_calories,
        total_protein: meal.total_protein,
        total_carbs: meal.total_carbs,
        total_fats: meal.total_fats,
        foods,
        created_at: meal.created_at
      };
    });
  } catch (error) {
    console.error("Error fetching user meals:", error);
    throw error;
  }
};

export const saveUserGoal = async (userId: string, goalType: string, description: string, targetValue?: number, targetDate?: Date) => {
  try {
    const { data, error } = await supabase
      .rpc('create_user_goal', {
        user_id_param: userId,
        goal_type_param: goalType,
        description_param: description,
        target_value_param: targetValue,
        target_date_param: targetDate ? targetDate.toISOString().split('T')[0] : null
      });
    
    if (error) throw error;
    
    return data as Array<{
      id: string;
      user_id: string;
      goal_type: string;
      description: string;
      target_value: number | null;
      current_value: number | null;
      target_date: string | null;
      is_achieved: boolean;
      created_at: string;
      updated_at: string;
    }>;
  } catch (error) {
    console.error("Error saving user goal:", error);
    throw error;
  }
};

export const getUserGoals = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_goals', { 
        user_id_param: userId 
      });
    
    if (error) throw error;
    
    return (data || []) as Array<{
      id: string;
      user_id: string;
      goal_type: string;
      description: string;
      target_value: number | null;
      current_value: number | null;
      target_date: string | null;
      is_achieved: boolean;
      created_at: string;
      updated_at: string;
    }>;
  } catch (error) {
    console.error("Error getting user goals:", error);
    throw error;
  }
};

export const updateUserGoal = async (goalId: string, updates: Partial<{
  description: string;
  target_value: number;
  current_value: number;
  target_date: string;
  is_achieved: boolean;
}>) => {
  try {
    const { data, error } = await supabase
      .rpc('update_user_goal', {
        goal_id_param: goalId,
        description_param: updates.description,
        target_value_param: updates.target_value,
        current_value_param: updates.current_value,
        target_date_param: updates.target_date,
        is_achieved_param: updates.is_achieved,
        updated_at_param: new Date().toISOString()
      });
    
    if (error) throw error;
    
    return data as Array<{
      id: string;
      user_id: string;
      goal_type: string;
      description: string;
      target_value: number | null;
      current_value: number | null;
      target_date: string | null;
      is_achieved: boolean;
      created_at: string;
      updated_at: string;
    }>;
  } catch (error) {
    console.error("Error updating user goal:", error);
    throw error;
  }
};

export const deleteUserGoal = async (goalId: string) => {
  try {
    const { error } = await supabase
      .rpc('delete_user_goal', { 
        goal_id_param: goalId 
      });
    
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting user goal:", error);
    throw error;
  }
};

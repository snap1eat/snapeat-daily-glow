
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
  
  // Convert meal.type to Spanish format
  const mealTypeMapping: Record<string, string> = {
    'breakfast': 'desayuno',
    'lunch': 'almuerzo',
    'dinner': 'cena',
    'snack': 'snack'
  };
  
  const spanishMealType = mealTypeMapping[meal.type] || meal.type;
  
  // Convert Food[] to JSONB format
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
  
  // Using type assertion to match the table structure from our SQL migration
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

// Water intake management functions using the new water_logs table
export const updateWaterIntake = async (userId: string, date: string, glasses: number) => {
  try {
    // Check if there's a record for this date
    const { data: existingLog, error: fetchError } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    
    if (existingLog) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('water_logs')
        .update({
          glasses,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLog.id);
      
      if (updateError) throw updateError;
    } else {
      // Insert new record
      const { error: createError } = await supabase
        .from('water_logs')
        .insert({
          user_id: userId,
          date,
          glasses,
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
    // Get current glasses count
    const { data: existingLog, error: fetchError } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    
    const currentGlasses = existingLog ? existingLog.glasses : 0;
    await updateWaterIntake(userId, date, currentGlasses + 1);
  } catch (error) {
    console.error("Error incrementing water:", error);
    throw error;
  }
};

export const decrementWaterIntake = async (userId: string, date: string) => {
  try {
    // Get current glasses count
    const { data: existingLog, error: fetchError } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    
    const currentGlasses = existingLog ? existingLog.glasses : 0;
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
    
    // Get meals data
    const { data: mealsData, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .order('date', { ascending: false });
  
    if (mealsError) throw mealsError;
    
    // Get water logs data
    const { data: waterData, error: waterError } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .order('date', { ascending: false });
  
    if (waterError) throw waterError;
    
    // Process and combine the data
    const logsByDate: Record<string, any> = {};
    
    // Initialize with dates from the past 30 days
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
    
    // Add water data
    waterData?.forEach((water: any) => {
      if (water && typeof water === 'object' && 'date' in water) {
        const dateStr = water.date as string;
        if (logsByDate[dateStr]) {
          logsByDate[dateStr].waterGlasses = water.glasses as number;
        }
      }
    });
    
    // Add meals data
    mealsData?.forEach((meal: any) => {
      if (meal && typeof meal === 'object' && 'date' in meal && 'foods' in meal) {
        const dateStr = meal.date as string;
        if (logsByDate[dateStr]) {
          // Convert the JSONB foods back to Food[] format
          const mealFoods = meal.foods as any[];
          const foods = mealFoods.map((item: any) => ({
            id: crypto.randomUUID(),
            name: item.name,
            quantity: item.quantity,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat || item.fats, // Handle both potential property names
            fiber: item.fiber,
            sodium: item.sodium,
            sugar: item.sugar
          }));
          
          // Convert Spanish meal type back to English
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
    
    // Calculate streak
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
    
    // Convert the meals data to the expected format
    return mealsData.map((meal: any) => {
      // Convert the JSONB foods back to Food[] format
      const mealFoods = meal.foods as any[];
      const foods = mealFoods ? mealFoods.map((item: any) => ({
        id: crypto.randomUUID(),
        name: item.name,
        quantity: item.quantity,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat || item.fats, // Handle both property names
        fiber: item.fiber,
        sodium: item.sodium,
        sugar: item.sugar
      })) : [];
      
      // Convert Spanish meal type back to English
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

// User goals functions - direct database operations
export const saveUserGoal = async (userId: string, goalType: string, description: string, targetValue?: number, targetDate?: Date) => {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .insert({
        user_id: userId,
        goal_type: goalType,
        description,
        target_value: targetValue,
        target_date: targetDate ? targetDate.toISOString().split('T')[0] : null,
        current_value: 0
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error saving user goal:", error);
    throw error;
  }
};

// Get user goals
export const getUserGoals = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting user goals:", error);
    throw error;
  }
};

// Update a user goal
export const updateUserGoal = async (goalId: string, updates: Partial<{
  description: string;
  target_value: number;
  current_value: number;
  target_date: string;
  is_achieved: boolean;
}>) => {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating user goal:", error);
    throw error;
  }
};

// Delete a user goal
export const deleteUserGoal = async (goalId: string) => {
  try {
    const { error } = await supabase
      .from('user_goals')
      .delete()
      .eq('id', goalId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting user goal:", error);
    throw error;
  }
};


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
  
  const { data: mealData, error: mealError } = await supabase
    .from('meals')
    .insert({
      user_id: userId,
      meal_type: meal.type,
      total_quantity: totalQuantity,
      total_calories: totalCalories,
      total_protein: totalProtein,
      total_carbs: totalCarbs,
      total_fats: totalFats,
      total_fiber: totalFiber,
      total_sodium: totalSodium,
      total_sugar: totalSugar,
      image_url: meal.photo,
      input_method: 'manual',
      created_at: meal.timestamp.toISOString(),
    })
    .select()
    .single();
  
  if (mealError) throw mealError;
  
  const mealFoods = meal.foods.map(food => ({
    meal_id: mealData.id,
    food_item_id: food.id,
    name: food.name,
    quantity: food.quantity,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fats: food.fat,
    fiber: food.fiber,
    sodium: food.sodium,
    sugar: food.sugar,
  }));
  
  const { error: foodsError } = await supabase
    .from('meal_foods')
    .insert(mealFoods);
  
  if (foodsError) throw foodsError;
  
  return mealData;
};

export const updateDailyLog = async (userId: string, date: string, data: any) => {
  const { data: existingLog, error: logCheckError } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  
  if (logCheckError && logCheckError.code !== 'PGRST116') throw logCheckError;
  
  if (!existingLog) {
    const { error: createLogError } = await supabase
      .from('daily_logs')
      .insert({
        user_id: userId,
        date,
        ...data
      });
    
    if (createLogError) throw createLogError;
  } else {
    const { error: updateLogError } = await supabase
      .from('daily_logs')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingLog.id);
    
    if (updateLogError) throw updateLogError;
  }
};

export const fetchUserLogs = async (userId: string, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];
  
  const { data: logsData, error: logsError } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDateStr)
    .order('date', { ascending: false });

  if (logsError) throw logsError;
  
  return logsData || [];
};

export const fetchUserMeals = async (userId: string, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString();
  
  const { data: mealsData, error: mealsError } = await supabase
    .from('meals')
    .select('*, meal_foods(*)')
    .eq('user_id', userId)
    .gte('created_at', startDateStr)
    .order('created_at', { ascending: false });

  if (mealsError) throw mealsError;
  
  return mealsData || [];
};

export const updateWaterIntake = async (userId: string, date: string, waterIntake: number) => {
  const { data: logData, error: logError } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  
  if (logError && logError.code !== 'PGRST116') throw logError;
  
  if (logData) {
    const { error: updateError } = await supabase
      .from('daily_logs')
      .update({
        water_intake: waterIntake,
        updated_at: new Date().toISOString(),
      })
      .eq('id', logData.id);
    
    if (updateError) throw updateError;
  } else {
    const { error: createError } = await supabase
      .from('daily_logs')
      .insert({
        user_id: userId,
        date,
        water_intake: waterIntake,
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fats: 0,
      });
    
    if (createError) throw createError;
  }
};

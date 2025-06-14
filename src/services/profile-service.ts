
import { supabase } from '@/integrations/supabase/client';
import { NutritionGoals, UserProfile } from '@/types/user';

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: updates.name,
      gender: updates.gender,
      age: updates.age,
      weight: updates.weight,
      height: updates.height,
      avatar_url: updates.avatar,
      activity_level: updates.activityLevel,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const getUserNutritionGoals = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching nutrition goals:', error);
    return null;
  }
};

export const updateNutritionGoals = async (
  userId: string, 
  goals: Partial<NutritionGoals>,
  nutritionGoal: string = 'maintain'
) => {
  try {
    console.log("Updating nutrition goals with objective:", nutritionGoal);
    
    // Check if user already has goals
    const { data: existingGoals } = await supabase
      .from('user_goals')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();
    
    if (existingGoals) {
      // Update existing goals
      const { error } = await supabase
        .from('user_goals')
        .update({
          calories: goals.calories,
          protein: goals.protein,
          carbs: goals.carbs,
          fat: goals.fat,
          nutrition_goal: nutritionGoal,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingGoals.id);
      
      if (error) throw error;
    } else {
      // Create new goals
      const { error } = await supabase
        .from('user_goals')
        .insert({
          user_id: userId,
          calories: goals.calories,
          protein: goals.protein,
          carbs: goals.carbs,
          fat: goals.fat,
          nutrition_goal: nutritionGoal
        });
      
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error updating nutrition goals:', error);
    throw error;
  }
};

export const createNutritionLimitNotification = async (userId: string, message: string) => {
  try {
    // Verificar si ya existe una notificación similar para hoy
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existingNotifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'nutrition_limit')
      .like('sent_at', `${today}%`);
    
    // Solo crear la notificación si no hay una similar hoy
    if (!existingNotifications || existingNotifications.length === 0) {
      console.log("Creating nutrition limit notification:", message);
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Límite de nutrición',
          message: message,
          type: 'nutrition_limit',
          read: false,
          sent_at: new Date().toISOString()
        });
      
      if (error) throw error;
    } else {
      console.log("Nutrition limit notification already exists for today, skipping");
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};


import { supabase } from '@/integrations/supabase/client';

// Updated to match our new database schema
export type UserGoal = {
  id: string;
  user_id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  nutrition_goal: string | null;
  updated_at: string;
};

export const saveUserGoal = async (userId: string, goalData: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  nutrition_goal?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .insert({
        user_id: userId,
        calories: goalData.calories,
        protein: goalData.protein,
        carbs: goalData.carbs,
        fat: goalData.fat,
        nutrition_goal: goalData.nutrition_goal || 'maintain'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data as UserGoal;
  } catch (error) {
    console.error("Error saving user goal:", error);
    throw error;
  }
};

export const getUserGoals = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    return data as UserGoal[];
  } catch (error) {
    console.error("Error getting user goals:", error);
    throw error;
  }
};

export const updateUserGoal = async (goalId: string, updates: Partial<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  nutrition_goal: string;
}>) => {
  try {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('user_goals')
      .update(updateData)
      .eq('id', goalId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data as UserGoal;
  } catch (error) {
    console.error("Error updating user goal:", error);
    throw error;
  }
};

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

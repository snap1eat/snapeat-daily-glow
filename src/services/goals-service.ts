
import { supabase } from '@/integrations/supabase/client';

type UserGoal = {
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
};

export const saveUserGoal = async (userId: string, goalType: string, description: string, targetValue?: number, targetDate?: Date) => {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .insert({
        user_id: userId,
        goal_type: goalType,
        description: description,
        target_value: targetValue || null,
        target_date: targetDate ? targetDate.toISOString().split('T')[0] : null
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
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as UserGoal[];
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

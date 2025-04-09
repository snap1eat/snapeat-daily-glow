
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
      .rpc('create_user_goal', {
        user_id_param: userId,
        goal_type_param: goalType,
        description_param: description,
        target_value_param: targetValue,
        target_date_param: targetDate ? targetDate.toISOString().split('T')[0] : null
      });
    
    if (error) throw error;
    
    return Array.isArray(data) ? data as UserGoal[] : [];
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
    
    return Array.isArray(data) ? data as UserGoal[] : [];
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
    
    return Array.isArray(data) ? data as UserGoal[] : [];
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

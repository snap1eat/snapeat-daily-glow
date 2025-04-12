
import { supabase } from '@/integrations/supabase/client';

export interface UserHabit {
  id: string;
  alcoholConsumption: string;
  caffeine: string;
  sugarIntake: string;
  sleepHours: number;
  dietQuality: number;
  favoriteFood: string;
  dietType: string;
  tobacco: string;
}

/**
 * Fetches the user's habit preferences from the database
 */
export const fetchUserHabits = async (userId: string): Promise<UserHabit | null> => {
  try {
    const { data, error } = await supabase
      .from('user_habits')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user habits:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Convert from database format to our application format
    return {
      id: data.id,
      alcoholConsumption: data.alcohol_consumption || 'no',
      caffeine: data.caffeine || 'moderate',
      sugarIntake: data.sugar_intake || 'moderate',
      sleepHours: data.sleep_hours || 7,
      dietQuality: data.diet_quality || 3,
      favoriteFood: data.favorite_food || '',
      dietType: data.diet_type || 'balanced',
      tobacco: data.tobacco || 'none'
    };
  } catch (error) {
    console.error('Error in fetchUserHabits:', error);
    return null;
  }
};

/**
 * Saves or updates the user's habit preferences in the database
 */
export const saveUserHabits = async (userId: string, habits: Omit<UserHabit, 'id'>): Promise<boolean> => {
  try {
    // Check if the user already has habits saved
    const { data: existingHabits } = await supabase
      .from('user_habits')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    // Map from our application format to database format
    const habitData = {
      user_id: userId,
      alcohol_consumption: habits.alcoholConsumption,
      caffeine: habits.caffeine,
      sugar_intake: habits.sugarIntake,
      sleep_hours: habits.sleepHours,
      diet_quality: habits.dietQuality,
      favorite_food: habits.favoriteFood,
      diet_type: habits.dietType,
      tobacco: habits.tobacco,
      updated_at: new Date().toISOString()
    };
    
    let result;
    
    if (existingHabits) {
      // Update existing record
      result = await supabase
        .from('user_habits')
        .update(habitData)
        .eq('id', existingHabits.id);
    } else {
      // Insert new record
      result = await supabase
        .from('user_habits')
        .insert(habitData);
    }
    
    if (result.error) {
      console.error('Error saving user habits:', result.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveUserHabits:', error);
    return false;
  }
};

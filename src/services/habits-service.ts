
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
    // Use a more generic type here to avoid TypeScript errors with the table name
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
      alcoholConsumption: data.frequency || 'no', // Map user_habits frequency to alcoholConsumption
      caffeine: 'moderate',
      sugarIntake: 'moderate',
      sleepHours: 7,
      dietQuality: 3,
      favoriteFood: '',
      dietType: 'balanced',
      tobacco: 'none'
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
    
    // Map from our application format to user_habits table format
    const habitData = {
      user_id: userId,
      frequency: habits.alcoholConsumption, // Map alcoholConsumption to frequency
      habit_id: '00000000-0000-0000-0000-000000000000' // Default habit_id (required by schema)
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

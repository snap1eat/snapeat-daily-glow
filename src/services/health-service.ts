
import { supabase } from '@/integrations/supabase/client';

export interface UserHealth {
  id: string;
  glycemia: string;
  cholesterol: string;
  triglycerides: string;
  hypertension: boolean;
  foodIntolerances: string;
  digestiveIssues: string;
  additionalHealthInfo: string;
  familyHypertension: boolean;
  familyDiabetes: boolean;
}

/**
 * Fetches the user's health data from the database
 */
export const fetchUserHealth = async (userId: string): Promise<UserHealth | null> => {
  try {
    const { data, error } = await supabase
      .from('user_health')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user health data:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Convert from database format to our application format
    return {
      id: data.id,
      glycemia: data.glycemia || '',
      cholesterol: data.cholesterol || '',
      triglycerides: data.triglycerides || '',
      hypertension: data.hypertension || false,
      foodIntolerances: data.food_intolerances || '',
      digestiveIssues: data.digestive_issues || 'none',
      additionalHealthInfo: data.additional_health_info || '',
      familyHypertension: data.family_hypertension || false,
      familyDiabetes: data.family_diabetes || false
    };
  } catch (error) {
    console.error('Error in fetchUserHealth:', error);
    return null;
  }
};

/**
 * Saves or updates the user's health data in the database
 */
export const saveUserHealth = async (userId: string, health: Omit<UserHealth, 'id'>): Promise<boolean> => {
  try {
    // Check if the user already has health data saved
    const { data: existingHealth } = await supabase
      .from('user_health')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    // Map from our application format to database format
    const healthData = {
      user_id: userId,
      glycemia: health.glycemia,
      cholesterol: health.cholesterol,
      triglycerides: health.triglycerides,
      hypertension: health.hypertension,
      food_intolerances: health.foodIntolerances,
      digestive_issues: health.digestiveIssues,
      additional_health_info: health.additionalHealthInfo,
      family_hypertension: health.familyHypertension,
      family_diabetes: health.familyDiabetes,
      updated_at: new Date().toISOString()
    };
    
    let result;
    
    if (existingHealth) {
      // Update existing record
      result = await supabase
        .from('user_health')
        .update(healthData)
        .eq('id', existingHealth.id);
    } else {
      // Insert new record
      result = await supabase
        .from('user_health')
        .insert(healthData);
    }
    
    if (result.error) {
      console.error('Error saving user health data:', result.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveUserHealth:', error);
    return false;
  }
};

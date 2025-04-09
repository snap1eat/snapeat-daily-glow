
import { supabase } from '@/integrations/supabase/client';

export const updateWaterIntake = async (userId: string, date: string, glasses: number) => {
  try {
    // Check if a water log exists for this date
    const { data, error: fetchError } = await supabase
      .rpc('get_water_log', { 
        user_id_param: userId, 
        date_param: date 
      });
    
    if (fetchError) throw fetchError;
    
    const existingLogs = Array.isArray(data) ? data : [];
    
    if (existingLogs && existingLogs.length > 0) {
      // Update existing log
      const logId = existingLogs[0].id;
      const { error: updateError } = await supabase
        .rpc('update_water_log', { 
          log_id_param: logId, 
          glasses_param: glasses, 
          updated_at_param: new Date().toISOString()
        });
      
      if (updateError) throw updateError;
    } else {
      // Create new log
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
    
    const existingLogs = Array.isArray(data) ? data : [];
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
    
    const existingLogs = Array.isArray(data) ? data : [];
    const currentGlasses = existingLogs && existingLogs.length > 0 ? existingLogs[0].glasses : 0;
    
    if (currentGlasses > 0) {
      await updateWaterIntake(userId, date, currentGlasses - 1);
    }
  } catch (error) {
    console.error("Error decrementing water:", error);
    throw error;
  }
};


// This file is maintained for backwards compatibility
// It re-exports all services from their new locations
export * from './auth-service';
export * from './profile-service';
export * from './meals-service';
export * from './water-service';
export * from './logs-service';
export * from './goals-service';

// Add a function to get the current user ID
import { supabase } from '@/integrations/supabase/client';

export const getCurrentUserId = async (): Promise<string> => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error || !data.session) {
    throw new Error("No active session found");
  }
  
  return data.session.user.id;
};

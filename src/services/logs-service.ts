
import { supabase } from '@/integrations/supabase/client';
import { DailyLog } from '@/types/user';

export const fetchUserLogs = async (userId: string, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    const { data: mealsData, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .order('date', { ascending: false });
  
    if (mealsError) throw mealsError;
    
    // Get water logs using RPC function
    const { data, error: waterError } = await supabase
      .rpc('get_water_logs_for_user', { 
        user_id_param: userId, 
        start_date_param: startDateStr 
      });
  
    if (waterError) throw waterError;
    
    const waterData = Array.isArray(data) ? data : [];
    
    const logsByDate: Record<string, any> = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      logsByDate[dateStr] = {
        date: dateStr,
        waterGlasses: 0,
        meals: [],
        streakDay: 0,
        eatsPoints: 0
      };
    }
    
    if (waterData) {
      waterData.forEach((water: any) => {
        if (water && typeof water === 'object' && 'date' in water) {
          const dateStr = water.date as string;
          if (logsByDate[dateStr]) {
            logsByDate[dateStr].waterGlasses = water.glasses as number;
          }
        }
      });
    }
    
    if (mealsData) {
      mealsData.forEach((meal: any) => {
        if (meal && typeof meal === 'object' && 'date' in meal && 'foods' in meal) {
          const dateStr = meal.date as string;
          if (logsByDate[dateStr]) {
            const mealFoods = meal.foods as any[];
            const foods = mealFoods ? mealFoods.map((item: any) => ({
              id: crypto.randomUUID(),
              name: item.name,
              quantity: item.quantity,
              calories: item.calories,
              protein: item.protein,
              carbs: item.carbs,
              fat: item.fat || item.fats,
              fiber: item.fiber,
              sodium: item.sodium,
              sugar: item.sugar
            })) : [];
            
            const mealTypeMapping: Record<string, string> = {
              'desayuno': 'breakfast',
              'almuerzo': 'lunch',
              'cena': 'dinner',
              'snack': 'snack'
            };
            
            const englishMealType = mealTypeMapping[meal.meal_type as string] || meal.meal_type;
            
            logsByDate[dateStr].meals.push({
              id: meal.id,
              type: englishMealType as any,
              foods,
              timestamp: new Date(meal.created_at as string),
              photo: meal.image_url
            });
            
            logsByDate[dateStr].eatsPoints += 10;
          }
        }
      });
    }
    
    const dateKeys = Object.keys(logsByDate).sort().reverse();
    let consecutiveDays = 0;
    
    for (const dateStr of dateKeys) {
      const log = logsByDate[dateStr];
      
      if (log.meals.length > 0 || log.waterGlasses > 0) {
        consecutiveDays++;
        log.streakDay = consecutiveDays;
      } else {
        break;
      }
    }
    
    return Object.values(logsByDate);
  } catch (error) {
    console.error("Error fetching user logs:", error);
    throw error;
  }
};

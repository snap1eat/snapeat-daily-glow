
import { supabase } from '@/integrations/supabase/client';
import { MealLog, Food } from '@/types/user';

export const saveMeal = async (userId: string, meal: MealLog) => {
  const totalCalories = meal.foods.reduce((sum, food) => sum + food.calories, 0);
  const totalProtein = meal.foods.reduce((sum, food) => sum + food.protein, 0);
  const totalCarbs = meal.foods.reduce((sum, food) => sum + food.carbs, 0);
  const totalFats = meal.foods.reduce((sum, food) => sum + food.fat, 0);
  const totalFiber = meal.foods.reduce((sum, food) => sum + (food.fiber || 0), 0);
  const totalSodium = meal.foods.reduce((sum, food) => sum + (food.sodium || 0), 0);
  const totalSugar = meal.foods.reduce((sum, food) => sum + (food.sugar || 0), 0);
  const totalQuantity = meal.foods.reduce((sum, food) => sum + food.quantity, 0);
  
  const mealTypeMapping: Record<string, string> = {
    'breakfast': 'desayuno',
    'lunch': 'almuerzo',
    'dinner': 'cena',
    'snack': 'snack'
  };
  
  const spanishMealType = mealTypeMapping[meal.type] || meal.type;
  
  const foodsJson = meal.foods.map(food => ({
    name: food.name,
    quantity: food.quantity,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    fiber: food.fiber || 0,
    sodium: food.sodium || 0,
    sugar: food.sugar || 0
  }));
  
  const { data: mealData, error: mealError } = await supabase
    .from('meals')
    .insert({
      user_id: userId,
      meal_type: spanishMealType,
      total_quantity: totalQuantity,
      total_calories: totalCalories,
      total_protein: totalProtein,
      total_carbs: totalCarbs,
      total_fats: totalFats,
      total_fiber: totalFiber,
      total_sodium: totalSodium,
      total_sugar: totalSugar,
      foods: foodsJson,
      image_url: meal.photo,
      input_method: 'manual',
      date: meal.timestamp.toISOString().split('T')[0],
      created_at: meal.timestamp.toISOString()
    })
    .select()
    .single();
  
  if (mealError) throw mealError;
  
  return mealData;
};

export const fetchUserMeals = async (userId: string, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    const { data: mealsData, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .order('created_at', { ascending: false });
  
    if (mealsError) throw mealsError;
    
    return mealsData.map((meal: any) => {
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
      
      return {
        id: meal.id,
        user_id: meal.user_id,
        meal_type: englishMealType,
        total_calories: meal.total_calories,
        total_protein: meal.total_protein,
        total_carbs: meal.total_carbs,
        total_fats: meal.total_fats,
        foods,
        created_at: meal.created_at
      };
    });
  } catch (error) {
    console.error("Error fetching user meals:", error);
    throw error;
  }
};

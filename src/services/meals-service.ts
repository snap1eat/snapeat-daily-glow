
import { supabase } from '@/integrations/supabase/client';
import { MealLog, Food } from '@/types/user';

export const saveMeal = async (userId: string, meal: MealLog) => {
  try {
    const totalCalories = meal.foods.reduce((sum, food) => sum + food.calories, 0);
    const totalProtein = meal.foods.reduce((sum, food) => sum + food.protein, 0);
    const totalCarbs = meal.foods.reduce((sum, food) => sum + food.carbs, 0);
    const totalFats = meal.foods.reduce((sum, food) => sum + food.fat, 0);
    const totalFiber = meal.foods.reduce((sum, food) => sum + (food.fiber || 0), 0);
    const totalSodium = meal.foods.reduce((sum, food) => sum + (food.sodium || 0), 0);
    const totalSugar = meal.foods.reduce((sum, food) => sum + (food.sugar || 0), 0);
    const totalQuantity = meal.foods.reduce((sum, food) => sum + food.quantity, 0);
    
    // Definir un mapa para traducir los tipos de comida de inglés a español
    const mealTypeMapping: Record<string, string> = {
      'breakfast': 'desayuno',
      'lunch': 'almuerzo',
      'dinner': 'cena',
      'snack': 'snack',
      'drink': 'bebida'
    };
    
    // Asegurarse de que el tipo de comida esté en español
    const spanishMealType = mealTypeMapping[meal.type] || 'snack';
    
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
    
    // Verificar los datos antes de la inserción
    console.log('Saving meal with type:', spanishMealType);
    
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
    
    if (mealError) {
      console.error('Error saving meal:', mealError);
      throw mealError;
    }
    
    return mealData;
  } catch (error) {
    console.error("Error saving meal:", error);
    throw error;
  }
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
      
      // Mapa para traducir los tipos de comida de español a inglés
      const mealTypeMapping: Record<string, string> = {
        'desayuno': 'breakfast',
        'almuerzo': 'lunch',
        'cena': 'dinner',
        'snack': 'snack',
        'bebida': 'drink'
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

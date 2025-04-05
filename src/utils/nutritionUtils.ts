
import { MealLog, NutritionGoals, UserProfile } from '../types/user';

export const calculateGoalsBasedOnObjective = (
  profile: UserProfile, 
  objective: string
): NutritionGoals => {
  const { weight, height, age, gender, activityLevel } = profile;
  let bmr = 0;
  
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  let activityMultiplier = 1.2;
  switch(activityLevel) {
    case 'light': activityMultiplier = 1.375; break;
    case 'moderate': activityMultiplier = 1.55; break;
    case 'active': activityMultiplier = 1.725; break;
    case 'extra_active': activityMultiplier = 1.9; break;
  }
  
  let calories = Math.round(bmr * activityMultiplier);
  
  switch(objective) {
    case 'weight_loss': calories -= 500; break;
    case 'weight_gain': calories += 500; break;
    case 'muscle_gain': calories += 300; break;
  }
  
  let protein = 0;
  let fat = 0;
  let carbs = 0;
  
  switch(objective) {
    case 'weight_loss':
      protein = Math.round(weight * 2.2);
      fat = Math.round(weight * 0.4);
      carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4);
      break;
    case 'muscle_gain':
      protein = Math.round(weight * 1.6);
      fat = Math.round(calories * 0.25 / 9);
      carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4);
      break;
    case 'maintain':
    default:
      protein = Math.round(weight * 1.2);
      fat = Math.round(calories * 0.3 / 9);
      carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4);
  }
  
  calories = Math.max(1200, calories);
  protein = Math.max(50, protein);
  fat = Math.max(30, fat);
  carbs = Math.max(50, carbs);
  
  return { calories, protein, carbs, fat };
};

export const calculateDailyNutrition = (meals: MealLog[]) => {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  meals.forEach(meal => {
    meal.foods.forEach(food => {
      totalCalories += food.calories;
      totalProtein += food.protein;
      totalCarbs += food.carbs;
      totalFat += food.fat;
    });
  });

  return { totalCalories, totalProtein, totalCarbs, totalFat };
};

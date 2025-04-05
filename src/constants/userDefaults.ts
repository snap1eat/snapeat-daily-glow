
import { NutritionGoals, UserProfile, UserSettings } from '../types/user';

export const defaultProfile: UserProfile = {
  name: '',
  age: 30,
  gender: 'no-answer',
  weight: 70,
  height: 170,
  activityLevel: 'moderate',
  avatar: '',
  username: 'HealthyPineapple123',
};

export const defaultNutritionGoals: NutritionGoals = {
  calories: 2000,
  protein: 100,
  carbs: 250,
  fat: 70,
};

export const defaultSettings: UserSettings = {
  sound: true,
  vibration: true,
  animations: true,
  motivationalMessages: true,
  audioExercises: false,
  newsNotifications: true,
};

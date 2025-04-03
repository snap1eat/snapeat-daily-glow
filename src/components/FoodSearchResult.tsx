
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FoodSearchResultProps {
  food: {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onAdd: () => void;
}

export function FoodSearchResult({ food, onAdd }: FoodSearchResultProps) {
  return (
    <div className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50 transition-colors">
      <div>
        <div className="font-medium">{food.name}</div>
        <div className="text-sm text-muted-foreground">
          {food.calories.toFixed(1)} kcal | P: {food.protein.toFixed(1)}g | C: {food.carbs.toFixed(1)}g | F: {food.fat.toFixed(1)}g
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onAdd}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

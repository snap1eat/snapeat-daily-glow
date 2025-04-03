
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
          {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | G: {food.fat}g
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onAdd}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

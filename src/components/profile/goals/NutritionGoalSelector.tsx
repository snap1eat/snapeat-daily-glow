
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface NutritionGoalSelectorProps {
  value: string;
  onChange: (value: string) => void;
  applyGoalBasedObjective: (objective: string) => void;
}

const NutritionGoalSelector = ({ value, onChange, applyGoalBasedObjective }: NutritionGoalSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="nutrition-goal">Mi objetivo principal es</Label>
      <Select 
        value={value} 
        onValueChange={(value) => {
          onChange(value);
          applyGoalBasedObjective(value);
        }}
      >
        <SelectTrigger id="nutrition-goal">
          <SelectValue placeholder="Selecciona tu objetivo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="muscle_gain">Incrementar mi masa muscular</SelectItem>
          <SelectItem value="weight_loss">Bajar de peso</SelectItem>
          <SelectItem value="weight_gain">Subir de peso</SelectItem>
          <SelectItem value="immune_boost">Fortalecer mi sistema inmune</SelectItem>
          <SelectItem value="maintain">Mantener mi peso actual</SelectItem>
          <SelectItem value="energy">Aumentar mi energía diaria</SelectItem>
          <SelectItem value="performance">Mejorar mi rendimiento deportivo</SelectItem>
          <SelectItem value="health">Mejorar mi salud general</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default NutritionGoalSelector;

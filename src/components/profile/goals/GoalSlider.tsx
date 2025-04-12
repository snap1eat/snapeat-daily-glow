
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface GoalSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

const GoalSlider = ({ id, label, value, min, max, step, onChange }: GoalSliderProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor={id}>{label}</Label>
        <span className="font-medium">{value} {id === 'calories' ? 'kcal' : 'g'}</span>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
      />
    </div>
  );
};

export default GoalSlider;

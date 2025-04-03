
import { Coffee, Sun, Sunset, Cookie } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MealIndicatorProps {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  isCompleted: boolean;
  label: string;
  className?: string;
}

export function MealIndicator({ type, isCompleted, label, className }: MealIndicatorProps) {
  // Define icon based on meal type
  const Icon = () => {
    switch (type) {
      case 'breakfast':
        return <Coffee className="h-5 w-5" />;
      case 'lunch':
        return <Sun className="h-5 w-5" />;
      case 'dinner':
        return <Sunset className="h-5 w-5" />;
      case 'snack':
        return <Cookie className="h-5 w-5" />;
      default:
        return <Coffee className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={cn(
          "meal-indicator", 
          isCompleted ? "meal-indicator-filled" : "meal-indicator-empty",
          className
        )}
      >
        <Icon />
      </div>
      <div className="mt-1 text-xs font-medium">{label}</div>
    </div>
  );
}

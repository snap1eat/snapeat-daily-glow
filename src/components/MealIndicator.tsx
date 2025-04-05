
import React from 'react';
import { 
  Coffee, 
  UtensilsCrossed, 
  Soup, 
  Cookie
} from 'lucide-react';

interface MealIndicatorProps {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  isCompleted: boolean;
  label: string;
  count?: number;
}

export const MealIndicator: React.FC<MealIndicatorProps> = ({ 
  type, 
  isCompleted,
  label,
  count = 0
}) => {
  const Icon = () => {
    switch (type) {
      case 'breakfast':
        return <Coffee className="h-6 w-6" />;
      case 'lunch':
        return <UtensilsCrossed className="h-6 w-6" />;
      case 'dinner':
        return <Soup className="h-6 w-6" />;
      case 'snack':
        return <Cookie className="h-6 w-6" />;
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`
          relative flex items-center justify-center rounded-full w-14 h-14 
          ${isCompleted ? 'bg-snapeat-green/20' : 'bg-gray-100'}
          transition-colors duration-300
        `}
      >
        <div className={`text-${isCompleted ? 'snapeat-green' : 'gray-400'}`}>
          <Icon />
        </div>
        
        {count > 1 && (
          <div className="absolute -top-1 -right-1 bg-snapeat-green text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {count}
          </div>
        )}
      </div>
      <span className="text-xs mt-1 text-center">{label}</span>
    </div>
  );
};

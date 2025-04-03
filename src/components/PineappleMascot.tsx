
import { cn } from '@/lib/utils';

interface PineappleMascotProps {
  mood: number; // 0-10 scale where 10 is the happiest
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PineappleMascot({ 
  mood = 5, 
  className,
  size = 'md', 
}: PineappleMascotProps) {
  // Scale size based on prop
  const sizeClass = {
    'sm': 'text-3xl',
    'md': 'text-6xl',
    'lg': 'text-8xl',
  }[size];
  
  // Choose the right emoji based on mood
  const getEmoji = () => {
    if (mood >= 8) return (
      <div className="relative flex flex-col items-center">
        <div className="text-yellow-400">👑</div>
        <div className="text-yellow-500">😄</div>
        <div className="text-amber-600">🍍</div>
      </div>
    );
    if (mood >= 6) return (
      <div className="relative flex flex-col items-center">
        <div className="text-yellow-500">😊</div>
        <div className="text-amber-600">🍍</div>
      </div>
    );
    if (mood >= 4) return (
      <div className="relative flex flex-col items-center">
        <div className="text-yellow-500">😐</div>
        <div className="text-amber-600">🍍</div>
      </div>
    );
    if (mood >= 2) return (
      <div className="relative flex flex-col items-center">
        <div className="text-yellow-500">😕</div>
        <div className="text-amber-600">🍍</div>
      </div>
    );
    return (
      <div className="relative flex flex-col items-center">
        <div className="text-yellow-500">😢</div>
        <div className="text-amber-600">🍍</div>
      </div>
    );
  };
  
  // Add animations based on mood
  const getAnimationClass = () => {
    if (mood >= 8) return 'animate-pulse-soft animate-float';
    if (mood >= 6) return 'animate-float';
    if (mood <= 3) return 'animate-none';
    return 'animate-none';
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-center",
        sizeClass,
        getAnimationClass(),
        className
      )}
    >
      <span role="img" aria-label="pineapple mascot">
        {getEmoji()}
      </span>
    </div>
  );
}

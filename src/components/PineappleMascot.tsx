
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
    'md': 'text-5xl',
    'lg': 'text-7xl',
  }[size];
  
  // Choose the right emoji based on mood
  const getEmoji = () => {
    if (mood >= 8) return '😄🍍'; // Very happy
    if (mood >= 6) return '🙂🍍'; // Happy
    if (mood >= 4) return '😐🍍'; // Neutral
    if (mood >= 2) return '😕🍍'; // Sad
    return '😢🍍'; // Very sad
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

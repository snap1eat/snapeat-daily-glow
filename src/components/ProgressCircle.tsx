
import { cn } from '@/lib/utils';

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  value?: string;
}

export function ProgressCircle({
  percentage,
  size = 100,
  strokeWidth = 8,
  className,
  label,
  value,
}: ProgressCircleProps) {
  // Ensure percentage is between 0 and 100
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  // Calculate circle values
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;
  
  // Choose color based on percentage
  let colorClass = 'stroke-green-500';
  if (clampedPercentage > 100) {
    colorClass = 'stroke-red-500';
  } else if (clampedPercentage < 30) {
    colorClass = 'stroke-amber-500';
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={colorClass}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <div className="text-xs text-muted-foreground">{label}</div>}
        <div className="text-lg font-semibold">{clampedPercentage}%</div>
        {value && <div className="text-xs text-muted-foreground">{value}</div>}
      </div>
    </div>
  );
}

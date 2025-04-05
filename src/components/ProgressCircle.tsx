
import React from 'react';

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  value?: string;
  showAlert?: boolean;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  percentage,
  size = 100,
  strokeWidth = 10,
  label,
  value,
  showAlert = false
}) => {
  // Ensure percentage is between 0 and 100
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));
  
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedPercentage / 100) * circumference;
  
  // Calculate colors
  const getColor = () => {
    if (showAlert) return '#ef4444'; // Red for alert
    if (percentage < 30) return '#f97316'; // Orange for low
    if (percentage < 70) return '#22c55e'; // Green for normal
    if (percentage < 100) return '#3b82f6'; // Blue for good
    return '#8b5cf6'; // Purple for exceeding
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg width={size} height={size} className={showAlert ? "animate-pulse" : ""}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        
        {/* Center content */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ padding: strokeWidth }}
        >
          {label && <div className="text-xs text-muted-foreground">{label}</div>}
          <div className="text-2xl font-bold">{normalizedPercentage}%</div>
          {value && <div className="text-xs mt-1">{value}</div>}
        </div>
        
        {/* Alert indicator */}
        {showAlert && (
          <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

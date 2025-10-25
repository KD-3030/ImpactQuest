import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  value?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'warning' | 'success' | 'danger';
  showValue?: boolean;
  label?: string;
  animated?: boolean;
}

export function CircularProgress({
  value = 0,
  size = 'md',
  color = 'primary',
  showValue = false,
  label,
  animated = false,
}: CircularProgressProps) {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);

  useEffect(() => {
    if (animated && displayValue < value) {
      const timer = setTimeout(() => {
        setDisplayValue(prev => Math.min(prev + 1, value));
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [animated, displayValue, value]);

  const sizes = {
    sm: { dimension: 40, strokeWidth: 4, fontSize: 'text-xs' },
    md: { dimension: 60, strokeWidth: 6, fontSize: 'text-sm' },
    lg: { dimension: 80, strokeWidth: 8, fontSize: 'text-base' },
  };

  const colors = {
    primary: '#FA2FB5',
    secondary: '#31087B',
    warning: '#FFC23C',
    success: '#10B981',
    danger: '#EF4444',
  };

  const { dimension, strokeWidth, fontSize } = sizes[size];
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayValue / 100) * circumference;

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <svg
          width={dimension}
          height={dimension}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress circle */}
          <motion.circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke={colors[color]}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </svg>

        {/* Center value */}
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-bold text-white ${fontSize}`}>
              {Math.round(displayValue)}%
            </span>
          </div>
        )}
      </div>

      {/* Label */}
      {label && (
        <span className="text-sm text-gray-300">{label}</span>
      )}
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'warning';
  label?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  label 
}: LoadingSpinnerProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((v) => (v >= 100 ? 0 : v + 10));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return <CircularProgress value={value} size={size} color={color} showValue label={label} />;
}

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={`animate-spin rounded-full border-[#FA2FB5] border-t-transparent ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

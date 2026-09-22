import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number; // Duration in milliseconds (default: 1500)
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1400,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const startTimestampRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(0);

  useEffect(() => {
    startValueRef.current = displayValue;
    startTimestampRef.current = null;

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestampRef.current) startTimestampRef.current = timestamp;
      const progress = Math.min((timestamp - startTimestampRef.current) / duration, 1);

      // Smooth Ease-Out Expo curve for Apple-like momentum
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValueRef.current + (value - startValueRef.current) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  const formattedNumber = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();

  return (
    <span className={`inline-block font-mono tracking-tight ${className}`}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
};

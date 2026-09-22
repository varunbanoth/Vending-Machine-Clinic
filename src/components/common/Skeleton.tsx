import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'text':
        return 'rounded-md h-4 my-1';
      case 'rectangular':
      default:
        return 'rounded-2xl';
    }
  };

  return (
    <div
      style={{ width, height }}
      className={`relative overflow-hidden bg-slate-800/60 dark:bg-slate-900/60 border border-slate-700/30 ${getVariantStyles()} ${className}`}
    >
      {/* Passing Shimmer Gradient Wave */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-400/10 to-transparent animate-shimmer pointer-events-none" />
    </div>
  );
};

import React, { useRef, useState, useEffect } from 'react';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number; // Distance multiplier (default: 0.25)
  activeGlow?: boolean;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 0.25,
  activeGlow = false,
  className = '',
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = (e.clientX - centerX) * strength;
    const distanceY = (e.clientY - centerY) * strength;

    setPosition({ x: distanceX, y: distanceY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
    setIsPressed(false);
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onClick}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${isPressed ? 0.95 : isHovered ? 1.02 : 1})`,
        transition: isHovered
          ? 'transform 0.12s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.2s ease'
          : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease',
      }}
      className={`relative select-none cursor-pointer overflow-hidden ${
        activeGlow ? 'glow-blue' : ''
      } ${className}`}
      {...props}
    >
      {/* Visual Haptic Flash Ring on Click */}
      {isPressed && (
        <span className="absolute inset-0 rounded-[inherit] bg-white/15 pointer-events-none animate-ping duration-300" />
      )}
      {children}
    </button>
  );
};

'use client';

import React from 'react';
import { AVATAR_FRAMES } from '../data/achievements';

interface AvatarFrameProps {
  frameId?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: React.ReactNode;
  className?: string;
  showOrnament?: boolean;
}

export const AvatarFrame: React.FC<AvatarFrameProps> = ({
  frameId,
  size = 'md',
  children,
  className = '',
  showOrnament = true,
}) => {
  const currentFrame = AVATAR_FRAMES.find((f) => f.id === (frameId || 'none')) || AVATAR_FRAMES[0];
  const hasFrame = currentFrame.id !== 'none';

  // Size configurations
  const sizeMap = {
    xs: { container: 'w-7 h-7', ornament: 'text-[8px] -bottom-1 -right-1', ring: 'p-0.5' },
    sm: { container: 'w-8 h-8', ornament: 'text-[9px] -bottom-1 -right-1', ring: 'p-0.5' },
    md: { container: 'w-10 h-10', ornament: 'text-[11px] -bottom-1 -right-1', ring: 'p-[2px]' },
    lg: { container: 'w-12 h-12', ornament: 'text-[13px] -bottom-1.5 -right-1.5', ring: 'p-[2.5px]' },
    xl: { container: 'w-16 h-16', ornament: 'text-[16px] -bottom-2 -right-2', ring: 'p-[3px]' },
    '2xl': { container: 'w-24 h-24', ornament: 'text-[22px] -bottom-2.5 -right-2.5', ring: 'p-1' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (!hasFrame) {
    return (
      <div className={`relative shrink-0 rounded-full ${currentSize.container} ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 group select-none ${currentSize.container} ${className}`}>
      {/* Outer Glow & Gradient Ring */}
      <div
        className={`w-full h-full rounded-full transition-all duration-300 ${currentSize.ring} ${currentFrame.glowClass} ${currentFrame.borderClass} flex items-center justify-center`}
      >
        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
          {children}
        </div>
      </div>

      {/* Mini Ornament Badge on Bottom-Right */}
      {showOrnament && currentFrame.ornamentEmoji && (
        <div
          className={`absolute ${currentSize.ornament} rounded-full bg-black/90 border border-white/20 flex items-center justify-center shadow-lg pointer-events-none z-10`}
          style={{ lineHeight: 1 }}
        >
          <span>{currentFrame.ornamentEmoji}</span>
        </div>
      )}
    </div>
  );
};

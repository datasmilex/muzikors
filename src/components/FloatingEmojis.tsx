import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type EmojiReaction = {
  id: string;
  emoji: string;
  x: number;
};

interface FloatingEmojisProps {
  reactions: EmojiReaction[];
  onComplete: (id: string) => void;
}

export const FloatingEmojis: React.FC<FloatingEmojisProps> = ({ reactions, onComplete }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ opacity: 0, y: 50, x: reaction.x, scale: 0.5 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              y: -300, 
              x: reaction.x + (Math.random() * 40 - 20),
              scale: [0.5, 1.2, 1] 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            onAnimationComplete={() => onComplete(reaction.id)}
            className="absolute bottom-0 text-3xl filter drop-shadow-md"
            style={{ left: `${reaction.x}%` }}
          >
            {reaction.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

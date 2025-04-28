import React, { useEffect, useState } from 'react';
import { Symbol, symbols } from '../utils/symbols';

interface ReelDisplayProps {
  reels: Symbol[][];
  spinning: boolean;
  paylines: number[][];
  activePaylines: number[];
}

const ReelDisplay: React.FC<ReelDisplayProps> = ({ 
  reels, 
  spinning, 
  paylines, 
  activePaylines 
}) => {
  const [showBlur, setShowBlur] = useState(false);

  useEffect(() => {
    if (spinning) {
      setShowBlur(true);
    } else {
      // Add a small delay before clearing the blur to ensure smooth transition
      const timer = setTimeout(() => {
        setShowBlur(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [spinning]);

  const isWinningPosition = (rowIndex: number, colIndex: number): boolean => {
    return activePaylines.some(lineIndex => {
      const payline = paylines[lineIndex];
      return payline[colIndex] === rowIndex;
    });
  };

  return (
    <div className="mb-6 bg-white dark:bg-gray-900 rounded-xl p-4 shadow-inner transition-colors">
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg transition-colors">
        {/* Win Lines Indicators */}
        <div className="flex justify-around mb-2">
          {[0, 1, 2].map((col) => (
            <div 
              key={`top-${col}`} 
              className={`w-2 h-2 rounded-full transition-colors ${
                activePaylines.includes(0) ? 'bg-white animate-win-pulse' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
        
        {/* Reels */}
        <div className={`grid grid-cols-3 gap-2 bg-white dark:bg-gray-900 p-2 rounded-lg transition-colors ${showBlur ? 'blur-effect' : 'blur-effect clear'}`}>
          {reels[0].map((_, colIndex) => (
            <div 
              key={`reel-${colIndex}`} 
              className="relative flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden h-[216px] transition-colors"
            >
              {reels.map((row, rowIndex) => {
                const symbol = reels[rowIndex][colIndex];
                const isWinning = isWinningPosition(rowIndex, colIndex);
                
                return (
                  <div
                    key={`symbol-${rowIndex}-${colIndex}`}
                    className={`relative flex items-center justify-center h-24 transition-all ${
                      isWinning ? 'bg-gray-200/50 dark:bg-white/10 animate-win-pulse' : ''
                    }`}
                  >
                    <span className="text-5xl drop-shadow-lg">
                      {symbol.emoji}
                    </span>
                    {isWinning && (
                      <div className="absolute inset-0 border-2 border-gray-400 dark:border-white rounded opacity-50" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Bottom Indicators */}
        <div className="flex justify-around mt-2">
          {[0, 1, 2].map((col) => (
            <div 
              key={`bottom-${col}`} 
              className={`w-2 h-2 rounded-full transition-colors ${
                activePaylines.includes(2) ? 'bg-white animate-win-pulse' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReelDisplay;
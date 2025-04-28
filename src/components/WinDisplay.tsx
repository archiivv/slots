import React, { useEffect, useState } from 'react';

interface WinDisplayProps {
  win: number;
  active: boolean;
}

const WinDisplay: React.FC<WinDisplayProps> = ({ win, active }) => {
  const [scale, setScale] = useState(1);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);

  useEffect(() => {
    if (active && win > 0) {
      setScale(1.1);
      setTimeout(() => setScale(1), 300);
      
      if (win >= 50) {
        const newParticles = Array.from({ length: 20 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 2 + Math.random() * 4
        }));
        
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 1500);
      }
    } else {
      setParticles([]);
    }
  }, [active, win]);

  const getWinSizeClass = () => {
    if (win === 0) return 'text-gray-500';
    if (win < 10) return 'text-white';
    if (win < 50) return 'text-white';
    if (win < 100) return 'text-white';
    return 'text-white';
  };

  const getWinMessage = () => {
    if (win === 0) return 'no win';
    if (win < 10) return 'win!';
    if (win < 50) return 'big win!';
    if (win < 100) return 'mega win!';
    return 'jackpot!!!';
  };

  return (
    <div className={`relative bg-gray-50 dark:bg-gray-900 rounded-lg p-3 flex-1 text-center overflow-hidden shadow-sm ${
      active && win > 0 ? 'animate-win-pulse' : ''
    }`}>
      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
        {active && win > 0 ? getWinMessage() : 'last win'}
      </div>
      
      <div 
        className={`text-2xl text-gray-800 dark:text-white font-bold transition-all duration-300`}
        style={{ transform: `scale(${scale})` }}
      >
        {win}
      </div>
      
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-float-out bg-gray-800 dark:bg-white"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
        />
      ))}
    </div>
  );
};

export default WinDisplay;
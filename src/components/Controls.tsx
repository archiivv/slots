import React from 'react';
import { ChevronUp, ChevronDown, Play, Pause } from 'lucide-react';

interface ControlsProps {
  onSpin: () => void;
  onBetChange: (bet: number) => void;
  onAutoSpinToggle: () => void;
  bet: number;
  totalBet: number;
  autoSpin: boolean;
  spinning: boolean;
  disabled: boolean;
}

const Controls: React.FC<ControlsProps> = ({ 
  onSpin, 
  onBetChange, 
  onAutoSpinToggle, 
  bet, 
  totalBet, 
  autoSpin, 
  spinning, 
  disabled 
}) => {
  const handleIncreaseBet = () => {
    if (spinning) return;
    onBetChange(bet + 1);
  };

  const handleDecreaseBet = () => {
    if (spinning) return;
    onBetChange(bet - 1);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 justify-between items-center mt-8">
      {/* Bet Controls */}
      <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 bg-gray-900 p-4 rounded-xl w-full sm:w-auto">
        <div className="text-gray-300 font-medium">
          <span className="text-gray-500">line bet:</span> {bet}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleDecreaseBet}
            disabled={spinning || bet <= 1}
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
              spinning || bet <= 1
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            <ChevronDown size={20} />
          </button>
          
          <button
            onClick={handleIncreaseBet}
            disabled={spinning || bet >= 100}
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
              spinning || bet >= 100
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            <ChevronUp size={20} />
          </button>
        </div>
        
        <div className="text-gray-300 font-medium">
          <span className="text-gray-500">total bet:</span> {totalBet}
        </div>
      </div>
      
      {/* Spin Controls */}
      <div className="flex gap-6">
        <button
          onClick={onAutoSpinToggle}
          disabled={disabled}
          className={`flex items-center justify-center w-24 h-24 rounded-lg transition-all ${
            disabled
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : autoSpin
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          {autoSpin ? <Pause size={28} /> : <Play size={28} />}
        </button>
        
        <button
          onClick={onSpin}
          disabled={disabled}
          className={`flex items-center justify-center w-24 h-24 rounded-lg ${
            disabled
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-white hover:bg-gray-100 text-gray-900'
          } transition-all transform hover:scale-105 active:scale-95`}
        >
          <span className="text-2xl font-bold">spin</span>
        </button>
      </div>
    </div>
  );
};

export default Controls;
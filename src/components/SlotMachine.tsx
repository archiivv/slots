import React, { useEffect, useState, useRef } from 'react';
import { useGameContext } from '../context/GameContext';
import { generateReelResults, getWinningPaylines, symbols } from '../utils/symbols';
import ReelDisplay from './ReelDisplay';
import Controls from './Controls';
import WinDisplay from './WinDisplay';
import { Settings } from './Settings';
import { Settings2 } from 'lucide-react';

const SlotMachine: React.FC = () => {
  const { state, dispatch } = useGameContext();
  const [showSettings, setShowSettings] = useState(false);
  const [spinButtonDisabled, setSpinButtonDisabled] = useState(false);
  const [winAnimationActive, setWinAnimationActive] = useState(false);
  const autoSpinTimeoutRef = useRef<number>();

  // Sound effects
  const [spinSound] = useState(new Audio('./sounds/spin.mp3'));
  const [winSound] = useState(new Audio('./sounds/win.mp3'));
  const [buttonSound] = useState(new Audio('./sounds/button.mp3'));

  // Handle spin action
  const handleSpin = () => {
    if (state.credits < state.totalBet || state.spinning) return;
    
    try {
      spinSound.currentTime = 0;
      spinSound.play().catch(() => {});
    } catch (e) {}

    setWinAnimationActive(false);
    dispatch({ type: 'SPIN' });
    setSpinButtonDisabled(true);
    
    setTimeout(() => {
      const newReels = generateReelResults(
        3, 3, 
        state.cheats.winRate,
        state.cheats.forceSymbols,
        state.cheats.alwaysJackpot
      );
      
      dispatch({ type: 'SET_REELS', payload: newReels });
      
      const { winningLines, totalWin } = getWinningPaylines(
        newReels, 
        state.paylines,
        state.bet
      );
      
      dispatch({ type: 'SET_SPINNING', payload: false });
      dispatch({ type: 'SET_ACTIVE_PAYLINES', payload: winningLines });
      
      if (totalWin > 0) {
        dispatch({ type: 'SET_LAST_WIN', payload: totalWin });
        dispatch({ type: 'SET_CREDITS', payload: state.credits + totalWin });
        setWinAnimationActive(true);
        
        try {
          winSound.currentTime = 0;
          winSound.play().catch(() => {});
        } catch (e) {}
      } else {
        dispatch({ type: 'SET_LAST_WIN', payload: 0 });
      }
      
      dispatch({ type: 'UPDATE_STATS', payload: { win: totalWin } });
      setSpinButtonDisabled(false);
      
      if (state.autoSpin && state.credits >= state.totalBet) {
        autoSpinTimeoutRef.current = window.setTimeout(handleSpin, 1500);
      }
    }, 1600);
  };

  const toggleAutoSpin = () => {
    try {
      buttonSound.currentTime = 0;
      buttonSound.play().catch(() => {});
    } catch (e) {}
    
    // Clear any pending auto-spin timeout when toggling off
    if (state.autoSpin) {
      if (autoSpinTimeoutRef.current) {
        window.clearTimeout(autoSpinTimeoutRef.current);
        autoSpinTimeoutRef.current = undefined;
      }
    }
    
    dispatch({ type: 'TOGGLE_AUTO_SPIN' });
    
    // Only start spinning if turning auto-spin on
    if (!state.autoSpin && !state.spinning && state.credits >= state.totalBet) {
      handleSpin();
    }
  };

  const toggleSettings = () => {
    try {
      buttonSound.currentTime = 0;
      buttonSound.play().catch(() => {});
    } catch (e) {}
    
    setShowSettings(!showSettings);
  };

  const handleBetChange = (newBet: number) => {
    if (newBet < 1) newBet = 1;
    if (newBet > 100) newBet = 100;
    dispatch({ type: 'SET_BET', payload: newBet });
  };

  useEffect(() => {
    spinSound.volume = 0.3;
    winSound.volume = 0.5;
    buttonSound.volume = 0.2;
    
    return () => {
      spinSound.pause();
      winSound.pause();
      buttonSound.pause();
      if (autoSpinTimeoutRef.current) {
        window.clearTimeout(autoSpinTimeoutRef.current);
      }
    };
  }, [spinSound, winSound, buttonSound]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-2 sm:p-4">
      {/* Cabinet Top */}
      <div className="w-full max-w-3xl bg-gray-800 rounded-t-xl p-2 sm:p-4 flex justify-between items-center shadow-lg border-b border-gray-700">
        <div className="text-2xl font-bold text-white"> </div>
        <button 
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          onClick={toggleSettings}
          aria-label="Settings"
        >
          <Settings2 className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Machine Body */}
      <div className="w-full max-w-3xl bg-gray-800 rounded-b-xl p-3 sm:p-6 shadow-2xl">
        {/* Credit/Win Display */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
          <div className="bg-gray-900 rounded-lg p-2 sm:p-3 flex-1 text-center">
            <div className="text-xs sm:text-sm text-gray-400 font-medium">credits</div>
            <div className="text-xl sm:text-2xl text-white font-bold">
              {state.credits}
            </div>
          </div>
          
          <WinDisplay 
            win={state.lastWin} 
            active={winAnimationActive} 
          />
          
          <div className="bg-gray-900 rounded-lg p-2 sm:p-3 flex-1 text-center">
            <div className="text-xs sm:text-sm text-gray-400 font-medium">bet</div>
            <div className="text-xl sm:text-2xl text-white font-bold">
              {state.totalBet}
            </div>
          </div>
        </div>

        <ReelDisplay 
          reels={state.reels} 
          spinning={state.spinning} 
          paylines={state.paylines}
          activePaylines={state.activePaylines}
        />

        <Controls 
          onSpin={handleSpin}
          onBetChange={handleBetChange}
          onAutoSpinToggle={toggleAutoSpin}
          bet={state.bet}
          totalBet={state.totalBet}
          autoSpin={state.autoSpin}
          spinning={state.spinning}
          disabled={state.credits < state.totalBet || spinButtonDisabled}
        />
      </div>

      {/* Paytable */}
      <div className="w-full max-w-3xl mt-2 sm:mt-4 bg-gray-800 rounded-xl p-2 sm:p-4 shadow-lg">
        <h3 className="text-center text-xs sm:text-sm text-gray-400 font-medium mb-2 sm:mb-3">paytable (multiplier × bet)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 sm:gap-2">
          {symbols.map((symbol) => (
            <div key={symbol.name} className="flex flex-col items-center bg-gray-900 p-1 sm:p-2 rounded-lg">
              <span className="text-2xl sm:text-3xl">{symbol.emoji}</span>
              <span className="text-gray-400 text-xs mt-1">{symbol.name}</span>
              <span className="text-white font-bold">{symbol.value}x</span>
            </div>
          ))}
        </div>
      </div>

      {showSettings && <Settings onClose={toggleSettings} />}
    </div>
  );
};

export default SlotMachine;
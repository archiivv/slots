import React, { useEffect, useState, useRef } from 'react';
import { useGameContext } from '../context/GameContext';
import { generateReelResults, getWinningPaylines, symbols } from '../utils/symbols';
import ReelDisplay from './ReelDisplay';
import Controls from './Controls';
import WinDisplay from './WinDisplay';
import { Settings } from './Settings';
import { Settings2, Sun, Moon } from 'lucide-react';

const SlotMachine: React.FC = () => {
  const { state, dispatch } = useGameContext();
  const [showSettings, setShowSettings] = useState(false);
  const [spinButtonDisabled, setSpinButtonDisabled] = useState(false);
  const [winAnimationActive, setWinAnimationActive] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? saved === 'true' : true;
  });
  const autoSpinTimeoutRef = useRef<number>();
  const [reels, setReels] = useState(state.reels);
  const [isSpinning, setIsSpinning] = useState(false);
  const mainDisplayRef = useRef<HTMLDivElement>(null);

  // Initialize dark mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.style.backgroundColor = 'rgb(17 24 39)';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = 'rgb(249 250 251)';
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Handle scroll to show/hide sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (mainDisplayRef.current) {
        const rect = mainDisplayRef.current.getBoundingClientRect();
        setShowStickyHeader(rect.top < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle spin action
  const handleSpin = async () => {
    if (state.credits < state.totalBet || isSpinning) return;
    
    dispatch({ type: 'SPIN' });
    setIsSpinning(true);
    setWinAnimationActive(false);
    setSpinButtonDisabled(true);
    
    setTimeout(() => {
      const newReels = generateReelResults(
        3, 3, 
        state.cheats.winRate,
        state.cheats.forceSymbols,
        state.cheats.alwaysJackpot
      );
      
      setReels(newReels);
      dispatch({ type: 'SET_REELS', payload: newReels });
      
      const { winningLines, totalWin } = getWinningPaylines(
        newReels, 
        state.paylines,
        state.bet
      );
      
      dispatch({ type: 'SET_SPINNING', payload: false });
      dispatch({ type: 'SET_ACTIVE_PAYLINES', payload: winningLines });
      
      if (totalWin > 0) {
        setWinAnimationActive(true);
        dispatch({ type: 'SET_LAST_WIN', payload: totalWin });
        dispatch({ type: 'SET_CREDITS', payload: state.credits + totalWin });
        dispatch({ type: 'UPDATE_STATS', payload: { win: totalWin } });
      } else {
        dispatch({ type: 'SET_LAST_WIN', payload: 0 });
        dispatch({ type: 'UPDATE_STATS', payload: { win: 0 } });
      }
      
      setSpinButtonDisabled(false);
      setIsSpinning(false);
      
      if (state.autoSpin && state.credits >= state.totalBet) {
        autoSpinTimeoutRef.current = window.setTimeout(handleSpin, 1500);
      }
    }, 1600);
  };

  const toggleAutoSpin = () => {
    dispatch({ type: 'TOGGLE_AUTO_SPIN' });
    
    // Clear existing timeout if turning auto-spin off
    if (state.autoSpin) {
      if (autoSpinTimeoutRef.current) {
        window.clearTimeout(autoSpinTimeoutRef.current);
        autoSpinTimeoutRef.current = undefined;
      }
    } else if (!isSpinning && state.credits >= state.totalBet) {
      // Only start spinning if turning auto-spin on
      handleSpin();
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleBetChange = (newBet: number) => {
    if (newBet < 1) newBet = 1;
    if (newBet > 100) newBet = 100;
    dispatch({ type: 'SET_BET', payload: newBet });
  };

  useEffect(() => {
    return () => {
      if (autoSpinTimeoutRef.current) {
        window.clearTimeout(autoSpinTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative flex flex-col items-center justify-center min-h-screen p-2 sm:p-4 transition-colors ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>

      {/* Sticky Header for Mobile */}
      <div 
        className={`fixed top-0 left-0 right-0 bg-gray-50 dark:bg-gray-900 z-40 transition-transform duration-300 transform ${
          showStickyHeader ? 'translate-y-0' : '-translate-y-full'
        } sm:hidden`}
      >
        <div className="flex justify-between items-center p-2 gap-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 flex-1 text-center shadow-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">credits</div>
            <div className="text-lg text-gray-800 dark:text-white font-bold">
              {state.credits}
            </div>
          </div>
          
          <div className={`relative bg-white dark:bg-gray-800 rounded-lg p-2 flex-1 text-center shadow-sm ${
            winAnimationActive ? 'animate-win-pulse' : ''
          }`}>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {winAnimationActive ? 'win!' : 'last win'}
            </div>
            <div className="text-lg text-gray-800 dark:text-white font-bold">
              {state.lastWin}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 flex-1 text-center shadow-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">bet</div>
            <div className="text-lg text-gray-800 dark:text-white font-bold">
              {state.totalBet}
            </div>
          </div>
        </div>
      </div>

      {/* Cabinet Top */}
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-t-xl p-2 sm:p-4 flex justify-between items-center shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="text-2xl font-bold text-gray-800 dark:text-white"> </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="w-6 h-6 text-gray-800 dark:text-white" /> : <Moon className="w-6 h-6 text-gray-800 dark:text-white" />}
          </button>
          <button 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={toggleSettings}
            aria-label="Settings"
          >
            <Settings2 className="w-6 h-6 text-gray-800 dark:text-white" />
          </button>
        </div>
      </div>

      {/* Machine Body */}
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-b-xl p-3 sm:p-6 shadow-2xl">
        {/* Credit/Win Display */}
        <div 
          ref={mainDisplayRef}
          className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between gap-2 sm:gap-4"
        >
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 sm:p-3 flex-1 text-center shadow-sm">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">credits</div>
            <div className="text-xl sm:text-2xl text-gray-800 dark:text-white font-bold">
              {state.credits}
            </div>
          </div>
          
          <WinDisplay 
            win={state.lastWin} 
            active={winAnimationActive} 
          />
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 sm:p-3 flex-1 text-center shadow-sm">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">bet</div>
            <div className="text-xl sm:text-2xl text-gray-800 dark:text-white font-bold">
              {state.totalBet}
            </div>
          </div>
        </div>

        <ReelDisplay 
          reels={reels} 
          spinning={isSpinning} 
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
          spinning={isSpinning}
          disabled={state.credits < state.totalBet || spinButtonDisabled}
        />
      </div>

      {/* Paytable */}
      <div className="w-full max-w-3xl mt-2 sm:mt-4 bg-white dark:bg-gray-800 rounded-xl p-2 sm:p-4 shadow-lg">
        <h3 className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mb-2 sm:mb-3">paytable (multiplier × bet)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 sm:gap-2">
          {symbols.map((symbol) => (
            <div key={symbol.name} className="flex flex-col items-center bg-gray-50 dark:bg-gray-900 p-1 sm:p-2 rounded-lg shadow-sm">
              <span className="text-2xl sm:text-3xl">{symbol.emoji}</span>
              <span className="text-gray-500 dark:text-gray-400 text-xs mt-1">{symbol.name}</span>
              <span className="text-gray-800 dark:text-white font-bold">{symbol.value}x</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-3xl mt-2 sm:mt-4 bg-white dark:bg-gray-800 rounded-xl p-2 sm:p-4 shadow-lg transition-colors">
        <div className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} archiiv. All rights reserved.</p>
        </div>
      </div>

      {showSettings && <Settings onClose={toggleSettings} />}
    </div>
  );
};

export default SlotMachine;
import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import { symbols } from '../utils/symbols';
import { X, Save, Coins, BarChart, Wand2, Zap } from 'lucide-react';

interface SettingsProps {
  onClose: () => void;
}

type GameSymbol = {
  emoji: string;
  value: number;
};

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { state, dispatch } = useGameContext();
  const [selectedTab, setSelectedTab] = useState<'money' | 'stats' | 'cheats'>('money');
  const [creditInput, setCreditInput] = useState(state.credits.toString());
  const [selectedSymbols, setSelectedSymbols] = useState<Array<GameSymbol | null>>([null, null, null]);

  // Sync selectedSymbols with game state's forceSymbols
  useEffect(() => {
    if (state.cheats.forceSymbols) {
      const newSelectedSymbols: Array<GameSymbol | null> = [null, null, null];
      state.cheats.forceSymbols.forEach((symbol, index) => {
        newSelectedSymbols[index] = symbol;
      });
      setSelectedSymbols(newSelectedSymbols);
    } else {
      setSelectedSymbols([null, null, null]);
    }
  }, [state.cheats.forceSymbols]);

  const handleUpdateCredits = () => {
    const credits = parseInt(creditInput);
    if (!isNaN(credits) && credits >= 0) {
      dispatch({ type: 'SET_CREDITS', payload: credits });
    }
  };

  const handleWinRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    dispatch({ 
      type: 'SET_CHEAT', 
      payload: { key: 'winRate', value: value / 100 } 
    });
  };

  const handleJackpotToggle = () => {
    dispatch({ 
      type: 'SET_CHEAT', 
      payload: { key: 'alwaysJackpot', value: !state.cheats.alwaysJackpot } 
    });
  };

  const handleSelectSymbol = (index: number, symbol: GameSymbol | null) => {
    const newSelectedSymbols = [...selectedSymbols];
    newSelectedSymbols[index] = symbol;
    setSelectedSymbols(newSelectedSymbols);
    
    if (newSelectedSymbols.every(s => s === null)) {
      dispatch({ type: 'SET_CHEAT', payload: { key: 'forceSymbols', value: null } });
    } else {
      const nonNullSymbols = newSelectedSymbols.filter(s => s !== null) as GameSymbol[];
      dispatch({ type: 'SET_CHEAT', payload: { key: 'forceSymbols', value: nonNullSymbols } });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-800 rounded-t-xl p-4">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="bg-gray-900 flex border-b border-gray-800">
          <button 
            onClick={() => setSelectedTab('money')}
            className={`flex-1 py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2 ${
              selectedTab === 'money' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Coins className="w-5 h-5" />
            Money
          </button>
          <button 
            onClick={() => setSelectedTab('stats')}
            className={`flex-1 py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2 ${
              selectedTab === 'stats' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <BarChart className="w-5 h-5" />
            Stats
          </button>
          <button 
            onClick={() => setSelectedTab('cheats')}
            className={`flex-1 py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2 ${
              selectedTab === 'cheats' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Wand2 className="w-5 h-5" />
            Cheats
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Money Settings */}
          {selectedTab === 'money' && (
            <div>
              <div className="mb-4">
                <label className="block text-gray-400 font-medium mb-2">Credits</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={creditInput}
                    onChange={e => setCreditInput(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2"
                    min="0"
                  />
                  <button
                    onClick={handleUpdateCredits}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-1"
                  >
                    <Save className="w-4 h-4" />
                    Set
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setCreditInput('1000');
                    dispatch({ type: 'SET_CREDITS', payload: 1000 });
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg"
                >
                  Add 1,000
                </button>
                <button
                  onClick={() => {
                    setCreditInput('10000');
                    dispatch({ type: 'SET_CREDITS', payload: 10000 });
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg"
                >
                  Add 10,000
                </button>
                <button
                  onClick={() => {
                    setCreditInput('100000');
                    dispatch({ type: 'SET_CREDITS', payload: 100000 });
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg"
                >
                  Add 100,000
                </button>
                <button
                  onClick={() => {
                    setCreditInput('1000000');
                    dispatch({ type: 'SET_CREDITS', payload: 1000000 });
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg"
                >
                  MILLIONAIRE
                </button>
              </div>
            </div>
          )}
          
          {/* Stats */}
          {selectedTab === 'stats' && (
            <div className="text-white">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800 p-3 rounded-lg text-center">
                  <p className="text-gray-400 font-medium">Total Spins</p>
                  <p className="text-3xl font-bold">{state.stats.totalSpins}</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg text-center">
                  <p className="text-gray-400 font-medium">Total Wins</p>
                  <p className="text-3xl font-bold">{state.stats.totalWins}</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg text-center">
                  <p className="text-gray-400 font-medium">Win Rate</p>
                  <p className="text-3xl font-bold">
                    {state.stats.totalSpins 
                      ? `${Math.round((state.stats.totalWins / state.stats.totalSpins) * 100)}%` 
                      : '0%'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 bg-gray-800 p-3 rounded-lg text-center">
                <p className="text-gray-400 font-medium">Biggest Win</p>
                <p className="text-4xl font-bold">{state.stats.biggestWin}</p>
              </div>
              
              <button
                onClick={() => {
                  dispatch({ 
                    type: 'UPDATE_STATS', 
                    payload: { 
                      win: 0
                    }
                  });
                }}
                className="mt-4 w-full bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg"
              >
                Reset Stats
              </button>
            </div>
          )}
          
          {/* Cheats */}
          {selectedTab === 'cheats' && (
            <div className="text-white space-y-6">
              <div>
                <label className="flex justify-between mb-1">
                  <span>Win Rate: {Math.round(state.cheats.winRate * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={state.cheats.winRate * 100}
                  onChange={handleWinRateChange}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Normal</span>
                  <span>Always Win</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-gray-400" />
                  Force Middle Row Symbols
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[0, 1, 2].map((index) => (
                    <div 
                      key={`selected-${index}`}
                      className="h-16 flex items-center justify-center bg-gray-800 rounded-lg text-3xl"
                    >
                      {selectedSymbols[index] ? selectedSymbols[index]?.emoji : '?'}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {symbols.map((symbol) => (
                    <button
                      key={symbol.name}
                      onClick={() => {
                        const firstEmpty = selectedSymbols.findIndex(s => s === null);
                        if (firstEmpty !== -1) {
                          handleSelectSymbol(firstEmpty, symbol);
                        }
                      }}
                      className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg p-2"
                    >
                      <span className="text-2xl">{symbol.emoji}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setSelectedSymbols([null, null, null]);
                      dispatch({ type: 'SET_CHEAT', payload: { key: 'forceSymbols', value: null } });
                    }}
                    className="col-span-5 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg mt-2"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
              
              <div>
                <button
                  onClick={handleJackpotToggle}
                  className={`w-full p-3 rounded-lg ${
                    state.cheats.alwaysJackpot 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {state.cheats.alwaysJackpot ? '✓ JACKPOT MODE ON' : 'JACKPOT MODE OFF'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
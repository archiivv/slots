import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../context/GameContext';
import { symbols } from '../utils/symbols';
import { X, Save, Coins, BarChart, Wand2, Zap, Download, Upload } from 'lucide-react';

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
  const [saveFileName, setSaveFileName] = useState('slot-machine');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Prevent scrolling on main page while modal is open
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    
    // Store the current scroll position
    const scrollY = window.scrollY;
    
    // Prevent scrolling
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    
    return () => {
      // Restore scrolling
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

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
    if (!isNaN(value) && value >= 0 && value <= 100) {
      dispatch({ type: 'SET_CHEAT_WIN_RATE', payload: value / 100 });
    }
  };

  const handleAlwaysJackpotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_CHEAT_ALWAYS_JACKPOT', payload: e.target.checked });
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

  const handleDownloadSave = () => {
    const saveData = {
      credits: state.credits,
      bet: state.bet,
      totalBet: state.totalBet,
      stats: state.stats,
      cheats: state.cheats,
      autoSpin: state.autoSpin
    };

    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${saveFileName}.save`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleLoadSave(file);
    }
  };

  const handleLoadSave = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const saveData = JSON.parse(e.target?.result as string);
        console.log('Loading save file:', saveData);
        
        // Load all state at once
        dispatch({ 
          type: 'LOAD_STATE', 
          payload: {
            credits: saveData.credits,
            bet: saveData.bet,
            totalBet: saveData.totalBet,
            stats: saveData.stats,
            cheats: saveData.cheats,
            settings: saveData.settings,
            autoSpin: saveData.autoSpin || false,
            reels: state.reels,
            spinning: false,
            lastWin: 0,
            paylines: state.paylines,
            activePaylines: [],
          }
        });
      } catch (error) {
        console.error('Error loading save file:', error);
        alert('Invalid save file format');
      }
    };
    reader.readAsText(file);
  };

  const handleCheatToggle = () => {
    dispatch({ type: 'TOGGLE_CHEATS' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700"
        style={{ height: '80vh' }}
      >
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
            <Save className="w-5 h-5" />
            Save
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
        <div className="p-4 sm:p-6 overflow-y-auto" style={{ height: 'calc(80vh - 120px)' }}>
          {/* Save/Load Settings */}
          {selectedTab === 'money' && (
            <div className="space-y-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Save File
                </h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={saveFileName}
                    onChange={(e) => setSaveFileName(e.target.value)}
                    className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                    placeholder="Save file name"
                  />
                  <button
                    onClick={handleDownloadSave}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Load Save File
                </h3>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".save"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </button>
                  {selectedFile && (
                    <div className="text-gray-400 text-sm truncate">
                      Selected: {selectedFile.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Stats */}
          {selectedTab === 'stats' && (
            <div className="text-white">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-gray-800 p-3 rounded-lg text-center">
                  <p className="text-gray-400 font-medium">Total Spins</p>
                  <p className="text-3xl font-bold">{state.stats.totalSpins}</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg text-center">
                  <p className="text-gray-400 font-medium">Total Wins</p>
                  <p className="text-3xl font-bold">{state.stats.totalWins}</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg text-center col-span-2 sm:col-span-1">
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

              <div className="mt-4 bg-gray-800 p-3 rounded-lg text-center">
                <p className="text-gray-400 font-medium">Has Cheated</p>
                <p className="text-lg font-bold">{state.stats.hasCheated ? 'Yes' : 'No'}</p>
              </div>
              
              <button
                onClick={() => {
                  dispatch({ type: 'RESET_STATS' });
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
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    Cheat Mode
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.cheats.enabled}
                      onChange={handleCheatToggle}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {state.cheats.enabled && (
                  <>
                    <div className="mt-4">
                      <label className="block text-gray-400 font-medium mb-2">Credits</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={creditInput}
                          onChange={e => setCreditInput(e.target.value)}
                          onBlur={handleUpdateCredits}
                          className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button
                        onClick={() => {
                          setCreditInput('1000');
                          dispatch({ type: 'SET_CREDITS', payload: 1000 });
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg"
                      >
                        Set 1000
                      </button>
                      <button
                        onClick={() => {
                          setCreditInput('10000');
                          dispatch({ type: 'SET_CREDITS', payload: 10000 });
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg"
                      >
                        Set 10000
                      </button>
                      <button
                        onClick={() => {
                          setCreditInput('100000');
                          dispatch({ type: 'SET_CREDITS', payload: 100000 });
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg"
                      >
                        Set 100000
                      </button>
                      <button
                        onClick={() => {
                          setCreditInput('1000000');
                          dispatch({ type: 'SET_CREDITS', payload: 1000000 });
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg"
                      >
                        Set 1000000
                      </button>
                    </div>
                  </>
                )}
              </div>

              {state.cheats.enabled && (
                <>
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
                        clear selection
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <button
                      onClick={() => {
                        dispatch({ type: 'SET_CHEAT', payload: { key: 'alwaysJackpot', value: !state.cheats.alwaysJackpot } });
                      }}
                      className={`w-full p-3 rounded-lg ${
                        state.cheats.alwaysJackpot 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {state.cheats.alwaysJackpot ? 'jackpot mode' : 'jackpot mode'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
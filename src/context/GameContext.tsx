import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { symbols, Symbol } from '../utils/symbols';
import { saveGameState, loadGameState } from '../utils/storage';

export type GameState = {
  credits: number;
  bet: number;
  reels: Symbol[][];
  spinning: boolean;
  lastWin: number;
  paylines: number[][];
  activePaylines: number[];
  totalBet: number;
  autoSpin: boolean;
  stats: {
    totalSpins: number;
    totalWins: number;
    totalLosses: number;
    biggestWin: number;
    totalWon: number;
    totalLost: number;
    hasCheated: boolean;
  };
  cheats: {
    enabled: boolean;
    winRate: number;
    forceSymbols: Symbol[] | null;
    alwaysJackpot: boolean;
  };
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    vibrationEnabled: boolean;
  };
  currentWinRate: number;
};

type GameAction =
  | { type: 'SET_CREDITS'; payload: number }
  | { type: 'SET_BET'; payload: number }
  | { type: 'SPIN' }
  | { type: 'SET_REELS'; payload: Symbol[][] }
  | { type: 'SET_SPINNING'; payload: boolean }
  | { type: 'SET_LAST_WIN'; payload: number }
  | { type: 'SET_ACTIVE_PAYLINES'; payload: number[] }
  | { type: 'TOGGLE_AUTO_SPIN' }
  | { type: 'UPDATE_STATS'; payload: { win: number } }
  | { type: 'RESET_STATS' }
  | { type: 'SET_CHEAT'; payload: { key: keyof GameState['cheats']; value: any } }
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'TOGGLE_CHEATS' }
  | { type: 'SET_CHEAT_WIN_RATE'; payload: number }
  | { type: 'SET_CHEAT_FORCE_SYMBOLS'; payload: Symbol[] }
  | { type: 'SET_CHEAT_ALWAYS_JACKPOT'; payload: boolean };

// Create context
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | undefined>(undefined);

// Define initial state
const initialState: GameState = {
  credits: 1000,
  bet: 1,
  reels: [
    Array(3).fill({ emoji: '🍀', name: 'Lucky Clover', value: 0, frequency: 0 }),
    Array(3).fill({ emoji: '🍀', name: 'Lucky Clover', value: 0, frequency: 0 }),
    Array(3).fill({ emoji: '🍀', name: 'Lucky Clover', value: 0, frequency: 0 }),
  ],
  spinning: false,
  lastWin: 0,
  paylines: [
    [0, 0, 0], // Top row
    [1, 1, 1], // Middle row
    [2, 2, 2], // Bottom row
    [0, 1, 2], // Diagonal top-left to bottom-right
    [2, 1, 0], // Diagonal bottom-left to top-right
  ],
  activePaylines: [],
  totalBet: 1,
  autoSpin: false,
  stats: {
    totalSpins: 0,
    totalWins: 0,
    totalLosses: 0,
    biggestWin: 0,
    totalWon: 0,
    totalLost: 0,
    hasCheated: false,
  },
  cheats: {
    enabled: false,
    winRate: 0.3, // Default 30% win rate
    forceSymbols: null,
    alwaysJackpot: false,
  },
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    vibrationEnabled: true,
  },
  currentWinRate: 0.3, // Initialize with default win rate
};

// Create reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_CREDITS':
      return { ...state, credits: action.payload };
    case 'SET_BET':
      return { 
        ...state, 
        bet: action.payload,
        totalBet: action.payload * state.paylines.length
      };
    case 'SPIN':
      return { 
        ...state, 
        credits: state.credits - state.totalBet,
        spinning: true,
        activePaylines: [],
      };
    case 'SET_REELS':
      return { ...state, reels: action.payload };
    case 'SET_SPINNING':
      return { ...state, spinning: action.payload };
    case 'SET_LAST_WIN':
      return { ...state, lastWin: action.payload };
    case 'SET_ACTIVE_PAYLINES':
      return { ...state, activePaylines: action.payload };
    case 'TOGGLE_AUTO_SPIN':
      return { ...state, autoSpin: !state.autoSpin };
    case 'UPDATE_STATS':
      const newTotalSpins = state.stats.totalSpins + 1;
      let newWinRate = state.currentWinRate;
      
      // Randomize win rate every 100 spins for non-cheaters
      if (!state.cheats.enabled && newTotalSpins % 100 === 0) {
        // Random win rate between 20% and 40%
        newWinRate = 0.2 + Math.random() * 0.2;
        console.log(`New win rate set to ${(newWinRate * 100).toFixed(1)}%`);
      }
      
      return { 
        ...state, 
        stats: {
          totalSpins: newTotalSpins,
          totalWins: action.payload.win > 0 ? state.stats.totalWins + 1 : state.stats.totalWins,
          totalLosses: action.payload.win === 0 ? state.stats.totalLosses + 1 : state.stats.totalLosses,
          biggestWin: Math.max(state.stats.biggestWin, action.payload.win),
          totalWon: state.stats.totalWon + (action.payload.win > 0 ? action.payload.win : 0),
          totalLost: state.stats.totalLost + (action.payload.win === 0 ? state.totalBet : 0),
          hasCheated: state.stats.hasCheated || state.cheats.enabled,
        },
        currentWinRate: newWinRate,
      };
    case 'RESET_STATS':
      return {
        ...state,
        stats: {
          totalSpins: 0,
          totalWins: 0,
          totalLosses: 0,
          biggestWin: 0,
          totalWon: 0,
          totalLost: 0,
          hasCheated: false,
        }
      };
    case 'SET_CHEAT':
      return {
        ...state,
        cheats: {
          ...state.cheats,
          [action.payload.key]: action.payload.value,
        },
      };
    case 'LOAD_STATE':
      console.log('Loading state in reducer:', action.payload);
      
      // Ensure we have valid stats data
      const stats = action.payload.stats || {};
      const hasCheated = stats.hasCheated || action.payload.cheats?.enabled || false;
      
      const loadedState = {
        ...state,
        ...action.payload,
        stats: {
          totalSpins: Number(stats.totalSpins) || 0,
          totalWins: Number(stats.totalWins) || 0,
          totalLosses: Number(stats.totalLosses) || 0,
          biggestWin: Number(stats.biggestWin) || 0,
          totalWon: Number(stats.totalWon) || 0,
          totalLost: Number(stats.totalLost) || 0,
          hasCheated,
        },
        cheats: {
          ...action.payload.cheats,
          enabled: action.payload.cheats?.enabled || false,
        },
        currentWinRate: action.payload.currentWinRate || 0.3,
        spinning: false,
      };
      
      console.log('Final loaded state:', loadedState);
      return loadedState;
    case 'TOGGLE_CHEATS':
      return {
        ...state,
        cheats: {
          ...state.cheats,
          enabled: !state.cheats.enabled,
        },
        stats: {
          ...state.stats,
          hasCheated: true,
        },
      };
    case 'SET_CHEAT_WIN_RATE':
      return {
        ...state,
        cheats: {
          ...state.cheats,
          winRate: action.payload,
        },
        stats: {
          ...state.stats,
          hasCheated: true,
        },
      };
    case 'SET_CHEAT_FORCE_SYMBOLS':
      return {
        ...state,
        cheats: {
          ...state.cheats,
          forceSymbols: action.payload,
        },
        stats: {
          ...state.stats,
          hasCheated: true,
        },
      };
    case 'SET_CHEAT_ALWAYS_JACKPOT':
      return {
        ...state,
        cheats: {
          ...state.cheats,
          alwaysJackpot: action.payload,
        },
        stats: {
          ...state.stats,
          hasCheated: true,
        },
      };
    default:
      return state;
  }
}

// Create provider
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load saved state on initial mount
  useEffect(() => {
    console.log('Initial state:', initialState);
    console.log('Attempting to load saved state...');
    
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      console.error('localStorage is not available');
      return;
    }

    const savedState = loadGameState();
    console.log('Loaded state from storage:', savedState);
    
    if (savedState) {
      console.log('Dispatching LOAD_STATE action with payload:', savedState);
      // Ensure we're not in a spinning state when loading
      const stateToLoad = {
        ...savedState,
        spinning: false // Always set spinning to false when loading
      };
      dispatch({ type: 'LOAD_STATE', payload: stateToLoad });
    } else {
      console.log('No saved state found, using initial state');
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.error('localStorage is not available');
      return;
    }

    console.log('State changed, saving to storage:', state);
    // Don't save if we're in a spinning state
    if (!state.spinning) {
      saveGameState(state);
    }
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// Create hook for using context
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
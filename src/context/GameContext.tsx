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
    biggestWin: number;
  };
  cheats: {
    winRate: number;
    alwaysJackpot: boolean;
    forceSymbols: Symbol[] | null;
  };
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
  | { type: 'LOAD_STATE'; payload: GameState };

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
    biggestWin: 0,
  },
  cheats: {
    winRate: 0.3, // Default 30% win rate
    forceSymbols: null,
    alwaysJackpot: false,
  },
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
      return { 
        ...state, 
        stats: {
          totalSpins: state.stats.totalSpins + 1,
          totalWins: action.payload.win > 0 ? state.stats.totalWins + 1 : state.stats.totalWins,
          biggestWin: Math.max(state.stats.biggestWin, action.payload.win),
        }
      };
    case 'RESET_STATS':
      return {
        ...state,
        stats: {
          totalSpins: 0,
          totalWins: 0,
          biggestWin: 0,
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
      return {
        ...state,
        ...action.payload,
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
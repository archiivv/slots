import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Define types
type Symbol = {
  emoji: string;
  value: number;
};

type GameState = {
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
    forceSymbols: Symbol[] | null;
    alwaysJackpot: boolean;
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
  | { type: 'SET_CHEAT'; payload: { key: keyof GameState['cheats']; value: any } };

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
    Array(3).fill({ emoji: '🍀', value: 0 }),
    Array(3).fill({ emoji: '🍀', value: 0 }),
    Array(3).fill({ emoji: '🍀', value: 0 }),
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
    case 'SET_CHEAT':
      return {
        ...state,
        cheats: {
          ...state.cheats,
          [action.payload.key]: action.payload.value,
        },
      };
    default:
      return state;
  }
}

// Create provider
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('slotMachineState', JSON.stringify({
      credits: state.credits,
      bet: state.bet,
      totalBet: state.totalBet,
      stats: state.stats,
      reels: state.reels,
      spinning: false, // Always save as not spinning
      lastWin: state.lastWin,
      activePaylines: state.activePaylines,
      cheats: state.cheats,
      autoSpin: state.autoSpin
    }));
  }, [state]);

  // Load state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('slotMachineState');
    if (savedState) {
      const {
        credits,
        bet,
        totalBet,
        stats,
        reels,
        lastWin,
        activePaylines,
        cheats,
        autoSpin
      } = JSON.parse(savedState);

      // Restore all state values
      if (credits !== undefined) {
        dispatch({ type: 'SET_CREDITS', payload: credits });
      }
      if (bet !== undefined) {
        dispatch({ type: 'SET_BET', payload: bet });
      }
      if (reels) {
        dispatch({ type: 'SET_REELS', payload: reels });
      }
      if (lastWin !== undefined) {
        dispatch({ type: 'SET_LAST_WIN', payload: lastWin });
      }
      if (activePaylines) {
        dispatch({ type: 'SET_ACTIVE_PAYLINES', payload: activePaylines });
      }
      if (cheats) {
        // Restore each cheat setting individually
        Object.entries(cheats).forEach(([key, value]) => {
          dispatch({ 
            type: 'SET_CHEAT', 
            payload: { key: key as keyof GameState['cheats'], value } 
          });
        });
      }
      if (autoSpin !== undefined) {
        if (autoSpin) {
          dispatch({ type: 'TOGGLE_AUTO_SPIN' });
        }
      }
    }
  }, []);

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
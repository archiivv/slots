import { GameState, Symbol } from '../context/GameContext';

const STORAGE_KEY = 'archiiv-slot-machine-state';

// Helper function to validate a Symbol
const isValidSymbol = (symbol: any): symbol is Symbol => {
  return (
    symbol &&
    typeof symbol.emoji === 'string' &&
    typeof symbol.value === 'number'
  );
};

// Helper function to validate the loaded state
const isValidGameState = (state: any): state is GameState => {
  if (!state) return false;

  try {
    // Check basic types
    if (
      typeof state.credits !== 'number' ||
      typeof state.bet !== 'number' ||
      typeof state.spinning !== 'boolean' ||
      typeof state.lastWin !== 'number' ||
      typeof state.totalBet !== 'number' ||
      typeof state.autoSpin !== 'boolean'
    ) {
      console.error('Invalid basic types in state');
      return false;
    }

    // Check arrays
    if (!Array.isArray(state.reels) || !Array.isArray(state.paylines) || !Array.isArray(state.activePaylines)) {
      console.error('Invalid array types in state');
      return false;
    }

    // Check reels structure
    for (const reel of state.reels) {
      if (!Array.isArray(reel)) {
        console.error('Invalid reel structure');
        return false;
      }
      for (const symbol of reel) {
        if (!isValidSymbol(symbol)) {
          console.error('Invalid symbol in reels');
          return false;
        }
      }
    }

    // Check stats
    if (
      !state.stats ||
      typeof state.stats.totalSpins !== 'number' ||
      typeof state.stats.totalWins !== 'number' ||
      typeof state.stats.biggestWin !== 'number'
    ) {
      console.error('Invalid stats structure');
      return false;
    }

    // Check cheats
    if (
      !state.cheats ||
      typeof state.cheats.winRate !== 'number' ||
      typeof state.cheats.alwaysJackpot !== 'boolean'
    ) {
      console.error('Invalid cheats structure');
      return false;
    }

    // Check forceSymbols
    if (state.cheats.forceSymbols !== null) {
      if (!Array.isArray(state.cheats.forceSymbols)) {
        console.error('Invalid forceSymbols structure');
        return false;
      }
      for (const symbol of state.cheats.forceSymbols) {
        if (!isValidSymbol(symbol)) {
          console.error('Invalid symbol in forceSymbols');
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating game state:', error);
    return false;
  }
};

export const saveGameState = (state: GameState) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.error('localStorage is not available');
      return;
    }

    console.log('Saving to localStorage with key:', STORAGE_KEY);
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
    console.log('Successfully saved state:', state);
    
    // Verify the save was successful
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) {
      console.error('Failed to verify saved state');
      return;
    }
    console.log('Verified saved state exists');
  } catch (error) {
    console.error('Error saving game state:', error);
  }
};

export const loadGameState = (): GameState | null => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.error('localStorage is not available');
      return null;
    }

    console.log('Loading from localStorage with key:', STORAGE_KEY);
    const savedState = localStorage.getItem(STORAGE_KEY);
    console.log('Raw saved state:', savedState);
    
    if (!savedState) {
      console.log('No saved state found');
      return null;
    }

    const parsedState = JSON.parse(savedState);
    console.log('Parsed state:', parsedState);

    if (!isValidGameState(parsedState)) {
      console.error('Invalid game state found in localStorage');
      clearGameState();
      return null;
    }

    console.log('Successfully loaded valid state');
    return parsedState;
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
};

export const clearGameState = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.error('localStorage is not available');
      return;
    }

    console.log('Clearing localStorage with key:', STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    console.log('Successfully cleared state');
  } catch (error) {
    console.error('Error clearing game state:', error);
  }
}; 
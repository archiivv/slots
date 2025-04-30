import { GameState } from '../context/GameContext';

export const saveGameState = (state: GameState): void => {
  const saveData = {
    credits: state.credits,
    bet: state.bet,
    totalBet: state.totalBet,
    stats: {
      ...state.stats,
      hasCheated: state.stats.hasCheated || state.cheats.enabled,
    },
    cheats: {
      ...state.cheats,
      enabled: state.cheats.enabled,
    },
    settings: state.settings,
    currentWinRate: state.currentWinRate,
  };
  
  localStorage.setItem('slotMachineSave', JSON.stringify(saveData));
};

export const loadGameState = (): Partial<GameState> | null => {
  const savedState = localStorage.getItem('slotMachineSave');
  if (!savedState) return null;
  
  try {
    const parsedState = JSON.parse(savedState);
    console.log('Raw saved state:', parsedState);
    
    // Ensure we have valid stats data
    const stats = parsedState.stats || {};
    const hasCheated = stats.hasCheated || parsedState.cheats?.enabled || false;
    
    const loadedState = {
      credits: parsedState.credits,
      bet: parsedState.bet,
      totalBet: parsedState.totalBet,
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
        ...parsedState.cheats,
        enabled: parsedState.cheats?.enabled || false,
      },
      settings: parsedState.settings,
      currentWinRate: parsedState.currentWinRate || 0.3,
    };
    
    console.log('Processed loaded state:', loadedState);
    return loadedState;
  } catch (error) {
    console.error('Error loading saved state:', error);
    return null;
  }
}; 
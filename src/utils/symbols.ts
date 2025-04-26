// Define the symbols that will appear on the slot machine

export type Symbol = {
  emoji: string;
  name: string;
  value: number;  // Payout multiplier for 3 in a row
  frequency: number; // Higher = more common
};

export const symbols: Symbol[] = [
  { emoji: '🍒', name: 'Cherry', value: 3, frequency: 20 },
  { emoji: '🍋', name: 'Lemon', value: 4, frequency: 15 },
  { emoji: '🍊', name: 'Orange', value: 5, frequency: 12 },
  { emoji: '🍇', name: 'Grapes', value: 8, frequency: 10 },
  { emoji: '🍉', name: 'Watermelon', value: 10, frequency: 8 },
  { emoji: '🔔', name: 'Bell', value: 15, frequency: 6 },
  { emoji: '💎', name: 'Diamond', value: 20, frequency: 4 },
  { emoji: '💰', name: 'Money Bag', value: 25, frequency: 3 },
  { emoji: '7️⃣', name: 'Seven', value: 50, frequency: 2 },
  { emoji: '🌟', name: 'Star', value: 100, frequency: 1 }, // Jackpot symbol
];

// Get a random symbol based on frequency
export const getRandomSymbol = (): Symbol => {
  // Calculate total frequency
  const totalFrequency = symbols.reduce((total, symbol) => total + symbol.frequency, 0);
  
  // Get a random value based on total frequency
  let randomValue = Math.random() * totalFrequency;
  
  // Find the symbol based on the random value
  for (const symbol of symbols) {
    randomValue -= symbol.frequency;
    if (randomValue <= 0) {
      return symbol;
    }
  }
  
  // Fallback in case of any issues
  return symbols[0];
};

// Generate random reel results
export const generateReelResults = (
  rows: number = 3, 
  cols: number = 3,
  winRate: number = 0.3,
  forceSymbols: Symbol[] | null = null,
  alwaysJackpot: boolean = false
): Symbol[][] => {
  if (alwaysJackpot) {
    // Return a jackpot combination (all stars)
    const jackpotSymbol = symbols.find(s => s.name === "Star") || symbols[symbols.length - 1];
    return Array(rows).fill(0).map(() => Array(cols).fill(jackpotSymbol));
  }
  
  if (forceSymbols && forceSymbols.length > 0) {
    // Return specified symbols on middle row
    const results = Array(rows).fill(0).map(() => 
      Array(cols).fill(0).map(() => getRandomSymbol())
    );
    
    // Replace middle row with forced symbols, only for non-null values
    for (let i = 0; i < cols; i++) {
      if (forceSymbols[i]) {
        results[1][i] = forceSymbols[i];
      }
    }
    
    return results;
  }
  
  // Apply win rate to determine if this spin should be a win
  const shouldWin = Math.random() < winRate;
  
  if (shouldWin) {
    // Create a winning combination on one of the paylines
    const results = Array(rows).fill(0).map(() => 
      Array(cols).fill(0).map(() => getRandomSymbol())
    );
    
    // Pick a random payline and symbol for the win
    const paylineIndex = Math.floor(Math.random() * 5); // We have 5 paylines
    const winningSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    // Apply winning symbol to the chosen payline
    if (paylineIndex < 3) {
      // Horizontal paylines (rows 0, 1, or 2)
      for (let col = 0; col < cols; col++) {
        results[paylineIndex][col] = winningSymbol;
      }
    } else if (paylineIndex === 3) {
      // Diagonal top-left to bottom-right
      for (let i = 0; i < cols; i++) {
        results[i][i] = winningSymbol;
      }
    } else {
      // Diagonal bottom-left to top-right
      for (let i = 0; i < cols; i++) {
        results[rows - 1 - i][i] = winningSymbol;
      }
    }
    
    return results;
  }
  
  // Regular random results (non-winning)
  return Array(rows).fill(0).map(() => 
    Array(cols).fill(0).map(() => getRandomSymbol())
  );
};

// Check if a payline has a win
export const checkPaylineWin = (
  reels: Symbol[][],
  payline: number[]
): { win: boolean; symbol: Symbol | null; matches: number } => {
  if (payline.length !== reels[0].length) {
    return { win: false, symbol: null, matches: 0 };
  }
  
  const firstSymbol = reels[payline[0]][0];
  let matches = 1;
  
  for (let i = 1; i < payline.length; i++) {
    const currentSymbol = reels[payline[i]][i];
    if (currentSymbol.emoji === firstSymbol.emoji) {
      matches++;
    } else {
      break;
    }
  }
  
  // Win if at least 3 matches
  return {
    win: matches >= 3,
    symbol: matches >= 3 ? firstSymbol : null,
    matches,
  };
};

// Get all winning paylines and total win amount
export const getWinningPaylines = (
  reels: Symbol[][],
  paylines: number[][],
  bet: number
): { winningLines: number[]; totalWin: number } => {
  const winningLines: number[] = [];
  let totalWin = 0;
  
  paylines.forEach((payline, index) => {
    const result = checkPaylineWin(reels, payline);
    if (result.win) {
      winningLines.push(index);
      totalWin += result.symbol!.value * bet;
    }
  });
  
  return { winningLines, totalWin };
};

// Get the symbol at a specific position
export const getSymbolAt = (reels: Symbol[][], row: number, col: number): Symbol => {
  if (reels && reels[row] && reels[row][col]) {
    return reels[row][col];
  }
  // Fallback symbol
  return { emoji: '❓', name: 'Unknown', value: 0, frequency: 0 };
};
import React from 'react';
import SlotMachine from './components/SlotMachine';
import { GameProvider } from './context/GameContext';
import './index.css';

// Add custom animations to tailwind
import './utils/animations.css';

function App() {
  return (
    <GameProvider>
      <SlotMachine />
    </GameProvider>
  );
}

export default App;
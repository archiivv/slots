import React from 'react';
import SlotMachine from './components/SlotMachine';
import Footer from './components/Footer';
import { GameProvider } from './context/GameContext';
import './index.css';

// Add custom animations to tailwind
import './utils/animations.css';

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen w-full max-w-screen overflow-x-hidden bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 pb-20">
          <SlotMachine />
        </div>
        <Footer />
      </div>
    </GameProvider>
  );
}

export default App;
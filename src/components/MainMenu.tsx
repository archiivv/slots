import React, { useEffect } from 'react';

interface MainMenuProps {
  onPlay: () => void;
  visible: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onPlay, visible }) => {
  useEffect(() => {
    // Save visibility state to localStorage when it changes
    localStorage.setItem('mainMenuVisible', visible.toString());
  }, [visible]);

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 backdrop-blur-md bg-black/30" />
      <div className="relative bg-gray-900/90 rounded-xl p-14 max-w-md w-full mx-6 shadow-2xl border border-gray-700">
        <h1 className="text-4xl font-bold text-white text-center mb-4">archiiv's slot machine</h1>
        <p className="text-gray-300 text-center mb-8">
          disclaimer: gambling is a very serious addiction. if you or anyone you know is struggling, please contact the gambling helpline.
        </p>
        <button
          onClick={onPlay}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors"
        >
          yeah sure alright
        </button>
      </div>
    </div>
  );
}; 
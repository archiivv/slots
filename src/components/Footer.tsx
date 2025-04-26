import React from 'react';
import { Github as GitHub, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900/90 border-t border-gray-800 py-8 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-center md:text-left mb-4 md:mb-0">
            © {new Date().getFullYear()} archiiv. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="https://github.com/archiivv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <GitHub size={24} />
            </a>
            <a
              href="https://linkedin.com/in/chase-mccaskill"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Linkedin size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
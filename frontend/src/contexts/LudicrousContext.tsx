import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

interface LudicrousContextType {
  isLudicrous: boolean;
  setLudicrousMode: (enabled: boolean) => void;
}

const LudicrousContext = createContext<LudicrousContextType | undefined>(undefined);

export const useLudicrous = () => {
  const context = useContext(LudicrousContext);
  if (!context) {
    throw new Error('useLudicrous must be used within LudicrousProvider');
  }
  return context;
};

export const LudicrousProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const [isLudicrous, setIsLudicrous] = useState(false);

  useEffect(() => {
    // Load ludicrous mode from user preferences
    const mode = user?.preferences?.appMode || localStorage.getItem('appMode');
    setIsLudicrous(mode === 'ludicrous');
  }, [user]);

  useEffect(() => {
    // Apply global ludicrous mode effects
    if (isLudicrous) {
      document.body.classList.add('ludicrous-mode-global');
      
      // Add style tag for global animations
      const styleTag = document.createElement('style');
      styleTag.id = 'ludicrous-styles';
      styleTag.innerHTML = `
        @keyframes ludicrous-rainbow {
          0% { filter: hue-rotate(0deg) brightness(1.1); }
          100% { filter: hue-rotate(360deg) brightness(1.1); }
        }
        
        @keyframes ludicrous-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @keyframes ludicrous-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.3),
                        0 0 40px rgba(236, 72, 153, 0.2),
                        0 0 60px rgba(59, 130, 246, 0.1);
          }
          50% { 
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.5),
                        0 0 60px rgba(236, 72, 153, 0.4),
                        0 0 90px rgba(59, 130, 246, 0.3);
          }
        }
        
        .ludicrous-mode-global {
          transition: all 0.3s ease;
        }
        
        .ludicrous-mode-global .btn-primary {
          background: linear-gradient(45deg, #8b5cf6, #ec4899, #3b82f6);
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
          transform: scale(1.05);
          font-weight: bold;
        }
        
        .ludicrous-mode-global .btn-primary:hover {
          transform: scale(1.1);
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.5);
        }
        
        .ludicrous-mode-global h1,
        .ludicrous-mode-global h2,
        .ludicrous-mode-global h3 {
          background: linear-gradient(45deg, #8b5cf6, #ec4899, #3b82f6, #10b981);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 3s ease infinite;
          font-weight: bold;
        }
        
        .ludicrous-mode-global .card,
        .ludicrous-mode-global .bg-white,
        .ludicrous-mode-global [class*="rounded"] {
          animation: ludicrous-glow 3s ease-in-out infinite;
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .ludicrous-mode-global .motivational-quote {
          animation: float 3s ease-in-out infinite;
        }
        
        .ludicrous-mode-global a:hover {
          transform: scale(1.05);
          transition: transform 0.2s;
        }
        
        .ludicrous-mode-global input:focus,
        .ludicrous-mode-global textarea:focus,
        .ludicrous-mode-global select:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
        }
        
        .ludicrous-mode-global .success-message {
          background: linear-gradient(45deg, #10b981, #3b82f6);
          color: white;
          padding: 1rem;
          border-radius: 0.5rem;
          animation: ludicrous-pulse 1s ease-in-out infinite;
        }
      `;
      document.head.appendChild(styleTag);
      
      // Add confetti on certain actions
      window.ludicrousConfetti = true;
    } else {
      document.body.classList.remove('ludicrous-mode-global');
      const styleTag = document.getElementById('ludicrous-styles');
      if (styleTag) {
        styleTag.remove();
      }
      window.ludicrousConfetti = false;
    }

    return () => {
      document.body.classList.remove('ludicrous-mode-global');
      const styleTag = document.getElementById('ludicrous-styles');
      if (styleTag) {
        styleTag.remove();
      }
    };
  }, [isLudicrous]);

  const setLudicrousMode = (enabled: boolean) => {
    setIsLudicrous(enabled);
    localStorage.setItem('appMode', enabled ? 'ludicrous' : 'normal');
  };

  return (
    <LudicrousContext.Provider value={{ isLudicrous, setLudicrousMode }}>
      {children}
    </LudicrousContext.Provider>
  );
};

// Add to window for TypeScript
declare global {
  interface Window {
    ludicrousConfetti?: boolean;
  }
}
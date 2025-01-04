import React, { useState, useEffect, useCallback } from 'react';
import { IoRefreshOutline, IoExpand } from 'react-icons/io5';
import { IoHeartOutline, IoHeart } from 'react-icons/io5';
import './FocusMode.css';
import { useAppContext } from '../../context/AppContext';

console.log('import.meta.env:', import.meta.env);
console.log('BASE_URL:', import.meta.env.BASE_URL);

const BASE_PATH = import.meta.env.PROD ? '/DreamBeats-' : '';
const datGuiPath = `${BASE_PATH}/assets/dat.gui.min.js`;

console.log('Environment:', import.meta.env.MODE);
console.log('BASE_PATH:', BASE_PATH);
console.log('datGuiPath:', datGuiPath);

const notificationSound = `${BASE_PATH}/assets/notification.mp3`;

const FocusMode = () => {
  const { focusTime, shortBreakTime } = useAppContext();
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(focusTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [autoSwitch, setAutoSwitch] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const TOTAL_SESSIONS = 4;
  const [isSpinning, setIsSpinning] = useState(false);
  const isBreak = mode === 'break';
  const [quote] = useState({
    text: "Success is not final, failure is not fatal. It is the courage to continue that counts.",
    author: "Winston Churchill"
  });
  
  const [audio] = useState(new Audio(notificationSound));

  // Durées en secondes
  const FOCUS_TIME = focusTime * 60;
  const BREAK_TIME = shortBreakTime * 60;

  const playNotificationSound = () => {
    audio.currentTime = 0; // Remettre le son au début
    audio.play().catch(error => {
      console.error('Erreur lors de la lecture du son:', error);
    });
  };

  // Formater le temps pour l'affichage
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Gérer la fin d'un timer
  const handleTimerComplete = useCallback(() => {
    playNotificationSound();
    setIsActive(false);

    if (mode === 'focus') {
      // Passage en mode break
      setMode('break');
      setTimeLeft(BREAK_TIME);
      setIsActive(true);
      setAutoSwitch(true);
    } else {
      // Fin du break, on incrémente le compteur de sessions complètes
      const nextSessionCount = sessionCount + 1;
      setSessionCount(nextSessionCount);
      
      // Si on n'a pas atteint le nombre total de sessions
      if (nextSessionCount < TOTAL_SESSIONS) {
        setMode('focus');
        setTimeLeft(FOCUS_TIME);
        setIsActive(true); // Auto-démarrage du prochain focus
      } else {
        // Si on a terminé toutes les sessions
        setMode('focus');
        setTimeLeft(FOCUS_TIME);
        setSessionCount(0);
        setIsActive(false);
      }
    }
  }, [mode, sessionCount]);

  // Timer principal
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            handleTimerComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak, sessionCount]);

  // Gérer le changement de mode manuel
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? FOCUS_TIME : BREAK_TIME);
    setIsActive(false);
    setAutoSwitch(false);
    setSessionCount(0); // Réinitialiser le compteur de sessions
  };

  // Gérer le bouton Start/Pause
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  // Gérer le bouton Reset
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
    setSessionCount(0);
  };

  const handleReset = () => {
    resetTimer();
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 500); // Durée de l'animation
  };

  // Effet pour le canvas (inchangé)
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.id = 'fluid-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '1';
    document.body.appendChild(canvas);

    window.getFluidCanvas = () => canvas;
    
    const loadScriptOnce = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const initFluidSimulation = async () => {
      try {
        await loadScriptOnce(datGuiPath);
        await loadScriptOnce(`${BASE_PATH}/assets/script.js`);
      } catch (error) {
        console.error('💥 Erreur de chargement:', error);
      }
    };

    initFluidSimulation();

    return () => {
      const scripts = document.querySelectorAll('script[src*="assets"]');
      scripts.forEach(script => script.remove());
      canvas.remove();
      delete window.getFluidCanvas;
    };
  }, []);
  
  // Rendu des cœurs avec indication du cœur actuel
  const renderHearts = () => {
    return [...Array(TOTAL_SESSIONS)].map((_, index) => (
      <span 
        key={index} 
        className={`heart-icon ${index === sessionCount && isActive ? 'current' : ''}`}
      >
        {index < sessionCount ? (
          <IoHeart size={24} color="#ff4b4b" />
        ) : (
          <IoHeartOutline size={24} color="#ff4b4b" />
        )}
      </span>
    ));
  };

  useEffect(() => {
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  }, [focusTime, shortBreakTime, mode, FOCUS_TIME, BREAK_TIME]);

  useEffect(() => {
    const audio = new Audio(notificationSound);
    
    if (isActive && timeLeft === 0) {
      audio.play().catch(error => {
        console.error('Erreur lors de la lecture du son:', error);
      });
    }
  }, [isActive, timeLeft, mode]);

  return (
    <div className="dreambeats__focus-mode">
      <div className="inspirational-quote">
        <span className="quote-text">"{quote.text}"</span>
        <span className="quote-author">- {quote.author}</span>
      </div>

      <h1 className="focus-title">What do you want to focus on? ✏️</h1>
      
      <div className="focus-options">
        <button 
          className={`focus-button ${mode === 'focus' ? 'active' : ''}`}
          onClick={() => handleModeChange('focus')}
        >
          Focus
        </button>
        <button 
          className={`focus-button ${mode === 'break' ? 'active' : ''}`}
          onClick={() => handleModeChange('break')}
        >
          Break
        </button>
      </div>

      <div className="session-hearts">
        {renderHearts()}
      </div>

      <div className="focus-timer">{formatTime(timeLeft)}</div>

      <div className="focus-controls">
        <button className="control-button" onClick={toggleTimer}>
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          className={`icon-button reset ${isSpinning ? 'spinning' : ''}`} 
          onClick={handleReset}
        >
          <IoRefreshOutline size={32} />
        </button>
      </div>
    </div>
  );
};

export default FocusMode;
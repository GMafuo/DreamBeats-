import React, { useState, useEffect, useCallback } from 'react';
import { IoRefreshOutline, IoExpand, IoPlay, IoPause, IoPencilOutline, IoSaveOutline } from 'react-icons/io5';
import { IoHeartOutline, IoHeart } from 'react-icons/io5';
import './FocusMode.css';
import { useAppContext } from '../../context/AppContext';
import { QUOTES } from '../../data/quotes';

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
  const [quote, setQuote] = useState({
    text: "Loading...",
    author: ""
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
        setIsActive(true); 
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
    setTimeout(() => setIsSpinning(false), 500); 
  };

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

  const [notes, setNotes] = useState(localStorage.getItem('focusNotes') || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    localStorage.setItem('focusNotes', e.target.value);
  };

  // Fonction synchrone pour obtenir la citation
  const getQuoteOfTheDay = () => {
    try {
      const today = new Date().toDateString();
      const savedQuote = localStorage.getItem('dailyQuote');
      const savedDate = localStorage.getItem('quoteDate');

      if (savedQuote && savedDate === today) {
        return JSON.parse(savedQuote);
      }

      const dayOfMonth = new Date().getDate();
      const quoteIndex = dayOfMonth % QUOTES.length;
      const newQuote = QUOTES[quoteIndex];
      
      localStorage.setItem('dailyQuote', JSON.stringify(newQuote));
      localStorage.setItem('quoteDate', today);
      
      return newQuote;
    } catch (error) {
      console.error('Erreur lors de la récupération de la citation:', error);
      return QUOTES[0];
    }
  };

  useEffect(() => {
    const todayQuote = getQuoteOfTheDay();
    setQuote(todayQuote);
  }, []);

  const [focusText, setFocusText] = useState(localStorage.getItem('focusText') || 'Creating my dreams');
  const [isEditingFocus, setIsEditingFocus] = useState(false);

  return (
    <div className="dreambeats__focus-mode">
      <div className="focus-controls">
        <button 
          className={`modefocus-button ${mode === 'focus' ? 'active' : ''}`}
          onClick={() => handleModeChange('focus')}
        >
          Focus
        </button>
        <button 
          className={`modefocus-button ${mode === 'break' ? 'active' : ''}`}
          onClick={() => handleModeChange('break')}
        >
          Break
        </button>
      </div>
      
      <div className="timer-container">
        <button className="play-button" onClick={toggleTimer}>
          {isActive ? <IoPause size={15} /> : <IoPlay size={15} />}
        </button>
        <div className="focus-timer">{formatTime(timeLeft)}</div>
        <button 
          className={`reset-button ${isSpinning ? 'spinning' : ''}`} 
          onClick={handleReset}
        >
          <IoRefreshOutline size={35} />
        </button>
      </div>
      
      <div className="session-hearts">
        {renderHearts()}
      </div>

      <div className="focus-title">I'm focusing on</div>
      {isEditingFocus ? (
        <input
          type="text"
          className="focus-input"
          value={focusText}
          onChange={(e) => {
            setFocusText(e.target.value);
            localStorage.setItem('focusText', e.target.value);
          }}
          onBlur={() => setIsEditingFocus(false)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              setIsEditingFocus(false);
            }
          }}
          autoFocus
        />
      ) : (
        <div 
          className="focus-subtitle"
          onClick={() => setIsEditingFocus(true)}
        >
          {focusText}
        </div>
      )}

      <div className="focus-quote">
        {quote.text}
        <span className="focus-quote-author">- {quote.author}</span>
      </div>

      <div className="notes-container">
        {isEditing ? (
          <textarea
            className="notes-textarea"
            value={notes}
            onChange={handleNotesChange}
            placeholder="Qu'aimeriez-vous accomplir aujourd'hui ?"
            autoFocus
          />
        ) : (
          <div className="notes-display" onClick={() => setIsEditing(true)}>
            {notes || "Cliquez pour ajouter des notes..."}
          </div>
        )}
        <button 
          className="notes-toggle"
          onClick={() => setIsEditing(!isEditing)}
          aria-label={isEditing ? "Sauvegarder" : "Éditer"}
        >
          {isEditing ? <IoSaveOutline size={20} /> : <IoPencilOutline size={20} />}
        </button>
      </div>
    </div>
  );
};

export default FocusMode;
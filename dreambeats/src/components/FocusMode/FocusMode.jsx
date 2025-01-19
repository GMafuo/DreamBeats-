import React, { useState, useEffect, useCallback } from 'react';
import { IoRefreshOutline, IoExpand, IoPlay, IoPause, IoPencilOutline, IoSaveOutline } from 'react-icons/io5';
import { IoHeartOutline, IoHeart } from 'react-icons/io5';
import './FocusMode.css';
import { useAppContext } from '../../context/AppContext';
import { QUOTES } from '../../data/quotes';

const BASE_PATH = import.meta.env.PROD ? '/DreamBeats-' : '';
const datGuiPath = `${BASE_PATH}/assets/dat.gui.min.js`;
const notificationSound = `${BASE_PATH}/assets/notification.mp3`;
const TOTAL_SESSIONS = 4;

const FocusMode = () => {
  const { focusTime, shortBreakTime } = useAppContext();
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(focusTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [notes, setNotes] = useState(localStorage.getItem('focusNotes') || '');
  const [isEditing, setIsEditing] = useState(false);
  const [focusText, setFocusText] = useState(localStorage.getItem('focusText') || 'Creating my dreams');
  const [isEditingFocus, setIsEditingFocus] = useState(false);
  const [quote, setQuote] = useState(QUOTES[new Date().getDate() % QUOTES.length]);
  const [audio] = useState(new Audio(notificationSound));

  const FOCUS_TIME = focusTime * 60;
  const BREAK_TIME = shortBreakTime * 60;
  const isBreak = mode === 'break';

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const playNotificationSound = useCallback(() => {
    audio.currentTime = 0;
    audio.play().catch(error => console.error('Erreur audio:', error));
  }, [audio]);

  const handleTimerComplete = useCallback(() => {
    playNotificationSound();
    setIsActive(false);

    if (mode === 'focus') {
      setMode('break');
      setTimeLeft(shortBreakTime * 60);
      setIsActive(true);
    } else {
      const nextCount = sessionCount + 1;
      if (nextCount < TOTAL_SESSIONS) {
        setMode('focus');
        setTimeLeft(focusTime * 60);
        setIsActive(true);
        setSessionCount(nextCount);
      } else {
        setMode('focus');
        setTimeLeft(focusTime * 60);
        setSessionCount(0);
      }
    }
  }, [mode, sessionCount, shortBreakTime, focusTime, playNotificationSound]);

  // Timer Effect
  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time <= 1 ? (handleTimerComplete(), 0) : time - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, handleTimerComplete]);

  // Fluid Animation Effect
  useEffect(() => {
    const oldCanvas = document.getElementById('fluid-canvas');
    if (oldCanvas) oldCanvas.remove();
    document.querySelectorAll('script[src*="assets"]').forEach(script => script.remove());

    const fluidCanvas = document.createElement('canvas');
    fluidCanvas.id = 'fluid-canvas';
    fluidCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;';
    document.body.appendChild(fluidCanvas);

    window.getFluidCanvas = () => fluidCanvas;
    
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (src.includes('script.js')) {
          fetch(src)
            .then(response => response.text())
            .then(content => {
              const script = document.createElement('script');
              script.textContent = `
                (function() {
                  if (window.fluidSimulation) {
                    window.fluidSimulation.cleanup();
                    delete window.fluidSimulation;
                  }
                  window.canvas = document.getElementById('fluid-canvas');
                  ${content}
                })();
              `;
              document.body.appendChild(script);
              resolve(script);
            })
            .catch(reject);
        } else {
          const script = document.createElement('script');
          script.src = src;
          script.onload = () => resolve(script);
          script.onerror = reject;
          document.body.appendChild(script);
        }
      });
    };

    let loadedScripts = [];
    Promise.all([loadScript(datGuiPath), loadScript(`${BASE_PATH}/assets/script.js`)])
      .then(scripts => loadedScripts = scripts)
      .catch(error => console.error('💥 Erreur de chargement:', error));

    return () => {
      loadedScripts.forEach(script => script?.parentNode?.removeChild(script));
      fluidCanvas?.parentNode?.removeChild(fluidCanvas);
      delete window.getFluidCanvas;
      delete window.canvas;
      if (window.fluidSimulation) {
        window.fluidSimulation.cleanup();
        delete window.fluidSimulation;
      }
      const gl = fluidCanvas.getContext('webgl') || fluidCanvas.getContext('webgl2');
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  // Title Effect
  useEffect(() => {
    document.title = isActive ? `⚡ ${formatTime(timeLeft)} | DreamBeats~` : 'DreamBeats~ | Focus Mode';
    return () => { document.title = 'DreamBeats~'; };
  }, [isActive, timeLeft, formatTime]);

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? FOCUS_TIME : BREAK_TIME);
    setIsActive(false);
    setSessionCount(0);
  }, [FOCUS_TIME, BREAK_TIME]);

  const handleReset = useCallback(() => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
    setSessionCount(0);
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 500);
  }, [mode, FOCUS_TIME, BREAK_TIME]);

  const renderHearts = useCallback(() => (
    [...Array(TOTAL_SESSIONS)].map((_, index) => (
      <span key={index} className={`heart-icon ${index === sessionCount && isActive ? 'current' : ''}`}>
        {index < sessionCount ? <IoHeart size={24} color="#ff4b4b" /> : <IoHeartOutline size={24} color="#ff4b4b" />}
      </span>
    ))
  ), [sessionCount, isActive]);

  const toggleTimer = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(mode === 'focus' ? focusTime * 60 : shortBreakTime * 60);
    }
  }, [focusTime, shortBreakTime, mode, isActive]);

  const handleNotesChange = useCallback((e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    localStorage.setItem('focusNotes', newNotes);
  }, []);

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
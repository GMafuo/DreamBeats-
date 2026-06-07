import { useState, useEffect, useCallback } from 'react';
import {
  IoAddOutline,
  IoCheckboxOutline,
  IoDocumentTextOutline,
  IoListOutline,
  IoPause,
  IoPencilOutline,
  IoPlay,
  IoRefreshOutline,
  IoSaveOutline,
  IoSquareOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import { IoHeartOutline, IoHeart } from 'react-icons/io5';
import './FocusMode.css';
import { useAppContext } from '../../context/useAppContext';
import { QUOTES } from '../../data/quotes';

const BASE_PATH = import.meta.env.PROD ? '/DreamBeats-' : '';
const datGuiPath = `${BASE_PATH}/assets/dat.gui.min.js`;
const notificationSound = `${BASE_PATH}/assets/notification.mp3`;
const TOTAL_SESSIONS = 4;

const getStoredTasks = () => {
  try {
    return JSON.parse(localStorage.getItem('focusTasks')) || [];
  } catch {
    return [];
  }
};

const FocusMode = () => {
  const { focusTime, shortBreakTime } = useAppContext();
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(focusTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [notes, setNotes] = useState(localStorage.getItem('focusNotes') || '');
  const [tasks, setTasks] = useState(getStoredTasks);
  const [taskInput, setTaskInput] = useState('');
  const [noteView, setNoteView] = useState(localStorage.getItem('focusNoteView') || 'notes');
  const [isEditing, setIsEditing] = useState(false);
  const [focusText, setFocusText] = useState(localStorage.getItem('focusText') || 'Creating my dreams');
  const [isEditingFocus, setIsEditingFocus] = useState(false);
  const [quote] = useState(QUOTES[new Date().getDate() % QUOTES.length]);
  const [audio] = useState(new Audio(notificationSound));

  const FOCUS_TIME = focusTime * 60;
  const BREAK_TIME = shortBreakTime * 60;
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
    setIsPaused(false);

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

  useEffect(() => {
    const oldCanvas = document.getElementById('fluid-canvas');
    if (oldCanvas) oldCanvas.remove();
    document.querySelectorAll('script[src*="assets"]').forEach(script => script.remove());

    const fluidCanvas = document.createElement('canvas');
    fluidCanvas.id = 'fluid-canvas';
    
    fluidCanvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false
    });

    fluidCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;';
    document.body.appendChild(fluidCanvas);

    const adjustResolution = () => {
      const scale = window.devicePixelRatio * 0.75; // Réduction de la résolution
      const width = Math.floor(window.innerWidth * scale);
      const height = Math.floor(window.innerHeight * scale);
      fluidCanvas.width = width;
      fluidCanvas.height = height;
    };

    adjustResolution();
    window.addEventListener('resize', adjustResolution);

    window.getFluidCanvas = () => fluidCanvas;
    
    let isCancelled = false;
    let loadedScripts = [];

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (src.includes('script.js')) {
          fetch(src)
            .then(response => response.text())
            .then(content => {
              if (isCancelled) {
                resolve(null);
                return;
              }

              const script = document.createElement('script');
              // Ajout des optimisations dans le script
              const optimizedContent = content.replace(
                'function pointerPrototype',
                `
                const QUALITY = window.navigator.userAgent.includes('Opera') ? 0.5 : 1;
                const DENSITY = window.navigator.userAgent.includes('Opera') ? 0.5 : 1;
                function pointerPrototype`
              );
              script.textContent = `
                (function() {
                  if (window.fluidSimulation) {
                    window.fluidSimulation.cleanup();
                    delete window.fluidSimulation;
                  }
                  window.canvas = document.getElementById('fluid-canvas');
                  ${optimizedContent}
                })();
              `;
              document.body.appendChild(script);
              loadedScripts.push(script);
              resolve(script);
            })
            .catch(reject);
        } else {
          const script = document.createElement('script');
          script.src = src;
          script.onload = () => {
            if (isCancelled) {
              script.remove();
              resolve(null);
              return;
            }

            resolve(script);
          };
          script.onerror = reject;
          document.body.appendChild(script);
          loadedScripts.push(script);
        }
      });
    };

    Promise.all([loadScript(datGuiPath), loadScript(`${BASE_PATH}/assets/script.js`)])
      .then(scripts => {
        const mountedScripts = scripts.filter(Boolean);

        if (isCancelled) {
          mountedScripts.forEach(script => script.remove());
          return;
        }

        loadedScripts = mountedScripts;
      })
      .catch(error => console.error('💥 Erreur de chargement:', error));

    return () => {
      isCancelled = true;
      window.removeEventListener('resize', adjustResolution);
      loadedScripts.forEach(script => script?.parentNode?.removeChild(script));
      fluidCanvas?.parentNode?.removeChild(fluidCanvas);

      if (window.getFluidCanvas?.() === fluidCanvas) {
        delete window.getFluidCanvas;
      }

      if (window.canvas === fluidCanvas && window.fluidSimulation) {
        window.fluidSimulation.cleanup();
        delete window.fluidSimulation;
      }

      if (window.canvas === fluidCanvas) {
        delete window.canvas;
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
    setIsPaused(false);
    setSessionCount(0);
  }, [FOCUS_TIME, BREAK_TIME]);

  const handleReset = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
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
    if (isActive) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
    setIsActive(prev => !prev);
  }, [isActive]);

  useEffect(() => {
    if (!isActive && !isPaused) {
      setTimeLeft(mode === 'focus' ? focusTime * 60 : shortBreakTime * 60);
    }
  }, [focusTime, shortBreakTime, mode, isActive, isPaused]);

  const handleNotesChange = useCallback((e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    localStorage.setItem('focusNotes', newNotes);
  }, []);

  const updateNoteView = useCallback((view) => {
    setNoteView(view);
    localStorage.setItem('focusNoteView', view);
  }, []);

  const persistTasks = useCallback((nextTasks) => {
    setTasks(nextTasks);
    localStorage.setItem('focusTasks', JSON.stringify(nextTasks));
  }, []);

  const handleAddTask = useCallback(() => {
    const label = taskInput.trim();
    if (!label) return;

    persistTasks([
      ...tasks,
      {
        id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        label,
        done: false,
      },
    ]);
    setTaskInput('');
  }, [persistTasks, taskInput, tasks]);

  const handleToggleTask = useCallback((taskId) => {
    persistTasks(tasks.map(task => (
      task.id === taskId ? { ...task, done: !task.done } : task
    )));
  }, [persistTasks, tasks]);

  const handleRemoveTask = useCallback((taskId) => {
    persistTasks(tasks.filter(task => task.id !== taskId));
  }, [persistTasks, tasks]);

  const clearCompletedTasks = useCallback(() => {
    persistTasks(tasks.filter(task => !task.done));
  }, [persistTasks, tasks]);

  const completedTasks = tasks.filter(task => task.done).length;

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

      <div className="focus-title">I&apos;m focusing on</div>
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
          onKeyDown={(e) => {
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
        <div className="notes-header">
          <div>
            <span className="notes-kicker">Focus board</span>
            <h2>Notes de session</h2>
          </div>
          <button
            className="notes-toggle"
            onClick={() => setIsEditing(!isEditing)}
            aria-label={isEditing ? "Sauvegarder" : "Editer"}
            type="button"
          >
            {isEditing ? <IoSaveOutline size={20} /> : <IoPencilOutline size={20} />}
          </button>
        </div>

        <div className="notes-tabs" aria-label="Choisir le type de note">
          <button
            className={`notes-tab ${noteView === 'notes' ? 'active' : ''}`}
            onClick={() => updateNoteView('notes')}
            type="button"
          >
            <IoDocumentTextOutline size={16} />
            Notes
          </button>
          <button
            className={`notes-tab ${noteView === 'tasks' ? 'active' : ''}`}
            onClick={() => updateNoteView('tasks')}
            type="button"
          >
            <IoListOutline size={16} />
            Taches
          </button>
        </div>

        {noteView === 'notes' ? (
          isEditing ? (
            <textarea
              className="notes-textarea"
              value={notes}
              onChange={handleNotesChange}
              placeholder="Ce que je veux garder en tete..."
              autoFocus
            />
          ) : (
            <div className="notes-display" onClick={() => setIsEditing(true)}>
              {notes || "Clique pour ajouter des notes..."}
            </div>
          )
        ) : (
          <div className="tasks-panel">
            <div className="task-input-row">
              <input
                className="task-input"
                value={taskInput}
                onChange={(event) => setTaskInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleAddTask();
                  }
                }}
                placeholder="Ajouter une tache..."
              />
              <button className="task-add" onClick={handleAddTask} type="button" aria-label="Ajouter">
                <IoAddOutline size={20} />
              </button>
            </div>

            <div className="task-list">
              {tasks.length === 0 ? (
                <div className="task-empty">Aucune tache pour cette session.</div>
              ) : (
                tasks.map(task => (
                  <div className={`task-item ${task.done ? 'done' : ''}`} key={task.id}>
                    <button
                      className="task-check"
                      onClick={() => handleToggleTask(task.id)}
                      type="button"
                      aria-label={task.done ? "Marquer a faire" : "Marquer fait"}
                    >
                      {task.done ? <IoCheckboxOutline size={20} /> : <IoSquareOutline size={20} />}
                    </button>
                    <span>{task.label}</span>
                    <button
                      className="task-remove"
                      onClick={() => handleRemoveTask(task.id)}
                      type="button"
                      aria-label="Supprimer"
                    >
                      <IoTrashOutline size={17} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="task-footer">
              <span>{completedTasks}/{tasks.length} termine</span>
              {completedTasks > 0 && (
                <button onClick={clearCompletedTasks} type="button">
                  Nettoyer
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="notes-container legacy-notes-container">
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

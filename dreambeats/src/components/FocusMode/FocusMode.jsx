import { useState, useEffect, useCallback, useRef } from 'react';
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

const getStoredNotesPanelSize = () => {
  try {
    return JSON.parse(localStorage.getItem('focusNotesPanelSize')) || null;
  } catch {
    return null;
  }
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const SLASH_COMMANDS = [
  { id: 'title-1', trigger: 'titre1', label: 'Titre 1', hint: 'Grand titre de section', template: '# ', cursorOffset: 2 },
  { id: 'title-2', trigger: 'titre2', label: 'Titre 2', hint: 'Sous-section', template: '## ', cursorOffset: 3 },
  { id: 'title-3', trigger: 'titre3', label: 'Titre 3', hint: 'Petit titre', template: '### ', cursorOffset: 4 },
  { id: 'list', trigger: 'liste', label: 'Liste', hint: 'Liste a puces', template: '- ', cursorOffset: 2 },
  { id: 'todo', trigger: 'todo', label: 'Todo', hint: 'Case a cocher', template: '- [ ] ', cursorOffset: 6 },
  { id: 'quote', trigger: 'citation', label: 'Citation', hint: 'Bloc mis en avant', template: '> ', cursorOffset: 2 },
  { id: 'code', trigger: 'code', label: 'Code', hint: 'Bloc de code', template: '```\n\n```', cursorOffset: 4 },
  { id: 'divider', trigger: 'separateur', label: 'Separateur', hint: 'Ligne de separation', template: '---\n', cursorOffset: 4 },
];

const getMatchingSlashCommands = (query) => (
  SLASH_COMMANDS.filter(command => (
    command.trigger.includes(query) ||
    command.label.toLowerCase().includes(query)
  ))
);

const renderFormattedNotes = (content) => {
  if (!content.trim()) {
    return 'Clique pour ajouter des notes...';
  }

  return content.split('\n').map((line, index) => {
    if (line.startsWith('### ')) {
      return <h5 className="note-heading note-heading-three" key={index}>{line.slice(4)}</h5>;
    }

    if (line.startsWith('## ')) {
      return <h4 className="note-heading note-heading-two" key={index}>{line.slice(3)}</h4>;
    }

    if (line.startsWith('# ')) {
      return <h3 className="note-heading note-heading-one" key={index}>{line.slice(2)}</h3>;
    }

    if (line.startsWith('- [ ] ')) {
      return <div className="note-todo" key={index}><span></span>{line.slice(6)}</div>;
    }

    if (line.startsWith('- ')) {
      return <div className="note-list-item" key={index}>{line.slice(2)}</div>;
    }

    if (line.startsWith('> ')) {
      return <blockquote className="note-quote" key={index}>{line.slice(2)}</blockquote>;
    }

    if (line === '---') {
      return <hr className="note-divider" key={index} />;
    }

    if (line.startsWith('```')) {
      return <code className="note-code-line" key={index}>{line.replaceAll('`', '') || 'code'}</code>;
    }

    return <p className="note-paragraph" key={index}>{line || '\u00A0'}</p>;
  });
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
  const [notesPanelSize, setNotesPanelSize] = useState(getStoredNotesPanelSize);
  const [slashMenu, setSlashMenu] = useState({ visible: false, query: '', lineStart: 0, lineEnd: 0 });
  const [activeSlashCommandIndex, setActiveSlashCommandIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [focusText, setFocusText] = useState(localStorage.getItem('focusText') || 'Creating my dreams');
  const [isEditingFocus, setIsEditingFocus] = useState(false);
  const [quote] = useState(QUOTES[new Date().getDate() % QUOTES.length]);
  const [audio] = useState(new Audio(notificationSound));
  const notesPanelRef = useRef(null);
  const notesTextareaRef = useRef(null);

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

  const getSlashContext = useCallback((textarea) => {
    const cursor = textarea.selectionStart;
    const value = textarea.value;
    const lineStart = value.lastIndexOf('\n', cursor - 1) + 1;
    const lineEndIndex = value.indexOf('\n', cursor);
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
    const currentLine = value.slice(lineStart, cursor);

    if (!currentLine.startsWith('/') || currentLine.includes(' ')) {
      return null;
    }

    return {
      visible: true,
      query: currentLine.slice(1).toLowerCase(),
      lineStart,
      lineEnd,
    };
  }, []);

  const updateSlashMenu = useCallback((textarea) => {
    const slashContext = getSlashContext(textarea);

    if (!slashContext) {
      setSlashMenu({ visible: false, query: '', lineStart: 0, lineEnd: 0 });
      return;
    }

    setSlashMenu(slashContext);
    setActiveSlashCommandIndex(0);
  }, [getSlashContext]);

  const handleNotesChange = useCallback((e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    localStorage.setItem('focusNotes', newNotes);
    updateSlashMenu(e.target);
  }, [updateSlashMenu]);

  const applySlashCommand = useCallback((command, context = slashMenu) => {
    const textarea = notesTextareaRef.current;
    if (!textarea || !command) return;

    const value = textarea.value;
    const nextNotes = `${value.slice(0, context.lineStart)}${command.template}${value.slice(context.lineEnd)}`;
    const nextCursor = context.lineStart + command.cursorOffset;

    setNotes(nextNotes);
    localStorage.setItem('focusNotes', nextNotes);
    setSlashMenu({ visible: false, query: '', lineStart: 0, lineEnd: 0 });

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }, [slashMenu]);

  const handleNotesKeyDown = useCallback((event) => {
    const matchingCommands = getMatchingSlashCommands(slashMenu.query);

    if (slashMenu.visible && matchingCommands.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveSlashCommandIndex(index => (index + 1) % matchingCommands.length);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveSlashCommandIndex(index => (index - 1 + matchingCommands.length) % matchingCommands.length);
        return;
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        applySlashCommand(matchingCommands[activeSlashCommandIndex] || matchingCommands[0]);
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setSlashMenu({ visible: false, query: '', lineStart: 0, lineEnd: 0 });
      }
    }
  }, [activeSlashCommandIndex, applySlashCommand, slashMenu]);

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
  const matchingSlashCommands = slashMenu.visible ? getMatchingSlashCommands(slashMenu.query) : [];

  useEffect(() => {
    if (!notesPanelSize) return;

    const clampStoredPanelSize = () => {
      const minWidth = 260;
      const minHeight = 230;
      const maxWidth = Math.max(minWidth, window.innerWidth - 32);
      const maxHeight = Math.max(minHeight, window.innerHeight - 32);
      const nextSize = {
        width: Math.round(clamp(notesPanelSize.width, minWidth, maxWidth)),
        height: Math.round(clamp(notesPanelSize.height, minHeight, maxHeight)),
      };

      if (nextSize.width !== notesPanelSize.width || nextSize.height !== notesPanelSize.height) {
        setNotesPanelSize(nextSize);
        localStorage.setItem('focusNotesPanelSize', JSON.stringify(nextSize));
      }
    };

    clampStoredPanelSize();
    window.addEventListener('resize', clampStoredPanelSize);

    return () => window.removeEventListener('resize', clampStoredPanelSize);
  }, [notesPanelSize]);

  const startResizeNotesPanel = useCallback((event) => {
    event.preventDefault();

    const panel = notesPanelRef.current;
    if (!panel) return;

    const startX = event.clientX;
    const startY = event.clientY;
    const startRect = panel.getBoundingClientRect();
    const minWidth = 260;
    const minHeight = 230;
    let nextSize = {
      width: Math.round(startRect.width),
      height: Math.round(startRect.height),
    };
    let animationFrameId = null;

    const handlePointerMove = (moveEvent) => {
      const maxWidth = Math.max(minWidth, window.innerWidth - 32);
      const maxHeight = Math.max(minHeight, window.innerHeight - 32);
      nextSize = {
        width: Math.round(clamp(startRect.width + startX - moveEvent.clientX, minWidth, maxWidth)),
        height: Math.round(clamp(startRect.height + moveEvent.clientY - startY, minHeight, maxHeight)),
      };

      if (animationFrameId !== null) return;

      animationFrameId = requestAnimationFrame(() => {
        panel.style.width = `${nextSize.width}px`;
        panel.style.height = `${nextSize.height}px`;
        animationFrameId = null;
      });
    };

    const handlePointerUp = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      panel.style.width = `${nextSize.width}px`;
      panel.style.height = `${nextSize.height}px`;
      setNotesPanelSize(nextSize);
      localStorage.setItem('focusNotesPanelSize', JSON.stringify(nextSize));
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, []);

  return (
    <div className="dreambeats__focus-mode">
      <div className="focus-controls">
        <button 
          className={`modefocus-button ${mode === 'focus' ? 'active' : ''}`}
          onClick={() => handleModeChange('focus')}
          type="button"
          aria-pressed={mode === 'focus'}
        >
          Focus
        </button>
        <button 
          className={`modefocus-button ${mode === 'break' ? 'active' : ''}`}
          onClick={() => handleModeChange('break')}
          type="button"
          aria-pressed={mode === 'break'}
        >
          Break
        </button>
      </div>
      
      <div className="timer-container">
        <button className="play-button" onClick={toggleTimer} type="button" aria-label={isActive ? 'Mettre le timer en pause' : 'Demarrer le timer'}>
          {isActive ? <IoPause size={15} /> : <IoPlay size={15} />}
        </button>
        <div className="focus-timer">{formatTime(timeLeft)}</div>
        <button 
          className={`reset-button ${isSpinning ? 'spinning' : ''}`} 
          onClick={handleReset}
          type="button"
          aria-label="Reinitialiser le timer"
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
          aria-label="Objectif de focus"
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
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsEditingFocus(true);
            }
          }}
        >
          {focusText}
        </div>
      )}

      <div className="focus-quote">
        {quote.text}
        <span className="focus-quote-author">- {quote.author}</span>
      </div>

      <div
        className="notes-container"
        ref={notesPanelRef}
        style={{
          width: notesPanelSize?.width ? `${notesPanelSize.width}px` : undefined,
          height: notesPanelSize?.height ? `${notesPanelSize.height}px` : undefined,
        }}
      >
        <button
          className="notes-resize-handle"
          onPointerDown={startResizeNotesPanel}
          type="button"
          aria-label="Redimensionner le panneau"
        />
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

        <div className="notes-tabs" role="tablist" aria-label="Choisir le type de note">
          <button
            className={`notes-tab ${noteView === 'notes' ? 'active' : ''}`}
            onClick={() => updateNoteView('notes')}
            type="button"
            role="tab"
            aria-selected={noteView === 'notes'}
          >
            <IoDocumentTextOutline size={16} />
            Notes
          </button>
          <button
            className={`notes-tab ${noteView === 'tasks' ? 'active' : ''}`}
            onClick={() => updateNoteView('tasks')}
            type="button"
            role="tab"
            aria-selected={noteView === 'tasks'}
          >
            <IoListOutline size={16} />
            Taches
          </button>
        </div>

        {noteView === 'notes' ? (
          isEditing ? (
            <div className="notes-editor">
              <textarea
                ref={notesTextareaRef}
                className="notes-textarea"
                value={notes}
                onChange={handleNotesChange}
                onKeyDown={handleNotesKeyDown}
                onClick={(event) => updateSlashMenu(event.currentTarget)}
                placeholder="Tape / pour ajouter un titre, une liste, une todo..."
                aria-label="Notes de session"
                autoFocus
              />
              {slashMenu.visible && (
                <div className="slash-menu" role="listbox" aria-label="Commandes de mise en forme">
                  {matchingSlashCommands.length > 0 ? (
                    matchingSlashCommands.map((command, index) => (
                      <button
                        className={`slash-command ${index === activeSlashCommandIndex ? 'active' : ''}`}
                        key={command.id}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          applySlashCommand(command);
                        }}
                        type="button"
                      >
                        <span>/{command.trigger}</span>
                        <strong>{command.label}</strong>
                        <small>{command.hint}</small>
                      </button>
                    ))
                  ) : (
                    <div className="slash-command-empty">Aucune commande</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div
              className="notes-display"
              onClick={() => setIsEditing(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setIsEditing(true);
                }
              }}
            >
              {renderFormattedNotes(notes)}
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
                aria-label="Ajouter une tache"
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

    </div>
  );
};

export default FocusMode;

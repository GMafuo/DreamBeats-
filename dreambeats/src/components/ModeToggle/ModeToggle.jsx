import { useState, useEffect } from 'react';
import { IoMusicalNotes, IoTimer, IoSettingsSharp } from "react-icons/io5";
import { RiFullscreenFill, RiFullscreenExitFill } from "react-icons/ri";
import { useFullscreen } from '../../hooks/useFullscreen';
import { useAppContext } from '../../context/useAppContext';
import Settings from '../Settings/Settings';
import './ModeToggle.css';

const ModeToggle = ({ currentMode, onModeChange }) => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const { 
    clockFormat, 
    focusTime, 
    shortBreakTime,
    activePresetId,
    updateClockFormat,
    updateFocusTime,
    updateShortBreakTime,
    applyAmbiencePreset
  } = useAppContext();

  useEffect(() => {
    let timeoutId;

    const handleMouseMove = () => {
      setIsVisible(true);
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        if (!isSettingsOpen) {
          setIsVisible(false);
        }
      }, 3000);
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, [isSettingsOpen]);

  return (
    <>
      <div className={`dreambeats__mode-toggle ${isVisible ? 'visible' : 'hidden'}`}>
        <div className="toggle-container">
          <button 
            className={`mode-button ${currentMode === 'ambient' ? 'active' : ''}`}
            onClick={() => onModeChange('ambient')}
            type="button"
            aria-label="Mode ambiance"
            aria-pressed={currentMode === 'ambient'}
          >
            <IoMusicalNotes size={20} />
          </button>
          <button 
            className={`mode-button ${currentMode === 'focus' ? 'active' : ''}`}
            onClick={() => onModeChange('focus')}
            type="button"
            aria-label="Mode focus"
            aria-pressed={currentMode === 'focus'}
          >
            <IoTimer size={20} />
          </button>
          <div className={`slider ${currentMode}`} />
        </div>
        <div className="control-buttons">
          <button className="settings-button" onClick={() => setIsSettingsOpen(true)} type="button" aria-label="Ouvrir les parametres">
            <IoSettingsSharp size={20} />
          </button>
          <button className="fullscreen-button" onClick={toggleFullscreen} type="button" aria-label={isFullscreen ? 'Quitter le plein ecran' : 'Passer en plein ecran'}>
            {isFullscreen ? (
              <RiFullscreenExitFill size={20} />
            ) : (
              <RiFullscreenFill size={20} />
            )}
          </button>
        </div>
      </div>

      <Settings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        clockFormat={clockFormat}
        setClockFormat={updateClockFormat}
        focusTime={focusTime}
        shortBreakTime={shortBreakTime}
        onFocusTimeChange={updateFocusTime}
        onShortBreakTimeChange={updateShortBreakTime}
        activePresetId={activePresetId}
        onPresetApply={applyAmbiencePreset}
      />
    </>
  );
};

export default ModeToggle;

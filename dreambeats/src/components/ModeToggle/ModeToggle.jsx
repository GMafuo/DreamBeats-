import React, { useState, useEffect } from 'react';
import { IoMusicalNotes, IoTimer, IoSettingsSharp } from "react-icons/io5";
import { RiFullscreenFill, RiFullscreenExitFill } from "react-icons/ri";
import { useFullscreen } from '../../hooks/useFullscreen';
import { useAppContext } from '../../context/AppContext';
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
    updateClockFormat,
    updateFocusTime,
    updateShortBreakTime
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
          >
            <IoMusicalNotes size={20} />
          </button>
          <button 
            className={`mode-button ${currentMode === 'focus' ? 'active' : ''}`}
            onClick={() => onModeChange('focus')}
          >
            <IoTimer size={20} />
          </button>
          <div className={`slider ${currentMode}`} />
        </div>
        <div className="control-buttons">
          <button className="settings-button" onClick={() => setIsSettingsOpen(true)}>
            <IoSettingsSharp size={20} />
          </button>
          <button className="fullscreen-button" onClick={toggleFullscreen}>
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
      />
    </>
  );
};

export default ModeToggle;

import React from 'react';
import { IoMusicalNotes, IoTimer, IoSettingsSharp } from "react-icons/io5";
import { RiFullscreenFill, RiFullscreenExitFill } from "react-icons/ri";
import { useFullscreen } from '../../hooks/useFullscreen';
import './ModeToggle.css';

const ModeToggle = ({ currentMode, onModeChange }) => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <div className="dreambeats__mode-toggle">
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
        <button className="settings-button">
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
  );
};

export default ModeToggle;

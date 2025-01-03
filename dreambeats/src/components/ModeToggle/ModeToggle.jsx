import React from 'react';
import { IoMusicalNotes, IoTimer } from "react-icons/io5";
import './ModeToggle.css';

const ModeToggle = ({ currentMode, onModeChange }) => {
  return (
    <div className="dreambeats__mode-toggle">
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
  );
};

export default ModeToggle;

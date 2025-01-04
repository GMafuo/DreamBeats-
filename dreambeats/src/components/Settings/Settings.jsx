import React, { useState, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import './Settings.css';

const Settings = ({ 
  isOpen, 
  onClose, 
  clockFormat, 
  setClockFormat, 
  focusTime, 
  shortBreakTime, 
  onFocusTimeChange, 
  onShortBreakTimeChange 
}) => {
  // États temporaires pour les modifications
  const [tempClockFormat, setTempClockFormat] = useState(clockFormat);
  const [tempFocusTime, setTempFocusTime] = useState(focusTime);
  const [tempShortBreakTime, setTempShortBreakTime] = useState(shortBreakTime);

  // Réinitialiser les états temporaires à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setTempClockFormat(clockFormat);
      setTempFocusTime(focusTime);
      setTempShortBreakTime(shortBreakTime);
    }
  }, [isOpen, clockFormat, focusTime, shortBreakTime]);

  const handleApply = () => {
    setClockFormat(tempClockFormat);
    onFocusTimeChange(tempFocusTime);
    onShortBreakTimeChange(tempShortBreakTime);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Paramètres</h2>
          <button className="close-button" onClick={onClose}>
            <IoClose size={24} />
          </button>
        </div>

        <div className="settings-section">
          <h3>Clock</h3>
          <div className="clock-options">
            <div 
              className={`clock-option ${tempClockFormat === '12h' ? 'active' : ''}`}
              onClick={() => setTempClockFormat('12h')}
            >
              <div className="clock-preview">2:24</div>
              <div className="clock-label">12-hour Clock</div>
            </div>
            <div 
              className={`clock-option ${tempClockFormat === '24h' ? 'active' : ''}`}
              onClick={() => setTempClockFormat('24h')}
            >
              <div className="clock-preview">14:24</div>
              <div className="clock-label">24-hour Clock</div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Focus Timer</h3>
          <div className="timer-settings">
            <div className="timer-option">
              <label>Focus Time (minutes)</label>
              <input 
                type="number" 
                value={tempFocusTime} 
                onChange={(e) => setTempFocusTime(Number(e.target.value))}
                min="1"
                max="120"
              />
            </div>
            <div className="timer-option">
              <label>Short Break (minutes)</label>
              <input 
                type="number" 
                value={tempShortBreakTime} 
                onChange={(e) => setTempShortBreakTime(Number(e.target.value))}
                min="1"
                max="30"
              />
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="cancel-button" onClick={onClose}>Annuler</button>
          <button className="apply-button" onClick={handleApply}>Appliquer</button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 
import { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { AMBIENCE_PRESETS } from '../../config/ambiencePresets';
import './Settings.css';

const Settings = ({
  isOpen,
  onClose,
  clockFormat,
  setClockFormat,
  focusTime,
  shortBreakTime,
  onFocusTimeChange,
  onShortBreakTimeChange,
  activePresetId,
  onPresetApply,
}) => {
  const [tempClockFormat, setTempClockFormat] = useState(clockFormat);
  const [tempFocusTime, setTempFocusTime] = useState(focusTime);
  const [tempShortBreakTime, setTempShortBreakTime] = useState(shortBreakTime);

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

  const handlePresetApply = (presetId) => {
    onPresetApply(presetId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" role="presentation">
      <div className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="settings-header">
          <h2 id="settings-title">Parametres</h2>
          <button className="close-button" onClick={onClose} type="button" aria-label="Fermer les parametres">
            <IoClose size={24} />
          </button>
        </div>

        <div className="settings-section">
          <h3>Presets d&apos;ambiance</h3>
          <div className="preset-options">
            {AMBIENCE_PRESETS.map(preset => (
              <button
                className={`preset-option ${activePresetId === preset.id ? 'active' : ''}`}
                key={preset.id}
                onClick={() => handlePresetApply(preset.id)}
                type="button"
                aria-pressed={activePresetId === preset.id}
              >
                <span className="preset-emoji">{preset.emoji}</span>
                <span className="preset-copy">
                  <strong>{preset.title}</strong>
                  <small>{preset.mood} · {preset.focusTime}/{preset.shortBreakTime} min</small>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h3>Horloge</h3>
          <div className="clock-options">
            <button
              className={`clock-option ${tempClockFormat === '12h' ? 'active' : ''}`}
              onClick={() => setTempClockFormat('12h')}
              type="button"
              aria-pressed={tempClockFormat === '12h'}
            >
              <div className="clock-preview">2:24</div>
              <div className="clock-label">Format 12 h</div>
            </button>
            <button
              className={`clock-option ${tempClockFormat === '24h' ? 'active' : ''}`}
              onClick={() => setTempClockFormat('24h')}
              type="button"
              aria-pressed={tempClockFormat === '24h'}
            >
              <div className="clock-preview">14:24</div>
              <div className="clock-label">Format 24 h</div>
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>Timer focus</h3>
          <div className="timer-settings">
            <div className="timer-option">
              <label htmlFor="focus-time">Temps de focus (minutes)</label>
              <input
                id="focus-time"
                type="number"
                value={tempFocusTime}
                onChange={(e) => setTempFocusTime(Number(e.target.value))}
                min="1"
                max="120"
              />
            </div>
            <div className="timer-option">
              <label htmlFor="short-break-time">Pause courte (minutes)</label>
              <input
                id="short-break-time"
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
          <button className="cancel-button" onClick={onClose} type="button">Annuler</button>
          <button className="apply-button" onClick={handleApply} type="button">Appliquer</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

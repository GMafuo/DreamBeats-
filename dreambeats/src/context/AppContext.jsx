import { useMemo, useState, useCallback } from 'react';
import { AppContext } from './contextStore';
import { SCENES } from '../config/scenes';
import { YOUTUBE_STREAMS } from '../config/youtubeStreams';
import { AMBIENCE_PRESETS } from '../config/ambiencePresets';

const getStoredStreamId = () => {
  const storedStreamId = localStorage.getItem('currentStreamId');
  const isKnownStream = YOUTUBE_STREAMS.some(stream => stream.id === storedStreamId);

  return isKnownStream ? storedStreamId : YOUTUBE_STREAMS[0].id;
};

export const AppProvider = ({ children }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [appMode, setAppMode] = useState('ambient');
  const [currentStreamId, setCurrentStreamId] = useState(getStoredStreamId);
  const [activePresetId, setActivePresetId] = useState(() => (
    localStorage.getItem('activeAmbiencePresetId') || null
  ));
  
  const [clockFormat, setClockFormat] = useState(() => 
    localStorage.getItem('clockFormat') || '24h'
  );
  const [focusTime, setFocusTime] = useState(() => 
    Number(localStorage.getItem('focusTime')) || 25
  );
  const [shortBreakTime, setShortBreakTime] = useState(() => 
    Number(localStorage.getItem('shortBreakTime')) || 5
  );

  const getSceneByIndex = useCallback((index) => {
    return SCENES[((index % SCENES.length) + SCENES.length) % SCENES.length];
  }, []);

  const getCurrentScene = useCallback(() => {
    return getSceneByIndex(currentSceneIndex);
  }, [currentSceneIndex, getSceneByIndex]);

  const updateClockFormat = useCallback((format) => {
    setClockFormat(format);
    localStorage.setItem('clockFormat', format);
  }, []);

  const updateFocusTime = useCallback((time) => {
    setFocusTime(time);
    localStorage.setItem('focusTime', time.toString());
  }, []);

  const updateShortBreakTime = useCallback((time) => {
    setShortBreakTime(time);
    localStorage.setItem('shortBreakTime', time.toString());
  }, []);

  const updateCurrentStreamId = useCallback((streamId) => {
    setCurrentStreamId(streamId);
    setActivePresetId(null);
    localStorage.setItem('currentStreamId', streamId);
    localStorage.removeItem('activeAmbiencePresetId');
  }, []);

  const applyAmbiencePreset = useCallback((presetId) => {
    const preset = AMBIENCE_PRESETS.find(item => item.id === presetId);
    if (!preset) return;

    const sceneIndex = SCENES.findIndex(scene => scene.id === preset.sceneId);

    if (sceneIndex !== -1) {
      setCurrentSceneIndex(sceneIndex);
    }

    setCurrentStreamId(preset.streamId);
    setFocusTime(preset.focusTime);
    setShortBreakTime(preset.shortBreakTime);
    setActivePresetId(preset.id);

    localStorage.setItem('currentStreamId', preset.streamId);
    localStorage.setItem('focusTime', preset.focusTime.toString());
    localStorage.setItem('shortBreakTime', preset.shortBreakTime.toString());
    localStorage.setItem('activeAmbiencePresetId', preset.id);
  }, []);

  const value = useMemo(() => ({ 
      getCurrentScene, 
      getSceneByIndex,
      currentSceneIndex, 
      setCurrentSceneIndex,
      isLoading,
      setIsLoading,
      appMode,
      setAppMode,
      clockFormat,
      focusTime,
      shortBreakTime,
      currentStreamId,
      activePresetId,
      updateClockFormat,
      updateFocusTime,
      updateShortBreakTime,
      updateCurrentStreamId,
      applyAmbiencePreset,
    }), [
      getCurrentScene,
      getSceneByIndex,
      currentSceneIndex,
      isLoading,
      appMode,
      clockFormat,
      focusTime,
      shortBreakTime,
      currentStreamId,
      activePresetId,
      updateClockFormat,
      updateFocusTime,
      updateShortBreakTime,
      updateCurrentStreamId,
      applyAmbiencePreset,
    ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

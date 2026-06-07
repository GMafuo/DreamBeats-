import { useMemo, useState, useCallback } from 'react';
import { AppContext } from './contextStore';
import { SCENES } from '../config/scenes';

export const AppProvider = ({ children }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [appMode, setAppMode] = useState('ambient');
  
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
      updateClockFormat,
      updateFocusTime,
      updateShortBreakTime,
    }), [
      getCurrentScene,
      getSceneByIndex,
      currentSceneIndex,
      isLoading,
      appMode,
      clockFormat,
      focusTime,
      shortBreakTime,
      updateClockFormat,
      updateFocusTime,
      updateShortBreakTime,
    ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

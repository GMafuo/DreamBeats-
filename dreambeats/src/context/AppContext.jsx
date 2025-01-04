import { createContext, useContext, useState, useCallback } from 'react';
import { SCENES } from '../config/scenes';

const AppContext = createContext();

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

  const getCurrentScene = useCallback(() => {
    return SCENES[currentSceneIndex];
  }, [currentSceneIndex]);

  const updateClockFormat = (format) => {
    setClockFormat(format);
    localStorage.setItem('clockFormat', format);
  };

  const updateFocusTime = (time) => {
    setFocusTime(time);
    localStorage.setItem('focusTime', time.toString());
  };

  const updateShortBreakTime = (time) => {
    setShortBreakTime(time);
    localStorage.setItem('shortBreakTime', time.toString());
  };

  return (
    <AppContext.Provider value={{ 
      getCurrentScene, 
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
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext); 
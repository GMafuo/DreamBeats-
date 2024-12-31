import { createContext, useContext, useState, useCallback } from 'react';
import { SCENES } from '../config/scenes';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentScene = useCallback(() => {
    return SCENES[currentSceneIndex];
  }, [currentSceneIndex]);

  return (
    <AppContext.Provider value={{ 
      getCurrentScene, 
      currentSceneIndex, 
      setCurrentSceneIndex,
      isLoading,
      setIsLoading 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext); 
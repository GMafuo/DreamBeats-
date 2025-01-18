import { AppProvider } from './context/AppContext';
import Background from './components/Background/Background';
import Controls from './components/Controls/Controls';
import SceneSelector from './components/SceneSelector/SceneSelector';
import ModeToggle from './components/ModeToggle/ModeToggle';
import FocusMode from './components/FocusMode/FocusMode';
import { useAppContext } from './context/AppContext';
import logo from './assets/dreambeats-logo.png';
import './App.css';
import { useEffect } from 'react';

function AppContent() {
  const { appMode, setAppMode } = useAppContext();

  useEffect(() => {
    document.title = appMode === 'ambient' 
      ? 'DreamBeats~' 
      : 'DreamBeats~ | Focus Mode';
  }, [appMode]);

  return (
    <div className="dreambeats">
      <img 
        src={logo} 
        alt="DreamBeats"
        className="main-logo"
      />
      {appMode === 'ambient' ? (
        <>
          <Background />
          <Controls />
          <SceneSelector />
        </>
      ) : (
        <FocusMode />
      )}
      <ModeToggle 
        currentMode={appMode}
        onModeChange={setAppMode}
      />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

import { AppProvider } from './context/AppContext';
import Background from './components/Background/Background';
import Controls from './components/Controls/Controls';
import SceneSelector from './components/SceneSelector/SceneSelector';
import ModeToggle from './components/ModeToggle/ModeToggle';
import FocusMode from './components/FocusMode/FocusMode';
import { useAppContext } from './context/AppContext';

function AppContent() {
  const { appMode, setAppMode } = useAppContext();

  return (
    <div className="dreambeats">
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
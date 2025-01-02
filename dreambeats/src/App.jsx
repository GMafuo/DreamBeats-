import { AppProvider } from './context/AppContext';
import Background from './components/Background/Background';
import Controls from './components/Controls/Controls';
import SceneSelector from './components/SceneSelector/SceneSelector';

function App() {
  return (
    <AppProvider>
      <div className="dreambeats">
        <Background />
        <Controls />
        <SceneSelector />
      </div>
    </AppProvider>
  );
}

export default App;

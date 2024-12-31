import { AppProvider } from './context/AppContext';
import Background from './components/Background/Background';
import Controls from './components/Controls/Controls';

function App() {
  return (
    <AppProvider>
      <Background />
      <Controls />
    </AppProvider>
  );
}

export default App;

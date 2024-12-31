import { AppProvider } from './context/AppContext';
import Background from './components/Background/Background';

function App() {
  return (
    <AppProvider>
      <Background />
      {/* Votre contenu principal ici */}
    </AppProvider>
  );
}

export default App;

import { Routes, Route, Navigate } from 'react-router-dom';
import Listagem from './pages/Listagem';
import Detalhes from './pages/Detalhes';
import Ata from './pages/Ata';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/listagem" replace />} />
      <Route path="/listagem" element={<Listagem />} />
      <Route path="/detalhes/:id" element={<Detalhes />} />
      <Route path="/ata/:id" element={<Ata />} />
    </Routes>
  );
}

export default App;

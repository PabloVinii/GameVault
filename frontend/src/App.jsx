import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import GameDetail from './pages/GameDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/game/:id" element={<GameDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

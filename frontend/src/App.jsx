import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FinMateAI from './components/Landing';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<FinMateAI />} />
      </Routes>
    </BrowserRouter>
  );
}

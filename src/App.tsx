import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import { DiagnosticPage } from './pages/DiagnosticPage';
import { ResultPage } from './pages/ResultPage';
import { ProfilePage } from './pages/ProfilePage'; // ← ДОБАВЛЕНО

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />} />
        <Route path="/dashboard" element={isLoggedIn ? <DashboardPage onLogout={() => setIsLoggedIn(false)} /> : <Navigate to="/login" replace />} />
        <Route path="/tasks" element={isLoggedIn ? <TasksPage /> : <Navigate to="/login" replace />} />
        <Route path="/diagnostic" element={isLoggedIn ? <DiagnosticPage /> : <Navigate to="/login" replace />} />
        <Route path="/result" element={isLoggedIn ? <ResultPage /> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" replace />} /> {/* ← ДОБАВЛЕНО */}
        <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

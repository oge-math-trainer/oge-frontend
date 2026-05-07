import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import { DiagnosticPage } from "./pages/DiagnosticPage";
import { ResultPage } from "./pages/ResultPage";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";

type DiagnosticAnswer = {
  taskId: number;
  answer: string;
};

function AppRoutes() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<DiagnosticAnswer[]>([]);
  const navigate = useNavigate();

  function handleLoginSuccess() {
    setIsLoggedIn(true);
    navigate("/dashboard");
  }

  function handleLogout() {
    setIsLoggedIn(false);
    navigate("/login");
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route
        path="/login"
        element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
      />

      <Route
        path="/dashboard"
        element={
          isLoggedIn ? (
            <DashboardPage onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/diagnostic"
        element={
          isLoggedIn ? (
            <DiagnosticPage
              onFinish={(answers) => {
                setDiagnosticAnswers(answers);
                navigate("/result");
              }}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/result"
        element={
          isLoggedIn ? (
            <ResultPage
              answers={diagnosticAnswers}
              onRestart={() => navigate("/diagnostic")}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/profile"
        element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/tasks"
        element={isLoggedIn ? <TasksPage /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
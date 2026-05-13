import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import { DiagnosticPage } from "./pages/DiagnosticPage";
import { ResultPage } from "./pages/ResultPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import type { DiagnosticSubmitResponse } from "./api/diagnostic";

function AppRoutes() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("auth_token"))
  );
  const [diagnosticResult, setDiagnosticResult] =
    useState<DiagnosticSubmitResponse | null>(null);

  const navigate = useNavigate();

  function handleLoginSuccess() {
    setIsLoggedIn(true);
    navigate("/dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_email");
    setIsLoggedIn(false);
    setDiagnosticResult(null);
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
        path="/register"
        element={<RegisterPage onRegisterSuccess={handleLoginSuccess} />}
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
              onFinish={(result) => {
                setDiagnosticResult(result);
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
              result={diagnosticResult}
              onRestart={() => {
                setDiagnosticResult(null);
                navigate("/diagnostic");
              }}
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

      <Route path="*" element={<Navigate to="/" replace />} />
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
import { useState } from "react";
import { login } from "../api/auth";
import "./LoginPage.css";

type LoginPageProps = {
  onLoginSuccess: () => void;
};

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    // 1. Сохраняем ответ от login()
    const response = await login(email, password);
    
    // 2. Сохраняем токен в localStorage (это важно!)
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    // 3. Теперь можно переключать состояние
    onLoginSuccess();
    
  } catch (err) {
    console.error('Login error:', err);
    setError("Не удалось войти. Проверь email и пароль.");
  } finally {
    setIsLoading(false);
  }
}

  return (
    <main className="login-page">
      <section className="login-card">
        <p className="login-label">ОГЭ по математике</p>

        <h1>Вход</h1>

        <p className="login-subtitle">
          Войди в аккаунт и продолжи подготовку.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Почта"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Вход..." : "Войти"}
          </button>
        </form>
      </section>
    </main>
  );
}
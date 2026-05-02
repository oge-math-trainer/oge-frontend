import { useState } from "react";
import { login } from "../api/auth";
import "./LoginPage.css";

type LoginPageProps = {
  onLoginSuccess: () => void;
};

export function LoginPage({ onLoginSuccess }: LoginPageProps) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

   try {
  // TODO: Раскомментировать, когда Алиса сделает бэкенд
  // await login(email, password);
  
  // МОК-авторизация для тестов:
  await new Promise(resolve => setTimeout(resolve, 300)); // имитация задержки
  
  onLoginSuccess(); // ← ЭТО ДОЛЖНО ОСТАТЬСЯ! Обязательно!
} catch {
  setError("Не удалось войти. Проверь email и пароль.");
}
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Вход</h1>
        <p className="login-subtitle">Войди, чтобы продолжить тренировку</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email
            <input
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => {
  setEmail(e.target.value);
  setError("");
}}
              required
            />
          </label>

          <label>
            Пароль
            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => {
  setPassword(e.target.value);
  setError("");
}}
              required
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Входим..." : "Войти"}
          </button>
        </form>
      </section>
    </main>
  );
}

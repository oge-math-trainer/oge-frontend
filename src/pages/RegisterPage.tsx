import { useState } from "react";
import { Link } from "react-router-dom";
import { register } from "../api/auth";
import "./RegisterPage.css";

type RegisterPageProps = {
  onRegisterSuccess: () => void;
};

export function RegisterPage({ onRegisterSuccess }: RegisterPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await register(email, password);
      onRegisterSuccess();
    } catch {
      setError("Не удалось зарегистрироваться");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="register-page">
      <section className="register-card">
        <p className="register-label">ОГЭ по математике</p>

        <h1>Регистрация</h1>

        <p className="register-subtitle">
          Создай аккаунт и начни подготовку.
        </p>

        <form className="register-form" onSubmit={handleSubmit}>
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

          <input
            type="password"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && <p className="register-error">{error}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        <div className="login-section">
          <p>Уже есть учётная запись?</p>

          <Link to="/login">Войти</Link>
        </div>
      </section>
    </main>
  );
}
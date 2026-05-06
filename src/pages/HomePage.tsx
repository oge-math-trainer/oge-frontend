import { Link } from "react-router-dom";
import "./HomePage.css";

export function HomePage() {
  return (
    <main className="home-page">
      <section className="home-card">
        <p className="home-label">ОГЭ по математике</p>

        <h1>Тренажёр для подготовки к ОГЭ</h1>

        <p className="home-subtitle">
          Решай задания, проходи диагностику, получай подсказки и отслеживай
          прогресс в личном кабинете.
        </p>

        <div className="home-features">
          <div>Диагностика слабых тем</div>
          <div>Тренировка заданий 6–19</div>
          <div>Подсказки и объяснения</div>
        </div>

        <Link className="home-button" to="/login">
          Перейти ко входу
        </Link>
      </section>
    </main>
  );
}
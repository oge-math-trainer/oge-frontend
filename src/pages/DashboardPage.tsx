import "./DashboardPage.css";
import { Link } from "react-router-dom";
import "./DashboardPage.css";
type DashboardPageProps = {
  onLogout: () => void;
};

export function DashboardPage({ onLogout }: DashboardPageProps) {
  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <div>
          <p className="dashboard-label">ОГЭ по математике</p>
          <h1>Добро пожаловать</h1>
          <p className="dashboard-subtitle">
            Начни тренировку и постепенно улучшай результат.
          </p>
        </div>

        <div className="dashboard-progress">
          <div>
            <span>Прогресс</span>
            <strong>0%</strong>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" />
          </div>
        </div>

        <div className="dashboard-actions">
          <Link className="dashboard-primary-link" to="/tasks">
  Начать тренировку
</Link>
<Link className="dashboard-secondary-link" to="/diagnostic">
  Пройти диагностику
</Link>
          <button type="button" className="secondary-button" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </section>
    </main>
  );
}
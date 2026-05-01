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
          <button type="button">Начать тренировку</button>
          <button type="button" className="secondary-button" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </section>
    </main>
  );
}
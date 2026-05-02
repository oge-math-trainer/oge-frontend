import "./ProfilePage.css";

const weakTopics = [
  { title: "Уравнения", progress: 35 },
  { title: "Проценты", progress: 45 },
  { title: "Геометрия", progress: 30 },
];

export function ProfilePage() {
  const totalProgress = 42;

  return (
    <main className="profile-page">
      <section className="profile-card">
        <p className="profile-label">Личный кабинет</p>

        <h1>Твой прогресс</h1>

        <p className="profile-subtitle">
          Здесь видно, какие темы уже получаются, а какие стоит потренировать.
        </p>

        {/* Общий прогресс */}
        <div className="profile-summary">
          <div className="summary-header">
            <span>Общий прогресс</span>
            <strong>{totalProgress}%</strong>
          </div>

          <div className="profile-progress">
            <div
              className="profile-progress-fill"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* Слабые темы */}
        <div className="weak-topics">
          <h2>Слабые темы</h2>

          {weakTopics.map((topic) => (
            <div className="topic-item" key={topic.title}>
              <div className="topic-header">
                <span>{topic.title}</span>
                <strong>{topic.progress}%</strong>
              </div>

              <div className="topic-progress">
                <div
                  className="topic-progress-fill"
                  style={{ width: `${topic.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <button>Продолжить тренировку</button>
      </section>
    </main>
  );
}
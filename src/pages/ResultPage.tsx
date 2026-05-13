import { Link } from "react-router-dom";
import type { DiagnosticSubmitResponse } from "../api/diagnostic";
import "./ResultPage.css";

type ResultPageProps = {
  result: DiagnosticSubmitResponse | null;
  onRestart: () => void;
};

export function ResultPage({ result, onRestart }: ResultPageProps) {
  // Если результата нет (например, прямой переход на /result без диагностики)
  if (!result) {
    return (
      <main className="result-page">
        <section className="result-card">
          <h1>Нет результатов</h1>
          <p className="result-subtitle">
            Сначала пройди диагностику.
          </p>
          <div className="result-actions">
            <button
              type="button"
              className="result-secondary"
              onClick={onRestart}
            >
              Пройти диагностику
            </button>
          </div>
        </section>
      </main>
    );
  }

  const answers = result.answers ?? [];

  const solvedCount = answers.filter((a) => a.is_correct === true).length;
  const skippedCount = answers.filter(
    (a) => !a.student_answer || !a.student_answer.trim()
  ).length;
  const wrongCount = answers.length - solvedCount - skippedCount;

  return (
    <main className="result-page">
      <section className="result-card">
        <h1>Диагностика завершена</h1>

        <p className="result-subtitle">
          Вот краткая статистика по твоим ответам.
        </p>

        <div className="result-stats">
          <div className="result-stat-item">
            <span>Решено верно</span>
            <strong>{solvedCount}</strong>
          </div>

          <div className="result-stat-item">
            <span>Неверно</span>
            <strong>{wrongCount}</strong>
          </div>

          <div className="result-stat-item">
            <span>Пропущено</span>
            <strong>{skippedCount}</strong>
          </div>
        </div>

        {result.analysis?.summary && (
          <div className="result-analysis">
            <h2>🤖 Анализ от ИИ</h2>
            <p>{result.analysis.summary}</p>
          </div>
        )}

        {result.analysis?.weak_topics &&
          result.analysis.weak_topics.length > 0 && (
            <div className="result-analysis">
              <h2>📚 Слабые темы</h2>
              <ul className="weak-topics-list">
                {result.analysis.weak_topics.map((topic, index) => (
                  <li key={`${topic}-${index}`}>{topic}</li>
                ))}
              </ul>
            </div>
          )}

        <div className="result-list">
          <h2>Ответы по заданиям</h2>

          <div className="result-list-grid">
            {answers.map((task, index) => {
              const isSkipped =
                !task.student_answer || !task.student_answer.trim();
              const isCorrect = task.is_correct === true;

              return (
                <div
                  key={`${task.task_id}-${index}`}
                  className={`result-task-item ${
                    isSkipped ? "skipped" : isCorrect ? "correct" : "wrong"
                  }`}
                >
                  <span>Задание №{index + 1}</span>

                  <strong>
                    {isSkipped ? "Пропущено" : isCorrect ? "Верно" : "Неверно"}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>

        <div className="result-actions">
          <Link className="result-profile-link" to="/profile">
            Перейти в профиль
          </Link>

          <button
            type="button"
            className="result-secondary"
            onClick={onRestart}
          >
            Пройти диагностику заново
          </button>
        </div>
      </section>
    </main>
  );
}
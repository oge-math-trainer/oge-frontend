import { Link } from "react-router-dom";
import "./ResultPage.css";

type ResultPageProps = {
  answers: { taskId: number; answer: string }[];
  onRestart: () => void;
};

const totalTasks = 14;

const correctAnswers: Record<number, string> = {
  1: "28",
  2: "12",
  3: "30",
  4: "8",
  5: "0.5",
  6: "9",
  7: "54",
  8: "8",
  9: "15",
  10: "28",
  11: "5",
  12: "8",
  13: "180",
  14: "15",
};

export function ResultPage({
  answers,
  onRestart,
}: ResultPageProps) {
  const answeredTasks = answers.filter(
    (item) => item.answer.trim()
  );

  const solvedCount = answeredTasks.length;
  const skippedCount = totalTasks - solvedCount;

  const taskResults = Array.from(
    { length: totalTasks },
    (_, index) => {
      const taskId = index + 1;

      const userAnswer =
        answers.find(
          (item) => item.taskId === taskId
        )?.answer ?? "";

      const isSkipped = !userAnswer.trim();

      const isCorrect =
        !isSkipped &&
        userAnswer.trim().replace(",", ".") ===
          correctAnswers[taskId];

      return {
        taskId,
        isSkipped,
        isCorrect,
      };
    }
  );

  return (
    <main className="result-page">
      <section className="result-card">
        <h1>Диагностика завершена</h1>

        <p className="result-subtitle">
          Вот краткая статистика по твоим ответам.
        </p>

        <div className="result-stats">
          <div className="result-stat-item">
            <span>Решено</span>
            <strong>{solvedCount}</strong>
          </div>

          <div className="result-stat-item">
            <span>Пропущено</span>
            <strong>{skippedCount}</strong>
          </div>
        </div>

        <div className="result-list">
          <h2>Ответы по заданиям</h2>

          <div className="result-list-grid">
            {taskResults.map((task) => (
              <div
                key={task.taskId}
                className={`result-task-item ${
                  task.isSkipped
                    ? "skipped"
                    : task.isCorrect
                    ? "correct"
                    : "wrong"
                }`}
              >
                <span>
                  Задание №{task.taskId}
                </span>

                <strong>
                  {task.isSkipped
                    ? "Пропущено"
                    : task.isCorrect
                    ? "Верно"
                    : "Неверно"}
                </strong>
              </div>
            ))}
          </div>
        </div>

        <div className="result-actions">
          <Link
            className="result-profile-link"
            to="/profile"
          >
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
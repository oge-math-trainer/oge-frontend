import { useEffect, useState } from "react";
import {
  generateTask,
  checkAnswer,
  getHint,
  getExplanation,
  type GeneratedTask,
} from "../api/tasks";
import "./TasksPage.css";

type PageStatus = "loading" | "ready" | "error";
type CheckStatus = "idle" | "checking" | "success" | "error";

export default function TasksPage() {
  const [task, setTask] = useState<GeneratedTask | null>(null);
  const [answer, setAnswer] = useState("");
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
  const [checkStatus, setCheckStatus] = useState<CheckStatus>("idle");

  const [feedback, setFeedback] = useState("");
  const [hint, setHint] = useState("");
  const [explanation, setExplanation] = useState<string[]>([]);

  async function loadTask() {
    setPageStatus("loading");
    setAnswer("");
    setFeedback("");
    setHint("");
    setExplanation([]);
    setCheckStatus("idle");

    try {
      const newTask = await generateTask("all");
      setTask(newTask);
      setPageStatus("ready");
    } catch (error) {
      console.error("Generate task error:", error);
      setPageStatus("error");
    }
  }

  async function handleCheck() {
    if (!task || !answer.trim()) return;

    setCheckStatus("checking");
    setFeedback("");

    try {
      const result = await checkAnswer(task.id, answer);

      setFeedback(result.short_feedback);
      setCheckStatus(result.is_correct ? "success" : "error");
    } catch (error) {
      console.error("Check answer error:", error);
      setFeedback("Не удалось проверить ответ.");
      setCheckStatus("error");
    }
  }

  async function handleHint() {
    if (!task) return;

    try {
      const result = await getHint(task.id);
      setHint(result.hint);
    } catch (error) {
      console.error("Hint error:", error);
      setHint("Не удалось получить подсказку.");
    }
  }

  async function handleExplanation() {
    if (!task) return;

    try {
      const result = await getExplanation(task.id);

      if (result.steps?.length) {
        setExplanation(result.steps);
      } else {
        setExplanation([result.explanation]);
      }
    } catch (error) {
      console.error("Explanation error:", error);
      setExplanation(["Не удалось получить объяснение."]);
    }
  }

  useEffect(() => {
    loadTask();
  }, []);

  if (pageStatus === "loading") {
    return (
      <main className="tasks-page">
        <section className="task-card">
          <h1 className="tasks-title">Тренировка</h1>
          <p className="task-hint">ИИ генерирует задание...</p>
        </section>
      </main>
    );
  }

  if (pageStatus === "error") {
    return (
      <main className="tasks-page">
        <section className="task-card">
          <h1 className="tasks-title">Тренировка</h1>
          <p className="status-message error">
            Не удалось загрузить задание. Возможно, AI-сервис временно недоступен.
          </p>

          <button className="action-button" onClick={loadTask}>
            Попробовать снова
          </button>
        </section>
      </main>
    );
  }

  if (!task) return null;

  return (
    <main className="tasks-page">
      <header className="tasks-header">
        <h1 className="tasks-title">Тренировка</h1>

        <div className="mode-selector">
          <button className="mode-button">Слабые темы</button>
          <button className="mode-button active">Все задания</button>
          <button className="mode-button">Выбрать</button>
        </div>
      </header>

      <section className="task-card">
        <div className="ai-badge">🤖 Задание от ИИ</div>

        <p className="task-hint">Задание №{task.oge_number}</p>

        <h2 className="task-condition">{task.question}</h2>

        <div className="answer-section">
          <input
            className="task-input"
            type="text"
            placeholder="Введите ответ"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setFeedback("");
              setCheckStatus("idle");
            }}
          />

          <button
            className="action-button"
            onClick={handleCheck}
            disabled={!answer.trim() || checkStatus === "checking"}
          >
            {checkStatus === "checking" ? "ИИ проверяет..." : "Проверить"}
          </button>

          <div className="task-actions">
            <button className="action-button secondary-button" onClick={handleHint}>
              Подсказка
            </button>

            {(checkStatus === "success" || checkStatus === "error") && (
              <button
                className="action-button secondary-button explain-button"
                onClick={handleExplanation}
              >
                Объяснение
              </button>
            )}
          </div>

          {feedback && (
            <p
              className={
                checkStatus === "success"
                  ? "status-message success"
                  : "status-message error"
              }
            >
              {feedback}
            </p>
          )}

          {checkStatus === "success" && (
            <button className="action-button" onClick={loadTask}>
              Следующее задание
            </button>
          )}
        </div>

        {hint && (
          <div className="ai-panel hint-panel">
            <h3>💡 Подсказка</h3>
            <p>{hint}</p>
          </div>
        )}

        {explanation.length > 0 && (
          <div className="ai-panel explain-panel">
            <h3>📘 Объяснение</h3>

            <ol>
              {explanation.map((step, index) => (
                <li key={`${step}-${index}`}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </main>
  );
}
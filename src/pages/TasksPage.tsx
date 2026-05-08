import { useState } from "react";
import "./TasksPage.css";

type AiStatus = "idle" | "loading" | "success" | "error";

const task = {
  id: 1,
  number: 9,
  question: "Решите уравнение: 3x + 7 = 22",
  correctAnswer: "5",
};

export default function TasksPage() {
  const [answer, setAnswer] = useState("");
  const [checkStatus, setCheckStatus] = useState<AiStatus>("idle");
  const [hintStatus, setHintStatus] = useState<AiStatus>("idle");
  const [explainStatus, setExplainStatus] = useState<AiStatus>("idle");

  const [feedback, setFeedback] = useState("");
  const [hint, setHint] = useState("");
  const [explanation, setExplanation] = useState<string[]>([]);

  function resetAiBlocks() {
    setFeedback("");
    setHint("");
    setExplanation([]);
    setCheckStatus("idle");
    setHintStatus("idle");
    setExplainStatus("idle");
  }

  async function handleCheck() {
    if (!answer.trim()) return;

    setCheckStatus("loading");
    setFeedback("");

    await new Promise((resolve) => setTimeout(resolve, 900));

    if (answer.trim() === task.correctAnswer) {
      setCheckStatus("success");
      setFeedback("Верно! Отличная работа.");
    } else {
      setCheckStatus("error");
      setFeedback("Ответ не совпал. Попробуй ещё раз или возьми подсказку.");
    }
  }

  async function handleHint() {
    setHintStatus("loading");
    setHint("");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setHintStatus("success");
    setHint("Перенеси 7 в правую часть уравнения, изменив знак.");
  }

  async function handleExplain() {
    setExplainStatus("loading");
    setExplanation([]);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setExplainStatus("success");
    setExplanation([
      "3x + 7 = 22",
      "3x = 22 − 7",
      "3x = 15",
      "x = 5",
    ]);
  }

  function handleNextTask() {
    setAnswer("");
    resetAiBlocks();
  }

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
        <div className="ai-badge">🤖 Проверено ИИ</div>

        <p className="task-hint">Задание №{task.number}</p>

        <h2 className="task-condition">{task.question}</h2>

        <div className="answer-section">
  <input
    className="task-input"
    type="text"
    placeholder="Введите ответ"
    value={answer}
    onChange={(e) => {
      setAnswer(e.target.value);
      resetAiBlocks();
    }}
  />

  <button
    className="action-button"
    onClick={handleCheck}
    disabled={!answer.trim() || checkStatus === "loading"}
  >
    {checkStatus === "loading" ? "ИИ проверяет..." : "Проверить"}
  </button>

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
    <button
      className="action-button secondary-button"
      onClick={handleNextTask}
    >
      Следующее задание
    </button>
  )}

  <div className="task-actions">
    <button
      className="action-button secondary-button"
      onClick={handleHint}
      disabled={hintStatus === "loading"}
    >
      {hintStatus === "loading" ? "ИИ думает..." : "Подсказка"}
    </button>

    {(checkStatus === "error" || checkStatus === "success") && (
      <button
  className="action-button secondary-button explain-button"
  onClick={handleExplain}
        disabled={explainStatus === "loading"}
      >
        {explainStatus === "loading"
          ? "Готовим объяснение..."
          : "Объяснение"}
      </button>
    )}
  </div>
</div>

        {hintStatus === "loading" && (
          <div className="ai-panel">
            <h3>💡 Подсказка</h3>
            <p>ИИ подбирает наводящую подсказку...</p>
          </div>
        )}

        {hint && (
          <div className="ai-panel hint-panel">
            <h3>💡 Подсказка</h3>
            <p>{hint}</p>
          </div>
        )}

        {explainStatus === "loading" && (
          <div className="ai-panel">
            <h3>📘 Объяснение</h3>
            <p>ИИ формирует пошаговое решение...</p>
          </div>
        )}

        {explanation.length > 0 && (
          <div className="ai-panel explain-panel">
            <h3>📘 Объяснение</h3>

            <ol>
              {explanation.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </main>
  );
}
import { useEffect, useState } from "react";
import {
  startDiagnostic,
  submitDiagnostic,
  type DiagnosticTask,
} from "../api/diagnostic";
import "./DiagnosticPage.css";

type DiagnosticAnswer = {
  taskId: number;
  answer: string;
};

type DiagnosticPageProps = {
  onFinish: (answers: DiagnosticAnswer[]) => void;
};

export function DiagnosticPage({ onFinish }: DiagnosticPageProps) {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [diagnosticTasks, setDiagnosticTasks] = useState<DiagnosticTask[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<DiagnosticAnswer[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [showFinishModal, setShowFinishModal] = useState(false);

  const currentTask = diagnosticTasks[currentIndex];
  const isLastTask = currentIndex === diagnosticTasks.length - 1;

  async function loadDiagnostic() {
    setIsLoading(true);
    setError("");

    try {
      const data = await startDiagnostic();

      setSessionId(data.session_id);
      setDiagnosticTasks(data.tasks);
      setCurrentIndex(0);
      setAnswer("");
      setAnswers([]);
    } catch (err) {
      console.error("Start diagnostic error:", err);
      setError("Не удалось загрузить диагностику. Возможно, AI-сервис временно недоступен.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDiagnostic();
  }, []);

  function saveCurrentAnswer() {
    if (!currentTask) {
      return answers;
    }

    const currentAnswer = {
      taskId: currentTask.id,
      answer,
    };

    const answerExists = answers.some((item) => item.taskId === currentTask.id);

    if (answerExists) {
      return answers.map((item) =>
        item.taskId === currentTask.id ? currentAnswer : item
      );
    }

    return [...answers, currentAnswer];
  }

  function getSavedAnswer(taskId: number, list: DiagnosticAnswer[]) {
    return list.find((item) => item.taskId === taskId)?.answer ?? "";
  }

  function goToTask(index: number) {
    const updatedAnswers = saveCurrentAnswer();
    const selectedTask = diagnosticTasks[index];

    setAnswers(updatedAnswers);
    setAnswer(getSavedAnswer(selectedTask.id, updatedAnswers));
    setCurrentIndex(index);
  }

  function handleNext() {
    const updatedAnswers = saveCurrentAnswer();

    if (isLastTask) {
      setAnswers(updatedAnswers);
      setShowFinishModal(true);
      return;
    }

    const nextTask = diagnosticTasks[currentIndex + 1];

    setAnswers(updatedAnswers);
    setAnswer(getSavedAnswer(nextTask.id, updatedAnswers));
    setCurrentIndex(currentIndex + 1);
  }

  async function handleConfirmFinish() {
    if (!sessionId) return;

    const updatedAnswers = saveCurrentAnswer();

    const preparedAnswers = updatedAnswers
      .filter((item) => item.answer.trim())
      .map((item) => ({
        task_id: item.taskId,
        student_answer: item.answer,
      }));

    setIsSubmitting(true);

    try {
      await submitDiagnostic(sessionId, preparedAnswers);
      onFinish(updatedAnswers);
    } catch (err) {
      console.error("Submit diagnostic error:", err);
      setError("Не удалось завершить диагностику. Попробуй ещё раз.");
      setShowFinishModal(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="diagnostic-page">
        <section className="diagnostic-card">
          <p className="diagnostic-label">Диагностика</p>
          <h1>ИИ готовит задания...</h1>
        </section>
      </main>
    );
  }

  if (error && diagnosticTasks.length === 0) {
    return (
      <main className="diagnostic-page">
        <section className="diagnostic-card">
          <p className="diagnostic-label">Диагностика</p>
          <h1>Не удалось загрузить диагностику</h1>
          <p className="diagnostic-error">{error}</p>

          <button type="button" onClick={loadDiagnostic}>
            Попробовать снова
          </button>
        </section>
      </main>
    );
  }

  if (!currentTask) return null;

  const savedAnswers = saveCurrentAnswer();
  const answeredCount = savedAnswers.filter((item) => item.answer.trim()).length;
  const hasUnansweredTasks = answeredCount < diagnosticTasks.length;

  return (
    <main className="diagnostic-page">
      <section className="diagnostic-card">
        <div className="diagnostic-header">
          <p className="diagnostic-label">Диагностика</p>
          <span>
            {currentIndex + 1} / {diagnosticTasks.length}
          </span>
        </div>

        <div className="diagnostic-progress">
          <div
            className="diagnostic-progress-fill"
            style={{
              width: `${((currentIndex + 1) / diagnosticTasks.length) * 100}%`,
            }}
          />
        </div>

        <div className="diagnostic-navigation">
          {diagnosticTasks.map((task, index) => {
            const isActive = currentIndex === index;
            const isAnswered =
              getSavedAnswer(task.id, answers).trim().length > 0 ||
              (isActive && answer.trim().length > 0);

            return (
              <button
                key={task.id}
                type="button"
                className={`diagnostic-nav-button ${isActive ? "active" : ""} ${
                  isAnswered ? "answered" : ""
                }`}
                onClick={() => goToTask(index)}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {error && <p className="diagnostic-error">{error}</p>}

        <p className="task-number">Задание №{currentTask.oge_number}</p>

        <div className="task-question">{currentTask.question}</div>

        <label className="answer-field">
          Ваш ответ
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Введите ответ"
          />
        </label>

        <button type="button" onClick={handleNext}>
          {isLastTask ? "Завершить диагностику" : "Следующее задание"}
        </button>
      </section>

      {showFinishModal && (
        <div className="modal-overlay">
          <div className="finish-modal">
            <h3>
              {hasUnansweredTasks
                ? "У тебя есть нерешённые задания"
                : "Завершить диагностику?"}
            </h3>

            <p>
              {hasUnansweredTasks
                ? "Ты действительно хочешь завершить диагностику? Нерешённые задания не будут учитываться."
                : "После завершения ты перейдёшь к результату диагностики."}
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-secondary-button"
                onClick={() => setShowFinishModal(false)}
                disabled={isSubmitting}
              >
                Продолжить решать
              </button>

              <button
                type="button"
                className="modal-primary-button"
                onClick={handleConfirmFinish}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Завершаем..." : "Завершить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
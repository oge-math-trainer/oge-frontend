import { useEffect, useRef, useState } from "react";
import {
  loadNextDiagnosticTask,
  startDiagnostic,
  submitDiagnostic,
  type DiagnosticTask,
  type DiagnosticSubmitResponse,
} from "../api/diagnostic";
import "./DiagnosticPage.css";
import { MathContent } from "../components/MathContent";

type DiagnosticAnswer = {
  taskId: number;
  answer: string;
};

type DiagnosticPageProps = {
  onFinish: (result: DiagnosticSubmitResponse) => void;
};

export function DiagnosticPage({ onFinish }: DiagnosticPageProps) {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [diagnosticTasks, setDiagnosticTasks] = useState<DiagnosticTask[]>([]);
  const diagnosticTasksRef = useRef<DiagnosticTask[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<DiagnosticAnswer[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalTasks, setTotalTasks] = useState(14);
  const [isDiagnosticComplete, setIsDiagnosticComplete] = useState(false);
  const [error, setError] = useState("");
  const [nextError, setNextError] = useState("");

  const [showFinishModal, setShowFinishModal] = useState(false);
  const isLoadingNextRef = useRef(false);
  const isDiagnosticCompleteRef = useRef(false);
  const isFinishingRef = useRef(false);
  const didAutoLoadRef = useRef(false);

  const currentTask = diagnosticTasks[currentIndex];
  const hasGeneratedNextTask = currentIndex + 1 < diagnosticTasks.length;
  const shouldWaitForNextTask =
    !hasGeneratedNextTask && !isDiagnosticComplete && isLoadingNext;

  function applyDiagnosticTasks(nextTasks: DiagnosticTask[]) {
    diagnosticTasksRef.current = nextTasks;
    setDiagnosticTasks(nextTasks);
  }

  function appendGeneratedTask(task: DiagnosticTask) {
    const currentTasks = diagnosticTasksRef.current;
    const existingIndex = currentTasks.findIndex((item) => item.id === task.id);

    if (existingIndex >= 0) {
      return existingIndex;
    }

    const nextTasks = [...currentTasks, task];
    applyDiagnosticTasks(nextTasks);
    return nextTasks.length - 1;
  }

  async function requestNextTask(
    currentSessionId: number,
    options: { openWhenReady?: boolean } = {}
  ) {
    if (isLoadingNextRef.current || isDiagnosticCompleteRef.current) {
      return;
    }

    isLoadingNextRef.current = true;
    setIsLoadingNext(true);
    setNextError("");

    try {
      const data = await loadNextDiagnosticTask(currentSessionId);
      if (isFinishingRef.current) {
        return;
      }

      setTotalTasks(data.total_tasks);
      setIsDiagnosticComplete(data.complete);
      isDiagnosticCompleteRef.current = data.complete;

      if (data.task) {
        const taskIndex = appendGeneratedTask(data.task);

        if (options.openWhenReady) {
          setCurrentIndex(taskIndex);
          setAnswer("");
        }
      }
    } catch (err) {
      console.error("Next diagnostic task error:", err);
      if (!isFinishingRef.current) {
        setNextError("Не удалось подготовить следующее задание. Можно попробовать ещё раз или завершить диагностику.");
      }
    } finally {
      isLoadingNextRef.current = false;
      setIsLoadingNext(false);
    }
  }

  async function loadDiagnostic() {
    setIsLoading(true);
    setError("");
    setNextError("");
    setIsDiagnosticComplete(false);
    isDiagnosticCompleteRef.current = false;
    isFinishingRef.current = false;
    applyDiagnosticTasks([]);

    try {
      const data = await startDiagnostic();

      setSessionId(data.session_id);
      applyDiagnosticTasks(data.tasks);
      setTotalTasks(data.total_tasks);
      setIsDiagnosticComplete(data.complete);
      isDiagnosticCompleteRef.current = data.complete;
      isFinishingRef.current = false;
      setCurrentIndex(0);
      setAnswer("");
      setAnswers([]);
      setNextError("");

      if (!data.complete) {
        void requestNextTask(data.session_id);
      }
    } catch (err) {
      console.error("Start diagnostic error:", err);
      setError("Не удалось загрузить диагностику. Возможно, AI-сервис временно недоступен.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (didAutoLoadRef.current) {
      return;
    }

    didAutoLoadRef.current = true;
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

  async function handleNext() {
    const updatedAnswers = saveCurrentAnswer();
    setAnswers(updatedAnswers);

    const nextTask = diagnosticTasks[currentIndex + 1];
    if (nextTask) {
      setAnswer(getSavedAnswer(nextTask.id, updatedAnswers));
      setCurrentIndex(currentIndex + 1);

      if (
        sessionId &&
        currentIndex + 2 >= diagnosticTasks.length &&
        !isDiagnosticCompleteRef.current
      ) {
        void requestNextTask(sessionId);
      }

      return;
    }

    if (sessionId && !isDiagnosticCompleteRef.current) {
      if (isLoadingNextRef.current) {
        return;
      }

      await requestNextTask(sessionId, { openWhenReady: true });
      return;
    }

    setShowFinishModal(true);
  }

  function handleFinishClick() {
    setAnswers(saveCurrentAnswer());
    setShowFinishModal(true);
  }

  function retryNextTask() {
    if (!sessionId) {
      return;
    }

    void requestNextTask(sessionId);
  }

  function getNextButtonLabel() {
    if (hasGeneratedNextTask) {
      return "Следующее задание";
    }

    if (!isDiagnosticComplete) {
      return isLoadingNext ? "Готовим следующее..." : "Сгенерировать следующее";
    }

    return "Завершить диагностику";
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
    const result = await submitDiagnostic(sessionId, preparedAnswers);

    // Бэк присылает только проверенные ответы. Дополняем массив пропущенными
    // на основе всех заданий из диагностики, чтобы на /result был полный список.
    const checkedIds = new Set(result.answers?.map((a) => a.task_id) ?? []);

    const skippedAnswers = diagnosticTasks
      .filter((task) => !checkedIds.has(task.id))
      .map((task) => ({
        task_id: task.id,
        oge_number: task.oge_number,
        student_answer: "",
        is_correct: false as boolean | undefined,
        short_feedback: "Задание пропущено",
      }));

    const enrichedResult = {
      ...result,
      answers: [...(result.answers ?? []), ...skippedAnswers],
    };

    onFinish(enrichedResult);
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
  const generatedCount = diagnosticTasks.length;
  const progressTotal = totalTasks > 0 ? totalTasks : generatedCount;
  const progressWidth = Math.min(
    100,
    ((currentIndex + 1) / progressTotal) * 100
  );
  const hasRemainingUnloadedTasks = generatedCount < totalTasks && !isDiagnosticComplete;

  return (
    <main className="diagnostic-page">
      <section className="diagnostic-card">
        <div className="diagnostic-header">
          <p className="diagnostic-label">Диагностика</p>
          <span>
            {currentIndex + 1} / {totalTasks}
          </span>
        </div>

        <div className="diagnostic-progress">
          <div
            className="diagnostic-progress-fill"
            style={{
              width: `${progressWidth}%`,
            }}
          />
        </div>

        <div className="diagnostic-generation-status">
          <span>
            Готово заданий: {generatedCount} из {totalTasks}
          </span>
          {isLoadingNext && <span>ИИ готовит следующее...</span>}
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
        {nextError && (
          <div className="diagnostic-warning">
            <p>{nextError}</p>
            <button type="button" onClick={retryNextTask} disabled={isLoadingNext}>
              Попробовать снова
            </button>
          </div>
        )}

        <p className="task-number">Задание №{currentTask.oge_number}</p>

        <div className="task-question"><MathContent>{currentTask.question}</MathContent></div>

        <label className="answer-field">
          Ваш ответ
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Введите ответ"
          />
        </label>

        <div className="diagnostic-actions">
          <button
            type="button"
            className="diagnostic-primary-button"
            onClick={handleNext}
            disabled={shouldWaitForNextTask || isSubmitting}
          >
            {getNextButtonLabel()}
          </button>

          <button
            type="button"
            className="diagnostic-secondary-button"
            onClick={handleFinishClick}
            disabled={isSubmitting}
          >
            Завершить сейчас
          </button>
        </div>
      </section>

      {showFinishModal && (
        <div className="modal-overlay">
          <div className="finish-modal">
            <h3>
              {hasUnansweredTasks
                ? "У тебя есть нерешённые задания"
                : hasRemainingUnloadedTasks
                ? "Завершить до конца диагностики?"
                : "Завершить диагностику?"}
            </h3>

            <p>
              {hasUnansweredTasks
                ? "Ты действительно хочешь завершить диагностику? Нерешённые задания не будут учитываться."
                : hasRemainingUnloadedTasks
                ? "ИИ ещё не подготовил все задания, но можно завершить диагностику по уже решённым ответам."
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

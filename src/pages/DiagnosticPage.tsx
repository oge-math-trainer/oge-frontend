import { useState } from "react";
import "./DiagnosticPage.css";

const diagnosticTasks = [
  { id: 1, ogeNumber: 6, question: "Найдите значение выражения: 12 + 8 · 2" },
  { id: 2, ogeNumber: 7, question: "Решите уравнение: x + 15 = 27" },
  { id: 3, ogeNumber: 8, question: "Найдите 20% от числа 150" },
  { id: 4, ogeNumber: 9, question: "Решите уравнение: 3x = 24" },
  { id: 5, ogeNumber: 10, question: "Найдите вероятность выпадения чётного числа на кубике" },
  { id: 6, ogeNumber: 11, question: "Функция задана формулой y = 2x + 1. Найдите y при x = 4" },
  { id: 7, ogeNumber: 12, question: "Найдите площадь прямоугольника со сторонами 6 и 9" },
  { id: 8, ogeNumber: 13, question: "Решите неравенство: x - 5 > 3" },
  { id: 9, ogeNumber: 14, question: "Найдите сумму первых пяти натуральных чисел" },
  { id: 10, ogeNumber: 15, question: "Найдите периметр квадрата со стороной 7" },
  { id: 11, ogeNumber: 16, question: "Найдите гипотенузу прямоугольного треугольника с катетами 3 и 4" },
  { id: 12, ogeNumber: 17, question: "Найдите среднее арифметическое чисел 4, 8 и 12" },
  { id: 13, ogeNumber: 18, question: "Сколько градусов в развёрнутом угле?" },
  { id: 14, ogeNumber: 19, question: "Найдите значение выражения: 5² - 10" },
];

type DiagnosticAnswer = {
  taskId: number;
  answer: string;
};

type DiagnosticPageProps = {
  onFinish: (answers: DiagnosticAnswer[]) => void;
};

export function DiagnosticPage({ onFinish }: DiagnosticPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<DiagnosticAnswer[]>([]);
  const [showFinishModal, setShowFinishModal] = useState(false);

  const currentTask = diagnosticTasks[currentIndex];
  const isLastTask = currentIndex === diagnosticTasks.length - 1;

  function saveCurrentAnswer() {
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
      setShowFinishModal(true);
      return;
    }

    const nextTask = diagnosticTasks[currentIndex + 1];

    setAnswers(updatedAnswers);
    setAnswer(getSavedAnswer(nextTask.id, updatedAnswers));
    setCurrentIndex(currentIndex + 1);
  }

  function handleConfirmFinish() {
    const updatedAnswers = saveCurrentAnswer();
    onFinish(updatedAnswers);
  }

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
                className={`diagnostic-nav-button ${
                  isActive ? "active" : ""
                } ${isAnswered ? "answered" : ""}`}
                onClick={() => goToTask(index)}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <p className="task-number">Задание №{currentTask.ogeNumber}</p>

        <div className="task-question">{currentTask.question}</div>

        <label className="answer-field">
          Ваш ответ
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Введите ответ"
          />
        </label>

        <button type="button" onClick={handleNext} disabled={!answer.trim()}>
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
              >
                Продолжить решать
              </button>

              <button
                type="button"
                className="modal-primary-button"
                onClick={handleConfirmFinish}
              >
                Завершить
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
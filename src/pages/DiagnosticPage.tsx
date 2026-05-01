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

  const currentTask = diagnosticTasks[currentIndex];
  const isLastTask = currentIndex === diagnosticTasks.length - 1;

  function handleNext() {
    const nextAnswers = [
      ...answers,
      {
        taskId: currentTask.id,
        answer,
      },
    ];

    setAnswers(nextAnswers);
    setAnswer("");

    if (isLastTask) {
      onFinish(nextAnswers);
      return;
    }

    setCurrentIndex(currentIndex + 1);
  }

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
    </main>
  );
}
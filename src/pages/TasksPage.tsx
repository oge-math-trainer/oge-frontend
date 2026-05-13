import { useEffect, useState } from "react";
import {
  generateTask,
  checkAnswer,
  getHint,
  getExplanation,
  type GeneratedTask,
} from "../api/tasks";
import {
  getRecommendations,
  type Recommendation,
} from "../api/progress";
import { FunctionGraphs } from "../components/FunctionGraphs";
import "./TasksPage.css";
import { MathContent } from "../components/MathContent";

type CheckStatus = "idle" | "checking" | "success" | "error";
type TrainingMode = "weak" | "all" | "custom";

const taskTypes = [
  { ogeNumber: 6, label: "№6. Обыкновенные дроби", subtypeCode: "numbers_fractions" },
  { ogeNumber: 6, label: "№6. Десятичные дроби", subtypeCode: "numbers_decimal" },
  { ogeNumber: 6, label: "№6. Целые числа", subtypeCode: "numbers_integers" },

  { ogeNumber: 7, label: "№7. Числовая прямая", subtypeCode: "numberline_compare" },
  { ogeNumber: 7, label: "№7. Простейшие неравенства", subtypeCode: "inequalities_simple" },

  { ogeNumber: 8, label: "№8. Степени", subtypeCode: "algebra_powers" },
  { ogeNumber: 8, label: "№8. Корни", subtypeCode: "algebra_roots" },
  { ogeNumber: 8, label: "№8. Формулы сокращённого умножения", subtypeCode: "algebra_formulas" },
  { ogeNumber: 8, label: "№8. Алгебраические дроби", subtypeCode: "algebra_fractions" },

  { ogeNumber: 9, label: "№9. Линейные уравнения", subtypeCode: "equations_linear" },
  { ogeNumber: 9, label: "№9. Квадратные уравнения", subtypeCode: "equations_quadratic" },
  { ogeNumber: 9, label: "№9. Дробно-рациональные уравнения", subtypeCode: "equations_rational" },
  { ogeNumber: 9, label: "№9. Системы линейных уравнений", subtypeCode: "equations_system_linear" },
  { ogeNumber: 9, label: "№9. Смешанные системы", subtypeCode: "equations_system_mixed" },

  { ogeNumber: 10, label: "№10. Классическая вероятность", subtypeCode: "probability_classic" },
  { ogeNumber: 10, label: "№10. Дерево вероятностей", subtypeCode: "probability_tree" },

  { ogeNumber: 11, label: "№11. Линейная функция", subtypeCode: "graphs_linear" },
  { ogeNumber: 11, label: "№11. Квадратичная функция", subtypeCode: "graphs_quadratic" },
  { ogeNumber: 11, label: "№11. Обратная пропорциональность", subtypeCode: "graphs_inverse" },
  { ogeNumber: 11, label: "№11. Преобразования графиков", subtypeCode: "graphs_transform" },
  { ogeNumber: 11, label: "№11. Соответствие графика и формулы", subtypeCode: "graphs_match" },

  { ogeNumber: 12, label: "№12. Подстановка в формулу", subtypeCode: "formulas_subst" },
  { ogeNumber: 12, label: "№12. Перевод единиц", subtypeCode: "formulas_units" },
  { ogeNumber: 12, label: "№12. Практическая задача", subtypeCode: "formulas_practical" },

  { ogeNumber: 13, label: "№13. Линейные неравенства", subtypeCode: "ineq_linear" },
  { ogeNumber: 13, label: "№13. Квадратные неравенства", subtypeCode: "ineq_quadratic" },
  { ogeNumber: 13, label: "№13. Системы неравенств", subtypeCode: "ineq_system" },
  { ogeNumber: 13, label: "№13. Дробно-рациональные неравенства", subtypeCode: "ineq_rational" },

  { ogeNumber: 14, label: "№14. Арифметическая прогрессия", subtypeCode: "progression_arithm" },
  { ogeNumber: 14, label: "№14. Геометрическая прогрессия", subtypeCode: "progression_geom" },

  { ogeNumber: 15, label: "№15. Углы треугольника", subtypeCode: "triangles_angles" },
  { ogeNumber: 15, label: "№15. Теорема Пифагора", subtypeCode: "triangles_pythagor" },
  { ogeNumber: 15, label: "№15. Площадь треугольника", subtypeCode: "triangles_area" },
  { ogeNumber: 15, label: "№15. Замечательные линии", subtypeCode: "triangles_lines" },

  { ogeNumber: 16, label: "№16. Элементы окружности", subtypeCode: "circle_elements" },
  { ogeNumber: 16, label: "№16. Вписанные и центральные углы", subtypeCode: "circle_angles" },
  { ogeNumber: 16, label: "№16. Касательные", subtypeCode: "circle_tangents" },
  { ogeNumber: 16, label: "№16. Вписанные и описанные окружности", subtypeCode: "circle_inscribed" },
  { ogeNumber: 16, label: "№16. Площадь сектора и сегмента", subtypeCode: "circle_sector" },

  { ogeNumber: 17, label: "№17. Свойства четырёхугольников", subtypeCode: "quad_properties" },
  { ogeNumber: 17, label: "№17. Трапеция", subtypeCode: "quad_trapezoid" },
  { ogeNumber: 17, label: "№17. Площади четырёхугольников", subtypeCode: "quad_area" },
  { ogeNumber: 17, label: "№17. Диагонали четырёхугольников", subtypeCode: "quad_diagonals" },

  { ogeNumber: 18, label: "№18. Расстояние на решётке", subtypeCode: "grid_distance" },
  { ogeNumber: 18, label: "№18. Пифагор на решётке", subtypeCode: "grid_pythagor" },
  { ogeNumber: 18, label: "№18. Площадь на клетчатой бумаге", subtypeCode: "grid_area" },
  { ogeNumber: 18, label: "№18. Средняя линия на решётке", subtypeCode: "grid_midline" },

  { ogeNumber: 19, label: "№19. Утверждения об углах и прямых", subtypeCode: "logic_angles" },
  { ogeNumber: 19, label: "№19. Утверждения о треугольниках", subtypeCode: "logic_triangles" },
  { ogeNumber: 19, label: "№19. Утверждения о четырёхугольниках", subtypeCode: "logic_quad" },
  { ogeNumber: 19, label: "№19. Утверждения об окружности", subtypeCode: "logic_circle" },
];

type TrainingHistoryItem = {
  task: GeneratedTask;
  answer: string;
  checkStatus: CheckStatus;
  feedback: string;
  hint: string;
  explanation: string[];
};

export default function TasksPage() {
  const [mode, setMode] = useState<TrainingMode>("custom");
  const [selectedType, setSelectedType] = useState(taskTypes[0]);

  const [history, setHistory] = useState<TrainingHistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const current = history[currentIndex];

  // Сброс состояния при переключении режима, чтобы задачи и история одного режима
  // не «протекали» в другой
  function switchMode(newMode: TrainingMode) {
    if (newMode === mode) return;
    setMode(newMode);
    setHistory([]);
    setCurrentIndex(0);
    setPageError("");
  }

  async function loadRecommendations() {
    setIsRecommendationsLoading(true);
    setPageError("");

    try {
      const data = await getRecommendations();
      setRecommendations(data);
    } catch (error) {
      console.error("Recommendations error:", error);
      setPageError("Не удалось загрузить слабые темы.");
    } finally {
      setIsRecommendationsLoading(false);
    }
  }

  useEffect(() => {
    if (mode === "weak") {
      loadRecommendations();
    }
  }, [mode]);

  function addTaskToHistory(task: GeneratedTask) {
    const newItem: TrainingHistoryItem = {
      task,
      answer: "",
      checkStatus: "idle",
      feedback: "",
      hint: "",
      explanation: [],
    };

    setHistory((prev) => {
      const updated = [...prev, newItem];
      setCurrentIndex(updated.length - 1);
      return updated;
    });
  }

  async function loadCustomTask() {
    setIsLoading(true);
    setPageError("");

    try {
      const task = await generateTask({
        mode: "custom",
        oge_number: selectedType.ogeNumber,
        subtype_code: selectedType.subtypeCode,
      });

      addTaskToHistory(task);
    } catch (error) {
      console.error("Generate task error:", error);
      setPageError("Не удалось загрузить задание.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAllTask() {
    setIsLoading(true);
    setPageError("");

    try {
      const task = await generateTask({ mode: "all" });
      addTaskToHistory(task);
    } catch (error) {
      console.error("Generate all task error:", error);
      setPageError("Не удалось загрузить случайное задание.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadWeakTask(recommendation: Recommendation) {
    setIsLoading(true);
    setPageError("");

    try {
      const task = await generateTask({
        mode: "custom",
        oge_number: recommendation.oge_number,
        subtype_code: recommendation.subtype_code,
      });

      addTaskToHistory(task);
    } catch (error) {
      console.error("Generate weak task error:", error);
      setPageError("Не удалось загрузить задание по слабой теме.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateCurrent(changes: Partial<TrainingHistoryItem>) {
    setHistory((prev) =>
      prev.map((item, index) =>
        index === currentIndex ? { ...item, ...changes } : item
      )
    );
  }

  async function handleCheck() {
    if (!current || !current.answer.trim()) return;

    updateCurrent({
      checkStatus: "checking",
      feedback: "",
    });

    try {
      const result = await checkAnswer(
        current.task.id,
        current.answer
      );

      updateCurrent({
        feedback: result.short_feedback,
        checkStatus: result.is_correct
          ? "success"
          : "error",
      });
    } catch (error) {
      console.error("Check answer error:", error);

      updateCurrent({
        feedback: "Не удалось проверить ответ.",
        checkStatus: "error",
      });
    }
  }

  async function handleHint() {
    if (!current) return;

    try {
      const result = await getHint(current.task.id);

      updateCurrent({
        hint: result.hint,
      });
    } catch (error) {
      console.error("Hint error:", error);

      updateCurrent({
        hint: "Не удалось получить подсказку.",
      });
    }
  }

  async function handleExplanation() {
    if (!current) return;

    try {
      const result = await getExplanation(
        current.task.id
      );

      updateCurrent({
        explanation: result.steps?.length
          ? result.steps
          : [result.explanation],
      });
    } catch (error) {
      console.error("Explanation error:", error);

      updateCurrent({
        explanation: [
          "Не удалось получить объяснение.",
        ],
      });
    }
  }

  return (
    <main className="tasks-page">
      <header className="tasks-header">
        <h1 className="tasks-title">
          Тренировка
        </h1>

        <div className="mode-selector">
          <button
            className={`mode-button ${
              mode === "weak" ? "active" : ""
            }`}
            onClick={() => switchMode("weak")}
          >
            Слабые темы
          </button>

          <button
            className={`mode-button ${
              mode === "all" ? "active" : ""
            }`}
            onClick={() => switchMode("all")}
          >
            Все задания
          </button>

          <button
            className={`mode-button ${
              mode === "custom" ? "active" : ""
            }`}
            onClick={() => switchMode("custom")}
          >
            Выбрать
          </button>
        </div>
      </header>

      <section className="task-card">
        {mode === "custom" && (
          <div className="task-type-selector">
            <label className="task-type-label">
              Выбери тип задания

              <select
                value={selectedType.subtypeCode}
                onChange={(e) => {
                  const type = taskTypes.find(
                    (item) =>
                      item.subtypeCode ===
                      e.target.value
                  );

                  if (type) {
                    setSelectedType(type);
                  }
                }}
              >
                {taskTypes.map((type) => (
                  <option
                    key={`${type.ogeNumber}-${type.subtypeCode}`}
                    value={type.subtypeCode}
                  >
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="action-button"
              onClick={loadCustomTask}
              disabled={isLoading}
            >
              {isLoading
                ? "ИИ генерирует..."
                : "Сгенерировать задание"}
            </button>
          </div>
        )}

        {mode === "all" && (
          <div className="task-type-selector">
            <button
              className="action-button"
              onClick={loadAllTask}
              disabled={isLoading}
            >
              {isLoading
                ? "ИИ генерирует..."
                : "Сгенерировать случайное задание"}
            </button>
          </div>
        )}

        {mode === "weak" && (
          <div className="weak-topics-panel">
            <h3>Слабые темы</h3>

            {isRecommendationsLoading && (
              <p>Загружаем рекомендации...</p>
            )}

            {!isRecommendationsLoading &&
              recommendations.length ===
                0 && (
                <p>
                  Пока слабые темы не найдены.
                  Сначала пройди диагностику.
                </p>
              )}

            <div className="weak-topics-list">
              {recommendations.map((item) => (
                <button
                  key={`${item.oge_number}-${item.subtype_code}`}
                  className="weak-topic-button"
                  onClick={() =>
                    loadWeakTask(item)
                  }
                  disabled={isLoading}
                >
                  №{item.oge_number}{" "}
                  {item.title ??
                    item.subtype_code}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="training-history">
            {history.map((item, index) => (
              <button
                key={`${item.task.id}-${index}`}
                type="button"
                className={`history-button ${
                  index === currentIndex
                    ? "active"
                    : ""
                } ${
                  item.checkStatus ===
                  "success"
                    ? "solved"
                    : ""
                }`}
                onClick={() =>
                  setCurrentIndex(index)
                }
              >
                №{item.task.oge_number}.
                {index + 1}
              </button>
            ))}
          </div>
        )}

        {pageError && (
          <p className="status-message error">
            {pageError}
          </p>
        )}

        {!current && !isLoading && (
          <p className="task-hint">
            Выбери режим тренировки и
            сгенерируй задание.
          </p>
        )}

        {current && (
          <>
            <div className="ai-badge">
              🤖 Задание от ИИ
            </div>

            <p className="task-hint">
              Задание №
              {current.task.oge_number}
            </p>

            <h2 className="task-condition">
              <MathContent>{current.task.question}</MathContent>
            </h2>

            {((current.task.graphs ?? current.task.graph_data)?.length ?? 0) > 0 && (
  <FunctionGraphs
    graphs={current.task.graphs ?? current.task.graph_data ?? []}
  />
)}

            <div className="answer-section">
              <input
                className="task-input"
                type="text"
                placeholder="Введите ответ"
                value={current.answer}
                onChange={(e) => {
                  updateCurrent({
                    answer: e.target.value,
                    feedback: "",
                    checkStatus: "idle",
                  });
                }}
              />

              <button
                className="action-button"
                onClick={handleCheck}
                disabled={
                  !current.answer.trim() ||
                  current.checkStatus ===
                    "checking"
                }
              >
                {current.checkStatus ===
                "checking"
                  ? "ИИ проверяет..."
                  : "Проверить"}
              </button>

              <div className="task-actions">
                <button
                  className="action-button secondary-button"
                  onClick={handleHint}
                >
                  Подсказка
                </button>

                {(current.checkStatus ===
                  "success" ||
                  current.checkStatus ===
                    "error") && (
                  <button
                    className="action-button secondary-button explain-button"
                    onClick={
                      handleExplanation
                    }
                  >
                    Объяснение
                  </button>
                )}
              </div>

              {current.feedback && (
                <p
                  className={
                    current.checkStatus ===
                    "success"
                      ? "status-message success"
                      : "status-message error"
                  }
                >
                  {current.feedback}
                </p>
              )}
            </div>

            {current.hint && (
              <div className="ai-panel hint-panel">
                <h3>💡 Подсказка</h3>
                <p><MathContent>{current.hint}</MathContent></p>
              </div>
            )}

            {current.explanation.length >
              0 && (
              <div className="ai-panel explain-panel">
                <h3>📘 Объяснение</h3>

                <ol>
                  {current.explanation.map(
                    (step, index) => (
                      <li
                        key={`${step}-${index}`}
                      >
                        <MathContent>{step}</MathContent>
                      </li>
                    )
                  )}
                </ol>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

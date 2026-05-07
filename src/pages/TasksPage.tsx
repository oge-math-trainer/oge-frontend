import { useState, useRef, useEffect } from 'react';
import './TasksPage.css';
import {
  type Task,
  type CheckAnswerResponse,
  type ExplainResponse,
  tasksApi,
  ApiError,
} from '../api/tasks';

type TaskStatus = 'idle' | 'loading' | 'success' | 'error';
type AiState = 'idle' | 'hint' | 'explain';

// Локальный пул задач для демо (используется, если backend недоступен)
const DEMO_TASKS: Array<Task & { correctAnswer: string }> = [
  {
    id: 1,
    question: 'Решите уравнение: 3x + 7 = 22',
    formatHint: 'Введите число',
    correctAnswer: '5',
    mode: 'all', oge_number: 6, subtype_code: '', source: 'demo',
  } as any,
  {
    id: 2,
    question: 'Найдите значение выражения: 12 + 8 · 2',
    formatHint: 'Введите число',
    correctAnswer: '28',
    mode: 'all', oge_number: 6, subtype_code: '', source: 'demo',
  } as any,
  {
    id: 3,
    question: 'Найдите 20% от числа 150',
    formatHint: 'Введите число',
    correctAnswer: '30',
    mode: 'all', oge_number: 6, subtype_code: '', source: 'demo',
  } as any,
];

const DEMO_HINTS: Record<number, string> = {
  1: 'Перенеси число 7 в правую часть со знаком минус, затем раздели на 3.',
  2: 'Сначала умножение: 8 · 2, потом прибавь 12. Помни порядок действий.',
  3: 'Чтобы найти процент от числа, умножь число на процент и раздели на 100.',
};

const DEMO_EXPLANATIONS: Record<number, { explanation: string; steps: string[] }> = {
  1: {
    explanation: 'Линейное уравнение решается переносом неизвестного в одну часть, а чисел — в другую.',
    steps: ['3x + 7 = 22', '3x = 22 − 7', '3x = 15', 'x = 15 / 3', 'x = 5'],
  },
  2: {
    explanation: 'По правилу порядка действий, умножение выполняется раньше сложения.',
    steps: ['12 + 8 · 2', '8 · 2 = 16', '12 + 16 = 28'],
  },
  3: {
    explanation: 'Процент — это сотая часть числа. 20% означает 20/100 = 0.2.',
    steps: ['20% от 150', '150 · 20 / 100', '3000 / 100', '= 30'],
  },
};

export default function TasksPage() {
  const [task, setTask] = useState<Task | null>(null);
  const [taskLoading, setTaskLoading] = useState(true);
  const [answer, setAnswer] = useState<string>('');
  const [status, setStatus] = useState<TaskStatus>('idle');
  const [checkResult, setCheckResult] = useState<CheckAnswerResponse | null>(null);
  const [aiState, setAiState] = useState<AiState>('idle');
  const [aiLoading, setAiLoading] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [explainData, setExplainData] = useState<ExplainResponse | null>(null);
  const [activeMode, setActiveMode] = useState<'weak' | 'all' | 'custom'>('all');
  const [isRefOpen, setIsRefOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [demoIndex, setDemoIndex] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const taskAbortRef = useRef<AbortController | null>(null);
  const aiAbortRef = useRef<AbortController | null>(null);
  const cellRefs = useRef<(HTMLInputElement | null)[]>([]);

  const loadTask = async (mode: 'weak' | 'all' | 'custom', forceDemoNext = false) => {
    taskAbortRef.current?.abort();
    const ctrl = new AbortController();
    taskAbortRef.current = ctrl;

    setTaskLoading(true);
    setAnswer('');
    setStatus('idle');
    setAiState('idle');
    setHintText(null);
    setExplainData(null);
    setCheckResult(null);
    setErrorMessage(null);

    // Если уже в демо-режиме — сразу выдаём следующую демо-задачу
    if (isDemoMode || forceDemoNext) {
      const nextIndex = forceDemoNext ? (demoIndex + 1) % DEMO_TASKS.length : demoIndex;
      setDemoIndex(nextIndex);
      setTask(DEMO_TASKS[nextIndex]);
      setIsDemoMode(true);
      setTaskLoading(false);
      return;
    }

    try {
      const req =
        mode === 'custom'
          ? ({ mode: 'custom', oge_number: 6, subtype_code: '' } as const)
          : ({ mode } as const);
      const newTask = await tasksApi.generate(req, { signal: ctrl.signal });
      setTask(newTask);
      setIsDemoMode(false);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      // backend недоступен — переключаемся в демо-режим
      setIsDemoMode(true);
      setDemoIndex(0);
      setTask(DEMO_TASKS[0]);
    } finally {
      setTaskLoading(false);
    }
  };

  useEffect(() => {
    loadTask(activeMode);
    return () => { taskAbortRef.current?.abort(); };
  }, [activeMode]);

  const handleCellChange = (value: string, index: number) => {
    const sanitized = value.replace(/[^0-9,-]/g, '');
    const newAnswer = answer.split('');
    newAnswer[index] = sanitized;
    setAnswer(newAnswer.join(''));

    if (sanitized && cellRefs.current[index + 1]) {
      cellRefs.current[index + 1]?.focus();
    }
  };

  const handleCheck = async () => {
    if (!task) return;

    // Демо-режим: проверяем локально
    if (isDemoMode) {
      const demoTask = DEMO_TASKS[demoIndex];
      const normalized = answer.trim().replace(',', '.');
      const correct = demoTask.correctAnswer.trim().replace(',', '.');
      setStatus('loading');
      setTimeout(() => {
        const isCorrect = normalized === correct;
        setCheckResult({
          is_correct: isCorrect,
          short_feedback: isCorrect ? '✓ Верно!' : '✗ Неверно, попробуйте ещё раз',
        } as CheckAnswerResponse);
        setStatus(isCorrect ? 'success' : 'error');
      }, 400);
      return;
    }

    aiAbortRef.current?.abort();
    const ctrl = new AbortController();
    aiAbortRef.current = ctrl;

    setStatus('loading');
    try {
      const result = await tasksApi.check(
        { task_id: task.id, student_answer: answer },
        { signal: ctrl.signal },
      );
      setCheckResult(result);
      setStatus(result.is_correct ? 'success' : 'error');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      // если бэк не ответил — проверяем локально по DEMO_TASKS, если задача оттуда
      const demoTask = DEMO_TASKS.find((t) => t.id === task.id);
      if (demoTask) {
        const normalized = answer.trim().replace(',', '.');
        const correct = demoTask.correctAnswer.trim().replace(',', '.');
        const isCorrect = normalized === correct;
        setCheckResult({
          is_correct: isCorrect,
          short_feedback: isCorrect ? '✓ Верно!' : '✗ Неверно, попробуйте ещё раз',
        } as CheckAnswerResponse);
        setStatus(isCorrect ? 'success' : 'error');
        setIsDemoMode(true);
      } else {
        setStatus('error');
        setErrorMessage(err instanceof ApiError ? err.message : 'Ошибка проверки');
      }
    }
  };

  const handleNext = () => {
    if (isDemoMode) {
      loadTask(activeMode, true);
    } else {
      loadTask(activeMode);
    }
  };

  const handleHint = async () => {
    if (!task) return;

    if (isDemoMode) {
      setAiState('hint');
      setAiLoading(true);
      setTimeout(() => {
        setHintText(DEMO_HINTS[task.id] ?? 'Подумай над условием ещё раз — ответ всегда внутри.');
        setAiLoading(false);
      }, 300);
      return;
    }

    aiAbortRef.current?.abort();
    const ctrl = new AbortController();
    aiAbortRef.current = ctrl;

    setAiState('hint');
    setAiLoading(true);
    try {
      const { hint } = await tasksApi.hint({ task_id: task.id }, { signal: ctrl.signal });
      setHintText(hint);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      // fallback на демо-подсказку
      setHintText(DEMO_HINTS[task.id] ?? 'Подумай над условием ещё раз — ответ всегда внутри.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!task) return;

    if (isDemoMode) {
      setAiState('explain');
      setAiLoading(true);
      setTimeout(() => {
        setExplainData(
          (DEMO_EXPLANATIONS[task.id] ?? {
            explanation: 'Подробное решение скоро появится.',
            steps: [],
          }) as ExplainResponse,
        );
        setAiLoading(false);
      }, 300);
      return;
    }

    aiAbortRef.current?.abort();
    const ctrl = new AbortController();
    aiAbortRef.current = ctrl;

    setAiState('explain');
    setAiLoading(true);
    try {
      const data = await tasksApi.explain({ task_id: task.id }, { signal: ctrl.signal });
      setExplainData(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      // fallback на демо-объяснение
      setExplainData(
        (DEMO_EXPLANATIONS[task.id] ?? {
          explanation: 'Подробное решение скоро появится.',
          steps: [],
        }) as ExplainResponse,
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <h1 className="tasks-title">Тренировка</h1>
        <div className="mode-selector">
          <button className={`mode-button ${activeMode === 'weak' ? 'active' : ''}`} onClick={() => setActiveMode('weak')}>Слабые темы</button>
          <button className={`mode-button ${activeMode === 'all' ? 'active' : ''}`} onClick={() => setActiveMode('all')}>Все задания</button>
          <button className={`mode-button ${activeMode === 'custom' ? 'active' : ''}`} onClick={() => setActiveMode('custom')}>Выбрать</button>
        </div>
      </header>

      <div className="task-card">
        {taskLoading ? (
          <p className="task-condition">Загрузка задания…</p>
        ) : errorMessage && !task ? (
          <p className="status-message error">{errorMessage}</p>
        ) : task ? (
          <>
            <h2 className="task-condition">{task.question}</h2>

            <div className="answer-section">
              <div className="cell-input-container">
                {Array.from({ length: Math.max(answer.length, 1) || 3 }).map((_, index) => (
                  <input
                    key={index}
                    ref={(el: HTMLInputElement | null) => { cellRefs.current[index] = el; }}
                    className="cell-input"
                    type="text"
                    value={answer[index] || ''}
                    onChange={(e) => handleCellChange(e.target.value, index)}
                    maxLength={1}
                    disabled={status === 'loading'}
                  />
                ))}
              </div>

              {status === 'success' && (
                <button className="action-button" onClick={handleNext}>Следующее задание</button>
              )}
              {status === 'error' && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="action-button secondary-button" onClick={handleHint}>Подсказка</button>
                  <button className="action-button" onClick={handleCheck}>Проверить ещё раз</button>
                </div>
              )}
              {(status === 'idle' || status === 'loading') && (
                <button className="action-button" onClick={handleCheck} disabled={status === 'loading' || !answer.trim()}>
                  {status === 'loading' ? 'Проверяем…' : 'Проверить'}
                </button>
              )}

              {status === 'success' && <span className="status-message success">✓ Верно!</span>}
              {status === 'error' && (
                <span className="status-message error">
                  {checkResult?.short_feedback ?? '✗ Неверно, попробуйте ещё раз'}
                </span>
              )}
            </div>

            {aiState === 'hint' && (
              <div className="help-section">
                <h3 className="help-title">💡 Подсказка</h3>
                <p className="help-content">
                  {aiLoading ? 'Загрузка…' : hintText}
                </p>
                {!aiLoading && (
                  <button className="action-button secondary-button" style={{ marginTop: '12px' }} onClick={handleExplain}>Показать решение</button>
                )}
              </div>
            )}

            {aiState === 'explain' && (
              <div className="help-section">
                <h3 className="help-title">📖 Объяснение</h3>
                {aiLoading ? (
                  <p className="help-content">Загрузка…</p>
                ) : explainData ? (
                  <>
                    <p className="help-content">{explainData.explanation}</p>
                    <ol className="help-content">
                      {explainData.steps.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                  </>
                ) : null}
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Кнопка справочника */}
      <button
        className="reference-toggle"
        onClick={() => setIsRefOpen(!isRefOpen)}
        aria-label="Открыть справочник"
      >
        📚
      </button>

      {/* Панель справочника */}
      {isRefOpen && (
        <div className="reference-panel">
          <button
            className="reference-close"
            onClick={() => setIsRefOpen(false)}
            aria-label="Закрыть справочник"
          >
            ×
          </button>
          <h3 className="help-title">Справочник</h3>
          <p className="help-content">
            Квадратное уравнение: ax² + bx + c = 0<br/>
            Дискриминант: D = b² - 4ac<br/>
            Корни: x = (-b ± √D) / 2a
          </p>
        </div>
      )}
    </div>
  );
}
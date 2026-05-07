import { useState, useRef, useEffect } from 'react';
import './TasksPage.css';
import {
  type Task,
  type CheckAnswerResponse,
  type ExplainResponse,
  tasksApi,
  ApiError,
  clearAuthToken,
} from '../api/tasks';

type TaskStatus = 'idle' | 'loading' | 'success' | 'error';
type AiState = 'idle' | 'hint' | 'explain';

export default function TasksPage() {
  const [task, setTask] = useState<Task | null>(null);
  const [taskLoading, setTaskLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<TaskStatus>('idle');
  const [checkResult, setCheckResult] = useState<CheckAnswerResponse | null>(null);
  const [aiState, setAiState] = useState<AiState>('idle');
  const [aiLoading, setAiLoading] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [explainData, setExplainData] = useState<ExplainResponse | null>(null);
  const [activeMode, setActiveMode] = useState<'weak' | 'all' | 'custom'>('all');
  const [isRefOpen, setIsRefOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const taskAbortRef = useRef<AbortController | null>(null);
  const aiAbortRef = useRef<AbortController | null>(null);
  const cellRefs = useRef<(HTMLInputElement | null)[]>([]);

  const loadTask = async (mode: 'weak' | 'all' | 'custom') => {
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

    try {
      const req =
        mode === 'custom'
          ? ({ mode: 'custom', oge_number: 6, subtype_code: '' } as const)
          : ({ mode } as const);
      const newTask = await tasksApi.generate(req, { signal: ctrl.signal });
      setTask(newTask);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (err instanceof ApiError && err.isAuthError) {
        clearAuthToken();
        window.location.href = '/login';
        return;
      }
      setErrorMessage(err instanceof ApiError ? err.message : 'Ошибка загрузки задания');
    } finally {
      setTaskLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTask(activeMode); // async fetch — setState вызывается только после await
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
      setStatus('error');
      setErrorMessage(err instanceof ApiError ? err.message : 'Ошибка проверки');
    }
  };

  const handleNext = () => {
    loadTask(activeMode);
  };

  const handleHint = async () => {
    if (!task) return;
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
      setAiState('idle');
      setErrorMessage(err instanceof ApiError ? err.message : 'Ошибка получения подсказки');
    } finally {
      setAiLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!task) return;
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
      setAiState('idle');
      setErrorMessage(err instanceof ApiError ? err.message : 'Ошибка получения объяснения');
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
              {errorMessage && status === 'error' && (
                <span className="status-message error">{errorMessage}</span>
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
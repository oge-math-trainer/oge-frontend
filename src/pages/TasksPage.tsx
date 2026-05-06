import { useState, useRef } from 'react';
import './TasksPage.css';

interface Task {
  id: number;
  question: string;
  correctAnswer: string;
  formatHint: string;
}

type TaskStatus = 'idle' | 'loading' | 'success' | 'error';
type AiState = 'idle' | 'hint' | 'explain' | 'chat';

export default function TasksPage() {
  const tasks: Task[] = [
  {
    id: 1,
    question: "Решите уравнение: 3x + 7 = 22",
    correctAnswer: "5",
    formatHint: "Введите число",
  },
  {
    id: 2,
    question: "Найдите значение выражения: 12 + 8 · 2",
    correctAnswer: "28",
    formatHint: "Введите число",
  },
  {
    id: 3,
    question: "Найдите 20% от числа 150",
    correctAnswer: "30",
    formatHint: "Введите число",
  },
];

const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
const task = tasks[currentTaskIndex];
  
  const [answer, setAnswer] = useState<string>('');
  const [status, setStatus] = useState<TaskStatus>('idle');
  const [aiState, setAiState] = useState<AiState>('idle');
  const [activeMode, setActiveMode] = useState<string>('all');
  const [isRefOpen, setIsRefOpen] = useState(false);
  
  const cellRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCellChange = (value: string, index: number) => {
    const sanitized = value.replace(/[^0-9,-]/g, '');
    const newAnswer = answer.split('');
    newAnswer[index] = sanitized;
    setAnswer(newAnswer.join(''));
    
    if (sanitized && cellRefs.current[index + 1]) {
      cellRefs.current[index + 1]?.focus();
    }
  };

  const handleCheck = () => {
  const normalizedAnswer = answer.trim().replace(",", ".");
  const normalizedCorrectAnswer = task.correctAnswer.trim().replace(",", ".");

  setStatus("loading");

  setTimeout(() => {
    setStatus(
      normalizedAnswer === normalizedCorrectAnswer ? "success" : "error"
    );
  }, 600);
};

 const handleNext = () => {
  setAnswer("");
  setStatus("idle");
  setAiState("idle");

  setCurrentTaskIndex((prevIndex) =>
    prevIndex === tasks.length - 1 ? 0 : prevIndex + 1
  );
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
        <h2 className="task-condition">{task.question}</h2>
        <p className="task-hint">{task.formatHint}</p>

        <div className="answer-section">
          <div className="cell-input-container">
            {Array.from({ length: Math.max(answer.length, task.correctAnswer.length) || 3 }).map((_, index) => (
              <input
                key={index}
                ref={(el: HTMLInputElement | null) => { cellRefs.current[index] = el; }}
                className="cell-input"
                type="text"
                value={answer[index] || ''}
                onChange={(e) => handleCellChange(e.target.value, index)}
                maxLength={1}
              />
            ))}
          </div>

          {status === 'success' && (
            <button className="action-button" onClick={handleNext}>Следующее задание</button>
          )}
          {status === 'error' && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="action-button secondary-button" onClick={() => setAiState('hint')}>Подсказка</button>
              <button className="action-button" onClick={handleCheck}>Проверить ещё раз</button>
            </div>
          )}
          {status === 'idle' && (
            <button className="action-button" onClick={handleCheck} disabled={!answer.trim()}>Проверить</button>
          )}

          {status === 'success' && <span className="status-message success">✓ Верно!</span>}
          {status === 'error' && <span className="status-message error">✗ Неверно, попробуйте ещё раз</span>}
        </div>

        {aiState === 'hint' && (
          <div className="help-section">
            <h3 className="help-title">💡 Подсказка</h3>
            <p className="help-content">Перенесите известное слагаемое в правую часть, изменив знак.</p>
            <button className="action-button secondary-button" style={{ marginTop: '12px' }} onClick={() => setAiState('explain')}>Показать решение</button>
          </div>
        )}

        {aiState === 'explain' && (
          <div className="help-section">
            <h3 className="help-title">📖 Объяснение</h3>
            <p className="help-content">1. 3x = 22 - 7<br/>2. 3x = 15<br/>3. x = 5</p>
          </div>
        )}
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
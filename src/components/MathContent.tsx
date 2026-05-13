import { MathJax } from 'better-react-mathjax';

type MathContentProps = {
  children: string;
  className?: string;
};

// Список самых частых LaTeX-команд, которые ИИ присылает без обратного слэша
// Когда ИИ забывает поставить \, мы это исправляем.
const COMMON_LATEX_COMMANDS = [
  'frac', 'sqrt', 'cdot', 'times', 'div',
  'neq', 'leq', 'geq', 'approx', 'pm', 'mp',
  'sum', 'prod', 'int', 'infty',
  'alpha', 'beta', 'gamma', 'delta', 'pi', 'theta', 'lambda', 'mu',
  'sin', 'cos', 'tan', 'log', 'ln',
  'rightarrow', 'leftarrow', 'Rightarrow', 'Leftarrow',
];

/**
 * Восстанавливает обратный слэш у LaTeX-команд, которые ИИ присылает без него.
 * Например: "4 cdot 3" → "4 \cdot 3", "x neq 2" → "x \neq 2".
 *
 * Слово считается командой, если оно из списка и стоит как отдельное слово
 * (с пробелами/операторами по краям).
 */
function fixMissingBackslashes(text: string): string {
  const pattern = new RegExp(
    `(^|[^a-zA-Z\\\\])(${COMMON_LATEX_COMMANDS.join('|')})(?![a-zA-Z])`,
    'g',
  );
  return text.replace(pattern, '$1\\$2');
}

/**
 * Превращает «сырой» текст от ИИ в текст с LaTeX-делимитерами.
 */
function preprocess(raw: string): string {
  if (!raw) return '';

  // Уже есть делимитеры — MathJax всё сделает сам
  if (/\$|\\\(|\\\[/.test(raw)) {
    return raw;
  }

  // Сначала чиним пропущенные обратные слэши: "cdot" → "\cdot"
  const fixed = fixMissingBackslashes(raw);

  // Один математический токен: команда LaTeX или индекс/степень
  const token =
    String.raw`(?:\\[a-zA-Z]+(?:\{[^{}]*\})*` +
    String.raw`|[a-zA-Zа-яА-Я0-9]+(?:_\{[^}]+\}|_[a-zA-Z0-9]|\^\{[^}]+\}|\^[a-zA-Z0-9])+)`;

  // Группа из одного или нескольких токенов, между которыми могут стоять
  // пробелы и базовые математические операторы.
  const group = new RegExp(
    `(?:${token})(?:[\\s+\\-*/=,.()]*(?:${token}))*`,
    'g',
  );

  return fixed.replace(group, (match) => `\\(${match.trim()}\\)`);
}

export function MathContent({ children, className }: MathContentProps) {
  const processed = preprocess(children);

  return (
    <MathJax className={className} dynamic>
      {processed}
    </MathJax>
  );
}
import { MathJax } from 'better-react-mathjax';

type MathContentProps = {
  children: string;
  className?: string;
};

/**
 * Превращает «сырой» текст от ИИ в текст с LaTeX-делимитерами.
 *
 * ИИ непоследовательна и шлёт математику в 3 разных форматах:
 *   1. Голый LaTeX:        "\frac{3}{4}"           → оборачиваем в \( \)
 *   2. ASCII-нотация:       "b_1", "x^2", "b_{n+1}" → оборачиваем в \( \)
 *   3. Уже с делимитерами:  "$\frac{3}{4}$"         → оставляем как есть
 */
function preprocess(raw: string): string {
  if (!raw) return '';

  // Если в тексте уже есть $, \(, \[ — оставляем, MathJax сам разберётся
  if (/\$|\\\(|\\\[/.test(raw)) {
    return raw;
  }

  // Регулярка ловит:
  //   - LaTeX-команды вида \frac{...}{...}, \sqrt{...}, \cdot и т.п.
  //   - Подчёркивания и степени: b_1, x^2, b_{n+1}, 2b_n, x^{n+1}
  // Каждое такое выражение оборачиваем в \( ... \)
  const mathPattern =
    /(\\[a-zA-Z]+(?:\{[^{}]*\}){0,3}|[a-zA-Zа-яА-Я0-9]+(?:_\{[^}]+\}|_[a-zA-Z0-9]|\^\{[^}]+\}|\^[a-zA-Z0-9])+)/g;

  return raw.replace(mathPattern, (match) => `\\(${match}\\)`);
}

export function MathContent({ children, className }: MathContentProps) {
  const processed = preprocess(children);

  return (
    <MathJax
      className={className}
      // dynamic=true — переразбирать математику при изменении пропа children
      // (например, когда переключаешь задачи)
      dynamic
    >
      {processed}
    </MathJax>
  );
}
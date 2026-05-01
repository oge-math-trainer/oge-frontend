import "./ResultPage.css";

type ResultPageProps = {
  answers: { taskId: number; answer: string }[];
  onRestart: () => void;
};

export function ResultPage({ answers, onRestart }: ResultPageProps) {
  return (
    <main className="result-page">
      <section className="result-card">
        <h1>Диагностика завершена</h1>

        <p className="result-subtitle">
          Вы ответили на {answers.length} заданий
        </p>

        <button type="button" onClick={onRestart}>
          Пройти диагностику заново
        </button>
      </section>
    </main>
  );
}
import { useState } from "react";
import { LoginPage } from "./pages/LoginPage";
import { DiagnosticPage } from "./pages/DiagnosticPage";
import { ResultPage } from "./pages/ResultPage";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [answers, setAnswers] = useState<
    { taskId: number; answer: string }[] | null
  >(null);

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  if (!answers) {
    return (
      <DiagnosticPage
        onFinish={(answers) => setAnswers(answers)}
      />
    );
  }

  return (
    <ResultPage
      answers={answers}
      onRestart={() => setAnswers(null)}
    />
  );
}
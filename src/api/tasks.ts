import { apiPost } from "./client";

export type GeneratedTask = {
  id: number;
  mode: string;
  oge_number: number;
  subtype_code?: string;
  question: string;
  source?: string;
};

export type CheckAnswerResponse = {
  is_correct: boolean;
  short_feedback: string;
  reason: string;
};

export type HintResponse = {
  hint: string;
};

export type ExplainResponse = {
  explanation: string;
  steps: string[];
};

export function generateTask(mode: "all" | "weak" = "all") {
  return apiPost<GeneratedTask>("/api/v1/tasks/generate", {
    mode,
  });
}

export function checkAnswer(taskId: number, studentAnswer: string) {
  return apiPost<CheckAnswerResponse>("/api/v1/tasks/check", {
    task_id: taskId,
    student_answer: studentAnswer,
  });
}

export function getHint(taskId: number) {
  return apiPost<HintResponse>("/api/v1/tasks/hint", {
    task_id: taskId,
  });
}

export function getExplanation(taskId: number) {
  return apiPost<ExplainResponse>("/api/v1/tasks/explain", {
    task_id: taskId,
  });
}
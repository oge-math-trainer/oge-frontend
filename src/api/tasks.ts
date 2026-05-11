import { apiPost } from "./client";

export type GraphData = {
  id: string;
  type: "linear" | "quadratic" | "hyperbola";
  coefficients: number[];
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
};

export type GeneratedTask = {
  id: number;
  mode: string;
  oge_number: number;
  subtype_code?: string;
  question: string;
  source?: string;
  created_at?: string;

  graphs?: GraphData[];
  graph_data?: GraphData[];
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

export type GenerateTaskRequest =
  | { mode: "all" }
  | { mode: "weak" }
  | {
      mode: "custom";
      oge_number: number;
      subtype_code: string;
    };

export function generateTask(request: GenerateTaskRequest) {
  return apiPost<GeneratedTask>("/api/v1/tasks/generate", request);
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
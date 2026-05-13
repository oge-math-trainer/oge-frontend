import { apiPost } from "./client";

export type DiagnosticTask = {
  id: number;
  mode: string;
  oge_number: number;
  subtype_code?: string;
  question: string;
  source?: string;
};

export type DiagnosticStartResponse = {
  session_id: number;
  tasks: DiagnosticTask[];
  total_tasks: number;
  generated_count: number;
  complete: boolean;
};

export type DiagnosticNextResponse = {
  session_id: number;
  task?: DiagnosticTask;
  total_tasks: number;
  generated_count: number;
  complete: boolean;
};

export type DiagnosticAnswerRequest = {
  task_id: number;
  student_answer: string;
};

export type DiagnosticSubmitResponse = {
  session_id: number;
  answers: unknown[];
  analysis?: {
    summary?: string;
    weak_topics?: string[];
  };
};

export function startDiagnostic() {
  return apiPost<DiagnosticStartResponse>("/api/v1/diagnostic/start", {});
}

export function loadNextDiagnosticTask(sessionId: number) {
  return apiPost<DiagnosticNextResponse>("/api/v1/diagnostic/next", {
    session_id: sessionId,
  });
}

export function submitDiagnostic(
  sessionId: number,
  answers: DiagnosticAnswerRequest[]
) {
  return apiPost<DiagnosticSubmitResponse>("/api/v1/diagnostic/submit", {
    session_id: sessionId,
    answers,
  });
}

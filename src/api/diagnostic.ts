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

export function submitDiagnostic(
  sessionId: number,
  answers: DiagnosticAnswerRequest[]
) {
  return apiPost<DiagnosticSubmitResponse>("/api/v1/diagnostic/submit", {
    session_id: sessionId,
    answers,
  });
}
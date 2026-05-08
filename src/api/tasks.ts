/**
 * API-слой для страницы тренировки /tasks.
 *
 * Соответствует контракту backend (Go, Медведева) — см. API_ENDPOINTS_IMPLEMENTATION.md.
 * Все эндпоинты — под префиксом /api/v1, защищены JWT, ответы в обёртке { success, data | error }.
 *
 * POST /api/v1/tasks/generate  — генерация задания
 * POST /api/v1/tasks/check     — проверка ответа
 * POST /api/v1/tasks/hint      — наводящая подсказка (Этап 1)
 * POST /api/v1/tasks/explain   — полное пошаговое объяснение (Этап 2)
 *
 * ⚠️ Эндпоинта /tasks/ai-chat в MVP НЕТ — свободный чат убрали из бэклога
 *    (см. документ «Суть MVP», раздел «Почему убрали свободный чат»).
 */

const API_BASE: string = "http://localhost:8080";

const API_PREFIX = '/api/v1';

// ────────────────────────────────────────────────────────────
// Авторизация: читаем JWT, который кладёт страница /login
// ────────────────────────────────────────────────────────────

/**
 * Договорённость с Потапочкиной: после успешного login/register
 * JWT сохраняется в localStorage под ключом 'auth_token'.
 * Если ключ изменится — правится только эта функция.
 */
function getAuthToken(): string {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new ApiError(401, 'Сессия не найдена. Войдите в систему.', 'unauthorized', null);
  }
  return token;
}

/** Удалить токен из localStorage (используется при ошибке 401). */
export function clearAuthToken(): void {
  localStorage.removeItem('auth_token');
}

// ────────────────────────────────────────────────────────────
// Класс ошибки
// ────────────────────────────────────────────────────────────

/** Машинно-читаемые коды ошибок от backend. */
export type ErrorCode =
  | 'validation_error'
  | 'unauthorized'
  | 'not_found'
  | 'conflict'
  | 'ai_unavailable'
  | 'db_unavailable'
  | 'rate_limited'
  | 'internal_error'
  | 'network_error'
  | 'timeout';

export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details: unknown;

  constructor(
    status: number,
    message: string,
    code: ErrorCode,
    details: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isRetryable(): boolean {
    return (
      this.code === 'network_error' ||
      this.code === 'timeout' ||
      this.code === 'rate_limited' ||
      this.code === 'ai_unavailable' ||
      this.code === 'db_unavailable' ||
      this.code === 'internal_error'
    );
  }

  get isAuthError(): boolean {
    return this.code === 'unauthorized' || this.status === 401;
  }
}

// ────────────────────────────────────────────────────────────
// Базовый POST-запрос: JWT, таймаут, отмена, распаковка обёртки
// ────────────────────────────────────────────────────────────

interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

interface SuccessEnvelope<T> {
  success: true;
  data: T;
}

interface ErrorEnvelope {
  success: false;
  error: { code: ErrorCode; message: string };
}

type ApiEnvelope<T> = SuccessEnvelope<T> | ErrorEnvelope;

async function postJson<TResp>(
  path: string,
  body: unknown,
  options: RequestOptions = {},
): Promise<TResp> {
  const { signal: externalSignal, timeoutMs = 15_000 } = options;

  const timeoutCtrl = new AbortController();
  const timeoutId = setTimeout(() => timeoutCtrl.abort(), timeoutMs);
  const signal = externalSignal
    ? mergeSignals(externalSignal, timeoutCtrl.signal)
    : timeoutCtrl.signal;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof DOMException && err.name === 'AbortError') {
      if (timeoutCtrl.signal.aborted && !externalSignal?.aborted) {
        throw new ApiError(408, 'Сервер слишком долго не отвечает. Попробуйте ещё раз.', 'timeout', null);
      }
      throw err;
    }

    if (err instanceof ApiError) throw err;

    throw new ApiError(0, 'Нет связи с сервером. Проверьте подключение к интернету.', 'network_error', err);
  }
  clearTimeout(timeoutId);

  let envelope: ApiEnvelope<TResp>;
  try {
    envelope = (await response.json()) as ApiEnvelope<TResp>;
  } catch (err) {
    throw new ApiError(response.status, 'Сервер вернул некорректный JSON.', 'internal_error', err);
  }

  if (!envelope.success) {
    throw new ApiError(response.status, envelope.error.message, envelope.error.code, envelope.error);
  }

  return envelope.data;
}

function mergeSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  if (typeof (AbortSignal as unknown as { any?: unknown }).any === 'function') {
    return (AbortSignal as unknown as { any: (s: AbortSignal[]) => AbortSignal }).any([a, b]);
  }
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  if (a.aborted || b.aborted) ctrl.abort();
  else {
    a.addEventListener('abort', onAbort, { once: true });
    b.addEventListener('abort', onAbort, { once: true });
  }
  return ctrl.signal;
}

// ────────────────────────────────────────────────────────────
// Типы запросов и ответов
// ────────────────────────────────────────────────────────────

export type TrainingMode = 'weak' | 'all' | 'custom';

export type OgeNumber = 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19;

export type GenerateTaskRequest =
  | { mode: 'weak' }
  | { mode: 'all' }
  | { mode: 'custom'; oge_number: OgeNumber; subtype_code: string };

export interface Task {
  id: number;
  mode: TrainingMode | 'diagnostic';
  oge_number: OgeNumber;
  subtype_code: string;
  question: string;
  source: string;
}

export interface CheckAnswerRequest {
  task_id: number;
  student_answer: string;
}

export interface CheckAnswerResponse {
  is_correct: boolean;
  short_feedback: string;
  reason: string;
}

export interface HintRequest {
  task_id: number;
}

export interface HintResponse {
  hint: string;
}

export interface ExplainRequest {
  task_id: number;
}

export interface ExplainResponse {
  explanation: string;
  steps: string[];
}

// ────────────────────────────────────────────────────────────
// Публичный API
// ────────────────────────────────────────────────────────────

export function generateTask(
  req: GenerateTaskRequest,
  options?: RequestOptions,
): Promise<Task> {
  return postJson<Task>('/tasks/generate', req, { timeoutMs: 60_000, ...options });
}

export function checkAnswer(
  req: CheckAnswerRequest,
  options?: RequestOptions,
): Promise<CheckAnswerResponse> {
  return postJson<CheckAnswerResponse>('/tasks/check', req, { timeoutMs: 60_000, ...options });
}

export function getHint(
  req: HintRequest,
  options?: RequestOptions,
): Promise<HintResponse> {
  return postJson<HintResponse>('/tasks/hint', req, { timeoutMs: 60_000, ...options });
}

export function getExplanation(
  req: ExplainRequest,
  options?: RequestOptions,
): Promise<ExplainResponse> {
  return postJson<ExplainResponse>('/tasks/explain', req, { timeoutMs: 60_000, ...options });
}

export const tasksApi = {
  generate: generateTask,
  check: checkAnswer,
  hint: getHint,
  explain: getExplanation,
};
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "https://oge-backend-7v2t.onrender.com";

type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

function getToken() {
  return localStorage.getItem("auth_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE}${path}`,
    {
      ...options,
      headers: {
        "Content-Type":
          "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...options.headers,
      },
    }
  );

  const body =
    (await response.json()) as ApiResponse<T>;

  if (!body.success) {
    throw new Error(
      body.error.message
    );
  }

  return body.data;
}

export function apiGet<T>(
  path: string
) {
  return request<T>(path, {
    method: "GET",
  });
}

export function apiPost<T>(
  path: string,
  data: unknown
) {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
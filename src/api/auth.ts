import {
  apiGet,
  apiPost,
} from "./client";

type User = {
  id: number;
  email: string;
};

type AuthResponse = {
  token: string;
  user: User;
};

export async function login(
  email: string,
  password: string
) {
  const data =
    await apiPost<AuthResponse>(
      "/api/v1/auth/login",
      {
        email,
        password,
      }
    );

  localStorage.setItem(
    "auth_token",
    data.token
  );

  localStorage.setItem(
    "user_email",
    data.user.email
  );

  return data;
}

export async function register(
  email: string,
  password: string
) {
  const data =
    await apiPost<AuthResponse>(
      "/api/v1/auth/register",
      {
        email,
        password,
      }
    );

  localStorage.setItem(
    "auth_token",
    data.token
  );

  localStorage.setItem(
    "user_email",
    data.user.email
  );

  return data;
}

export async function me() {
  return apiGet<User>(
    "/api/v1/auth/me"
  );
}
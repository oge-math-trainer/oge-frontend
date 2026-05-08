export async function login(email: string, password: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (email === "test@test.com" && password === "1234") {
    localStorage.setItem("auth_token", "mock-token");
    localStorage.setItem("user_email", email);

    return {
      token: "mock-token",
      user: {
        id: 1,
        email,
      },
    };
  }

  throw new Error("Login failed");
}

export function logout() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_email");
}
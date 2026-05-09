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



export async function register(name: string, email: string, password: string) {
  void password;

  await new Promise((resolve) => setTimeout(resolve, 500));

  localStorage.setItem("auth_token", "mock-token");
  localStorage.setItem("user_email", email);
  localStorage.setItem("user_name", name);

  return {
    token: "mock-token",
    user: {
      id: 1,
      name,
      email,
    },
  };
}

export function logout() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_name");
}

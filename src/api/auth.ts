export async function login(email: string, password: string) {
  // имитация запроса
  await new Promise((res) => setTimeout(res, 800));

  if (email === "test@test.com" && password === "1234") {
    return { token: "fake-token" };
  }

  throw new Error("Login failed");
}
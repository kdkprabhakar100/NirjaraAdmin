import api from "./api";

type LoginPayload = {
  email: string;
  password: string;
};

export async function loginAdmin(data: LoginPayload) {
  const response = await api.post("/api/auth/login", data);

  if (!response.data.token) {
    throw new Error("No token returned from server");
  }

  localStorage.setItem(
    "adminToken",
    response.data.token
  );

  if (response.data.email) {
    localStorage.setItem(
      "adminEmail",
      response.data.email
    );
  }

  return response.data;
}

export function logoutAdmin() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminEmail");
}

export function isAdminLoggedIn() {
  return Boolean(
    localStorage.getItem("adminToken")
  );
}
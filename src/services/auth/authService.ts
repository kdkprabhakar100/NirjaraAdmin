import api from "../base/api";

import type {
  AdminLoginResponse,
  AdminSummary,
  LoginPayload,
  Permission,
} from "./auth.types";

const TOKEN_KEY = "adminToken";
const EMAIL_KEY = "adminEmail";
const SESSION_KEY = "adminSession";

// ========================================
// LOGIN
//
// POST /api/auth/login
//
// Admins and staff can sign in.
// ========================================

export async function loginAdmin(
  data: LoginPayload
) {
  const response =
    await api.post<AdminLoginResponse>(
      "/api/auth/login",
      data
    );

  if (!response.data.token) {
    throw new Error(
      "No token returned from server"
    );
  }

  localStorage.setItem(
    TOKEN_KEY,
    response.data.token
  );

  saveSession(response.data.admin);

  return response.data;
}

export function logoutAdmin() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function isAdminLoggedIn() {
  return Boolean(
    localStorage.getItem(TOKEN_KEY)
  );
}

// ========================================
// SESSION
//
// Who is signed in, with their role and
// permissions. Null for a session saved
// before roles existed, until
// refreshAdminSession fills it in.
// ========================================

function saveSession(admin: AdminSummary) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(admin)
  );

  localStorage.setItem(
    EMAIL_KEY,
    admin.email
  );
}

export function getAdminSession(): AdminSummary | null {
  try {
    const raw =
      localStorage.getItem(SESSION_KEY);

    return raw
      ? (JSON.parse(raw) as AdminSummary)
      : null;
  } catch {
    return null;
  }
}

export function hasPermission(
  permission: Permission
) {
  return (
    getAdminSession()?.permissions.includes(
      permission
    ) ?? false
  );
}

// ========================================
// REFRESH SESSION
//
// GET /api/auth/me
//
// Picks up a role another admin changed
// since this login. Throws on 401, e.g.
// when the account was deleted.
// ========================================

export async function refreshAdminSession(): Promise<AdminSummary> {
  const response = await api.get<{
    admin: AdminSummary;
  }>("/api/auth/me");

  saveSession(response.data.admin);

  return response.data.admin;
}

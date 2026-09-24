// ========================================
// AUTH TYPES
// ========================================

export type LoginPayload = {
  email: string;
  password: string;
};

// Mirrors the backend's user.permissions.ts.
// The API enforces these; the panel only
// uses them to hide what an account
// cannot use.
export type Permission =
  | "panel.access"
  | "users.manage";

export type AdminRole = "admin" | "staff";

// ========================================
// ADMIN SESSION
//
// Returned by POST /api/auth/login and
// GET /api/auth/me, kept in localStorage.
// ========================================

export type AdminSummary = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: Permission[];
};

export type AdminLoginResponse = {
  message: string;
  token: string;
  admin: AdminSummary;
};

// ========================================
// AUTH TYPES
// ========================================

export type LoginPayload = {
  email: string;
  password: string;
};

// `<resource>.<action>`, e.g.
// "bookings.update". The list lives on
// the backend (role.permissions.ts) and
// reaches the panel through
// GET /api/roles/permissions. The API
// enforces these; the panel only uses
// them to hide what an account cannot
// use.
export type Permission = string;

export type PermissionAction =
  | "view"
  | "create"
  | "update"
  | "delete";

// A role key: "super_admin", "admin",
// "staff", or one made on the Roles page.
export type AdminRole = string;

export const SUPER_ADMIN_ROLE = "super_admin";

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
  // Display name, e.g. "Super Admin".
  // Missing from sessions saved before
  // roles moved to the database.
  roleName?: string;
  // The branches the account works for;
  // the API narrows its bookings,
  // dashboard counts and service switches
  // to them. Empty means it sees every
  // branch. Read it through
  // sessionBranches(), which also handles
  // sessions saved before accounts could
  // hold several branches.
  branches?: SessionBranch[];
  // Sessions saved by older versions.
  branch?: SessionBranch | null;
  permissions: Permission[];
};

export type SessionBranch = {
  _id: string;
  name: string;
};

// The account's branches; empty when it
// sees every branch.
export function sessionBranches(
  session: AdminSummary | null | undefined
): SessionBranch[] {
  if (!session) {
    return [];
  }

  if (session.branches) {
    return session.branches;
  }

  return session.branch
    ? [session.branch]
    : [];
}

export type AdminLoginResponse = {
  message: string;
  token: string;
  admin: AdminSummary;
};

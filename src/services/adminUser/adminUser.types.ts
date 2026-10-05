import type { AdminRole } from "../auth/auth.types";

// ========================================
// ADMIN USER TYPES
//
// Accounts that can sign in to this
// panel. Website visitor accounts never
// show up here.
// ========================================

export type AdminUser = {
  _id: string;

  name: string;

  email: string;

  // A role key; the Roles page defines
  // what each one may do.
  role: AdminRole;

  // The branch the account works for, with
  // its name and address filled in by the
  // server. Null means it sees every
  // branch.
  branch?: {
    _id: string;
    name: string;
    address?: string;
  } | null;

  createdAt?: string;

  updatedAt?: string;
};

// ========================================
// CREATE / UPDATE PAYLOAD
//
// The password is set on create only.
// Changing it later goes through
// changeAdminUserPassword, which needs
// the adminPasswords.update permission.
// ========================================

export type AdminUserPayload = {
  name: string;

  email: string;

  role: AdminRole;

  // A branch id; "" for every branch.
  branch: string;

  password: string;
};

export type AdminUserUpdatePayload = Omit<
  AdminUserPayload,
  "password"
>;

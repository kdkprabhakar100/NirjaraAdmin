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

  // The branches the account works for,
  // with names and addresses filled in by
  // the server. Empty means it sees every
  // branch.
  branches?: {
    _id: string;
    name: string;
    address?: string;
  }[];

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

  // Branch ids; empty for every branch.
  branches: string[];

  password: string;
};

export type AdminUserUpdatePayload = Omit<
  AdminUserPayload,
  "password"
>;

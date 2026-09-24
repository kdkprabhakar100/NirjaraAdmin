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

  role: AdminRole;

  createdAt?: string;

  updatedAt?: string;
};

// ========================================
// CREATE / UPDATE PAYLOAD
//
// Password is required on create. On
// update a blank password keeps the
// current one.
// ========================================

export type AdminUserPayload = {
  name: string;

  email: string;

  role: AdminRole;

  password: string;
};

export const ADMIN_ROLES: {
  value: AdminRole;
  label: string;
  description: string;
}[] = [
  {
    value: "admin",
    label: "Admin",
    description:
      "Full access, including managing users.",
  },
  {
    value: "staff",
    label: "Staff",
    description:
      "Everything except managing users.",
  },
];

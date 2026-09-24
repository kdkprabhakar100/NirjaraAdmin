import api from "../base/api";

import type {
  AdminUser,
  AdminUserPayload,
} from "./adminUser.types";

// ========================================
// API CONFIGURATION
//
// Every route is admins-only; staff get a
// 403.
// ========================================

const ADMIN_USER_API = "/api/admin-users";

// ========================================
// GET ALL ADMIN USERS
//
// GET /api/admin-users
//
// Newest first.
// ========================================

export const getAdminUsers =
  async (): Promise<AdminUser[]> => {
    const response =
      await api.get<AdminUser[]>(
        ADMIN_USER_API
      );

    return response.data;
  };

// ========================================
// CREATE ADMIN USER
//
// POST /api/admin-users
//
// Answers 409 when the email already has
// an account.
// ========================================

export const createAdminUser = async (
  data: AdminUserPayload
): Promise<AdminUser> => {
  const response =
    await api.post<AdminUser>(
      ADMIN_USER_API,
      data
    );

  return response.data;
};

// ========================================
// UPDATE ADMIN USER
//
// PUT /api/admin-users/:id
//
// Refused for your own role and for
// demoting the last admin.
// ========================================

export const updateAdminUser = async (
  id: string,
  data: AdminUserPayload
): Promise<AdminUser> => {
  const response =
    await api.put<AdminUser>(
      `${ADMIN_USER_API}/${id}`,
      data
    );

  return response.data;
};

// ========================================
// DELETE ADMIN USER
//
// DELETE /api/admin-users/:id
//
// Refused for yourself and the last admin.
// ========================================

export const deleteAdminUser = async (
  id: string
): Promise<void> => {
  await api.delete(
    `${ADMIN_USER_API}/${id}`
  );
};

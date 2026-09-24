import api from "../base/api";

import type {
  Branch,
  BranchPayload,
} from "./branch.types";

// ========================================
// API CONFIGURATION
//
// Paths are relative: the shared `api`
// instance owns the base URL and attaches
// the admin bearer token.
// ========================================

const BRANCH_API = "/api/branches";

// ========================================
// GET ALL BRANCHES
//
// GET /api/branches
//
// Public; oldest first, so the main
// branch stays on top.
// ========================================

export const getBranches =
  async (): Promise<Branch[]> => {
    const response =
      await api.get<Branch[]>(BRANCH_API);

    return response.data;
  };

// ========================================
// CREATE BRANCH
//
// POST /api/branches
// ========================================

export const createBranch = async (
  data: BranchPayload
): Promise<Branch> => {
  const response = await api.post<Branch>(
    BRANCH_API,
    data
  );

  return response.data;
};

// ========================================
// UPDATE BRANCH
//
// PUT /api/branches/:id
// ========================================

export const updateBranch = async (
  id: string,
  data: BranchPayload
): Promise<Branch> => {
  const response = await api.put<Branch>(
    `${BRANCH_API}/${id}`,
    data
  );

  return response.data;
};

// ========================================
// DELETE BRANCH
//
// DELETE /api/branches/:id
// ========================================

export const deleteBranch = async (
  id: string
): Promise<void> => {
  await api.delete(`${BRANCH_API}/${id}`);
};

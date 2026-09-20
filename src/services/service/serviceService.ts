import api from "../base/api";

import type {
  Service,
  ServicePayload,
} from "./service.types";

// ========================================
// API CONFIGURATION
//
// Paths are relative: the shared `api`
// instance owns the base URL and attaches
// the admin bearer token.
// ========================================

const SERVICE_API = "/api/services";

// ========================================
// GET ALL SERVICES
//
// GET /api/services
//
// This route is public, so the token the
// interceptor adds is simply ignored.
// ========================================

export const getServices =
  async (): Promise<Service[]> => {
    const response = await api.get<
      Service[]
    >(SERVICE_API);

    return Array.isArray(response.data)
      ? response.data
      : [];
  };

// ========================================
// CREATE SERVICE
//
// POST /api/services
// ========================================

export const createService = async (
  data: ServicePayload
): Promise<Service> => {
  const response =
    await api.post<Service>(
      SERVICE_API,
      data
    );

  return response.data;
};

// ========================================
// UPDATE SERVICE
//
// PUT /api/services/:id
// ========================================

export const updateService = async (
  id: string,
  data: ServicePayload
): Promise<Service> => {
  const response =
    await api.put<Service>(
      `${SERVICE_API}/${id}`,
      data
    );

  return response.data;
};

// ========================================
// DELETE SERVICE
//
// DELETE /api/services/:id
// ========================================

export const deleteService = async (
  id: string
): Promise<void> => {
  await api.delete(
    `${SERVICE_API}/${id}`
  );
};

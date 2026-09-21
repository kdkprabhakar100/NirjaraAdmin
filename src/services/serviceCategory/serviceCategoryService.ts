import api from "../base/api";

import type {
  ServiceCategory,
  ServiceCategoryPayload,
} from "./serviceCategory.types";

// ========================================
// API CONFIGURATION
//
// Paths are relative: the shared `api`
// instance owns the base URL and attaches
// the admin bearer token.
// ========================================

const CATEGORY_API =
  "/api/service-categories";

// ========================================
// FILTERS
//
// Optional. `search` matches the name or
// the description.
// ========================================

export type ServiceCategoryFilters = {
  search?: string;
};

// ========================================
// GET ALL CATEGORIES
//
// GET /api/service-categories
//
// Public, so the website can build its
// filter chips from the same list. Every
// row carries `serviceCount`.
// ========================================

export const getServiceCategories =
  async (
    filters: ServiceCategoryFilters = {}
  ): Promise<ServiceCategory[]> => {
    const response = await api.get<
      ServiceCategory[]
    >(CATEGORY_API, {
      params: {
        search:
          filters.search?.trim() ||
          undefined,
      },
    });

    return Array.isArray(response.data)
      ? response.data
      : [];
  };

// ========================================
// CREATE CATEGORY
//
// POST /api/service-categories
//
// Answers 409 when the name is taken.
// ========================================

export const createServiceCategory =
  async (
    data: ServiceCategoryPayload
  ): Promise<ServiceCategory> => {
    const response =
      await api.post<ServiceCategory>(
        CATEGORY_API,
        data
      );

    return response.data;
  };

// ========================================
// UPDATE CATEGORY
//
// PUT /api/service-categories/:id
// ========================================

export const updateServiceCategory =
  async (
    id: string,
    data: ServiceCategoryPayload
  ): Promise<ServiceCategory> => {
    const response =
      await api.put<ServiceCategory>(
        `${CATEGORY_API}/${id}`,
        data
      );

    return response.data;
  };

// ========================================
// DELETE CATEGORY
//
// DELETE /api/service-categories/:id
//
// Answers 409 while services still use it.
// ========================================

export const deleteServiceCategory =
  async (id: string): Promise<void> => {
    await api.delete(
      `${CATEGORY_API}/${id}`
    );
  };

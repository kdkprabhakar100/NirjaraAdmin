import api from "../base/api";

import type {
  ProductCategory,
  ProductCategoryPayload,
} from "./productCategory.types";

// ========================================
// API CONFIGURATION
//
// Paths are relative: the shared `api`
// instance owns the base URL and attaches
// the admin bearer token.
// ========================================

const CATEGORY_API =
  "/api/product-categories";

// ========================================
// FILTERS
//
// Optional. `search` matches the name or
// the description.
// ========================================

export type ProductCategoryFilters = {
  search?: string;
};

// ========================================
// GET ALL CATEGORIES
//
// GET /api/product-categories
//
// Public, so the website can group the
// shop by the same list. Every
// row carries `productCount`.
// ========================================

export const getProductCategories =
  async (
    filters: ProductCategoryFilters = {}
  ): Promise<ProductCategory[]> => {
    const response = await api.get<
      ProductCategory[]
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
// POST /api/product-categories
//
// Answers 409 when the name is taken.
// ========================================

export const createProductCategory =
  async (
    data: ProductCategoryPayload
  ): Promise<ProductCategory> => {
    const response =
      await api.post<ProductCategory>(
        CATEGORY_API,
        data
      );

    return response.data;
  };

// ========================================
// UPDATE CATEGORY
//
// PUT /api/product-categories/:id
// ========================================

export const updateProductCategory =
  async (
    id: string,
    data: ProductCategoryPayload
  ): Promise<ProductCategory> => {
    const response =
      await api.put<ProductCategory>(
        `${CATEGORY_API}/${id}`,
        data
      );

    return response.data;
  };

// ========================================
// DELETE CATEGORY
//
// DELETE /api/product-categories/:id
//
// Answers 409 while products still use it.
// ========================================

export const deleteProductCategory =
  async (id: string): Promise<void> => {
    await api.delete(
      `${CATEGORY_API}/${id}`
    );
  };

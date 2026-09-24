import api from "../base/api";

import type {
  GalleryItem,
  GalleryItemPayload,
} from "./gallery.types";

// ========================================
// API CONFIGURATION
//
// Paths are relative: the shared `api`
// instance owns the base URL and attaches
// the admin bearer token.
// ========================================

const GALLERY_API = "/api/gallery";

// ========================================
// CREATE MANY GALLERY ITEMS
//
// POST /api/gallery/bulk
//
// All items are saved or none are, and
// the response keeps the request order.
// ========================================

export const createGalleryItems =
  async (
    items: GalleryItemPayload[]
  ): Promise<GalleryItem[]> => {
    const response =
      await api.post<GalleryItem[]>(
        `${GALLERY_API}/bulk`,
        { items }
      );

    return response.data;
  };

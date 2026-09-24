// ========================================
// GALLERY TYPES
// ========================================

export type GalleryItem = {
  _id: string;

  // Both optional on the backend; older
  // records may not have a description.
  title?: string;

  description?: string;

  image: string;

  createdAt?: string;

  updatedAt?: string;
};

// ========================================
// CREATE PAYLOAD
//
// Only the image is required.
// ========================================

export type GalleryItemPayload = {
  image: string;

  title?: string;

  description?: string;
};

// Matches MAX_BULK_ITEMS on the backend.
export const MAX_GALLERY_BATCH = 20;

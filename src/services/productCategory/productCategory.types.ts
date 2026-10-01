// ========================================
// PRODUCT CATEGORY TYPES
//
// Categories are their own collection, so a
// product points at one by
// `product_category_id`.
// ========================================

export type ProductCategory = {
  // Absent until the document is saved.
  _id?: string;

  name: string;

  description?: string;

  // How many products sit in this category.
  // The list endpoint adds it; a single
  // document (an edit response) does not.
  productCount?: number;

  createdAt?: string;

  updatedAt?: string;
};

// ========================================
// PAYLOAD
//
// What the form sends. The server owns the
// id, the timestamps and the count.
// ========================================

export type ProductCategoryPayload = Omit<
  ProductCategory,
  | "_id"
  | "productCount"
  | "createdAt"
  | "updatedAt"
>;

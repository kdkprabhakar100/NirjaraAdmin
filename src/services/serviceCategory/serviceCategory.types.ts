// ========================================
// SERVICE CATEGORY TYPES
//
// Categories are their own collection now,
// so a service points at one by id.
// ========================================

export type ServiceCategory = {
  // Absent until the document is saved.
  _id?: string;

  name: string;

  description?: string;

  icon?: string;

  // How many services sit in this category.
  // The list endpoint adds it; a single
  // document (an edit response) does not.
  serviceCount?: number;

  createdAt?: string;

  updatedAt?: string;
};

// ========================================
// PAYLOAD
//
// What the form sends. The server owns the
// id, the timestamps and the count.
// ========================================

export type ServiceCategoryPayload = Omit<
  ServiceCategory,
  | "_id"
  | "serviceCount"
  | "createdAt"
  | "updatedAt"
>;

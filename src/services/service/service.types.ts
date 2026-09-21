import type { ServiceCategory } from "../serviceCategory/serviceCategory.types";

// ========================================
// SERVICE TYPES
//
// "Service" here is a salon service shown
// on the website, not an API client.
// ========================================

export type Service = {
  // Absent until the document is saved.
  _id?: string;

  icon: string;

  title: string;

  description: string;

  // Free text, e.g. "From Rs. 800".
  price: string;

  // The server populates the category, so
  // a row can show its name without a
  // second request. Null when the category
  // was removed underneath us.
  category: ServiceCategory | null;

  image?: string;

  createdAt?: string;

  updatedAt?: string;
};

// ========================================
// PAYLOAD
//
// What the form sends. The server owns the
// id and the timestamps, and wants the
// category as a plain id.
// ========================================

export type ServicePayload = Omit<
  Service,
  | "_id"
  | "category"
  | "createdAt"
  | "updatedAt"
> & {
  category: string;
};

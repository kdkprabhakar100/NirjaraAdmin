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

  category: string;

  image?: string;

  createdAt?: string;

  updatedAt?: string;
};

// ========================================
// PAYLOAD
//
// What the form sends. The server owns the
// id and the timestamps.
// ========================================

export type ServicePayload = Omit<
  Service,
  "_id" | "createdAt" | "updatedAt"
>;

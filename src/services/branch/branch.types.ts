// ========================================
// BRANCH TYPES
// ========================================

export type Branch = {
  _id: string;

  name: string;

  // Short tag under the name, e.g.
  // "Main Branch · Est. 2013".
  label: string;

  address: string;

  phone: string;

  openingHours: string;

  mapUrl: string;

  createdAt?: string;

  updatedAt?: string;
};

// ========================================
// CREATE / UPDATE PAYLOAD
//
// Only the name is required.
// ========================================

export type BranchPayload = Omit<
  Branch,
  "_id" | "createdAt" | "updatedAt"
>;

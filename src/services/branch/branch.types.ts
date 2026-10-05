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

  // Booking hours: the appointment times
  // the website offers at this branch.
  // "HH:mm"; the last slot must end by
  // bookingCloses.
  bookingOpens: string;

  bookingCloses: string;

  // Length of one slot, in minutes.
  slotMinutes: number;

  createdAt?: string;

  updatedAt?: string;
};

// ========================================
// CREATE / UPDATE PAYLOAD
//
// Only the name is required; the booking
// hours default to 10:00–19:00 in 30
// minute slots.
// ========================================

export type BranchPayload = Omit<
  Branch,
  "_id" | "createdAt" | "updatedAt"
>;

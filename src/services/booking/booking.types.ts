// ========================================
// BOOKING TYPES
// ========================================

export type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "Cancelled";

export type BookingType =
  | "service"
  | "course";

// Query for GET /api/bookings. An empty
// type means "all types".
export type BookingFilters = {
  search?: string;

  type?: BookingType | "";
};

export type Booking = {
  _id: string;

  name: string;

  phone: string;

  email: string;

  type: BookingType;

  // Only one of these is filled in,
  // depending on `type`.
  service?: string;

  course?: string;

  // The branch name when the booking was
  // made.
  branch: string;

  // Decides which branch admins see it.
  // Null on bookings from before branches
  // had ids.
  branchId?: string | null;

  date: string;

  time: string;

  status: BookingStatus;

  createdAt?: string;

  updatedAt?: string;
};

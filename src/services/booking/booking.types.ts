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

  branch: string;

  date: string;

  time: string;

  status: BookingStatus;

  createdAt?: string;

  updatedAt?: string;
};

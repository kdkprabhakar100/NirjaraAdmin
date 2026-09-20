import api from "../base/api";

import type {
  Booking,
  BookingStatus,
} from "./booking.types";

// ========================================
// API CONFIGURATION
//
// Paths are relative: the shared `api`
// instance owns the base URL and attaches
// the admin bearer token.
// ========================================

const BOOKING_API = "/api/bookings";

// ========================================
// GET ALL BOOKINGS
// ADMIN
//
// GET /api/bookings
//
// The `t` param busts any cached response
// so a freshly confirmed booking never
// shows up stale.
// ========================================

export const getBookings =
  async (): Promise<Booking[]> => {
    const response = await api.get<
      Booking[]
    >(BOOKING_API, {
      params: {
        t: Date.now(),
      },
    });

    return Array.isArray(response.data)
      ? response.data
      : [];
  };

// ========================================
// UPDATE BOOKING STATUS
//
// PUT /api/bookings/:id
//
// Confirm or cancel a booking.
// ========================================

export const updateBookingStatus =
  async (
    id: string,
    status: BookingStatus
  ): Promise<Booking> => {
    const response =
      await api.put<Booking>(
        `${BOOKING_API}/${id}`,
        {
          status,
        }
      );

    return response.data;
  };

// ========================================
// DELETE BOOKING
//
// DELETE /api/bookings/:id
// ========================================

export const deleteBooking = async (
  id: string
): Promise<void> => {
  await api.delete(
    `${BOOKING_API}/${id}`
  );
};

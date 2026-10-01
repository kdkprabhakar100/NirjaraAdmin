import api from "../base/api";

import type {
  Booking,
  BookingFilters,
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
// GET /api/bookings?search=&type=
//
// Newest first. `search` matches name,
// phone, email, service, course or
// branch; `type` narrows to service or
// course. Blank filters are left off.
//
// The `t` param busts any cached response
// so a freshly confirmed booking never
// shows up stale.
// ========================================

export const getBookings =
  async (
    filters: BookingFilters = {}
  ): Promise<Booking[]> => {
    const response = await api.get<
      Booking[]
    >(BOOKING_API, {
      params: {
        search:
          filters.search?.trim() ||
          undefined,
        type: filters.type || undefined,
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

    announceBookingsChanged();

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

  announceBookingsChanged();
};

// ========================================
// PENDING COUNT
//
// GET /api/bookings/pending-count
//
// The badge next to Bookings in the
// sidebar.
// ========================================

export const getPendingBookingCount =
  async (): Promise<number> => {
    const response = await api.get<{
      pending: number;
    }>(`${BOOKING_API}/pending-count`, {
      params: {
        t: Date.now(),
      },
    });

    return response.data?.pending ?? 0;
  };

// ========================================
// CHANGE NOTICE
//
// Fired after a status change or delete,
// so the sidebar badge refreshes at once
// instead of on its next poll.
// ========================================

export const BOOKINGS_CHANGED_EVENT =
  "bookings:changed";

const announceBookingsChanged = () => {
  window.dispatchEvent(
    new Event(BOOKINGS_CHANGED_EVENT)
  );
};

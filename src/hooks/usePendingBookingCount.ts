import { useEffect, useState } from "react";

import {
  BOOKINGS_CHANGED_EVENT,
  getPendingBookingCount,
} from "../services/booking/bookingService";

// New bookings come from the website, so
// the panel cannot be told about them; it
// asks again on this interval.
const POLL_MS = 60_000;

// ========================================
// PENDING BOOKING COUNT
//
// For the sidebar badge. Refreshes on an
// interval, when the tab regains focus,
// and right after the panel changes a
// booking. `enabled` is false for accounts
// without bookings.view, which never ask.
// ========================================

export function usePendingBookingCount(
  enabled: boolean
): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setCount(0);

      return;
    }

    let cancelled = false;

    const refresh = () => {
      getPendingBookingCount()
        .then((pending) => {
          if (!cancelled) {
            setCount(pending);
          }
        })
        // A badge is not worth an error
        // toast; keep the last count.
        .catch(() => undefined);
    };

    refresh();

    const timer = setInterval(
      refresh,
      POLL_MS
    );

    window.addEventListener(
      BOOKINGS_CHANGED_EVENT,
      refresh
    );

    window.addEventListener(
      "focus",
      refresh
    );

    return () => {
      cancelled = true;

      clearInterval(timer);

      window.removeEventListener(
        BOOKINGS_CHANGED_EVENT,
        refresh
      );

      window.removeEventListener(
        "focus",
        refresh
      );
    };
  }, [enabled]);

  return count;
}

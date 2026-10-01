import {
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../components/CustomTable";

import DialogBox from "../../components/DialogBox";

import RowActionsMenu from "../../components/RowActionsMenu";

import { getApiErrorMessage } from "../../services/base/api";

import {
  deleteBooking as deleteBookingRequest,
  getBookings,
  updateBookingStatus,
} from "../../services/booking/bookingService";

import type {
  Booking,
  BookingType,
} from "../../services/booking/booking.types";

// How long typing must pause before a
// search request goes out.
const SEARCH_DELAY_MS = 350;

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Only the first load blanks the table.
  // Later loads (a search, a filter) swap
  // the rows in place.
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // ---- Search + filter ----
  //
  // `search` follows the keyboard;
  // `appliedSearch` is what was actually
  // sent, so the server is not hit on every
  // keystroke.

  const [search, setSearch] =
    useState("");

  const [appliedSearch, setAppliedSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState<BookingType | "">("");

  // Counts the booking requests, so a slow
  // one cannot overwrite a fresher list.
  const latestRequest = useRef(0);

  // The booking awaiting delete confirmation.
  // Null means the dialog is closed.
  const [bookingToDelete, setBookingToDelete] =
    useState<Booking | null>(null);

  // ============================
  // FETCH BOOKINGS
  //
  // Filtering happens on the server, so the
  // search box matches every booking, not
  // only the ones already on screen.
  // ============================

  const fetchBookings = async () => {
    // Typing fires one request per pause,
    // so an older answer must not land on
    // top of a newer one.
    const requestId = ++latestRequest.current;

    try {
      const data = await getBookings({
        search: appliedSearch,
        type: typeFilter,
      });

      if (
        requestId !==
        latestRequest.current
      ) {
        return;
      }

      setBookings(data);
    } catch (error) {
      console.error(
        "Fetch bookings error:",
        error
      );

      if (
        requestId !==
        latestRequest.current
      ) {
        return;
      }

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load bookings"
        )
      );

      setBookings([]);
    } finally {
      if (
        requestId ===
        latestRequest.current
      ) {
        setLoading(false);
      }
    }
  };

  // ---- Debounce the search box ----

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearch(search.trim());
    }, SEARCH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchBookings();
  }, [appliedSearch, typeFilter]);

  // ============================
  // UPDATE STATUS
  // ============================

  const updateStatus = async (
    id: string,
    status: Booking["status"]
  ) => {
    try {
      setProcessingId(id);

      await updateBookingStatus(
        id,
        status
      );

      // Update UI immediately
      setBookings((previous) =>
        previous.map((booking) =>
          booking._id === id
            ? {
                ...booking,
                status,
              }
            : booking
        )
      );

      // Show toast immediately
      if (status === "Confirmed") {
        toast.success(
          "Booking confirmed successfully!"
        );
      }

      if (status === "Cancelled") {
        toast.success(
          "Booking cancelled successfully!"
        );
      }
    } catch (error) {
      console.error(
        "Update booking error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Unable to update booking"
        )
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ============================
  // DELETE BOOKING
  //
  // Asking happens in the dialog; this
  // only runs once the admin confirms.
  // ============================

  const requestDelete = (
    booking: Booking
  ) => {
    setBookingToDelete(booking);
  };

  const confirmDelete = async () => {
    if (!bookingToDelete) {
      return;
    }

    const id = bookingToDelete._id;

    try {
      setProcessingId(id);

      await deleteBookingRequest(id);

      // Remove from UI immediately
      setBookings((previous) =>
        previous.filter(
          (booking) =>
            booking._id !== id
        )
      );

      toast.success(
        "Booking deleted successfully!"
      );

      setBookingToDelete(null);
    } catch (error) {
      console.error(
        "Delete booking error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Unable to delete booking"
        )
      );

      // Dialog stays open so the admin can
      // retry without hunting for the row
      // again.
    } finally {
      setProcessingId(null);
    }
  };

  // ============================
  // STATUS COLORS
  // ============================

  const statusClass = (
    status: Booking["status"]
  ) => {
    if (status === "Confirmed") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Cancelled") {
      return "bg-red-100 text-red-700";
    }

    return "bg-blush text-[#E75480]";
  };

  const statusBadge = (
    booking: Booking
  ) => (
    <span
      className={`inline-block rounded-full px-4 py-1 text-xs ${statusClass(
        booking.status
      )}`}
    >
      {booking.status}
    </span>
  );

  // ============================
  // ACTION MENU
  //
  // A render function rather than a nested
  // component: a component declared inside
  // the page would be a new type on every
  // render, so React would remount the
  // open menu and close it.
  // ============================

  const renderActions = (
    booking: Booking
  ) => (
    <RowActionsMenu
      label={`Actions for ${booking.name}`}
      busy={
        processingId === booking._id
      }
      actions={[
        {
          key: "confirm",
          label: "Confirm",
          icon: "✓",
          tone: "success",
          disabled:
            booking.status ===
            "Confirmed",
          onSelect: () =>
            updateStatus(
              booking._id,
              "Confirmed"
            ),
        },
        {
          key: "cancel",
          label: "Cancel",
          icon: "✕",
          tone: "danger",
          disabled:
            booking.status ===
            "Cancelled",
          onSelect: () =>
            updateStatus(
              booking._id,
              "Cancelled"
            ),
        },
        {
          key: "delete",
          label: "Delete",
          icon: "🗑",
          tone: "danger",
          dividerBefore: true,
          onSelect: () =>
            requestDelete(booking),
        },
      ]}
    />
  );

  // ============================
  // COLUMNS
  //
  // Drives both the desktop table and the
  // mobile cards. Columns marked
  // hideOnMobile already appear in the card
  // header or footer, so the label/value
  // list would only repeat them.
  // ============================

  const columns: TableColumn<Booking>[] = [
    {
      key: "name",
      header: "Customer",
      hideOnMobile: true,
      cellClassName:
        "font-medium text-ink",
      render: (booking) => booking.name,
    },
    {
      key: "phone",
      header: "Phone",
      cellClassName: "whitespace-nowrap",
      render: (booking) => booking.phone,
    },
    {
      key: "email",
      header: "Email",
      cellClassName: "break-all",
      render: (booking) => booking.email,
    },
    {
      key: "type",
      header: "Type",
      hideOnMobile: true,
      cellClassName: "capitalize",
      render: (booking) => booking.type,
    },
    {
      key: "selected",
      header: "Selected",
      mobileLabel: "Selected",
      render: (booking) =>
        booking.type === "course"
          ? booking.course
          : booking.service,
    },
    {
      key: "branch",
      header: "Branch",
      render: (booking) => booking.branch,
    },
    {
      key: "date",
      header: "Date",
      cellClassName: "whitespace-nowrap",
      render: (booking) => booking.date,
    },
    {
      key: "time",
      header: "Time",
      cellClassName: "whitespace-nowrap",
      render: (booking) => booking.time,
    },
    {
      key: "status",
      header: "Status",
      hideOnMobile: true,
      render: statusBadge,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "90px",
      hideOnMobile: true,
      render: renderActions,
    },
  ];

  // ============================
  // UI
  // ============================

  const filtersActive = Boolean(
    appliedSearch || typeFilter
  );

  return (
    <div>
      <div>
        <p className="text-xs uppercase tracking-[3px] text-[#E75480]">
          Management
        </p>

        <h1 className="mt-2 font-serif text-4xl text-[#E75480] md:text-5xl">
          Bookings
        </h1>

        <p className="mt-2 text-muted">
          View, confirm, cancel, or delete customer bookings.
        </p>
      </div>

      {/* SEARCH + TYPE FILTER */}

      <div className="mt-8 flex flex-col gap-3 rounded-3xl bg-surface p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-muted">
          {bookings.length} booking
          {bookings.length === 1
            ? ""
            : "s"}{" "}
          {filtersActive
            ? "found"
            : "in total"}
        </p>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search name, phone, email, service or branch..."
            className="w-full rounded-xl border border-[#E75480]/20 bg-soft px-4 py-3 text-sm outline-none focus:border-[#E75480] lg:w-80"
          />

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value as
                  | BookingType
                  | ""
              )
            }
            className="rounded-xl border border-[#E75480]/20 bg-soft px-4 py-3 text-sm text-ink outline-none focus:border-[#E75480]"
          >
            <option value="">
              All Types
            </option>

            <option value="service">
              Service
            </option>

            <option value="course">
              Course
            </option>
          </select>
        </div>
      </div>

      <CustomTable
        className="mt-6"
        columns={columns}
        rows={bookings}
        rowKey={(booking) =>
          booking._id
        }
        loading={loading}
        loadingMessage="Loading bookings..."
        emptyTitle={
          filtersActive
            ? "No matching bookings"
            : "No bookings available"
        }
        emptyMessage={
          filtersActive
            ? "Try a different search, or pick another type."
            : "New bookings from customers will show up here."
        }
        minWidth="1100px"
        mobileTitle={(booking) =>
          booking.name
        }
        mobileSubtitle={(booking) =>
          booking.type
        }
        mobileBadge={statusBadge}
        mobileActions={renderActions}
      />

      {/* ============================ */}
      {/* DELETE CONFIRMATION          */}
      {/* ============================ */}

      <DialogBox
        open={Boolean(bookingToDelete)}
        onClose={() =>
          setBookingToDelete(null)
        }
        eyebrow="Confirm"
        title="Delete booking?"
        description={
          bookingToDelete
            ? `This will permanently remove ${bookingToDelete.name}'s booking. This cannot be undone.`
            : undefined
        }
        size="sm"
        destructive
        confirmLabel="Delete"
        submittingLabel="Deleting..."
        submitting={Boolean(
          bookingToDelete &&
            processingId ===
              bookingToDelete._id
        )}
        onConfirm={confirmDelete}
      >
        <p className="text-sm text-muted">
          Cancelling the booking instead
          keeps the record and lets the
          customer be notified.
        </p>
      </DialogBox>
    </div>
  );
}

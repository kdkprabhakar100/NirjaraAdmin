import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../components/CustomTable";

import DialogBox from "../components/DialogBox";

import { getApiErrorMessage } from "../services/base/api";

import {
  deleteBooking as deleteBookingRequest,
  getBookings,
  updateBookingStatus,
} from "../services/booking/bookingService";

import type { Booking } from "../services/booking/booking.types";

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // The booking awaiting delete confirmation.
  // Null means the dialog is closed.
  const [bookingToDelete, setBookingToDelete] =
    useState<Booking | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // ============================
  // FETCH BOOKINGS
  // ============================

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const data = await getBookings();

      setBookings(data);
    } catch (error) {
      console.error(
        "Fetch bookings error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load bookings"
        )
      );

      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ============================
  // CLOSE ACTION MENU
  // ============================

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ============================
  // UPDATE STATUS
  // ============================

  const updateStatus = async (
    id: string,
    status: Booking["status"]
  ) => {
    try {
      setProcessingId(id);
      setOpenMenuId(null);

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
    setOpenMenuId(null);
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

    return "bg-[#FCE7EF] text-[#E75480]";
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
  ) => {
    const isOpen =
      openMenuId === booking._id;

    const processing =
      processingId === booking._id;

    return (
      <div
        className="relative"
        ref={
          isOpen
            ? menuRef
            : null
        }
      >
        <button
          type="button"
          disabled={processing}
          onClick={() =>
            setOpenMenuId(
              isOpen
                ? null
                : booking._id
            )
          }
          className="flex min-w-[120px] items-center justify-between gap-3 rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-2 text-xs text-[#3A2A2F] transition hover:border-[#E75480] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>
            {processing
              ? "Processing..."
              : "Actions"}
          </span>

          <span
            className={`transition ${
              isOpen
                ? "rotate-180"
                : ""
            }`}
          >
            ▾
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-[#E75480]/10 bg-white py-2 shadow-xl">
            <button
              type="button"
              disabled={
                booking.status ===
                "Confirmed"
              }
              onClick={() =>
                updateStatus(
                  booking._id,
                  "Confirmed"
                )
              }
              className="block w-full px-4 py-3 text-left text-xs text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ✓ Confirm
            </button>

            <button
              type="button"
              disabled={
                booking.status ===
                "Cancelled"
              }
              onClick={() =>
                updateStatus(
                  booking._id,
                  "Cancelled"
                )
              }
              className="block w-full px-4 py-3 text-left text-xs text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ✕ Cancel
            </button>

            <div className="my-1 border-t border-gray-100" />

            <button
              type="button"
              onClick={() =>
                requestDelete(booking)
              }
              className="block w-full px-4 py-3 text-left text-xs text-[#E75480] transition hover:bg-[#FFF5F8]"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

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
        "font-medium text-[#3A2A2F]",
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
      hideOnMobile: true,
      render: renderActions,
    },
  ];

  // ============================
  // UI
  // ============================

  return (
    <div>
      <div>
        <p className="text-xs uppercase tracking-[3px] text-[#E75480]">
          Management
        </p>

        <h1 className="mt-2 font-serif text-4xl text-[#E75480] md:text-5xl">
          Bookings
        </h1>

        <p className="mt-2 text-[#8A6F78]">
          View, confirm, cancel, or delete customer bookings.
        </p>
      </div>

      <CustomTable
        className="mt-10"
        columns={columns}
        rows={bookings}
        rowKey={(booking) =>
          booking._id
        }
        loading={loading}
        loadingMessage="Loading bookings..."
        emptyTitle="No bookings available"
        emptyMessage="New bookings from customers will show up here."
        minWidth="1100px"
        mobileTitle={(booking) =>
          booking.name
        }
        mobileSubtitle={(booking) =>
          booking.type
        }
        mobileBadge={statusBadge}
        mobileFooter={renderActions}
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
        <p className="text-sm text-[#8A6F78]">
          Cancelling the booking instead
          keeps the record and lets the
          customer be notified.
        </p>
      </DialogBox>
    </div>
  );
}

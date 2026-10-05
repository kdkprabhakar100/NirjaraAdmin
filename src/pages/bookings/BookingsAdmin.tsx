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

import { useAdminSession } from "../../hooks/useAuth";

import { getApiErrorMessage } from "../../services/base/api";

import { getBranches } from "../../services/branch/branchService";

import type { Branch } from "../../services/branch/branch.types";

import {
  deleteBooking as deleteBookingRequest,
  getBookings,
  updateBookingStatus,
} from "../../services/booking/bookingService";

import type {
  Booking,
  BookingStatus,
  BookingType,
} from "../../services/booking/booking.types";

// How long typing must pause before a
// search request goes out.
const SEARCH_DELAY_MS = 350;

// ========================================
// FILTER STYLES
// ========================================

const filterClass =
  "rounded-xl border border-[#E75480]/20 bg-soft px-4 py-3 text-sm text-ink outline-none focus:border-[#E75480]";

const filterLabelClass =
  "mb-1 block text-[11px] uppercase tracking-[1.5px] text-muted";

export default function BookingsAdmin() {
  // The API only sends a branch account
  // its own branch's bookings.
  const branchName =
    useAdminSession()?.branch?.name;

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

  const [statusFilter, setStatusFilter] =
    useState<BookingStatus | "">("");

  // A branch id; "" for every branch.
  const [branchFilter, setBranchFilter] =
    useState("");

  // Appointment dates, "YYYY-MM-DD"; either
  // end may be left blank.
  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [branches, setBranches] =
    useState<Branch[]>([]);

  useEffect(() => {
    // For the branch filter and the
    // addresses in the Branch column.
    getBranches()
      .then(setBranches)
      .catch((error) => {
        console.error(
          "Fetch branches error:",
          error
        );
      });
  }, []);

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
        status: statusFilter,
        branch: branchFilter,
        dateFrom,
        dateTo,
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
  }, [
    appliedSearch,
    typeFilter,
    statusFilter,
    branchFilter,
    dateFrom,
    dateTo,
  ]);

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

  // ============================
  // SAME-TIME REQUESTS
  //
  // Customers may ask for a time someone
  // else already asked for; the branch
  // confirms one and cancels the rest.
  // Counts the other open (not cancelled)
  // service bookings on screen for the
  // same branch, date and time.
  // ============================

  const slotKey = (booking: Booking) =>
    [
      booking.branchId ?? booking.branch,
      booking.date,
      booking.time,
    ].join("|");

  const openBookingsBySlot = new Map<
    string,
    Booking[]
  >();

  for (const booking of bookings) {
    if (
      booking.type !== "service" ||
      booking.status === "Cancelled"
    ) {
      continue;
    }

    const key = slotKey(booking);

    openBookingsBySlot.set(key, [
      ...(openBookingsBySlot.get(key) ??
        []),
      booking,
    ]);
  }

  const sameTimeOthers = (
    booking: Booking
  ) =>
    booking.type === "service"
      ? (
          openBookingsBySlot.get(
            slotKey(booking)
          ) ?? []
        ).filter(
          (other) =>
            other._id !== booking._id
        )
      : [];

  const timeCell = (booking: Booking) => {
    const others = sameTimeOthers(booking);

    const confirmedOther = others.some(
      (other) =>
        other.status === "Confirmed"
    );

    return (
      <span>
        {booking.time}

        {others.length > 0 && (
          <span
            className={`mt-1 block whitespace-nowrap text-xs font-medium ${
              confirmedOther
                ? "text-red-600"
                : "text-amber-600"
            }`}
            title={others
              .map(
                (other) =>
                  `${other.name} (${other.status})`
              )
              .join(", ")}
          >
            ⚠ {others.length} other
            {others.length === 1
              ? ""
              : "s"}{" "}
            {confirmedOther
              ? "· one confirmed"
              : "asked too"}
          </span>
        )}
      </span>
    );
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
      render: (booking) => {
        // The name the booking was made
        // with; the address comes from the
        // branch as it is now.
        const address = branches.find(
          (branch) =>
            branch._id === booking.branchId
        )?.address;

        return (
          <span>
            <span className="block">
              {booking.branch}
            </span>

            {address && (
              <span className="block text-xs text-muted">
                {address}
              </span>
            )}
          </span>
        );
      },
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
      render: timeCell,
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
    appliedSearch ||
      typeFilter ||
      statusFilter ||
      branchFilter ||
      dateFrom ||
      dateTo
  );

  const clearFilters = () => {
    setSearch("");
    setAppliedSearch("");
    setTypeFilter("");
    setStatusFilter("");
    setBranchFilter("");
    setDateFrom("");
    setDateTo("");
  };

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
          {branchName
            ? `Bookings and enrollments made at ${branchName}.`
            : "View, confirm, cancel, or delete customer bookings."}
        </p>
      </div>

      {/* SEARCH + FILTERS */}

      <div className="mt-8 rounded-3xl bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
              className={`${filterClass} w-full lg:w-80`}
            />

            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="whitespace-nowrap rounded-xl border border-[#E75480]/30 px-4 py-3 text-xs uppercase tracking-[1.5px] text-[#E75480] transition hover:bg-soft"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block">
            <span className={filterLabelClass}>
              Type
            </span>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as
                    | BookingType
                    | ""
                )
              }
              className={`${filterClass} w-full`}
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
          </label>

          <label className="block">
            <span className={filterLabelClass}>
              Status
            </span>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | BookingStatus
                    | ""
                )
              }
              className={`${filterClass} w-full`}
            >
              <option value="">
                All Statuses
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Confirmed">
                Confirmed
              </option>

              <option value="Cancelled">
                Cancelled
              </option>
            </select>
          </label>

          {/* A branch account only ever
              gets its own branch. */}
          {!branchName && (
            <label className="block">
              <span className={filterLabelClass}>
                Branch
              </span>

              <select
                value={branchFilter}
                onChange={(event) =>
                  setBranchFilter(
                    event.target.value
                  )
                }
                className={`${filterClass} w-full`}
              >
                <option value="">
                  All Branches
                </option>

                {branches.map((branch) => (
                  <option
                    key={branch._id}
                    value={branch._id}
                  >
                    {branch.name}
                    {branch.address
                      ? ` — ${branch.address}`
                      : ""}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block">
            <span className={filterLabelClass}>
              Date from
            </span>

            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) =>
                setDateFrom(
                  event.target.value
                )
              }
              className={`${filterClass} w-full`}
            />
          </label>

          <label className="block">
            <span className={filterLabelClass}>
              Date to
            </span>

            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) =>
                setDateTo(
                  event.target.value
                )
              }
              className={`${filterClass} w-full`}
            />
          </label>
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

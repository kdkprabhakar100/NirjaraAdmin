import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

type Booking = {
  _id: string;
  name: string;
  phone: string;
  email: string;
  type: "service" | "course";
  service?: string;
  course?: string;
  branch: string;
  date: string;
  time: string;
  status: "Pending" | "Confirmed" | "Cancelled";
};

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // ============================
  // FETCH BOOKINGS
  // ============================

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bookings?t=${Date.now()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message || "Failed to load bookings"
        );
      }

      setBookings(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Fetch bookings error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load bookings"
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

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bookings/${id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await res
        .json()
        .catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Failed to update booking"
        );
      }

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
        error instanceof Error
          ? error.message
          : "Unable to update booking"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ============================
  // DELETE BOOKING
  // ============================

  const deleteBooking = async (
    id: string
  ) => {
    setOpenMenuId(null);

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this booking?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(id);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bookings/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "adminToken"
            )}`,
          },
        }
      );

      const data = await res
        .json()
        .catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Failed to delete booking"
        );
      }

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
    } catch (error) {
      console.error(
        "Delete booking error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete booking"
      );
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

  // ============================
  // ACTION MENU
  // ============================

  const ActionMenu = ({
    booking,
  }: {
    booking: Booking;
  }) => {
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
                deleteBooking(
                  booking._id
                )
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

      {loading ? (
        <div className="mt-10 rounded-3xl bg-white p-10 text-center text-[#8A6F78] shadow-sm">
          Loading bookings...
        </div>
      ) : (
        <>
          {/* MOBILE */}
          <div className="mt-10 grid gap-4 md:hidden">
            {bookings.map(
              (booking) => (
                <div
                  key={
                    booking._id
                  }
                  className="rounded-3xl bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[#3A2A2F]">
                        {
                          booking.name
                        }
                      </h3>

                      <p className="mt-1 text-xs capitalize text-[#8A6F78]">
                        {
                          booking.type
                        }
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs ${statusClass(
                        booking.status
                      )}`}
                    >
                      {
                        booking.status
                      }
                    </span>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-[#8A6F78]">
                    <p>
                      <strong>
                        Phone:
                      </strong>{" "}
                      {
                        booking.phone
                      }
                    </p>

                    <p className="break-all">
                      <strong>
                        Email:
                      </strong>{" "}
                      {
                        booking.email
                      }
                    </p>

                    <p>
                      <strong>
                        Selected:
                      </strong>{" "}
                      {booking.type ===
                      "course"
                        ? booking.course
                        : booking.service}
                    </p>

                    <p>
                      <strong>
                        Branch:
                      </strong>{" "}
                      {
                        booking.branch
                      }
                    </p>

                    <p>
                      <strong>
                        Date:
                      </strong>{" "}
                      {
                        booking.date
                      }
                    </p>

                    <p>
                      <strong>
                        Time:
                      </strong>{" "}
                      {
                        booking.time
                      }
                    </p>
                  </div>

                  <div className="mt-5">
                    <ActionMenu
                      booking={
                        booking
                      }
                    />
                  </div>
                </div>
              )
            )}

            {bookings.length ===
              0 && (
              <div className="rounded-3xl bg-white p-8 text-center text-[#8A6F78]">
                No bookings available.
              </div>
            )}
          </div>

          {/* DESKTOP */}
          <div className="mt-10 hidden overflow-visible rounded-3xl bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse">
                <thead className="bg-[#FCE7EF] text-left text-sm text-[#E75480]">
                  <tr>
                    <th className="p-5">
                      Customer
                    </th>

                    <th className="p-5">
                      Phone
                    </th>

                    <th className="p-5">
                      Email
                    </th>

                    <th className="p-5">
                      Type
                    </th>

                    <th className="p-5">
                      Selected
                    </th>

                    <th className="p-5">
                      Branch
                    </th>

                    <th className="p-5">
                      Date
                    </th>

                    <th className="p-5">
                      Time
                    </th>

                    <th className="p-5">
                      Status
                    </th>

                    <th className="p-5">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map(
                    (booking) => (
                      <tr
                        key={
                          booking._id
                        }
                        className="border-t border-[#E75480]/10 hover:bg-[#FFF9FB]"
                      >
                        <td className="p-5 text-sm font-medium text-[#3A2A2F]">
                          {
                            booking.name
                          }
                        </td>

                        <td className="p-5 text-sm text-[#8A6F78]">
                          {
                            booking.phone
                          }
                        </td>

                        <td className="p-5 text-sm text-[#8A6F78]">
                          {
                            booking.email
                          }
                        </td>

                        <td className="p-5 text-sm capitalize text-[#8A6F78]">
                          {
                            booking.type
                          }
                        </td>

                        <td className="p-5 text-sm text-[#8A6F78]">
                          {booking.type ===
                          "course"
                            ? booking.course
                            : booking.service}
                        </td>

                        <td className="p-5 text-sm text-[#8A6F78]">
                          {
                            booking.branch
                          }
                        </td>

                        <td className="p-5 text-sm text-[#8A6F78]">
                          {
                            booking.date
                          }
                        </td>

                        <td className="p-5 text-sm text-[#8A6F78]">
                          {
                            booking.time
                          }
                        </td>

                        <td className="p-5">
                          <span
                            className={`rounded-full px-4 py-1 text-xs ${statusClass(
                              booking.status
                            )}`}
                          >
                            {
                              booking.status
                            }
                          </span>
                        </td>

                        <td className="p-5">
                          <ActionMenu
                            booking={
                              booking
                            }
                          />
                        </td>
                      </tr>
                    )
                  )}

                  {bookings.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={
                          10
                        }
                        className="p-10 text-center text-[#8A6F78]"
                      >
                        No bookings available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
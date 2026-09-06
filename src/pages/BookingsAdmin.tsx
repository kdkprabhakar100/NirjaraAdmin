import { useEffect, useState } from "react";

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

  const fetchBookings = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    const data = await res.json();
    setBookings(data);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: string, status: Booking["status"]) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    fetchBookings();
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Delete this booking?")) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    fetchBookings();
  };

  return (
    <div>
      <h1 className="font-serif text-5xl text-[#E75480]">Bookings</h1>

      <p className="mt-2 text-[#8A6F78]">
        View, confirm, cancel, or delete customer bookings.
      </p>

      {/* Mobile cards */}
      <div className="mt-10 grid gap-4 md:hidden">
        {bookings.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center text-[#8A6F78] shadow-sm">
            No bookings available.
          </div>
        )}

        {bookings.map((booking) => (
          <div key={booking._id} className="rounded-3xl bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[#3A2A2F]">
              {booking.name}
            </h3>

            <div className="mt-4 space-y-2 text-sm text-[#8A6F78]">
              <p>
                <b>Phone:</b> {booking.phone}
              </p>
              <p className="break-words">
                <b>Email:</b> {booking.email}
              </p>
              <p>
                <b>Type:</b> {booking.type}
              </p>
              <p>
                <b>Selected:</b>{" "}
                {booking.type === "course" ? booking.course : booking.service}
              </p>
              <p>
                <b>Branch:</b> {booking.branch}
              </p>
              <p>
                <b>Date:</b> {booking.date}
              </p>
              <p>
                <b>Time:</b> {booking.time}
              </p>
              <p>
                <b>Status:</b>{" "}
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    booking.status === "Confirmed"
                      ? "bg-green-100 text-green-700"
                      : booking.status === "Cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-[#FCE7EF] text-[#E75480]"
                  }`}
                >
                  {booking.status}
                </span>
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => updateStatus(booking._id, "Confirmed")}
                className="rounded-full bg-green-100 px-4 py-2 text-xs text-green-700"
              >
                Confirm
              </button>

              <button
                onClick={() => updateStatus(booking._id, "Cancelled")}
                className="rounded-full bg-red-100 px-4 py-2 text-xs text-red-700"
              >
                Cancel
              </button>

              <button
                onClick={() => deleteBooking(booking._id)}
                className="rounded-full bg-[#FCE7EF] px-4 py-2 text-xs text-[#E75480]"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="mt-10 hidden overflow-x-auto rounded-3xl bg-white shadow-sm md:block">
        <table className="w-full min-w-[950px] border-collapse">
          <thead className="bg-[#FCE7EF] text-left text-sm text-[#E75480]">
            <tr>
              <th className="p-5">Customer</th>
              <th className="p-5">Phone</th>
              <th className="p-5">Email</th>
              <th className="p-5">Type</th>
              <th className="p-5">Selected</th>
              <th className="p-5">Branch</th>
              <th className="p-5">Date</th>
              <th className="p-5">Time</th>
              <th className="p-5">Status</th>
              <th className="p-5">Actions</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} className="border-t border-[#E75480]/10">
                <td className="p-5 text-sm font-medium text-[#3A2A2F]">
                  {booking.name}
                </td>
                <td className="p-5 text-sm text-[#8A6F78]">{booking.phone}</td>
                <td className="p-5 text-sm text-[#8A6F78]">{booking.email}</td>
                <td className="p-5 text-sm capitalize text-[#8A6F78]">
                  {booking.type}
                </td>
                <td className="p-5 text-sm text-[#8A6F78]">
                  {booking.type === "course" ? booking.course : booking.service}
                </td>
                <td className="p-5 text-sm text-[#8A6F78]">{booking.branch}</td>
                <td className="p-5 text-sm text-[#8A6F78]">{booking.date}</td>
                <td className="p-5 text-sm text-[#8A6F78]">{booking.time}</td>

                <td className="p-5">
                  <span
                    className={`rounded-full px-4 py-1 text-xs ${
                      booking.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : booking.status === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-[#FCE7EF] text-[#E75480]"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>

                <td className="p-5">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateStatus(booking._id, "Confirmed")}
                      className="rounded-full bg-green-100 px-4 py-2 text-xs text-green-700"
                    >
                      Confirm
                    </button>

                    <button
                      onClick={() => updateStatus(booking._id, "Cancelled")}
                      className="rounded-full bg-red-100 px-4 py-2 text-xs text-red-700"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => deleteBooking(booking._id)}
                      className="rounded-full bg-[#FCE7EF] px-4 py-2 text-xs text-[#E75480]"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {bookings.length === 0 && (
              <tr>
                <td colSpan={10} className="p-8 text-center text-[#8A6F78]">
                  No bookings available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
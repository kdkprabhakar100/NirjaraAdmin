import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  image: string;
};

type Order = {
  _id: string;
  customerName?: string;
  email?: string;
  phone?: string;
  address?: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders`
      );

      const data = await res.json();

      setOrders(data);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // UPDATE ORDER STATUS
  const updateStatus = async (
    id: string,
    status: string
  ) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order._id === id
            ? { ...order, status }
            : order
        )
      );

      toast.success(`Order marked as ${status}`);
    } catch (error) {
      console.log(error);

      toast.error("Failed to update order");
    }
  };

  // DELETE ORDER
  const deleteOrder = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      setOrders((prev) =>
        prev.filter((order) => order._id !== id)
      );

      toast.success("Order deleted successfully");
    } catch (error) {
      console.log(error);

      toast.error("Failed to delete order");
    }
  };

  return (
    <section className="min-h-screen bg-[#FFF5F8] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        
        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="font-serif text-5xl text-[#E75480]">
            Orders
          </h1>

          <p className="mt-4 text-[#8A6F78]">
            View and manage ecommerce customer orders
          </p>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-[30px] bg-white shadow-sm">
          <table className="min-w-[1450px] w-full">
            
            <thead className="bg-[#FDE7EF]">
              <tr>
                <th className="px-5 py-5 text-left text-sm font-semibold text-[#E75480]">
                  Customer
                </th>

                <th className="px-5 py-5 text-left text-sm font-semibold text-[#E75480]">
                  Phone
                </th>

                <th className="px-5 py-5 text-left text-sm font-semibold text-[#E75480]">
                  Email
                </th>

                <th className="px-5 py-5 text-left text-sm font-semibold text-[#E75480]">
                  Address
                </th>

                <th className="px-5 py-5 text-left text-sm font-semibold text-[#E75480]">
                  Date
                </th>

                <th className="px-5 py-5 text-left text-sm font-semibold text-[#E75480]">
                  Time
                </th>

                <th className="px-5 py-5 text-left text-sm font-semibold text-[#E75480]">
                  Items
                </th>

                <th className="px-5 py-5 text-left text-sm font-semibold text-[#E75480]">
                  Total
                </th>

                <th className="px-5 py-5 text-left text-sm font-semibold text-[#E75480]">
                  Status
                </th>

                <th className="px-5 py-5 text-left text-sm font-semibold text-[#E75480]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const date = new Date(order.createdAt);

                return (
                  <tr
                    key={order._id}
                    className="border-t border-[#F7DCE5] align-top"
                  >
                    {/* CUSTOMER */}
                    <td className="px-5 py-6">
                      <p className="font-semibold text-[#3A2A2F]">
                        {order.customerName || "No name"}
                      </p>
                    </td>

                    {/* PHONE */}
                    <td className="px-5 py-6 text-[#8A6F78] whitespace-nowrap">
                      {order.phone || "No phone"}
                    </td>

                    {/* EMAIL */}
                    <td className="px-5 py-6 text-[#8A6F78]">
                      {order.email || "No email"}
                    </td>

                    {/* ADDRESS */}
                    <td className="max-w-[220px] px-5 py-6 text-[#8A6F78]">
                      {order.address || "No address"}
                    </td>

                    {/* DATE */}
                    <td className="px-5 py-6 text-[#8A6F78] whitespace-nowrap">
                      {date.toLocaleDateString()}
                    </td>

                    {/* TIME */}
                    <td className="px-5 py-6 text-[#8A6F78] whitespace-nowrap">
                      {date.toLocaleTimeString()}
                    </td>

                    {/* ITEMS */}
                    <td className="px-5 py-6">
                      <div className="space-y-4">
                        {order.items?.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-20 w-20 rounded-2xl border border-[#F7DCE5] object-cover"
                            />

                            <div>
                              <p className="font-semibold text-[#3A2A2F]">
                                {item.name}
                              </p>

                              <p className="text-sm text-[#8A6F78]">
                                Qty: {item.quantity}
                              </p>

                              <p className="text-sm font-medium text-[#E75480]">
                                ${item.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* TOTAL */}
                    <td className="px-5 py-6 whitespace-nowrap">
                      <p className="text-3xl font-semibold text-[#E75480]">
                        $
                        {Number(
                          order.totalAmount || 0
                        ).toFixed(2)}
                      </p>
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-6">
                      <span
                        className={`
                          rounded-full px-5 py-2 text-sm font-medium
                          ${
                            order.status === "Pending"
                              ? "bg-pink-100 text-pink-600"
                              : ""
                          }
                          ${
                            order.status === "Processing"
                              ? "bg-yellow-100 text-yellow-700"
                              : ""
                          }
                          ${
                            order.status === "Shipped"
                              ? "bg-blue-100 text-blue-700"
                              : ""
                          }
                          ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-700"
                              : ""
                          }
                        `}
                      >
                        {order.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-6">
                      <div className="flex min-w-[160px] flex-col gap-3">
                        
                        <button
                          onClick={() =>
                            updateStatus(
                              order._id,
                              "Processing"
                            )
                          }
                          className="rounded-full bg-yellow-300 px-5 py-2 text-sm transition hover:opacity-90"
                        >
                          Processing
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(
                              order._id,
                              "Shipped"
                            )
                          }
                          className="rounded-full bg-blue-300 px-5 py-2 text-sm transition hover:opacity-90"
                        >
                          Shipped
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(
                              order._id,
                              "Delivered"
                            )
                          }
                          className="rounded-full bg-green-300 px-5 py-2 text-sm transition hover:opacity-90"
                        >
                          Delivered
                        </button>

                        <button
                          onClick={() =>
                            deleteOrder(order._id)
                          }
                          className="rounded-full bg-red-100 px-5 py-2 text-sm text-red-600 transition hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
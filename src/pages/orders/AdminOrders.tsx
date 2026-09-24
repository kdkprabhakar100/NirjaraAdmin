import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../components/CustomTable";

import DialogBox from "../../components/DialogBox";

import RowActionsMenu from "../../components/RowActionsMenu";

// ========================================
// TYPES
// ========================================

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

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

// ========================================
// STATUS COLORS
// ========================================

const statusClass = (status: string) => {
  if (status === "Processing") {
    return "bg-yellow-100 text-yellow-700";
  }

  if (status === "Shipped") {
    return "bg-blue-100 text-blue-700";
  }

  if (status === "Delivered") {
    return "bg-green-100 text-green-700";
  }

  return "bg-blush text-[#E75480]";
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<
    Order[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  // The order whose items are open in the
  // details dialog.
  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  // The order awaiting delete
  // confirmation.
  const [orderToDelete, setOrderToDelete] =
    useState<Order | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  // ============================
  // FETCH ORDERS
  // ============================

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await res.json();

      setOrders(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.log(error);

      toast.error(
        "Failed to fetch orders"
      );

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ============================
  // UPDATE STATUS
  // ============================

  const updateStatus = async (
    id: string,
    status: string
  ) => {
    try {
      setProcessingId(id);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to update status"
        );
      }

      // Update UI immediately
      setOrders((previous) =>
        previous.map((order) =>
          order._id === id
            ? { ...order, status }
            : order
        )
      );

      toast.success(
        `Order marked as ${status}`
      );
    } catch (error) {
      console.log(error);

      toast.error(
        "Failed to update order"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ============================
  // DELETE
  //
  // Asking happens in the dialog; this
  // only runs once the admin confirms.
  // ============================

  const confirmDelete = async () => {
    if (!orderToDelete) {
      return;
    }

    const id = orderToDelete._id;

    try {
      setDeleting(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      // Remove from UI immediately
      setOrders((previous) =>
        previous.filter(
          (order) => order._id !== id
        )
      );

      toast.success(
        "Order deleted successfully"
      );

      if (selectedOrder?._id === id) {
        setSelectedOrder(null);
      }

      setOrderToDelete(null);
    } catch (error) {
      console.log(error);

      toast.error(
        "Failed to delete order"
      );

      // Dialog stays open so the admin can
      // retry.
    } finally {
      setDeleting(false);
    }
  };

  // ============================
  // ROW PIECES
  // ============================

  const statusBadge = (order: Order) => (
    <span
      className={`inline-block rounded-full px-4 py-1 text-xs ${statusClass(
        order.status
      )}`}
    >
      {order.status}
    </span>
  );

  const itemCount = (order: Order) =>
    order.items?.reduce(
      (total, item) =>
        total + (item.quantity || 0),
      0
    ) ?? 0;

  const renderActions = (order: Order) => (
    <RowActionsMenu
      label={`Actions for the order from ${
        order.customerName || "customer"
      }`}
      busy={processingId === order._id}
      actions={[
        {
          key: "view",
          label: "View items",
          icon: "👁",
          onSelect: () =>
            setSelectedOrder(order),
        },
        {
          key: "processing",
          label: "Processing",
          icon: "⏳",
          disabled:
            order.status ===
            "Processing",
          onSelect: () =>
            updateStatus(
              order._id,
              "Processing"
            ),
        },
        {
          key: "shipped",
          label: "Shipped",
          icon: "📦",
          disabled:
            order.status === "Shipped",
          onSelect: () =>
            updateStatus(
              order._id,
              "Shipped"
            ),
        },
        {
          key: "delivered",
          label: "Delivered",
          icon: "✓",
          tone: "success",
          disabled:
            order.status === "Delivered",
          onSelect: () =>
            updateStatus(
              order._id,
              "Delivered"
            ),
        },
        {
          key: "delete",
          label: "Delete",
          icon: "🗑",
          tone: "danger",
          dividerBefore: true,
          onSelect: () =>
            setOrderToDelete(order),
        },
      ]}
    />
  );

  // ============================
  // COLUMNS
  // ============================

  const columns: TableColumn<Order>[] = [
    {
      key: "customer",
      header: "Customer",
      hideOnMobile: true,
      cellClassName:
        "font-medium text-ink",
      render: (order) =>
        order.customerName || "No name",
    },
    {
      key: "phone",
      header: "Phone",
      cellClassName: "whitespace-nowrap",
      render: (order) =>
        order.phone || "No phone",
    },
    {
      key: "email",
      header: "Email",
      cellClassName: "break-all",
      render: (order) =>
        order.email || "No email",
    },
    {
      key: "address",
      header: "Address",
      cellClassName: "max-w-xs",
      render: (order) =>
        order.address || "No address",
    },
    {
      key: "placed",
      header: "Placed",
      cellClassName: "whitespace-nowrap",
      render: (order) => {
        const date = new Date(
          order.createdAt
        );

        return (
          <>
            <p>
              {date.toLocaleDateString()}
            </p>

            <p className="mt-1 text-xs">
              {date.toLocaleTimeString()}
            </p>
          </>
        );
      },
    },
    {
      key: "items",
      header: "Items",
      cellClassName: "whitespace-nowrap",
      render: (order) => (
        <button
          type="button"
          onClick={() =>
            setSelectedOrder(order)
          }
          className="rounded-full bg-soft px-4 py-2 text-xs text-[#E75480] transition hover:bg-blush"
        >
          {itemCount(order)} item
          {itemCount(order) === 1
            ? ""
            : "s"}
        </button>
      ),
    },
    {
      key: "total",
      header: "Total",
      cellClassName:
        "whitespace-nowrap font-medium text-[#E75480]",
      render: (order) =>
        `$${Number(
          order.totalAmount || 0
        ).toFixed(2)}`,
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

  return (
    <div>
      {/* HEADER */}

      <div>
        <p className="text-xs uppercase tracking-[3px] text-[#E75480]">
          Management
        </p>

        <h1 className="mt-2 font-serif text-4xl text-[#E75480] md:text-5xl">
          Orders
        </h1>

        <p className="mt-2 text-muted">
          View and manage ecommerce customer
          orders.
        </p>
      </div>

      {/* TABLE */}

      <CustomTable
        className="mt-10"
        columns={columns}
        rows={orders}
        rowKey={(order) => order._id}
        loading={loading}
        loadingMessage="Loading orders..."
        emptyIcon="🛍"
        emptyTitle="No orders yet"
        emptyMessage="Orders placed on the website will show up here."
        minWidth="1250px"
        mobileTitle={(order) =>
          order.customerName || "No name"
        }
        mobileSubtitle={(order) =>
          new Date(
            order.createdAt
          ).toLocaleDateString()
        }
        mobileBadge={statusBadge}
        mobileActions={renderActions}
      />

      {/* ============================ */}
      {/* ORDER ITEMS                  */}
      {/* ============================ */}

      <DialogBox
        open={Boolean(selectedOrder)}
        onClose={() =>
          setSelectedOrder(null)
        }
        eyebrow="Order Details"
        title={
          selectedOrder?.customerName ||
          "Order"
        }
        description={
          selectedOrder
            ? `${itemCount(
                selectedOrder
              )} item${
                itemCount(
                  selectedOrder
                ) === 1
                  ? ""
                  : "s"
              } · $${Number(
                selectedOrder.totalAmount ||
                  0
              ).toFixed(2)}`
            : undefined
        }
        size="md"
        cancelLabel="Close"
      >
        {selectedOrder && (
          <div className="space-y-5">
            {selectedOrder.items?.map(
              (item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded-2xl border border-[#E75480]/10 object-cover"
                  />

                  <div>
                    <p className="font-medium text-ink">
                      {item.name}
                    </p>

                    <p className="mt-1 text-sm text-muted">
                      Qty: {item.quantity}
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#E75480]">
                      ${item.price}
                    </p>
                  </div>
                </div>
              )
            )}

            <div className="border-t border-[#E75480]/10 pt-5 text-sm text-muted">
              <p>
                <strong className="text-ink">
                  Address:
                </strong>{" "}
                {selectedOrder.address ||
                  "No address"}
              </p>

              <p className="mt-2">
                <strong className="text-ink">
                  Phone:
                </strong>{" "}
                {selectedOrder.phone ||
                  "No phone"}
              </p>

              <p className="mt-2 break-all">
                <strong className="text-ink">
                  Email:
                </strong>{" "}
                {selectedOrder.email ||
                  "No email"}
              </p>
            </div>
          </div>
        )}
      </DialogBox>

      {/* ============================ */}
      {/* DELETE CONFIRMATION          */}
      {/* ============================ */}

      <DialogBox
        open={Boolean(orderToDelete)}
        onClose={() =>
          setOrderToDelete(null)
        }
        eyebrow="Confirm"
        title="Delete order?"
        description={
          orderToDelete
            ? `The order from ${
                orderToDelete.customerName ||
                "this customer"
              } will be removed. This cannot be undone.`
            : undefined
        }
        size="sm"
        destructive
        confirmLabel="Delete"
        submittingLabel="Deleting..."
        submitting={deleting}
        onConfirm={confirmDelete}
      >
        <p className="text-sm text-muted">
          The order history and its items
          will no longer be available here.
        </p>
      </DialogBox>
    </div>
  );
}

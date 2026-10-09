import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

type Order = {
  _id: string;
  orderNumber?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  items: OrderItem[];
  subtotal?: number;
  shipping?: {
    label?: string;
    cost?: number;
  };
  totalAmount: number;
  paymentStatus?: string;
  status: string;
  createdAt: string;
};

type RangeMode = "today" | "week" | "month" | "all" | "custom";

type ProductSummary = {
  name: string;
  quantity: number;
  revenue: number;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const formatMoney = (value: number) =>
  `Rs. ${Number(value || 0).toLocaleString()}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const startOfDay = (date: Date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const endOfDay = (date: Date) => {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
};

const getRange = (
  mode: RangeMode,
  customFrom: string,
  customTo: string
) => {
  const now = new Date();

  if (mode === "today") {
    return { from: startOfDay(now), to: endOfDay(now) };
  }

  if (mode === "week") {
    const from = startOfDay(now);
    const day = from.getDay();
    from.setDate(from.getDate() + (day === 0 ? -6 : 1 - day));
    return { from, to: endOfDay(now) };
  }

  if (mode === "month") {
    return {
      from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: endOfDay(now),
    };
  }

  if (mode === "custom") {
    return {
      from: customFrom
        ? startOfDay(new Date(`${customFrom}T00:00:00`))
        : null,
      to: customTo ? endOfDay(new Date(`${customTo}T00:00:00`)) : null,
    };
  }

  return { from: null, to: null };
};

const csvEscape = (value: unknown) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function AdminSales() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangeMode, setRangeMode] = useState<RangeMode>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders`,
          { headers: getAuthHeaders() }
        );

        const data = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(data?.message || "Could not load sales.");
        }

        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("SALES LOAD ERROR:", error);
        toast.error(
          error instanceof Error ? error.message : "Could not load sales."
        );
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const verifiedOrders = useMemo(
    () => orders.filter((order) => order.paymentStatus === "Verified"),
    [orders]
  );

  const filteredSales = useMemo(() => {
    const { from, to } = getRange(rangeMode, customFrom, customTo);
    const query = search.trim().toLowerCase();

    return verifiedOrders.filter((order) => {
      const date = new Date(order.createdAt);

      if (Number.isNaN(date.getTime())) return false;
      if (from && date < from) return false;
      if (to && date > to) return false;

      if (!query) return true;

      return [
        order.orderNumber,
        order.customerName,
        order.email,
        order.phone,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [verifiedOrders, rangeMode, customFrom, customTo, search]);

  const metrics = useMemo(() => {
    const revenue = filteredSales.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0
    );

    const productRevenue = filteredSales.reduce((sum, order) => {
      const subtotal =
        order.subtotal ??
        order.items?.reduce(
          (itemSum, item) =>
            itemSum + Number(item.price || 0) * Number(item.quantity || 0),
          0
        ) ??
        0;

      return sum + Number(subtotal || 0);
    }, 0);

    const shippingRevenue = filteredSales.reduce(
      (sum, order) => sum + Number(order.shipping?.cost || 0),
      0
    );

    const productsSold = filteredSales.reduce(
      (sum, order) =>
        sum +
        (order.items?.reduce(
          (itemSum, item) => itemSum + Number(item.quantity || 0),
          0
        ) ?? 0),
      0
    );

    return {
      revenue,
      productRevenue,
      shippingRevenue,
      productsSold,
      averageOrder: filteredSales.length ? revenue / filteredSales.length : 0,
    };
  }, [filteredSales]);

  const topProducts = useMemo<ProductSummary[]>(() => {
    const productMap = new Map<string, ProductSummary>();

    filteredSales.forEach((order) => {
      order.items?.forEach((item) => {
        const key = item.name.trim().toLowerCase();
        const current = productMap.get(key) ?? {
          name: item.name,
          quantity: 0,
          revenue: 0,
        };

        current.quantity += Number(item.quantity || 0);
        current.revenue +=
          Number(item.quantity || 0) * Number(item.price || 0);

        productMap.set(key, current);
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [filteredSales]);

  const exportCsv = () => {
    if (!filteredSales.length) {
      toast.info("There are no sales to export.");
      return;
    }

    const rows = [
      [
        "Order Number",
        "Date",
        "Customer",
        "Email",
        "Phone",
        "Products",
        "Items Sold",
        "Subtotal",
        "Shipping",
        "Total",
        "Payment Status",
        "Order Status",
      ],
      ...filteredSales.map((order) => [
        order.orderNumber ?? order._id,
        formatDate(order.createdAt),
        order.customerName ?? "",
        order.email ?? "",
        order.phone ?? "",
        order.items
          ?.map((item) => `${item.name} x${item.quantity}`)
          .join(" | ") ?? "",
        order.items?.reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0
        ) ?? 0,
        Number(order.subtotal ?? 0),
        Number(order.shipping?.cost ?? 0),
        Number(order.totalAmount ?? 0),
        order.paymentStatus ?? "",
        order.status ?? "",
      ]),
    ];

    const csv = rows
      .map((row) => row.map(csvEscape).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `nirjara-sales-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    toast.success("Sales CSV downloaded.");
  };

  return (
    <div className="min-h-screen bg-soft p-5 pb-12 sm:p-7 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[4px] text-[#E75480]">
              Reporting
            </p>

            <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">
              Sales
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              Verified payments are counted as sales. Pending and rejected
              payments are excluded.
            </p>
          </div>

          <button
            type="button"
            onClick={exportCsv}
            className="w-fit rounded-full bg-[#E75480] px-6 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#D94873]"
          >
            Export CSV
          </button>
        </div>

        <div className="mt-8 rounded-[24px] border border-[#E75480]/10 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex gap-2 overflow-x-auto">
              {(
                [
                  ["today", "Today"],
                  ["week", "This Week"],
                  ["month", "This Month"],
                  ["all", "All Time"],
                  ["custom", "Custom"],
                ] as [RangeMode, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRangeMode(value)}
                  className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[1.5px] transition ${
                    rangeMode === value
                      ? "bg-[#E75480] text-white"
                      : "bg-[#FFF5F8] text-muted hover:text-[#E75480]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, customer, email..."
              className="h-11 w-full rounded-full border border-[#E75480]/15 bg-[#FFF8FA] px-5 text-sm text-ink outline-none focus:border-[#E75480]/40 xl:max-w-sm"
            />
          </div>

          {rangeMode === "custom" && (
            <div className="mt-4 grid gap-3 sm:max-w-xl sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[1.5px] text-muted">
                  From
                </span>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(event) => setCustomFrom(event.target.value)}
                  className="h-11 w-full rounded-xl border border-[#E75480]/15 bg-white px-4 text-sm text-ink outline-none"
                />
              </label>

              <label>
                <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[1.5px] text-muted">
                  To
                </span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(event) => setCustomTo(event.target.value)}
                  className="h-11 w-full rounded-xl border border-[#E75480]/15 bg-white px-4 text-sm text-ink outline-none"
                />
              </label>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Revenue"
            value={formatMoney(metrics.revenue)}
            helper={`${filteredSales.length} verified ${
              filteredSales.length === 1 ? "order" : "orders"
            }`}
          />

          <StatCard
            label="Product Revenue"
            value={formatMoney(metrics.productRevenue)}
            helper="Before shipping"
          />

          <StatCard
            label="Shipping"
            value={formatMoney(metrics.shippingRevenue)}
            helper="Delivery collected"
          />

          <StatCard
            label="Products Sold"
            value={String(metrics.productsSold)}
            helper="Total units"
          />

          <StatCard
            label="Average Order"
            value={formatMoney(metrics.averageOrder)}
            helper="Verified orders"
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_330px]">
          <section className="min-w-0 rounded-[26px] border border-[#E75480]/10 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-[#E75480]/10 px-5 py-5 sm:px-6">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[2px] text-[#E75480]">
                  Sales History
                </p>
                <h2 className="mt-1 font-serif text-2xl text-ink">
                  Verified Sales
                </h2>
              </div>

              <span className="rounded-full bg-[#FFF5F8] px-3 py-1.5 text-xs text-[#E75480]">
                {filteredSales.length}
              </span>
            </div>

            {loading ? (
              <div className="flex min-h-[320px] items-center justify-center p-8 text-sm text-muted">
                Loading sales...
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF5F8] text-xl">
                  🧾
                </div>
                <p className="mt-4 font-serif text-xl text-ink">
                  No verified sales found
                </p>
                <p className="mt-1 text-sm text-muted">
                  Change the date range or verify a customer payment.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#E75480]/10 bg-[#FFF8FA]">
                      {[
                        "Order",
                        "Date",
                        "Customer",
                        "Items",
                        "Subtotal",
                        "Shipping",
                        "Total",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-5 py-3 text-[9px] font-semibold uppercase tracking-[1.5px] text-muted"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSales.map((order) => {
                      const units =
                        order.items?.reduce(
                          (sum, item) => sum + Number(item.quantity || 0),
                          0
                        ) ?? 0;

                      return (
                        <tr
                          key={order._id}
                          className="border-b border-[#E75480]/10 last:border-b-0"
                        >
                          <td className="px-5 py-4 text-sm font-medium text-ink">
                            {order.orderNumber || order._id.slice(-8)}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-sm text-muted">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-ink">
                              {order.customerName || "Customer"}
                            </p>
                            <p className="mt-0.5 max-w-[180px] truncate text-[11px] text-muted">
                              {order.email}
                            </p>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-sm text-muted">
                            {units}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-sm text-muted">
                            {formatMoney(Number(order.subtotal ?? 0))}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-sm text-muted">
                            {Number(order.shipping?.cost ?? 0) === 0
                              ? "FREE"
                              : formatMoney(Number(order.shipping?.cost ?? 0))}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-[#E75480]">
                            {formatMoney(Number(order.totalAmount || 0))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="h-fit rounded-[26px] border border-[#E75480]/10 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[9px] font-semibold uppercase tracking-[2px] text-[#E75480]">
              Products
            </p>
            <h2 className="mt-1 font-serif text-2xl text-ink">Top Selling</h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              Ranked by units sold in the selected period.
            </p>

            <div className="mt-5 space-y-3">
              {topProducts.length === 0 ? (
                <div className="rounded-2xl bg-[#FFF8FA] p-5 text-center text-sm text-muted">
                  No product sales yet.
                </div>
              ) : (
                topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center gap-3 rounded-2xl bg-[#FFF8FA] p-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#E75480]">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {product.quantity} {product.quantity === 1 ? "unit" : "units"} sold
                      </p>
                    </div>
                    <p className="whitespace-nowrap text-xs font-semibold text-[#E75480]">
                      {formatMoney(product.revenue)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#E75480]/10 bg-white p-5 shadow-sm">
      <p className="text-[9px] font-semibold uppercase tracking-[1.5px] text-muted">
        {label}
      </p>
      <p className="mt-2 font-serif text-2xl text-[#E75480]">{value}</p>
      <p className="mt-1 text-[11px] text-muted">{helper}</p>
    </div>
  );
}

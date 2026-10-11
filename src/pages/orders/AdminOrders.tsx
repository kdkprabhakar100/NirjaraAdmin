import {
  useEffect,
  useState,
} from "react";

import {
  toast,
} from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../components/CustomTable";

import DialogBox from "../../components/DialogBox";

import RowActionsMenu from "../../components/RowActionsMenu";

import { getApiErrorMessage } from "../../services/base/api";

import {
  announceOrdersChanged,
  getOrdersPage,
  type OrderQuery,
} from "../../services/order/orderService";

/* ========================================
   TYPES
======================================== */

type OrderItem = {
  name: string;

  quantity: number;

  price: number;

  image: string;
};

type PaymentStatus =
  | "Pending Verification"
  | "Verified"
  | "Rejected";

type Order = {
  _id: string;

  customerName?: string;

  email?: string;

  phone?: string;

  address?: string;

  items: OrderItem[];

  totalAmount: number;

  /* ----------------------------------------
     PAYMENT
  ---------------------------------------- */

  paymentProof?: string;

  paymentMethod?: string;

  paymentStatus?: PaymentStatus;

  /* ----------------------------------------
     ORDER
  ---------------------------------------- */

  status: string;

  createdAt: string;
};

/* ========================================
   FILTERS
======================================== */

const PAGE_SIZE = 20;

const EMPTY_QUERY: OrderQuery = {
  page: 1,
  limit: PAGE_SIZE,
  search: "",
  customer: "",
  phone: "",
  status: "",
  paymentStatus: "",
  dateFrom: "",
  dateTo: "",
};

// How long typing in a text filter waits
// before asking the API.
const SEARCH_DELAY_MS = 300;

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "Pending Verification",
  "Verified",
  "Rejected",
];

// The text filters, typed into at once and
// copied into the query after a pause.
type TextFilters = Pick<
  OrderQuery,
  "search" | "customer" | "phone"
>;

const EMPTY_TEXT: TextFilters = {
  search: "",
  customer: "",
  phone: "",
};

const fieldClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-soft px-4 py-3 text-sm text-ink outline-none focus:border-[#E75480]";

const pagerButton =
  "rounded-full border border-[#E75480] px-5 py-2 text-xs uppercase tracking-[2px] text-[#E75480] transition hover:bg-soft disabled:cursor-not-allowed disabled:opacity-40";

/* ========================================
   AUTH
======================================== */

const getAuthHeaders = () => ({
  "Content-Type":
    "application/json",

  Authorization:
    `Bearer ${localStorage.getItem(
      "adminToken"
    )}`,
});

/* ========================================
   ORDER STATUS COLORS
======================================== */

const statusClass = (
  status: string
) => {
  if (
    status ===
    "Processing"
  ) {
    return "bg-yellow-100 text-yellow-700";
  }

  if (
    status ===
    "Shipped"
  ) {
    return "bg-blue-100 text-blue-700";
  }

  if (
    status ===
    "Delivered"
  ) {
    return "bg-green-100 text-green-700";
  }

  if (
    status ===
    "Cancelled"
  ) {
    return "bg-red-100 text-red-700";
  }

  return "bg-blush text-[#E75480]";
};

/* ========================================
   PAYMENT STATUS COLORS
======================================== */

const paymentStatusClass = (
  status?: PaymentStatus
) => {
  if (
    status ===
    "Verified"
  ) {
    return "bg-green-100 text-green-700";
  }

  if (
    status ===
    "Rejected"
  ) {
    return "bg-red-100 text-red-700";
  }

  return "bg-yellow-100 text-yellow-700";
};

/* ========================================
   ADMIN ORDERS
======================================== */

export default function AdminOrders() {
  const [
    orders,
    setOrders,
  ] =
    useState<Order[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    processingId,
    setProcessingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    paymentProcessingId,
    setPaymentProcessingId,
  ] =
    useState<
      string | null
    >(null);

  /* ----------------------------------------
     DETAILS DIALOG
  ---------------------------------------- */

  const [
    selectedOrder,
    setSelectedOrder,
  ] =
    useState<
      Order | null
    >(null);

  /* ----------------------------------------
     DELETE
  ---------------------------------------- */

  const [
    orderToDelete,
    setOrderToDelete,
  ] =
    useState<
      Order | null
    >(null);

  const [
    deleting,
    setDeleting,
  ] =
    useState(false);

  /* ----------------------------------------
     FILTERS & PAGINATION
  ---------------------------------------- */

  const [
    query,
    setQuery,
  ] =
    useState<OrderQuery>(
      EMPTY_QUERY
    );

  const [
    textInput,
    setTextInput,
  ] =
    useState<TextFilters>(
      EMPTY_TEXT
    );

  const [
    pageInfo,
    setPageInfo,
  ] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });

  // Bumped to fetch the same page again,
  // e.g. after a delete.
  const [
    reloadKey,
    setReloadKey,
  ] =
    useState(0);

  /* ========================================
     FETCH ORDERS
  ========================================= */

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    getOrdersPage<Order>(query)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setOrders(result.items);

        setPageInfo({
          total: result.total,
          page: result.page,
          pages: result.pages,
        });
      })
      .catch((error: unknown) => {
        console.log(error);

        if (!cancelled) {
          toast.error(
            getApiErrorMessage(
              error,
              "Failed to fetch orders"
            )
          );

          setOrders([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    // A slow older request must not
    // overwrite a newer one.
    return () => {
      cancelled = true;
    };
  }, [query, reloadKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery((previous) => {
        const next = {
          search:
            textInput.search.trim(),
          customer:
            textInput.customer.trim(),
          phone:
            textInput.phone.trim(),
        };

        return next.search ===
          previous.search &&
          next.customer ===
            previous.customer &&
          next.phone ===
            previous.phone
          ? previous
          : {
              ...previous,
              ...next,
              page: 1,
            };
      });
    }, SEARCH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [textInput]);

  // Any filter change starts again from
  // the first page.
  const setFilter = (
    field:
      | "status"
      | "paymentStatus"
      | "dateFrom"
      | "dateTo",
    value: string
  ) => {
    setQuery((previous) => ({
      ...previous,
      [field]: value,
      page: 1,
    }));
  };

  const setText = (
    field: keyof TextFilters,
    value: string
  ) => {
    setTextInput((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetFilters = () => {
    setTextInput(EMPTY_TEXT);
    setQuery(EMPTY_QUERY);
  };

  const hasFilters =
    Object.values(textInput).some(
      Boolean
    ) ||
    query.status !== "" ||
    query.paymentStatus !== "" ||
    query.dateFrom !== "" ||
    query.dateTo !== "";

  const goToPage = (page: number) =>
    setQuery((previous) => ({
      ...previous,
      page,
    }));

  /* ========================================
     UPDATE ORDER STATUS
  ========================================= */

  const updateStatus =
    async (
      id: string,
      status: string
    ) => {
      try {
        setProcessingId(
          id
        );

        const res =
          await fetch(
            `${
              import.meta.env
                .VITE_API_URL
            }/api/orders/${id}`,
            {
              method:
                "PUT",

              headers:
                getAuthHeaders(),

              body:
                JSON.stringify(
                  {
                    status,
                  }
                ),
            }
          );

        if (
          !res.ok
        ) {
          const data =
            await res
              .json()
              .catch(
                () =>
                  ({})
              );

          throw new Error(
            data?.message ||
              "Failed to update status"
          );
        }

        /* ----------------------------------
           UPDATE TABLE
        ---------------------------------- */

        setOrders(
          (
            previous
          ) =>
            previous.map(
              (
                order
              ) =>
                order._id ===
                id
                  ? {
                      ...order,

                      status,
                    }
                  : order
            )
        );

        /* ----------------------------------
           UPDATE OPEN DIALOG TOO
        ---------------------------------- */

        setSelectedOrder(
          (
            previous
          ) =>
            previous?._id ===
            id
              ? {
                  ...previous,

                  status,
                }
              : previous
        );

        announceOrdersChanged();

        toast.success(
          `Order marked as ${status}`
        );
      } catch (
        error
      ) {
        console.log(
          error
        );

        toast.error(
          error instanceof
          Error
            ? error.message
            : "Failed to update order"
        );
      } finally {
        setProcessingId(
          null
        );
      }
    };

  /* ========================================
     UPDATE PAYMENT STATUS
  ========================================= */

  const updatePaymentStatus =
    async (
      id: string,

      paymentStatus:
        PaymentStatus
    ) => {
      try {
        setPaymentProcessingId(
          id
        );

        const res =
          await fetch(
            `${
              import.meta.env
                .VITE_API_URL
            }/api/orders/${id}/payment-status`,
            {
              method:
                "PUT",

              headers:
                getAuthHeaders(),

              body:
                JSON.stringify(
                  {
                    paymentStatus,
                  }
                ),
            }
          );

        const data =
          await res
            .json()
            .catch(
              () =>
                ({})
            );

        if (
          !res.ok
        ) {
          throw new Error(
            data?.message ||
              "Failed to update payment status"
          );
        }

        /* ----------------------------------
           UPDATE TABLE

           Verifying a Pending order also
           moves it to Processing on the
           server, so take its status too.
        ---------------------------------- */

        const status: string =
          data?.status;

        setOrders(
          (
            previous
          ) =>
            previous.map(
              (
                order
              ) =>
                order._id ===
                id
                  ? {
                      ...order,

                      paymentStatus,

                      status:
                        status ||
                        order.status,
                    }
                  : order
            )
        );

        /* ----------------------------------
           UPDATE DIALOG
        ---------------------------------- */

        setSelectedOrder(
          (
            previous
          ) =>
            previous?._id ===
            id
              ? {
                  ...previous,

                  paymentStatus,

                  status:
                    status ||
                    previous.status,
                }
              : previous
        );

        announceOrdersChanged();

        if (
          paymentStatus ===
          "Verified"
        ) {
          toast.success(
            "Payment verified successfully"
          );
        } else if (
          paymentStatus ===
          "Rejected"
        ) {
          toast.success(
            "Payment marked as rejected"
          );
        } else {
          toast.success(
            "Payment status updated"
          );
        }
      } catch (
        error
      ) {
        console.log(
          error
        );

        toast.error(
          error instanceof
          Error
            ? error.message
            : "Failed to update payment status"
        );
      } finally {
        setPaymentProcessingId(
          null
        );
      }
    };

  /* ========================================
     DELETE
  ========================================= */

  const confirmDelete =
    async () => {
      if (
        !orderToDelete
      ) {
        return;
      }

      const id =
        orderToDelete._id;

      try {
        setDeleting(
          true
        );

        const res =
          await fetch(
            `${
              import.meta.env
                .VITE_API_URL
            }/api/orders/${id}`,
            {
              method:
                "DELETE",

              headers:
                getAuthHeaders(),
            }
          );

        if (
          !res.ok
        ) {
          throw new Error(
            "Delete failed"
          );
        }

        // Fetch again so the page refills
        // and the totals stay right. The
        // last row of a later page steps
        // back one page instead.
        if (
          orders.length === 1 &&
          query.page > 1
        ) {
          goToPage(query.page - 1);
        } else {
          setReloadKey(
            (key) => key + 1
          );
        }

        announceOrdersChanged();

        toast.success(
          "Order deleted successfully"
        );

        if (
          selectedOrder?._id ===
          id
        ) {
          setSelectedOrder(
            null
          );
        }

        setOrderToDelete(
          null
        );
      } catch (
        error
      ) {
        console.log(
          error
        );

        toast.error(
          "Failed to delete order"
        );
      } finally {
        setDeleting(
          false
        );
      }
    };

  /* ========================================
     HELPERS
  ========================================= */

  const statusBadge = (
    order: Order
  ) => (
    <span
      className={`
        inline-block
        rounded-full
        px-4
        py-1
        text-xs

        ${statusClass(
          order.status
        )}
      `}
    >
      {
        order.status
      }
    </span>
  );

  const paymentBadge = (
    order: Order
  ) => {
    const status =
      order.paymentStatus ||
      "Pending Verification";

    return (
      <span
        className={`
          inline-block
          whitespace-nowrap
          rounded-full
          px-3
          py-1
          text-[11px]
          font-medium

          ${paymentStatusClass(
            status
          )}
        `}
      >
        {
          status
        }
      </span>
    );
  };

  const itemCount = (
    order: Order
  ) =>
    order.items?.reduce(
      (
        total,
        item
      ) =>
        total +
        (
          item.quantity ||
          0
        ),
      0
    ) ??
    0;

  /* ========================================
     ACTIONS
  ========================================= */

  const renderActions = (
    order: Order
  ) => (
    <RowActionsMenu
      label={`Actions for the order from ${
        order.customerName ||
        "customer"
      }`}
      busy={
        processingId ===
          order._id ||
        paymentProcessingId ===
          order._id
      }
      actions={[
        {
          key:
            "view",

          label:
            "View details",

          icon:
            "👁",

          onSelect:
            () =>
              setSelectedOrder(
                order
              ),
        },

        {
          key:
            "verify-payment",

          label:
            "Verify payment",

          icon:
            "✓",

          tone:
            "success",

          disabled:
            !order.paymentProof ||
            order.paymentStatus ===
              "Verified",

          onSelect:
            () =>
              updatePaymentStatus(
                order._id,
                "Verified"
              ),
        },

        {
          key:
            "reject-payment",

          label:
            "Reject payment",

          icon:
            "✕",

          tone:
            "danger",

          disabled:
            !order.paymentProof ||
            order.paymentStatus ===
              "Rejected",

          onSelect:
            () =>
              updatePaymentStatus(
                order._id,
                "Rejected"
              ),
        },

        {
          key:
            "processing",

          label:
            "Processing",

          icon:
            "⏳",

          dividerBefore:
            true,

          disabled:
            order.status ===
            "Processing",

          onSelect:
            () =>
              updateStatus(
                order._id,
                "Processing"
              ),
        },

        {
          key:
            "shipped",

          label:
            "Shipped",

          icon:
            "📦",

          disabled:
            order.status ===
            "Shipped",

          onSelect:
            () =>
              updateStatus(
                order._id,
                "Shipped"
              ),
        },

        {
          key:
            "delivered",

          label:
            "Delivered",

          icon:
            "✓",

          tone:
            "success",

          disabled:
            order.status ===
            "Delivered",

          onSelect:
            () =>
              updateStatus(
                order._id,
                "Delivered"
              ),
        },

        {
          key:
            "delete",

          label:
            "Delete",

          icon:
            "🗑",

          tone:
            "danger",

          dividerBefore:
            true,

          onSelect:
            () =>
              setOrderToDelete(
                order
              ),
        },
      ]}
    />
  );

  /* ========================================
     COLUMNS
  ========================================= */

  const columns:
    TableColumn<Order>[] =
    [
      {
        key:
          "customer",

        header:
          "Customer",

        hideOnMobile:
          true,

        cellClassName:
          "font-medium text-ink",

        render:
          (
            order
          ) =>
            order.customerName ||
            "No name",
      },

      {
        key:
          "phone",

        header:
          "Phone",

        cellClassName:
          "whitespace-nowrap",

        render:
          (
            order
          ) =>
            order.phone ||
            "No phone",
      },

      {
        key:
          "email",

        header:
          "Email",

        cellClassName:
          "break-all",

        render:
          (
            order
          ) =>
            order.email ||
            "No email",
      },

      {
        key:
          "address",

        header:
          "Address",

        cellClassName:
          "max-w-xs",

        render:
          (
            order
          ) =>
            order.address ||
            "No address",
      },

      {
        key:
          "placed",

        header:
          "Placed",

        cellClassName:
          "whitespace-nowrap",

        render:
          (
            order
          ) => {
            const date =
              new Date(
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
        key:
          "items",

        header:
          "Items",

        cellClassName:
          "whitespace-nowrap",

        render:
          (
            order
          ) => (
            <button
              type="button"
              onClick={() =>
                setSelectedOrder(
                  order
                )
              }
              className="
                rounded-full
                bg-soft
                px-4
                py-2
                text-xs
                text-[#E75480]
                transition
                hover:bg-blush
              "
            >
              {
                itemCount(
                  order
                )
              }{" "}
              item
              {itemCount(
                order
              ) ===
              1
                ? ""
                : "s"}
            </button>
          ),
      },

      {
        key:
          "total",

        header:
          "Total",

        cellClassName:
          "whitespace-nowrap font-medium text-[#E75480]",

        render:
          (
            order
          ) =>
            `$${Number(
              order.totalAmount ||
                0
            ).toFixed(
              2
            )}`,
      },

      /* ----------------------------------
         PAYMENT
      ---------------------------------- */

      {
        key:
          "payment",

        header:
          "Payment",

        hideOnMobile:
          true,

        render:
          paymentBadge,
      },

      {
        key:
          "status",

        header:
          "Status",

        hideOnMobile:
          true,

        render:
          statusBadge,
      },

      {
        key:
          "actions",

        header:
          "Actions",

        align:
          "right",

        width:
          "90px",

        hideOnMobile:
          true,

        render:
          renderActions,
      },
    ];

  /* ========================================
     UI
  ========================================= */

  return (
    <div>
      {/* ====================================
          HEADER
      ==================================== */}

      <div>
        <p className="text-xs uppercase tracking-[3px] text-[#E75480]">
          Management
        </p>

        <h1 className="mt-2 font-serif text-4xl text-[#E75480] md:text-5xl">
          Orders
        </h1>

        <p className="mt-2 text-muted">
          View customer orders, verify
          online payments and manage order
          fulfilment.
        </p>
      </div>

      {/* ====================================
          FILTERS
      ==================================== */}

      <div className="mt-10 rounded-3xl bg-surface p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <input
            type="search"
            value={textInput.search}
            onChange={(event) =>
              setText(
                "search",
                event.target.value
              )
            }
            placeholder="Search order no., name, email, phone..."
            aria-label="Search"
            className={`${fieldClass} xl:col-span-2`}
          />

          <input
            type="search"
            value={textInput.customer}
            onChange={(event) =>
              setText(
                "customer",
                event.target.value
              )
            }
            placeholder="Customer name"
            aria-label="Customer name"
            className={fieldClass}
          />

          <input
            type="search"
            inputMode="tel"
            value={textInput.phone}
            onChange={(event) =>
              setText(
                "phone",
                event.target.value
              )
            }
            placeholder="Phone"
            aria-label="Phone"
            className={fieldClass}
          />

          <select
            value={query.status}
            onChange={(event) =>
              setFilter(
                "status",
                event.target.value
              )
            }
            aria-label="Order status"
            className={fieldClass}
          >
            <option value="">
              All statuses
            </option>

            {ORDER_STATUSES.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>

          <select
            value={query.paymentStatus}
            onChange={(event) =>
              setFilter(
                "paymentStatus",
                event.target.value
              )
            }
            aria-label="Payment status"
            className={fieldClass}
          >
            <option value="">
              All payments
            </option>

            {PAYMENT_STATUSES.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>

          <div className="flex gap-2 xl:col-span-2">
            <input
              type="date"
              value={query.dateFrom}
              max={
                query.dateTo || undefined
              }
              onChange={(event) =>
                setFilter(
                  "dateFrom",
                  event.target.value
                )
              }
              aria-label="Placed from"
              title="Placed from"
              className={`${fieldClass} px-3`}
            />

            <input
              type="date"
              value={query.dateTo}
              min={
                query.dateFrom ||
                undefined
              }
              onChange={(event) =>
                setFilter(
                  "dateTo",
                  event.target.value
                )
              }
              aria-label="Placed to"
              title="Placed to"
              className={`${fieldClass} px-3`}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <p>
            {pageInfo.total > 0
              ? `Showing ${
                  (pageInfo.page - 1) *
                    PAGE_SIZE +
                  1
                }–${
                  (pageInfo.page - 1) *
                    PAGE_SIZE +
                  orders.length
                } of ${pageInfo.total} order${
                  pageInfo.total === 1
                    ? ""
                    : "s"
                }`
              : "No orders"}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs uppercase tracking-[1px] text-[#E75480] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ====================================
          TABLE
      ==================================== */}

      <CustomTable
        className="mt-6"
        columns={
          columns
        }
        rows={
          orders
        }
        rowKey={(
          order
        ) =>
          order._id
        }
        loading={
          loading
        }
        loadingMessage="Loading orders..."
        emptyIcon="🛍"
        emptyTitle={
          hasFilters
            ? "Nothing matches these filters"
            : "No orders yet"
        }
        emptyMessage={
          hasFilters
            ? "Try a wider date range or clear the filters."
            : "Orders placed on the website will show up here."
        }
        minWidth="1380px"
        mobileTitle={(
          order
        ) =>
          order.customerName ||
          "No name"
        }
        mobileSubtitle={(
          order
        ) =>
          new Date(
            order.createdAt
          ).toLocaleDateString()
        }
        mobileBadge={(
          order
        ) => (
          <div className="flex flex-wrap gap-2">
            {statusBadge(
              order
            )}

            {paymentBadge(
              order
            )}
          </div>
        )}
        mobileActions={
          renderActions
        }
      />

      {/* ====================================
          PAGINATION
      ==================================== */}

      {pageInfo.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={
              loading ||
              pageInfo.page <= 1
            }
            onClick={() =>
              goToPage(
                pageInfo.page - 1
              )
            }
            className={pagerButton}
          >
            Previous
          </button>

          <span className="text-sm text-muted">
            Page {pageInfo.page} of{" "}
            {pageInfo.pages}
          </span>

          <button
            type="button"
            disabled={
              loading ||
              pageInfo.page >=
                pageInfo.pages
            }
            onClick={() =>
              goToPage(
                pageInfo.page + 1
              )
            }
            className={pagerButton}
          >
            Next
          </button>
        </div>
      )}

      {/* ====================================
          ORDER DETAILS
      ==================================== */}

      <DialogBox
        open={
          Boolean(
            selectedOrder
          )
        }
        onClose={() =>
          setSelectedOrder(
            null
          )
        }
        eyebrow="Order Details"
        title={
          selectedOrder
            ?.customerName ||
          "Order"
        }
        description={
          selectedOrder
            ? `${itemCount(
                selectedOrder
              )} item${
                itemCount(
                  selectedOrder
                ) ===
                1
                  ? ""
                  : "s"
              } · $${Number(
                selectedOrder.totalAmount ||
                  0
              ).toFixed(
                2
              )}`
            : undefined
        }
        size="md"
        cancelLabel="Close"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* ================================
                ITEMS
            ================================ */}

            <div className="space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#E75480]">
                Order Items
              </p>

              {selectedOrder.items?.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                    className="
                      flex
                      items-center
                      gap-4
                      rounded-2xl
                      border
                      border-[#E75480]/10
                      bg-soft
                      p-3
                    "
                  >
                    <img
                      src={
                        item.image
                      }
                      alt={
                        item.name
                      }
                      className="
                        h-20
                        w-20
                        shrink-0
                        rounded-2xl
                        border
                        border-[#E75480]/10
                        bg-white
                        object-cover
                      "
                    />

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink">
                        {
                          item.name
                        }
                      </p>

                      <p className="mt-1 text-sm text-muted">
                        Qty:{" "}
                        {
                          item.quantity
                        }
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#E75480]">
                        $
                        {Number(
                          item.price ||
                            0
                        ).toFixed(
                          2
                        )}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* ================================
                CUSTOMER
            ================================ */}

            <div
              className="
                rounded-2xl
                border
                border-[#E75480]/10
                bg-white
                p-5
                text-sm
                text-muted
              "
            >
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[2px] text-[#E75480]">
                Customer Information
              </p>

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

            {/* ================================
                PAYMENT
            ================================ */}

            <div
              className="
                rounded-[22px]
                border
                border-[#E75480]/10
                bg-white
                p-5
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-3

                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#E75480]">
                    Payment
                  </p>

                  <p className="mt-1 text-sm font-medium text-ink">
                    {selectedOrder.paymentMethod ||
                      "QR Payment"}
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Payment must be verified
                    before processing the order.
                  </p>
                </div>

                <span
                  className={`
                    w-fit
                    rounded-full
                    px-4
                    py-1.5
                    text-xs
                    font-medium

                    ${paymentStatusClass(
                      selectedOrder.paymentStatus ||
                        "Pending Verification"
                    )}
                  `}
                >
                  {selectedOrder.paymentStatus ||
                    "Pending Verification"}
                </span>
              </div>

              {/* PAYMENT PROOF */}

              {selectedOrder.paymentProof ? (
                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <p className="text-xs text-muted">
                      Customer payment screenshot
                    </p>

                    <a
                      href={
                        selectedOrder.paymentProof
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[1.5px]
                        text-[#E75480]
                        transition
                        hover:underline
                      "
                    >
                      Open Full Image
                    </a>
                  </div>

                  <a
                    href={
                      selectedOrder.paymentProof
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={
                        selectedOrder.paymentProof
                      }
                      alt="Payment proof"
                      className="
                        max-h-[430px]
                        w-full
                        rounded-2xl
                        border
                        border-[#E75480]/10
                        bg-soft
                        object-contain
                        p-2
                      "
                    />
                  </a>
                </div>
              ) : (
                <div
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-dashed
                    border-[#E75480]/20
                    bg-soft
                    p-6
                    text-center
                  "
                >
                  <div
                    className="
                      mx-auto
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      bg-blush
                    "
                  >
                    📷
                  </div>

                  <p className="mt-3 text-sm font-medium text-ink">
                    No payment proof
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted">
                    This may be an older order
                    created before payment screenshot
                    uploads were enabled.
                  </p>
                </div>
              )}

              {/* PAYMENT ACTIONS */}

              {selectedOrder.paymentProof && (
                <div
                  className="
                    mt-5
                    flex
                    flex-col
                    gap-3

                    sm:flex-row
                  "
                >
                  <button
                    type="button"
                    disabled={
                      paymentProcessingId ===
                        selectedOrder._id ||
                      selectedOrder.paymentStatus ===
                        "Verified"
                    }
                    onClick={() =>
                      updatePaymentStatus(
                        selectedOrder._id,
                        "Verified"
                      )
                    }
                    className="
                      flex-1
                      rounded-full
                      bg-green-600
                      px-5
                      py-3
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[2px]
                      text-white
                      transition

                      hover:bg-green-700

                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {paymentProcessingId ===
                    selectedOrder._id
                      ? "Updating..."
                      : selectedOrder.paymentStatus ===
                          "Verified"
                        ? "Payment Verified"
                        : "Verify Payment"}
                  </button>

                  <button
                    type="button"
                    disabled={
                      paymentProcessingId ===
                        selectedOrder._id ||
                      selectedOrder.paymentStatus ===
                        "Rejected"
                    }
                    onClick={() =>
                      updatePaymentStatus(
                        selectedOrder._id,
                        "Rejected"
                      )
                    }
                    className="
                      flex-1
                      rounded-full
                      border
                      border-red-200
                      bg-white
                      px-5
                      py-3
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[2px]
                      text-red-600
                      transition

                      hover:bg-red-50

                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {paymentProcessingId ===
                    selectedOrder._id
                      ? "Updating..."
                      : selectedOrder.paymentStatus ===
                          "Rejected"
                        ? "Payment Rejected"
                        : "Reject Payment"}
                  </button>
                </div>
              )}
            </div>

            {/* ================================
                ORDER STATUS
            ================================ */}

            <div
              className="
                rounded-2xl
                border
                border-[#E75480]/10
                bg-soft
                p-5
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-3

                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#E75480]">
                    Order Status
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Current fulfilment status for
                    this order.
                  </p>
                </div>

                {statusBadge(
                  selectedOrder
                )}
              </div>
            </div>
          </div>
        )}
      </DialogBox>

      {/* ====================================
          DELETE CONFIRMATION
      ==================================== */}

      <DialogBox
        open={
          Boolean(
            orderToDelete
          )
        }
        onClose={() =>
          setOrderToDelete(
            null
          )
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
        submitting={
          deleting
        }
        onConfirm={
          confirmDelete
        }
      >
        <p className="text-sm text-muted">
          The order history, products and
          payment information will no longer
          be available here.
        </p>
      </DialogBox>
    </div>
  );
}
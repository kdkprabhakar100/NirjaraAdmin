import api from "../base/api";

// ========================================
// API CONFIGURATION
//
// Paths are relative: the shared `api`
// instance owns the base URL and attaches
// the admin bearer token.
// ========================================

const ORDER_API = "/api/orders";

export type OrderQuery = {
  page: number;
  limit: number;
  search: string;
  customer: string;
  phone: string;
  status: string;
  paymentStatus: string;
  dateFrom: string;
  dateTo: string;
};

export type OrderPage<T> = {
  items: T[];
  total: number;
  page: number;
  pages: number;
};

// ========================================
// GET ONE PAGE OF ORDERS
//
// GET /api/orders?page=&limit=&search=
//   &customer=&phone=&status=
//   &paymentStatus=&dateFrom=&dateTo=
//
// Newest first. `search` matches order
// number, name, email or phone; dates are
// the day the order was placed. Blank
// filters are left off.
// ========================================

export const getOrdersPage = async <T>(
  query: OrderQuery
): Promise<OrderPage<T>> => {
  const response = await api.get<
    OrderPage<T>
  >(ORDER_API, {
    params: {
      page: query.page,
      limit: query.limit,
      search:
        query.search.trim() || undefined,
      customer:
        query.customer.trim() ||
        undefined,
      phone:
        query.phone.trim() || undefined,
      status: query.status || undefined,
      paymentStatus:
        query.paymentStatus || undefined,
      dateFrom:
        query.dateFrom || undefined,
      dateTo: query.dateTo || undefined,
    },
  });

  return response.data;
};

// ========================================
// PENDING COUNT
//
// GET /api/orders/pending-count
//
// The badge next to Orders in the
// sidebar: orders still marked Pending.
// ========================================

export const getPendingOrderCount =
  async (): Promise<number> => {
    const response = await api.get<{
      pending: number;
    }>(`${ORDER_API}/pending-count`, {
      params: {
        t: Date.now(),
      },
    });

    return response.data?.pending ?? 0;
  };

// ========================================
// CHANGE NOTICE
//
// Fired after a status change or delete,
// so the sidebar badge refreshes at once
// instead of on its next poll.
// ========================================

export const ORDERS_CHANGED_EVENT =
  "orders:changed";

export const announceOrdersChanged =
  () => {
    window.dispatchEvent(
      new Event(ORDERS_CHANGED_EVENT)
    );
  };

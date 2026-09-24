import api from "../base/api";

import type {
  Customer,
  CustomerFormData,
} from "../../types/customer";

// ========================================
// API CONFIGURATION
//
// Paths are relative: the shared `api`
// instance owns the base URL and attaches
// the admin bearer token. Every customer
// route is admin-only.
// ========================================

const CUSTOMER_API = "/api/customers";

// ========================================
// GET ALL CUSTOMERS
//
// GET /api/customers
//
// Newest first. The backend also takes
// ?search= and ?status=, but the page
// filters locally so its totals always
// count every customer.
// ========================================

export const getCustomers =
  async (): Promise<Customer[]> => {
    const response =
      await api.get<Customer[]>(
        CUSTOMER_API
      );

    return response.data;
  };

// ========================================
// CREATE CUSTOMER
//
// POST /api/customers
//
// Answers 409 when the email is taken.
// ========================================

export const createCustomer = async (
  data: CustomerFormData
): Promise<Customer> => {
  const response = await api.post<Customer>(
    CUSTOMER_API,
    data
  );

  return response.data;
};

// ========================================
// UPDATE CUSTOMER
//
// PUT /api/customers/:id
// ========================================

export const updateCustomer = async (
  id: string,
  data: CustomerFormData
): Promise<Customer> => {
  const response = await api.put<Customer>(
    `${CUSTOMER_API}/${id}`,
    data
  );

  return response.data;
};

// ========================================
// DELETE CUSTOMER
//
// DELETE /api/customers/:id
// ========================================

export const deleteCustomer = async (
  id: string
): Promise<void> => {
  await api.delete(
    `${CUSTOMER_API}/${id}`
  );
};

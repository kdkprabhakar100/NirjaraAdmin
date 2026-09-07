import { useState } from "react";

import CustomerForm from "../components/customers/CustomerForm";
import CustomerTable from "../components/customers/CustomerTable";
import CustomerDetailsModal from "../components/customers/CustomerDetailsModal";

import {
  downloadCustomerPdf,
  downloadCustomerListPdf,
  type CustomerPdfMode,
} from "../utils/customerPdf";

import type {
  Customer,
  CustomerFormData,
} from "../types/customer";

const emptyForm: CustomerFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  status: "Active",
};

const mockCustomers: Customer[] = [
  {
    _id: "1",
    name: "Aarati Sharma",
    email: "aarati@example.com",
    phone: "+977 9800000001",
    address: "Kathmandu, Nepal",
    notes: "Regular bridal makeup customer.",
    status: "Active",
    createdAt: "2026-09-01T10:00:00.000Z",
  },
  {
    _id: "2",
    name: "Sujata Karki",
    email: "sujata@example.com",
    phone: "+977 9800000002",
    address: "Lalitpur, Nepal",
    notes: "Interested in beauty academy courses.",
    status: "Active",
    createdAt: "2026-09-02T10:00:00.000Z",
  },
  {
    _id: "3",
    name: "Priya Thapa",
    email: "priya@example.com",
    phone: "+977 9800000003",
    address: "Bhaktapur, Nepal",
    notes: "",
    status: "Inactive",
    createdAt: "2026-09-03T10:00:00.000Z",
  },
];

export default function CustomersAdmin() {
  const [customers, setCustomers] =
    useState<Customer[]>(mockCustomers);

  const [form, setForm] =
    useState<CustomerFormData>(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Inactive"
  >("All");

  // ============================
  // FORM CHANGE
  // ============================

  const handleChange = (
    field: keyof CustomerFormData,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ============================
  // RESET FORM
  // ============================

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  // ============================
  // ADD / UPDATE CUSTOMER
  // ============================

  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      alert(
        "Please fill name, email, and phone."
      );

      return;
    }

    if (editingId) {
      setCustomers((previous) =>
        previous.map((customer) =>
          customer._id === editingId
            ? {
                ...customer,
                ...form,
              }
            : customer
        )
      );

      resetForm();

      return;
    }

    const newCustomer: Customer = {
      _id: crypto.randomUUID(),
      ...form,
      createdAt: new Date().toISOString(),
    };

    setCustomers((previous) => [
      newCustomer,
      ...previous,
    ]);

    resetForm();
  };

  // ============================
  // EDIT CUSTOMER
  // ============================

  const handleEdit = (
    customer: Customer
  ) => {
    setEditingId(customer._id);

    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes,
      status: customer.status,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================
  // DELETE CUSTOMER
  // ============================

  const handleDelete = (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this customer?"
      );

    if (!confirmed) return;

    setCustomers((previous) =>
      previous.filter(
        (customer) =>
          customer._id !== id
      )
    );

    if (editingId === id) {
      resetForm();
    }

    if (
      selectedCustomer?._id === id
    ) {
      setSelectedCustomer(null);
    }
  };

  // ============================
  // SEARCH + FILTER
  // ============================

  const filteredCustomers =
    customers.filter((customer) => {
      const query =
        search
          .toLowerCase()
          .trim();

      const matchesSearch =
        !query ||
        customer.name
          .toLowerCase()
          .includes(query) ||
        customer.email
          .toLowerCase()
          .includes(query) ||
        customer.phone
          .toLowerCase()
          .includes(query) ||
        customer.address
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        customer.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  // ============================
  // STATS
  // ============================

  const totalCustomers =
    customers.length;

  const activeCustomers =
    customers.filter(
      (customer) =>
        customer.status === "Active"
    ).length;

  const inactiveCustomers =
    customers.filter(
      (customer) =>
        customer.status === "Inactive"
    ).length;

  // ============================
  // INDIVIDUAL PDF
  // ============================

  const handleDownloadPdf = (
    customer: Customer,
    mode: CustomerPdfMode
  ) => {
    downloadCustomerPdf(
      customer,
      mode
    );
  };

  // ============================
  // CUSTOMER LIST PDF
  // ============================

  const handleExportCustomerList = () => {
    if (
      filteredCustomers.length === 0
    ) {
      alert(
        "No customers available to export."
      );

      return;
    }

    downloadCustomerListPdf(
      filteredCustomers
    );
  };

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div>
        <p className="text-xs uppercase tracking-[3px] text-[#E75480]">
          Customer Management
        </p>

        <h1 className="mt-2 font-serif text-4xl text-[#E75480] md:text-5xl">
          Customers
        </h1>

        <p className="mt-2 text-sm text-[#8A6F78] md:text-base">
          Store and manage customer information,
          contact details, status and notes.
        </p>
      </div>

      {/* CUSTOMER STATS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[2px] text-[#8A6F78]">
            Total Customers
          </p>

          <p className="mt-3 text-3xl font-semibold text-[#3A2A2F]">
            {totalCustomers}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[2px] text-[#8A6F78]">
            Active
          </p>

          <p className="mt-3 text-3xl font-semibold text-green-600">
            {activeCustomers}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[2px] text-[#8A6F78]">
            Inactive
          </p>

          <p className="mt-3 text-3xl font-semibold text-gray-500">
            {inactiveCustomers}
          </p>
        </div>
      </div>

      {/* CUSTOMER FORM */}
      <CustomerForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        editing={Boolean(editingId)}
        onCancel={resetForm}
      />

      {/* CUSTOMER RECORDS HEADER */}
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-[#3A2A2F]">
              Customer Records
            </h2>

            <p className="mt-1 text-sm text-[#8A6F78]">
              {filteredCustomers.length} of{" "}
              {customers.length} customer
              {customers.length === 1
                ? ""
                : "s"}{" "}
              shown
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            {/* SEARCH */}
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search name, email, phone or address..."
              className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none focus:border-[#E75480] lg:w-80"
            />

            {/* STATUS FILTER */}
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "All"
                    | "Active"
                    | "Inactive"
                )
              }
              className="rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm text-[#3A2A2F] outline-none focus:border-[#E75480]"
            >
              <option value="All">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>

            {/* EXPORT PDF */}
            <button
              type="button"
              onClick={
                handleExportCustomerList
              }
              className="whitespace-nowrap rounded-xl bg-[#E75480] px-5 py-3 text-xs font-medium uppercase tracking-[1px] text-white transition hover:bg-[#d94873]"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* CUSTOMER TABLE */}
      <CustomerTable
        customers={
          filteredCustomers
        }
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={
          setSelectedCustomer
        }
      />

      {/* CUSTOMER DETAILS MODAL */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        onClose={() =>
          setSelectedCustomer(null)
        }
        onEdit={(customer) => {
          handleEdit(customer);

          setSelectedCustomer(
            null
          );
        }}
        onDownloadPdf={
          handleDownloadPdf
        }
      />
    </div>
  );
}
import CustomTable, {
  type TableColumn,
} from "../CustomTable";

import RowActionsMenu from "../RowActionsMenu";

import type { Customer } from "../../types/customer";

// ========================================
// CUSTOMER TABLE
//
// The customer columns on top of the
// shared CustomTable, so this list looks
// and behaves like every other list in
// the admin panel.
// ========================================

type CustomerTableProps = {
  customers: Customer[];
  loading?: boolean;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onView: (customer: Customer) => void;
};

const statusBadge = (
  customer: Customer
) => (
  <span
    className={`inline-block rounded-full px-4 py-1 text-xs ${
      customer.status === "Active"
        ? "bg-green-100 text-green-700"
        : "bg-gray-100 text-gray-600"
    }`}
  >
    {customer.status}
  </span>
);

export default function CustomerTable({
  customers,
  loading = false,
  onEdit,
  onDelete,
  onView,
}: CustomerTableProps) {
  const renderActions = (
    customer: Customer
  ) => (
    <RowActionsMenu
      label={`Actions for ${customer.name}`}
      actions={[
        {
          key: "view",
          label: "View",
          icon: "👁",
          onSelect: () =>
            onView(customer),
        },
        {
          key: "edit",
          label: "Edit",
          icon: "✎",
          onSelect: () =>
            onEdit(customer),
        },
        {
          key: "delete",
          label: "Delete",
          icon: "🗑",
          tone: "danger",
          dividerBefore: true,
          onSelect: () =>
            onDelete(customer),
        },
      ]}
    />
  );

  const columns: TableColumn<Customer>[] =
    [
      {
        key: "name",
        header: "Customer",
        hideOnMobile: true,
        cellClassName:
          "font-medium text-[#3A2A2F]",
        render: (customer) =>
          customer.name,
      },
      {
        key: "email",
        header: "Email",
        cellClassName: "break-all",
        render: (customer) =>
          customer.email,
      },
      {
        key: "phone",
        header: "Phone",
        cellClassName:
          "whitespace-nowrap",
        render: (customer) =>
          customer.phone,
      },
      {
        key: "address",
        header: "Address",
        render: (customer) =>
          customer.address || "-",
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

  return (
    <CustomTable
      columns={columns}
      rows={customers}
      rowKey={(customer) =>
        customer._id
      }
      loading={loading}
      loadingMessage="Loading customers..."
      emptyIcon="♡"
      emptyTitle="No customers yet"
      emptyMessage="Add your first customer using the button above."
      minWidth="950px"
      mobileTitle={(customer) =>
        customer.name
      }
      mobileSubtitle={(customer) =>
        customer.phone
      }
      mobileBadge={statusBadge}
      mobileActions={renderActions}
    />
  );
}

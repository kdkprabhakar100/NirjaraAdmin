import type { Customer } from "../../types/customer";

type CustomerTableProps = {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onView: (customer: Customer) => void;
};

export default function CustomerTable({
  customers,
  onEdit,
  onDelete,
  onView,
}: CustomerTableProps) {
  return (
    <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
      <table className="w-full min-w-[900px] border-collapse">
        <thead className="bg-[#FCE7EF] text-left text-sm text-[#E75480]">
          <tr>
            <th className="p-5">Customer</th>
            <th className="p-5">Email</th>
            <th className="p-5">Phone</th>
            <th className="p-5">Address</th>
            <th className="p-5">Status</th>
            <th className="p-5">Actions</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer) => (
            <tr
              key={customer._id}
              className="border-t border-[#E75480]/10 transition hover:bg-[#FFF9FB]"
            >
              <td className="p-5 font-medium text-[#3A2A2F]">
                {customer.name}
              </td>

              <td className="p-5 text-sm text-[#8A6F78]">
                {customer.email}
              </td>

              <td className="p-5 text-sm text-[#8A6F78]">
                {customer.phone}
              </td>

              <td className="p-5 text-sm text-[#8A6F78]">
                {customer.address || "-"}
              </td>

              <td className="p-5">
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    customer.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {customer.status}
                </span>
              </td>

              <td className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onView(customer)}
                    className="rounded-full bg-[#FFF5F8] px-4 py-2 text-xs text-[#E75480] transition hover:bg-[#FCE7EF]"
                  >
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit(customer)}
                    className="rounded-full border border-[#E75480] px-4 py-2 text-xs text-[#E75480] transition hover:bg-[#FFF5F8]"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(customer._id)}
                    className="rounded-full bg-red-50 px-4 py-2 text-xs text-red-600 transition hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {customers.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="p-10 text-center text-[#8A6F78]"
              >
                No customers available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
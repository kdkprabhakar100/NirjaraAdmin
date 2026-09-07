import type { Customer } from "../../types/customer";
import type { CustomerPdfMode } from "../../utils/customerPdf";

type CustomerDetailsModalProps = {
  customer: Customer | null;
  onClose: () => void;
  onEdit: (customer: Customer) => void;

  onDownloadPdf: (
    customer: Customer,
    mode: CustomerPdfMode
  ) => void;
};

export default function CustomerDetailsModal({
  customer,
  onClose,
  onEdit,
  onDownloadPdf,
}: CustomerDetailsModalProps) {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[2px] text-[#E75480]">
              Customer Details
            </p>

            <h2 className="mt-2 font-serif text-3xl text-[#3A2A2F]">
              {customer.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#FFF5F8] px-4 py-2 text-sm text-[#E75480] transition hover:bg-[#FCE7EF]"
          >
            Close
          </button>
        </div>

        {/* DETAILS */}
        <div className="mt-6 space-y-5 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[1px] text-[#8A6F78]">
              Email
            </p>

            <p className="mt-1 break-words text-[#3A2A2F]">
              {customer.email || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[1px] text-[#8A6F78]">
              Phone
            </p>

            <p className="mt-1 text-[#3A2A2F]">
              {customer.phone || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[1px] text-[#8A6F78]">
              Address
            </p>

            <p className="mt-1 text-[#3A2A2F]">
              {customer.address || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[1px] text-[#8A6F78]">
              Status
            </p>

            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs ${
                customer.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {customer.status}
            </span>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[1px] text-[#8A6F78]">
              Notes
            </p>

            <p className="mt-1 whitespace-pre-line leading-6 text-[#3A2A2F]">
              {customer.notes || "No notes available."}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[1px] text-[#8A6F78]">
              Created
            </p>

            <p className="mt-1 text-[#3A2A2F]">
              {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onEdit(customer)}
            className="rounded-full border border-[#E75480] px-6 py-3 text-xs uppercase tracking-[2px] text-[#E75480] transition hover:bg-[#FFF5F8]"
          >
            Edit Customer
          </button>

          <button
            type="button"
            onClick={() =>
              onDownloadPdf(customer, "full")
            }
            className="rounded-full bg-[#E75480] px-6 py-3 text-xs uppercase tracking-[2px] text-white transition hover:bg-[#d94873]"
          >
            Full PDF
          </button>

          <button
            type="button"
            onClick={() =>
              onDownloadPdf(customer, "limited")
            }
            className="rounded-full bg-[#FFF5F8] px-6 py-3 text-xs uppercase tracking-[2px] text-[#E75480] transition hover:bg-[#FCE7EF]"
          >
            Limited PDF
          </button>
        </div>
      </div>
    </div>
  );
}
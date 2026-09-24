import DialogBox from "../DialogBox";

import type { Customer } from "../../types/customer";
import type { CustomerPdfMode } from "../../utils/customerPdf";

// ========================================
// CUSTOMER DETAILS
//
// A read-only dialog. The shell, the
// header and the close behaviour come
// from DialogBox; the PDF buttons replace
// its default footer.
// ========================================

type CustomerDetailsModalProps = {
  customer: Customer | null;

  onClose: () => void;

  onEdit: (customer: Customer) => void;

  onDownloadPdf: (
    customer: Customer,
    mode: CustomerPdfMode
  ) => void;
};

type DetailProps = {
  label: string;
  children: React.ReactNode;
};

function Detail({
  label,
  children,
}: DetailProps) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[1px] text-muted">
        {label}
      </p>

      <div className="mt-1 text-ink">
        {children}
      </div>
    </div>
  );
}

export default function CustomerDetailsModal({
  customer,
  onClose,
  onEdit,
  onDownloadPdf,
}: CustomerDetailsModalProps) {
  return (
    <DialogBox
      open={Boolean(customer)}
      onClose={onClose}
      eyebrow="Customer Details"
      title={customer?.name ?? "Customer"}
      size="md"
      footer={
        customer ? (
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                onEdit(customer)
              }
              className="rounded-full border border-[#E75480] px-6 py-3 text-xs uppercase tracking-[2px] text-[#E75480] transition hover:bg-soft"
            >
              Edit Customer
            </button>

            <button
              type="button"
              onClick={() =>
                onDownloadPdf(
                  customer,
                  "limited"
                )
              }
              className="rounded-full bg-soft px-6 py-3 text-xs uppercase tracking-[2px] text-[#E75480] transition hover:bg-blush"
            >
              Limited PDF
            </button>

            <button
              type="button"
              onClick={() =>
                onDownloadPdf(
                  customer,
                  "full"
                )
              }
              className="rounded-full bg-[#E75480] px-6 py-3 text-xs uppercase tracking-[2px] text-white transition hover:bg-[#d94873]"
            >
              Full PDF
            </button>
          </div>
        ) : undefined
      }
    >
      {customer && (
        <div className="space-y-5 text-sm">
          <Detail label="Email">
            <span className="break-words">
              {customer.email ||
                "Not provided"}
            </span>
          </Detail>

          <Detail label="Phone">
            {customer.phone ||
              "Not provided"}
          </Detail>

          <Detail label="Address">
            {customer.address ||
              "Not provided"}
          </Detail>

          <Detail label="Status">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs ${
                customer.status ===
                "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {customer.status}
            </span>
          </Detail>

          <Detail label="Notes">
            <span className="whitespace-pre-line leading-6">
              {customer.notes ||
                "No notes available."}
            </span>
          </Detail>

          <Detail label="Created">
            {new Date(
              customer.createdAt
            ).toLocaleDateString()}
          </Detail>
        </div>
      )}
    </DialogBox>
  );
}

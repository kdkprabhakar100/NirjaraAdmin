import type {
  CustomerFormData,
  CustomerStatus,
} from "../../types/customer";

type CustomerFormProps = {
  form: CustomerFormData;
  onChange: (
    field: keyof CustomerFormData,
    value: string
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  editing: boolean;
  onCancel?: () => void;
};

export default function CustomerForm({
  form,
  onChange,
  onSubmit,
  editing,
  onCancel,
}: CustomerFormProps) {
  const inputClass =
    "w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none focus:border-[#E75480]";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl bg-white p-6 shadow-sm"
    >
      <h2 className="font-serif text-2xl text-[#3A2A2F]">
        {editing ? "Edit Customer" : "Add Customer"}
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) =>
            onChange("name", e.target.value)
          }
          className={inputClass}
        />

        <input
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={(e) =>
            onChange("email", e.target.value)
          }
          className={inputClass}
        />

        <input
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) =>
            onChange("phone", e.target.value)
          }
          className={inputClass}
        />

        <select
          value={form.status}
          onChange={(e) =>
            onChange(
              "status",
              e.target.value as CustomerStatus
            )
          }
          className={inputClass}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <input
          placeholder="Address"
          value={form.address}
          onChange={(e) =>
            onChange("address", e.target.value)
          }
          className={`${inputClass} md:col-span-2`}
        />

        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) =>
            onChange("notes", e.target.value)
          }
          rows={4}
          className={`${inputClass} md:col-span-2`}
        />
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          className="rounded-full bg-[#E75480] px-7 py-3 text-xs font-medium uppercase tracking-[2px] text-white"
        >
          {editing ? "Update Customer" : "Add Customer"}
        </button>

        {editing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[#E75480] px-7 py-3 text-xs font-medium uppercase tracking-[2px] text-[#E75480]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
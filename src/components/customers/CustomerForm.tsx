import type {
  CustomerFormData,
  CustomerStatus,
} from "../../types/customer";

// ========================================
// CUSTOMER FORM
//
// The fields only. The <form>, the header
// and the save / cancel buttons belong to
// the DialogBox this is rendered inside.
// ========================================

type CustomerFormProps = {
  form: CustomerFormData;

  onChange: (
    field: keyof CustomerFormData,
    value: string
  ) => void;
};

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none focus:border-[#E75480]";

export default function CustomerForm({
  form,
  onChange,
}: CustomerFormProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
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
          onChange(
            "email",
            e.target.value
          )
        }
        className={inputClass}
      />

      <input
        placeholder="Phone Number"
        value={form.phone}
        onChange={(e) =>
          onChange(
            "phone",
            e.target.value
          )
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
        <option value="Active">
          Active
        </option>

        <option value="Inactive">
          Inactive
        </option>
      </select>

      <input
        placeholder="Address"
        value={form.address}
        onChange={(e) =>
          onChange(
            "address",
            e.target.value
          )
        }
        className={`${inputClass} md:col-span-2`}
      />

      <textarea
        placeholder="Notes"
        value={form.notes}
        onChange={(e) =>
          onChange(
            "notes",
            e.target.value
          )
        }
        rows={4}
        className={`${inputClass} md:col-span-2`}
      />
    </div>
  );
}

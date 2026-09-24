import type {
  CustomerFormData,
  CustomerStatus,
} from "../../types/customer";

import FormField from "../FormField";

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
      <FormField
        label="Full Name"
        required
      >
        <input
          required
          value={form.name}
          onChange={(e) =>
            onChange("name", e.target.value)
          }
          className={inputClass}
        />
      </FormField>

      <FormField
        label="Email"
        required
      >
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) =>
            onChange(
              "email",
              e.target.value
            )
          }
          className={inputClass}
        />
      </FormField>

      <FormField
        label="Phone"
        required
      >
        <input
          required
          value={form.phone}
          onChange={(e) =>
            onChange(
              "phone",
              e.target.value
            )
          }
          className={inputClass}
        />
      </FormField>

      <FormField label="Status">
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
      </FormField>

      <FormField
        label="Address"
        className="md:col-span-2"
      >
        <input
          value={form.address}
          onChange={(e) =>
            onChange(
              "address",
              e.target.value
            )
          }
          className={inputClass}
        />
      </FormField>

      <FormField
        label="Notes"
        className="md:col-span-2"
      >
        <textarea
          value={form.notes}
          onChange={(e) =>
            onChange(
              "notes",
              e.target.value
            )
          }
          rows={4}
          className={inputClass}
        />
      </FormField>
    </div>
  );
}

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../components/CustomTable";

import DialogBox from "../../components/DialogBox";

import FormField from "../../components/FormField";

import RowActionsMenu from "../../components/RowActionsMenu";

import { getApiErrorMessage } from "../../services/base/api";

import {
  createBranch,
  deleteBranch,
  getBranches,
  updateBranch,
} from "../../services/branch/branchService";

import type {
  Branch,
  BranchPayload,
} from "../../services/branch/branch.types";

import {
  phone,
  required,
  url,
  validate,
} from "../../utils/validation";

// ========================================
// FORM DEFAULTS
// ========================================

const EMPTY_FORM: BranchPayload = {
  name: "",
  label: "",
  address: "",
  phone: "",
  openingHours: "",
  mapUrl: "",
  bookingOpens: "10:00",
  bookingCloses: "19:00",
  slotMinutes: 60,
  customSlots: [],
};

// Slot lengths offered in the form.
const SLOT_LENGTHS = [15, 20, 30, 45, 60, 90, 120];

const toMinutes = (time: string) => {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
};

const toTime = (minutes: number) =>
  `${String(
    Math.floor(minutes / 60)
  ).padStart(2, "0")}:${String(
    minutes % 60
  ).padStart(2, "0")}`;

// The slots regular hours give, the same
// way the API builds them: every slot
// length from opening, while the slot
// still ends by closing.
const regularSlots = (
  opens: string,
  closes: string,
  slotMinutes: number
) => {
  const times: string[] = [];

  if (!opens || !closes || !slotMinutes) {
    return times;
  }

  for (
    let minutes = toMinutes(opens);
    minutes + slotMinutes <=
    toMinutes(closes);
    minutes += slotMinutes
  ) {
    times.push(toTime(minutes));
  }

  return times;
};

// Sorted, without repeats; "HH:mm"
// sorts as text in time order.
const normalizeSlots = (times: string[]) =>
  [...new Set(times)].sort();

// "10:00" → "10:00 AM", for the table.
const formatTime = (time: string) => {
  const minutes = toMinutes(time);
  const hours = Math.floor(minutes / 60);

  return `${hours % 12 || 12}:${String(
    minutes % 60
  ).padStart(2, "0")} ${
    hours >= 12 ? "PM" : "AM"
  }`;
};

// ========================================
// SHARED INPUT STYLE
// ========================================

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-soft px-4 py-3 text-sm outline-none focus:border-[#E75480]";

export default function BranchesAdmin() {
  const [branches, setBranches] = useState<
    Branch[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [form, setForm] =
    useState<BranchPayload>(EMPTY_FORM);

  const [formOpen, setFormOpen] =
    useState(false);

  // Null while adding a new branch.
  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  // "regular": a slot every slot length
  // between the two times. "custom": the
  // admin lists the exact times.
  const [slotMode, setSlotMode] = useState<
    "regular" | "custom"
  >("regular");

  // The time being typed into "Add time".
  const [newSlot, setNewSlot] =
    useState("");

  // The branch awaiting delete
  // confirmation. Null means the dialog
  // is closed.
  const [branchToDelete, setBranchToDelete] =
    useState<Branch | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  // ============================
  // FETCH
  // ============================

  const fetchBranches = async () => {
    try {
      setLoading(true);

      setBranches(await getBranches());
    } catch (error) {
      console.error(
        "Fetch branches error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load branches"
        )
      );

      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // ============================
  // FORM
  // ============================

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setSlotMode("regular");
    setNewSlot("");
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditForm = (branch: Branch) => {
    setForm({
      name: branch.name,
      label: branch.label,
      address: branch.address,
      phone: branch.phone,
      openingHours: branch.openingHours,
      mapUrl: branch.mapUrl,
      bookingOpens:
        branch.bookingOpens ||
        EMPTY_FORM.bookingOpens,
      bookingCloses:
        branch.bookingCloses ||
        EMPTY_FORM.bookingCloses,
      slotMinutes:
        branch.slotMinutes ||
        EMPTY_FORM.slotMinutes,
      customSlots:
        branch.customSlots ?? [],
    });

    setSlotMode(
      branch.customSlots?.length
        ? "custom"
        : "regular"
    );
    setNewSlot("");
    setEditingId(branch._id);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const updateField = <
    K extends keyof BranchPayload,
  >(
    field: K,
    value: BranchPayload[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ============================
  // CUSTOM TIMES
  // ============================

  // Switching to custom starts from the
  // times the regular hours give, so the
  // admin only adds or removes a few.
  const switchSlotMode = (
    mode: "regular" | "custom"
  ) => {
    if (
      mode === "custom" &&
      form.customSlots.length === 0
    ) {
      updateField(
        "customSlots",
        regularSlots(
          form.bookingOpens,
          form.bookingCloses,
          form.slotMinutes
        )
      );
    }

    setSlotMode(mode);
  };

  const addCustomSlot = () => {
    if (!newSlot) {
      return;
    }

    if (form.customSlots.includes(newSlot)) {
      toast.info(
        `${formatTime(newSlot)} is already listed.`
      );

      return;
    }

    updateField(
      "customSlots",
      normalizeSlots([
        ...form.customSlots,
        newSlot,
      ])
    );
    setNewSlot("");
  };

  const removeCustomSlot = (
    time: string
  ) => {
    updateField(
      "customSlots",
      form.customSlots.filter(
        (one) => one !== time
      )
    );
  };

  // ============================
  // SAVE
  // ============================

  const handleSubmit = async () => {
    const error = validate(form, {
      name: ["Branch name", [required()]],
      phone: ["Phone", [phone()]],
      mapUrl: ["Google Maps URL", [url()]],
    });

    if (error) {
      toast.error(error);

      return;
    }

    const custom = slotMode === "custom";

    if (
      custom &&
      form.customSlots.length === 0
    ) {
      toast.error(
        "Add at least one custom time, or switch back to regular slots."
      );

      return;
    }

    // The API refuses this too; checking
    // here saves the round trip. Custom
    // times replace the regular hours, so
    // those need not fit then.
    if (
      !custom &&
      (!form.bookingOpens ||
        !form.bookingCloses ||
        toMinutes(form.bookingCloses) -
          toMinutes(form.bookingOpens) <
          form.slotMinutes)
    ) {
      toast.error(
        "Booking closing time must be at least one slot after the opening time."
      );

      return;
    }

    const payload: BranchPayload = {
      name: form.name.trim(),
      label: form.label.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      openingHours: form.openingHours.trim(),
      mapUrl: form.mapUrl.trim(),
      bookingOpens: form.bookingOpens,
      bookingCloses: form.bookingCloses,
      slotMinutes: form.slotMinutes,
      // Empty sends the branch back to its
      // regular slots.
      customSlots: custom
        ? form.customSlots
        : [],
    };

    try {
      setSaving(true);

      if (editingId) {
        await updateBranch(
          editingId,
          payload
        );

        toast.success(
          "Branch updated successfully!"
        );
      } else {
        await createBranch(payload);

        toast.success(
          "Branch added successfully!"
        );
      }

      closeForm();

      await fetchBranches();
    } catch (error) {
      console.error(
        "Save branch error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Unable to save the branch"
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // DELETE
  //
  // Asking happens in the dialog; this
  // only runs once the admin confirms.
  // ============================

  const confirmDelete = async () => {
    if (!branchToDelete) {
      return;
    }

    try {
      setDeleting(true);

      await deleteBranch(
        branchToDelete._id
      );

      toast.success(
        "Branch deleted successfully!"
      );

      setBranchToDelete(null);

      await fetchBranches();
    } catch (error) {
      console.error(
        "Delete branch error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Unable to delete the branch"
        )
      );

      // Dialog stays open so the admin can
      // retry.
    } finally {
      setDeleting(false);
    }
  };

  // ============================
  // ROW PIECES
  // ============================

  const renderActions = (branch: Branch) => (
    <RowActionsMenu
      label={`Actions for ${branch.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: "✎",
          onSelect: () =>
            openEditForm(branch),
        },
        ...(branch.mapUrl
          ? [
              {
                key: "map",
                label: "Open map",
                icon: "⌖",
                onSelect: () =>
                  window.open(
                    branch.mapUrl,
                    "_blank",
                    "noopener"
                  ),
              },
            ]
          : []),
        {
          key: "delete",
          label: "Delete",
          icon: "🗑",
          tone: "danger",
          onSelect: () =>
            setBranchToDelete(branch),
        },
      ]}
    />
  );

  const nameCell = (branch: Branch) => (
    <div>
      <p className="font-medium text-ink">
        {branch.name}
      </p>

      {branch.label && (
        <p className="mt-1 text-xs text-[#E75480]">
          {branch.label}
        </p>
      )}
    </div>
  );

  // ============================
  // COLUMNS
  // ============================

  const columns: TableColumn<Branch>[] = [
    {
      key: "name",
      header: "Branch",
      hideOnMobile: true,
      render: nameCell,
    },
    {
      key: "address",
      header: "Address",
      cellClassName:
        "text-sm text-muted",
      render: (branch) =>
        branch.address || "—",
    },
    {
      key: "phone",
      header: "Phone",
      width: "160px",
      render: (branch) =>
        branch.phone || "—",
    },
    {
      key: "hours",
      header: "Opening Hours",
      cellClassName:
        "text-sm text-muted",
      render: (branch) =>
        branch.openingHours || "—",
    },
    {
      key: "booking",
      header: "Booking Times",
      cellClassName:
        "whitespace-nowrap text-sm",
      render: (branch) =>
        branch.customSlots?.length ? (
          <span>
            <span className="block">
              Custom ·{" "}
              {branch.customSlots.length}{" "}
              time
              {branch.customSlots.length === 1
                ? ""
                : "s"}
            </span>

            <span className="block text-xs text-muted">
              {formatTime(
                branch.customSlots[0]
              )}{" "}
              –{" "}
              {formatTime(
                branch.customSlots[
                  branch.customSlots.length - 1
                ]
              )}
            </span>
          </span>
        ) : (
          <span>
            <span className="block">
              {formatTime(
                branch.bookingOpens || "10:00"
              )}{" "}
              –{" "}
              {formatTime(
                branch.bookingCloses ||
                  "19:00"
              )}
            </span>

            <span className="block text-xs text-muted">
              {branch.slotMinutes || 60} min
              slots
            </span>
          </span>
        ),
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

  // ============================
  // UI
  // ============================

  return (
    <div>
      {/* HEADER */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[3px] text-[#E75480]">
            Management
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#E75480] md:text-5xl">
            Branches
          </h1>

          <p className="mt-2 text-muted">
            Manage salon locations and contact
            details shown on the website.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-full bg-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-white transition hover:bg-[#d94873]"
        >
          Add Branch
        </button>
      </div>

      {/* TABLE */}

      <CustomTable
        className="mt-10"
        columns={columns}
        rows={branches}
        rowKey={(branch) => branch._id}
        loading={loading}
        loadingMessage="Loading branches..."
        emptyIcon="⌂"
        emptyTitle="No branches yet"
        emptyMessage="Add your first branch using the button above."
        minWidth="800px"
        mobileTitle={nameCell}
        mobileActions={renderActions}
      />

      {/* ============================ */}
      {/* ADD / EDIT                   */}
      {/* ============================ */}

      <DialogBox
        open={formOpen}
        onClose={closeForm}
        eyebrow="Management"
        title={
          editingId
            ? "Edit Branch"
            : "Add Branch"
        }
        size="lg"
        onSubmit={handleSubmit}
        submitting={saving}
        submittingLabel={
          editingId
            ? "Updating..."
            : "Adding..."
        }
        confirmLabel={
          editingId
            ? "Update Branch"
            : "Add Branch"
        }
        // A half filled form should not
        // vanish on a stray click.
        closeOnBackdrop={false}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Branch Name"
            required
          >
            <input
              required
              placeholder="e.g. Rabibhawan Branch"
              value={form.name}
              onChange={(e) =>
                updateField(
                  "name",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>

          <FormField label="Label">
            <input
              placeholder="e.g. Main Branch · Est. 2013"
              value={form.label}
              onChange={(e) =>
                updateField(
                  "label",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Address"
            className="md:col-span-2"
          >
            <input
              value={form.address}
              onChange={(e) =>
                updateField(
                  "address",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>

          <FormField label="Phone">
            <input
              type="tel"
              placeholder="e.g. +977 9851097472"
              value={form.phone}
              onChange={(e) =>
                updateField(
                  "phone",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>

          <FormField label="Opening Hours">
            <input
              placeholder="e.g. 8:30 AM – 10:00 PM · Open Daily"
              value={form.openingHours}
              onChange={(e) =>
                updateField(
                  "openingHours",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Google Maps URL"
            className="md:col-span-2"
          >
            <input
              type="url"
              placeholder="https://maps.google.com/..."
              value={form.mapUrl}
              onChange={(e) =>
                updateField(
                  "mapUrl",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>

          {/* BOOKING HOURS */}

          <div className="md:col-span-2">
            <p className="text-sm font-medium text-ink">
              Booking Times
            </p>

            <p className="text-xs text-muted">
              The appointment times customers
              can pick for this branch on the
              website.
            </p>

            <div className="mt-3 inline-flex rounded-full border border-[#E75480]/20 bg-soft p-1">
              {(
                [
                  ["regular", "Regular slots"],
                  ["custom", "Custom times"],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() =>
                    switchSlotMode(mode)
                  }
                  className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[1px] transition ${
                    slotMode === mode
                      ? "bg-[#E75480] text-white"
                      : "text-muted hover:text-[#E75480]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {slotMode === "custom" ? (
            <div className="md:col-span-2">
              <p className="text-xs text-muted">
                Only these times are offered.
                Click × to remove one.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {form.customSlots.length ===
                  0 && (
                  <span className="text-sm text-muted">
                    No times yet — add one
                    below.
                  </span>
                )}

                {form.customSlots.map(
                  (time) => (
                    <span
                      key={time}
                      className="inline-flex items-center gap-1 rounded-full bg-blush py-1 pl-3 pr-1 text-xs font-medium text-[#E75480]"
                    >
                      {formatTime(time)}

                      <button
                        type="button"
                        onClick={() =>
                          removeCustomSlot(time)
                        }
                        aria-label={`Remove ${formatTime(time)}`}
                        className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-[#E75480] hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  )
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  type="time"
                  value={newSlot}
                  onChange={(e) =>
                    setNewSlot(e.target.value)
                  }
                  onKeyDown={(e) => {
                    // Enter adds the time
                    // instead of submitting
                    // the whole form.
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomSlot();
                    }
                  }}
                  className={`${inputClass} max-w-45`}
                />

                <button
                  type="button"
                  onClick={addCustomSlot}
                  disabled={!newSlot}
                  className="rounded-xl border border-[#E75480] px-5 py-3 text-xs uppercase tracking-[1.5px] text-[#E75480] transition hover:bg-soft disabled:opacity-50"
                >
                  Add time
                </button>

                {form.customSlots.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        "customSlots",
                        []
                      )
                    }
                    className="rounded-xl px-4 py-3 text-xs uppercase tracking-[1.5px] text-muted transition hover:text-red-600"
                  >
                    Remove all
                  </button>
                )}
              </div>
            </div>
          ) : (
          <>
          <FormField
            label="First appointment"
            required
          >
            <input
              type="time"
              required
              value={form.bookingOpens}
              onChange={(e) =>
                updateField(
                  "bookingOpens",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Closing time"
            required
          >
            <input
              type="time"
              required
              value={form.bookingCloses}
              onChange={(e) =>
                updateField(
                  "bookingCloses",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Slot length"
            required
          >
            <select
              value={form.slotMinutes}
              onChange={(e) =>
                updateField(
                  "slotMinutes",
                  Number(e.target.value)
                )
              }
              className={inputClass}
            >
              {/* Keeps an odd stored value
                  listed. */}
              {[
                ...new Set([
                  ...SLOT_LENGTHS,
                  form.slotMinutes,
                ]),
              ]
                .sort((a, b) => a - b)
                .map((minutes) => (
                  <option
                    key={minutes}
                    value={minutes}
                  >
                    {minutes} minutes
                  </option>
                ))}
            </select>
          </FormField>

          <p className="text-xs text-muted md:col-span-2">
            {(() => {
              const times = regularSlots(
                form.bookingOpens,
                form.bookingCloses,
                form.slotMinutes
              );

              return times.length
                ? `${times.length} slots: ${times
                    .map(formatTime)
                    .join(", ")}`
                : "These hours fit no slot yet.";
            })()}
          </p>
          </>
          )}
        </div>
      </DialogBox>

      {/* ============================ */}
      {/* DELETE CONFIRMATION          */}
      {/* ============================ */}

      <DialogBox
        open={Boolean(branchToDelete)}
        onClose={() =>
          setBranchToDelete(null)
        }
        eyebrow="Confirm"
        title="Delete branch?"
        description={
          branchToDelete
            ? `"${branchToDelete.name}" will be removed from the website. This cannot be undone.`
            : undefined
        }
        size="sm"
        destructive
        confirmLabel="Delete"
        submittingLabel="Deleting..."
        submitting={deleting}
        onConfirm={confirmDelete}
      >
        <p className="text-sm text-muted">
          Visitors will no longer see this
          branch on the website.
        </p>
      </DialogBox>
    </div>
  );
}

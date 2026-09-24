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
};

// ========================================
// SHARED INPUT STYLE
// ========================================

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none focus:border-[#E75480]";

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
    });

    setEditingId(branch._id);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const updateField = (
    field: keyof BranchPayload,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
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

    const payload: BranchPayload = {
      name: form.name.trim(),
      label: form.label.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      openingHours: form.openingHours.trim(),
      mapUrl: form.mapUrl.trim(),
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
      <p className="font-medium text-[#3A2A2F]">
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
        "text-sm text-[#8A6F78]",
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
        "text-sm text-[#8A6F78]",
      render: (branch) =>
        branch.openingHours || "—",
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

          <p className="mt-2 text-[#8A6F78]">
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
        <p className="text-sm text-[#8A6F78]">
          Visitors will no longer see this
          branch on the website.
        </p>
      </DialogBox>
    </div>
  );
}

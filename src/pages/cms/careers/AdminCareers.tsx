import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../../components/CustomTable";

import DialogBox from "../../../components/DialogBox";

import RowActionsMenu from "../../../components/RowActionsMenu";

import api, {
  getApiErrorMessage,
} from "../../../services/base/api";

// ========================================
// TYPES
// ========================================

type Career = {
  _id: string;
  title: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string;
  active: boolean;
};

const emptyForm = {
  title: "",
  location: "",
  type: "",
  salary: "",
  description: "",
  requirements: "",
};

// ========================================
// SHARED INPUT STYLE
// ========================================

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none focus:border-[#E75480]";

export default function AdminCareers() {
  const [careers, setCareers] = useState<
    Career[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [formData, setFormData] =
    useState(emptyForm);

  // The job awaiting delete
  // confirmation. Null means the dialog
  // is closed.
  const [
    careerToDelete,
    setCareerToDelete,
  ] = useState<Career | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  // ============================
  // FETCH CAREERS
  // ============================

  const fetchCareers = async () => {
    try {
      setLoading(true);

      const res = await api.get<
        Career[]
      >(`/api/careers/admin/all`);

      setCareers(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (error) {
      console.log(error);

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load careers"
        )
      );

      setCareers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  // ============================
  // FORM
  // ============================

  const handleChange = (
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [event.target.name]:
        event.target.value,
    });
  };

  const openAddForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditForm = (
    career: Career
  ) => {
    setFormData({
      title: career.title,
      location: career.location,
      type: career.type,
      salary: career.salary || "",
      description: career.description,
      requirements:
        career.requirements || "",
    });

    setEditingId(career._id);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (editingId) {
        await api.put(
          `/api/careers/${editingId}`,
          formData
        );

        toast.success(
          "Job updated successfully!"
        );
      } else {
        await api.post(
          `/api/careers`,
          formData
        );

        toast.success(
          "Job added successfully!"
        );
      }

      await fetchCareers();

      closeForm();
    } catch (error) {
      console.log(error);

      toast.error(
        getApiErrorMessage(
          error,
          "Unable to save the job"
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // TOGGLE ACTIVE
  // ============================

  const toggleActive = async (
    career: Career
  ) => {
    try {
      setProcessingId(career._id);

      await api.put(
        `/api/careers/${career._id}/active`
      );

      await fetchCareers();
    } catch (error) {
      console.log(error);

      toast.error(
        getApiErrorMessage(
          error,
          "Unable to update the job"
        )
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ============================
  // DELETE
  //
  // Asking happens in the dialog; this
  // only runs once the admin confirms.
  // ============================

  const confirmDelete = async () => {
    if (!careerToDelete) {
      return;
    }

    const id = careerToDelete._id;

    try {
      setDeleting(true);

      await api.delete(
        `/api/careers/${id}`
      );

      // Remove from UI immediately
      setCareers((previous) =>
        previous.filter(
          (career) => career._id !== id
        )
      );

      toast.success(
        "Job deleted successfully!"
      );

      if (editingId === id) {
        closeForm();
      }

      setCareerToDelete(null);
    } catch (error) {
      console.log(error);

      toast.error(
        getApiErrorMessage(
          error,
          "Unable to delete the job"
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

  const statusBadge = (
    career: Career
  ) => (
    <span
      className={`inline-block rounded-full px-4 py-1 text-xs ${
        career.active
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {career.active
        ? "Active"
        : "Inactive"}
    </span>
  );

  const renderActions = (
    career: Career
  ) => (
    <RowActionsMenu
      label={`Actions for ${career.title}`}
      busy={processingId === career._id}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: "✎",
          onSelect: () =>
            openEditForm(career),
        },
        {
          key: "toggle",
          label: career.active
            ? "Deactivate"
            : "Activate",
          icon: career.active
            ? "✕"
            : "✓",
          tone: career.active
            ? "default"
            : "success",
          onSelect: () =>
            toggleActive(career),
        },
        {
          key: "delete",
          label: "Delete",
          icon: "🗑",
          tone: "danger",
          dividerBefore: true,
          onSelect: () =>
            setCareerToDelete(career),
        },
      ]}
    />
  );

  // ============================
  // COLUMNS
  // ============================

  const columns: TableColumn<Career>[] = [
    {
      key: "title",
      header: "Job Title",
      hideOnMobile: true,
      cellClassName:
        "font-medium text-[#3A2A2F]",
      render: (career) => career.title,
    },
    {
      key: "location",
      header: "Location",
      render: (career) =>
        career.location,
    },
    {
      key: "type",
      header: "Type",
      cellClassName: "whitespace-nowrap",
      render: (career) => career.type,
    },
    {
      key: "salary",
      header: "Salary",
      cellClassName:
        "whitespace-nowrap font-medium text-[#E75480]",
      render: (career) =>
        career.salary || "-",
    },
    {
      key: "description",
      header: "Description",
      cellClassName: "max-w-sm",
      render: (career) => (
        <p className="line-clamp-2 leading-6">
          {career.description}
        </p>
      ),
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
            Careers
          </h1>

          <p className="mt-2 text-[#8A6F78]">
            Post and manage job openings
            shown on the careers page.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-full bg-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-white transition hover:bg-[#d94873]"
        >
          Add Career
        </button>
      </div>

      {/* TABLE */}

      <CustomTable
        className="mt-10"
        columns={columns}
        rows={careers}
        rowKey={(career) => career._id}
        loading={loading}
        loadingMessage="Loading careers..."
        emptyIcon="✦"
        emptyTitle="No job openings yet"
        emptyMessage="Add your first opening using the button above."
        minWidth="1100px"
        mobileTitle={(career) =>
          career.title
        }
        mobileSubtitle={(career) =>
          career.location
        }
        mobileBadge={statusBadge}
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
            ? "Edit Career"
            : "Add Career"
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
            ? "Update Career"
            : "Add Career"
        }
        // A half filled form should not
        // vanish on a stray click.
        closeOnBackdrop={false}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="title"
            placeholder="Job Title"
            required
            value={formData.title}
            onChange={handleChange}
            className={inputClass}
          />

          <input
            name="location"
            placeholder="Location"
            required
            value={formData.location}
            onChange={handleChange}
            className={inputClass}
          />

          <input
            name="type"
            placeholder="Full Time / Part Time"
            required
            value={formData.type}
            onChange={handleChange}
            className={inputClass}
          />

          <input
            name="salary"
            placeholder="Salary"
            value={formData.salary}
            onChange={handleChange}
            className={inputClass}
          />

          <textarea
            name="description"
            placeholder="Job Description"
            required
            rows={5}
            value={formData.description}
            onChange={handleChange}
            className={`${inputClass} md:col-span-2`}
          />

          <textarea
            name="requirements"
            placeholder="Requirements"
            rows={5}
            value={formData.requirements}
            onChange={handleChange}
            className={`${inputClass} md:col-span-2`}
          />
        </div>
      </DialogBox>

      {/* ============================ */}
      {/* DELETE CONFIRMATION          */}
      {/* ============================ */}

      <DialogBox
        open={Boolean(careerToDelete)}
        onClose={() =>
          setCareerToDelete(null)
        }
        eyebrow="Confirm"
        title="Delete job opening?"
        description={
          careerToDelete
            ? `"${careerToDelete.title}" will be removed from the careers page. This cannot be undone.`
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
          Applicants will no longer see
          this opening on the website.
        </p>
      </DialogBox>
    </div>
  );
}

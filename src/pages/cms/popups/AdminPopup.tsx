import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../../components/CustomTable";

import DialogBox from "../../../components/DialogBox";

import RowActionsMenu from "../../../components/RowActionsMenu";

import api from "../../../services/base/api";

import { uploadImage as uploadImageToServer } from "../../../services/upload/uploadService";

import FormField, { FormLabel } from "../../../components/FormField";

// ========================================
// TYPES
// ========================================

type Popup = {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  delay: number;
  startDate: string;
  endDate: string;
  active: boolean;
};

const emptyForm = {
  title: "",
  subtitle: "",
  image: "",
  buttonText: "",
  buttonLink: "",
  delay: 3000,
  startDate: "",
  endDate: "",
};

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

// ========================================
// SHARED INPUT STYLE
// ========================================

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none focus:border-[#E75480]";

// A missing or malformed date should show
// a dash, not "Invalid Date".
const formatDate = (value?: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString();
};

export default function AdminPopup() {
  const [popups, setPopups] = useState<
    Popup[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState(emptyForm);

  // The popup awaiting delete
  // confirmation. Null means the dialog
  // is closed.
  const [popupToDelete, setPopupToDelete] =
    useState<Popup | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  // ============================
  // FETCH POPUPS
  // ============================

  const fetchPopups = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/popup`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await res.json();

      setPopups(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.log(error);

      toast.error(
        "Failed to fetch popups"
      );

      setPopups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  // ============================
  // FORM
  // ============================

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditForm = (
    popup: Popup
  ) => {
    setForm({
      title: popup.title,
      subtitle: popup.subtitle,
      image: popup.image,
      buttonText: popup.buttonText,
      buttonLink: popup.buttonLink,
      delay: popup.delay,
      startDate:
        popup.startDate?.split(
          "T"
        )[0] ?? "",
      endDate:
        popup.endDate?.split("T")[0] ??
        "",
    });

    setEditingId(popup._id);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const uploadImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);

      const imageUrl =
        await uploadImageToServer(file);

      setForm((previous) => ({
        ...previous,
        image: imageUrl,
      }));

      toast.success("Image uploaded 💖");
    } catch (error) {
      console.log(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (editingId) {
        await api.put(
          `/api/popup/${editingId}`,
          form
        );

        toast.success("Popup updated 💖");
      } else {
        await api.post(
          `/api/popup`,
          form
        );

        toast.success("Popup created 💖");
      }

      await fetchPopups();

      closeForm();
    } catch (error) {
      console.log(error);

      toast.error(
        "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // TOGGLE ACTIVE
  // ============================

  const togglePopup = async (
    popup: Popup
  ) => {
    try {
      setProcessingId(popup._id);

      await api.put(
        `/api/popup/${popup._id}/toggle`
      );

      toast.success("Popup updated 💖");

      await fetchPopups();
    } catch (error) {
      console.log(error);

      toast.error("Toggle failed");
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
    if (!popupToDelete) {
      return;
    }

    const id = popupToDelete._id;

    try {
      setDeleting(true);

      await api.delete(
        `/api/popup/${id}`
      );

      // Remove from UI immediately
      setPopups((previous) =>
        previous.filter(
          (popup) => popup._id !== id
        )
      );

      toast.success("Popup deleted");

      if (editingId === id) {
        closeForm();
      }

      setPopupToDelete(null);
    } catch (error) {
      console.log(error);

      toast.error("Delete failed");

      // Dialog stays open so the admin can
      // retry.
    } finally {
      setDeleting(false);
    }
  };

  // ============================
  // ROW PIECES
  // ============================

  const thumbnail = (popup: Popup) =>
    popup.image ? (
      <img
        src={popup.image}
        alt={popup.title}
        className="h-14 w-20 rounded-xl object-cover"
      />
    ) : (
      <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-[#FFF5F8] text-lg text-[#E75480]">
        ✦
      </div>
    );

  const statusBadge = (popup: Popup) => (
    <span
      className={`inline-block rounded-full px-4 py-1 text-xs ${
        popup.active
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {popup.active
        ? "Active"
        : "Inactive"}
    </span>
  );

  const renderActions = (
    popup: Popup
  ) => (
    <RowActionsMenu
      label={`Actions for ${popup.title}`}
      busy={processingId === popup._id}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: "✎",
          onSelect: () =>
            openEditForm(popup),
        },
        {
          key: "toggle",
          label: popup.active
            ? "Deactivate"
            : "Activate",
          icon: popup.active
            ? "✕"
            : "✓",
          tone: popup.active
            ? "default"
            : "success",
          onSelect: () =>
            togglePopup(popup),
        },
        {
          key: "delete",
          label: "Delete",
          icon: "🗑",
          tone: "danger",
          dividerBefore: true,
          onSelect: () =>
            setPopupToDelete(popup),
        },
      ]}
    />
  );

  // ============================
  // COLUMNS
  // ============================

  const columns: TableColumn<Popup>[] = [
    {
      key: "image",
      header: "Image",
      width: "110px",
      hideOnMobile: true,
      render: thumbnail,
    },
    {
      key: "title",
      header: "Title",
      hideOnMobile: true,
      cellClassName:
        "font-medium text-[#3A2A2F]",
      render: (popup) => popup.title,
    },
    {
      key: "subtitle",
      header: "Subtitle",
      cellClassName: "max-w-sm",
      render: (popup) => (
        <p className="line-clamp-2 leading-6">
          {popup.subtitle}
        </p>
      ),
    },
    {
      key: "schedule",
      header: "Schedule",
      cellClassName: "whitespace-nowrap",
      render: (popup) => (
        <>
          <p>
            {formatDate(popup.startDate)}
          </p>

          <p className="mt-1 text-xs">
            to{" "}
            {formatDate(popup.endDate)}
          </p>
        </>
      ),
    },
    {
      key: "delay",
      header: "Delay",
      cellClassName: "whitespace-nowrap",
      render: (popup) =>
        `${popup.delay} ms`,
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
            Website Popup
          </h1>

          <p className="mt-2 text-[#8A6F78]">
            Manage website offers and
            announcements.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-full bg-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-white transition hover:bg-[#d94873]"
        >
          Add Popup
        </button>
      </div>

      {/* TABLE */}

      <CustomTable
        className="mt-10"
        columns={columns}
        rows={popups}
        rowKey={(popup) => popup._id}
        loading={loading}
        loadingMessage="Loading popups..."
        emptyIcon="✦"
        emptyTitle="No popups yet"
        emptyMessage="Add your first popup using the button above."
        minWidth="1100px"
        mobileTitle={(popup) => (
          <span className="flex items-center gap-3">
            {thumbnail(popup)}

            <span>{popup.title}</span>
          </span>
        )}
        mobileSubtitle={(popup) =>
          `${formatDate(
            popup.startDate
          )} - ${formatDate(
            popup.endDate
          )}`
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
            ? "Edit Popup"
            : "Create Popup"
        }
        size="lg"
        onSubmit={handleSubmit}
        submitting={saving}
        submittingLabel={
          editingId
            ? "Updating..."
            : "Creating..."
        }
        confirmLabel={
          editingId
            ? "Update Popup"
            : "Create Popup"
        }
        confirmDisabled={uploading}
        // A half filled form should not
        // vanish on a stray click.
        closeOnBackdrop={false}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Popup Title"
            required
          >
            <input
              type="text"
              required
              value={form.title}
              onChange={(event) =>
                setForm({
                  ...form,
                  title:
                    event.target.value,
                })
              }
              className={inputClass}
            />
          </FormField>

          <FormField label="Button Text">
            <input
              type="text"
              value={form.buttonText}
              onChange={(event) =>
                setForm({
                  ...form,
                  buttonText:
                    event.target.value,
                })
              }
              className={inputClass}
            />
          </FormField>

          <FormField label="Button Link">
            <input
              type="text"
              value={form.buttonLink}
              onChange={(event) =>
                setForm({
                  ...form,
                  buttonLink:
                    event.target.value,
                })
              }
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Delay"
            hint="in milliseconds"
          >
            <input
              type="number"
              placeholder="e.g. 3000"
              value={form.delay}
              onChange={(event) =>
                setForm({
                  ...form,
                  delay: Number(
                    event.target.value
                  ),
                })
              }
              className={inputClass}
            />
          </FormField>

          <div>
            <FormLabel label="Start Date" />

            <input
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm({
                  ...form,
                  startDate:
                    event.target.value,
                })
              }
              className={inputClass}
            />
          </div>

          <div>
            <FormLabel label="End Date" />

            <input
              type="date"
              value={form.endDate}
              onChange={(event) =>
                setForm({
                  ...form,
                  endDate:
                    event.target.value,
                })
              }
              className={inputClass}
            />
          </div>

          <FormField
            label="Subtitle"
            className="md:col-span-2"
          >
            <textarea
              value={form.subtitle}
              onChange={(event) =>
                setForm({
                  ...form,
                  subtitle:
                    event.target.value,
                })
              }
              rows={4}
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Popup Image"
            className="md:col-span-2"
          >
            <input
              type="file"
              accept="image/*"
              onChange={uploadImage}
              className={inputClass}
            />
          </FormField>
        </div>

        {uploading && (
          <p className="mt-4 text-sm text-[#8A6F78]">
            Uploading image...
          </p>
        )}

        {form.image && (
          <div className="mt-5">
            <p className="mb-2 text-sm text-[#8A6F78]">
              Image Preview
            </p>

            <img
              src={form.image}
              alt="Preview"
              className="h-48 w-full rounded-2xl object-cover md:max-w-md"
            />
          </div>
        )}
      </DialogBox>

      {/* ============================ */}
      {/* DELETE CONFIRMATION          */}
      {/* ============================ */}

      <DialogBox
        open={Boolean(popupToDelete)}
        onClose={() =>
          setPopupToDelete(null)
        }
        eyebrow="Confirm"
        title="Delete popup?"
        description={
          popupToDelete
            ? `"${popupToDelete.title}" will be removed from the website. This cannot be undone.`
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
          announcement.
        </p>
      </DialogBox>
    </div>
  );
}

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../../components/CustomTable";

import DialogBox from "../../../components/DialogBox";

import RowActionsMenu from "../../../components/RowActionsMenu";

import { uploadImage } from "../../../services/upload/uploadService";

// ========================================
// TYPES
// ========================================

type ImageItem = {
  _id?: string;
  title: string;
  category: string;
  image: string;
};

const emptyItem: ImageItem = {
  title: "",
  category: "Salon",
  image: "",
};

// ========================================
// REQUEST HELPERS
// ========================================

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

// Older records were saved with a
// localhost URL or a bare /uploads path.
const getImageUrl = (image?: string) => {
  if (!image) return "";

  if (
    image.startsWith(
      "http://localhost:5000"
    )
  ) {
    return image.replace(
      "http://localhost:5000",
      import.meta.env.VITE_API_URL
    );
  }

  if (image.startsWith("/uploads")) {
    return `${import.meta.env.VITE_API_URL}${image}`;
  }

  return image;
};

// ========================================
// SHARED INPUT STYLE
// ========================================

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none focus:border-[#E75480]";

export default function GalleryAdmin() {
  const [items, setItems] = useState<
    ImageItem[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [form, setForm] =
    useState<ImageItem>(emptyItem);

  const [formOpen, setFormOpen] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  // The image awaiting delete
  // confirmation. Null means the dialog
  // is closed.
  const [itemToDelete, setItemToDelete] =
    useState<ImageItem | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  // ============================
  // FETCH IMAGES
  // ============================

  const fetchItems = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/gallery`
      );

      const data = await res.json();

      setItems(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Fetch gallery error:",
        error
      );

      toast.error(
        "Failed to load gallery images"
      );

      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ============================
  // FORM
  // ============================

  const openAddForm = () => {
    setForm(emptyItem);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(emptyItem);
  };

  const handleUpload = async (
    file: File
  ) => {
    try {
      setUploading(true);

      const imageUrl =
        await uploadImage(file);

      setForm((previous) => ({
        ...previous,
        image: imageUrl,
      }));
    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

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
    if (!form.image) {
      toast.error(
        "Please upload an image."
      );

      return;
    }

    try {
      setSaving(true);

      await fetch(
        `${import.meta.env.VITE_API_URL}/api/gallery`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(form),
        }
      );

      await fetchItems();

      toast.success(
        "Image added successfully!"
      );

      closeForm();
    } catch (error) {
      console.error(
        "Save gallery error:",
        error
      );

      toast.error(
        "Unable to save the image"
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
    if (!itemToDelete?._id) {
      return;
    }

    try {
      setDeleting(true);

      await fetch(
        `${import.meta.env.VITE_API_URL}/api/gallery/${itemToDelete._id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      await fetchItems();

      toast.success(
        "Image deleted successfully!"
      );

      setItemToDelete(null);
    } catch (error) {
      console.error(
        "Delete gallery error:",
        error
      );

      toast.error(
        "Unable to delete the image"
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

  const thumbnail = (
    item: ImageItem
  ) => (
    <img
      src={getImageUrl(item.image)}
      alt={item.title || "Gallery image"}
      className="h-14 w-20 rounded-xl object-cover"
    />
  );

  const renderActions = (
    item: ImageItem
  ) => (
    <RowActionsMenu
      label={`Actions for ${item.title || "image"}`}
      actions={[
        {
          key: "delete",
          label: "Delete",
          icon: "🗑",
          tone: "danger",
          onSelect: () =>
            setItemToDelete(item),
        },
      ]}
    />
  );

  // ============================
  // COLUMNS
  // ============================

  const columns: TableColumn<ImageItem>[] =
    [
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
        render: (item) =>
          item.title || "Untitled",
      },
      {
        key: "category",
        header: "Category",
        hideOnMobile: true,
        render: (item) => (
          <span className="inline-block rounded-full bg-[#FCE7EF] px-4 py-1 text-xs uppercase tracking-[1px] text-[#E75480]">
            {item.category}
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
            Gallery
          </h1>

          <p className="mt-2 text-[#8A6F78]">
            Upload and manage gallery images.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-full bg-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-white transition hover:bg-[#d94873]"
        >
          Add Image
        </button>
      </div>

      {/* TABLE */}

      <CustomTable
        className="mt-10"
        columns={columns}
        rows={items}
        rowKey={(item, index) =>
          item._id ?? String(index)
        }
        loading={loading}
        loadingMessage="Loading gallery..."
        emptyIcon="✦"
        emptyTitle="No images uploaded"
        emptyMessage="Add your first image using the button above."
        minWidth="700px"
        mobileTitle={(item) => (
          <span className="flex items-center gap-3">
            {thumbnail(item)}

            <span>
              {item.title || "Untitled"}
            </span>
          </span>
        )}
        mobileSubtitle={(item) =>
          item.category
        }
        mobileActions={renderActions}
      />

      {/* ============================ */}
      {/* ADD                          */}
      {/* ============================ */}

      <DialogBox
        open={formOpen}
        onClose={closeForm}
        eyebrow="Management"
        title="Add Image"
        size="lg"
        onSubmit={handleSubmit}
        submitting={saving}
        submittingLabel="Adding..."
        confirmLabel="Upload Image"
        confirmDisabled={uploading}
        // A half filled form should not
        // vanish on a stray click.
        closeOnBackdrop={false}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <input
            placeholder="Title"
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

          <input
            placeholder="Category"
            value={form.category}
            onChange={(event) =>
              setForm({
                ...form,
                category:
                  event.target.value,
              })
            }
            className={inputClass}
          />

          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={(event) => {
              const file =
                event.target.files?.[0];

              if (!file) {
                return;
              }

              handleUpload(file);
            }}
            className={`${inputClass} md:col-span-2`}
          />
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
              src={getImageUrl(
                form.image
              )}
              alt="Preview"
              className="h-44 w-full rounded-2xl object-cover md:max-w-md"
            />
          </div>
        )}
      </DialogBox>

      {/* ============================ */}
      {/* DELETE CONFIRMATION          */}
      {/* ============================ */}

      <DialogBox
        open={Boolean(itemToDelete)}
        onClose={() =>
          setItemToDelete(null)
        }
        eyebrow="Confirm"
        title="Delete image?"
        description={
          itemToDelete
            ? `"${itemToDelete.title || "Untitled"}" will be removed from the gallery. This cannot be undone.`
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
          image on the website gallery.
        </p>
      </DialogBox>
    </div>
  );
}

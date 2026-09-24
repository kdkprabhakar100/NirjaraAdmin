import {
  useEffect,
  useRef,
  useState,
} from "react";

import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../../components/CustomTable";

import DialogBox from "../../../components/DialogBox";

import LoadingSpinner from "../../../components/LoadingSpinner";

import RowActionsMenu from "../../../components/RowActionsMenu";

import { getApiErrorMessage } from "../../../services/base/api";

import { createGalleryItems } from "../../../services/gallery/galleryService";

import {
  MAX_GALLERY_BATCH,
  type GalleryItem,
} from "../../../services/gallery/gallery.types";

import { uploadImage } from "../../../services/upload/uploadService";

import {
  validImage,
  validateField,
} from "../../../utils/validation";

// ========================================
// TYPES
// ========================================

// One picked file in the Add dialog.
// `imageUrl` is filled once the file is
// uploaded, so a retry after a failed
// save does not upload it twice.
type DraftImage = {
  id: string;
  file: File;
  preview: string;
  title: string;
  description: string;
  imageUrl?: string;
  // Unset while waiting or once done;
  // `imageUrl` tells those two apart.
  status?: "uploading" | "failed";
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
// UPLOAD SETTINGS
//
// A few uploads at a time keeps a large
// batch from flooding the server, which
// holds each file in memory while it
// streams to Cloudinary.
// ========================================

const UPLOAD_CONCURRENCY = 3;

// Keys the picked files; only needs to be
// unique within this browser tab.
let nextDraftId = 0;

// ========================================
// SHARED INPUT STYLE
// ========================================

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none focus:border-[#E75480]";

export default function GalleryAdmin() {
  const [items, setItems] = useState<
    GalleryItem[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [drafts, setDrafts] = useState<
    DraftImage[]
  >([]);

  const [formOpen, setFormOpen] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  // How many of the batch have finished
  // uploading, for the progress line.
  const [uploadedCount, setUploadedCount] =
    useState(0);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  // The image awaiting delete
  // confirmation. Null means the dialog
  // is closed.
  const [itemToDelete, setItemToDelete] =
    useState<GalleryItem | null>(null);

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
    setDrafts([]);
    setUploadedCount(0);
    setFormOpen(true);
  };

  const closeForm = () => {
    drafts.forEach((draft) =>
      URL.revokeObjectURL(draft.preview)
    );

    setDrafts([]);
    setFormOpen(false);
  };

  // ============================
  // PICK FILES
  //
  // Adds to the current batch, so the
  // admin can pick from more than one
  // folder. Bad files are skipped with a
  // message; the rest are still added.
  // ============================

  const handleFilesPicked = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const picked = Array.from(
      event.target.files ?? []
    );

    // Lets the same file be picked again
    // after it was removed.
    event.target.value = "";

    const accepted: DraftImage[] = [];

    for (const file of picked) {
      const error = validateField(
        file,
        "Image",
        [validImage()]
      );

      if (error) {
        toast.error(
          `${file.name}: ${error}`
        );

        continue;
      }

      accepted.push({
        id: `${Date.now()}-${nextDraftId++}`,
        file,
        preview:
          URL.createObjectURL(file),
        title: "",
        description: "",
      });
    }

    const room =
      MAX_GALLERY_BATCH - drafts.length;

    if (accepted.length > room) {
      toast.error(
        `You can upload at most ${MAX_GALLERY_BATCH} images at a time.`
      );

      accepted
        .slice(room)
        .forEach((draft) =>
          URL.revokeObjectURL(
            draft.preview
          )
        );
    }

    setDrafts((previous) => [
      ...previous,
      ...accepted.slice(0, room),
    ]);
  };

  const updateDraft = (
    id: string,
    changes: Partial<DraftImage>
  ) => {
    setDrafts((previous) =>
      previous.map((draft) =>
        draft.id === id
          ? { ...draft, ...changes }
          : draft
      )
    );
  };

  const removeDraft = (id: string) => {
    setDrafts((previous) => {
      const draft = previous.find(
        (item) => item.id === id
      );

      if (draft) {
        URL.revokeObjectURL(
          draft.preview
        );
      }

      return previous.filter(
        (item) => item.id !== id
      );
    });
  };

  // ============================
  // SAVE
  //
  // Uploads every image that is not
  // uploaded yet, then creates all the
  // gallery items in one request. If any
  // upload fails nothing is saved, and
  // the finished uploads are kept for
  // the retry.
  // ============================

  const handleSubmit = async () => {
    if (drafts.length === 0) {
      toast.error(
        "Please choose at least one image."
      );

      return;
    }

    setSaving(true);

    const urls = new Map<string, string>();

    drafts.forEach((draft) => {
      if (draft.imageUrl) {
        urls.set(draft.id, draft.imageUrl);
      }
    });

    setUploadedCount(urls.size);

    const pending = drafts.filter(
      (draft) => !draft.imageUrl
    );

    const failures: string[] = [];

    const worker = async () => {
      for (
        let draft = pending.shift();
        draft;
        draft = pending.shift()
      ) {
        updateDraft(draft.id, {
          status: "uploading",
        });

        try {
          const imageUrl =
            await uploadImage(draft.file);

          urls.set(draft.id, imageUrl);

          updateDraft(draft.id, {
            imageUrl,
            status: undefined,
          });

          setUploadedCount(urls.size);
        } catch (error) {
          updateDraft(draft.id, {
            status: "failed",
          });

          failures.push(
            `${draft.file.name}: ${
              error instanceof Error
                ? error.message
                : "Upload failed"
            }`
          );
        }
      }
    };

    await Promise.all(
      Array.from(
        { length: UPLOAD_CONCURRENCY },
        worker
      )
    );

    if (failures.length > 0) {
      failures.forEach((message) =>
        toast.error(message)
      );

      toast.error(
        "Nothing was saved. Remove or retry the failed images."
      );

      setSaving(false);

      return;
    }

    try {
      const created =
        await createGalleryItems(
          drafts.map((draft) => ({
            image: urls.get(draft.id)!,
            title: draft.title.trim(),
            description:
              draft.description.trim(),
          }))
        );

      toast.success(
        created.length === 1
          ? "Image added successfully!"
          : `${created.length} images added successfully!`
      );

      closeForm();

      await fetchItems();
    } catch (error) {
      console.error(
        "Save gallery error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Unable to save the images"
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
    item: GalleryItem
  ) => (
    <img
      src={getImageUrl(item.image)}
      alt={item.title || "Gallery image"}
      className="h-14 w-20 rounded-xl object-cover"
    />
  );

  const renderActions = (
    item: GalleryItem
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

  const columns: TableColumn<GalleryItem>[] =
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
        key: "description",
        header: "Description",
        hideOnMobile: true,
        cellClassName:
          "text-sm text-[#8A6F78]",
        render: (item) => (
          <span className="line-clamp-2">
            {item.description || "—"}
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

  const readyCount = drafts.length;

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
          Add Images
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
        emptyMessage="Add your first images using the button above."
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
          item.description
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
        title="Add Images"
        description={`Pick up to ${MAX_GALLERY_BATCH} images. Title and description are optional.`}
        size="lg"
        onSubmit={handleSubmit}
        submitting={saving}
        submittingLabel={
          uploadedCount < readyCount
            ? `Uploading ${uploadedCount} of ${readyCount}...`
            : "Saving..."
        }
        confirmLabel={
          readyCount > 1
            ? `Upload ${readyCount} Images`
            : "Upload Image"
        }
        confirmDisabled={readyCount === 0}
        // A half filled form should not
        // vanish on a stray click.
        closeOnBackdrop={false}
        closeOnEscape={!saving}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFilesPicked}
          className="hidden"
        />

        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          disabled={
            saving ||
            readyCount >= MAX_GALLERY_BATCH
          }
          className="flex w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#E75480]/30 bg-[#FFF5F8] px-4 py-8 text-sm text-[#8A6F78] transition hover:border-[#E75480] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-[#E75480]">
            {readyCount === 0
              ? "Choose images"
              : "Add more images"}
          </span>

          <span className="text-xs">
            JPG, PNG or WebP, up to 5 MB each
          </span>
        </button>

        {/* PROGRESS */}

        {saving && (
          <div
            role="status"
            className="mt-5 rounded-2xl bg-[#FFF5F8] p-4"
          >
            <div className="flex items-center gap-3 text-sm text-[#3A2A2F]">
              <LoadingSpinner
                size="sm"
                className="text-[#E75480]"
              />

              {uploadedCount < readyCount
                ? `Uploading ${uploadedCount} of ${readyCount} images...`
                : "Saving to the gallery..."}
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E75480]/15">
              <div
                className="h-full rounded-full bg-[#E75480] transition-all duration-300"
                style={{
                  width: `${
                    readyCount
                      ? (uploadedCount /
                          readyCount) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {drafts.length > 0 && (
          <ul className="mt-5 space-y-4">
            {drafts.map((draft, index) => (
              <li
                key={draft.id}
                className="flex flex-col gap-4 rounded-2xl border border-[#E75480]/10 p-4 sm:flex-row"
              >
                <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-36">
                  <img
                    src={draft.preview}
                    alt={`Selected image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {draft.status ===
                    "uploading" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70 text-[#E75480]">
                      <LoadingSpinner
                        label={`Uploading image ${index + 1}`}
                      />

                      <span className="text-xs">
                        Uploading...
                      </span>
                    </div>
                  )}

                  {draft.status ===
                    "failed" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#DC2626]/70 text-xs font-medium uppercase tracking-[1px] text-white">
                      Failed
                    </div>
                  )}

                  {draft.imageUrl && (
                    <span
                      aria-label="Uploaded"
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#16A34A] text-xs text-white"
                    >
                      ✓
                    </span>
                  )}

                  {saving &&
                    !draft.status &&
                    !draft.imageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-xs text-[#8A6F78]">
                        Waiting...
                      </div>
                    )}
                </div>

                <div className="flex-1 space-y-3">
                  <input
                    placeholder="Title (optional)"
                    aria-label={`Title for image ${index + 1}`}
                    maxLength={200}
                    value={draft.title}
                    disabled={saving}
                    onChange={(event) =>
                      updateDraft(draft.id, {
                        title:
                          event.target.value,
                      })
                    }
                    className={inputClass}
                  />

                  <textarea
                    placeholder="Description (optional)"
                    aria-label={`Description for image ${index + 1}`}
                    maxLength={1000}
                    rows={2}
                    value={draft.description}
                    disabled={saving}
                    onChange={(event) =>
                      updateDraft(draft.id, {
                        description:
                          event.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeDraft(draft.id)
                  }
                  disabled={saving}
                  aria-label={`Remove image ${index + 1}`}
                  className="self-start rounded-full px-3 py-1 text-xs uppercase tracking-[1px] text-[#DC2626] transition hover:bg-[#FEE2E2] disabled:opacity-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
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

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

import CustomTable, {
  type TableColumn,
} from "../../../components/CustomTable";

import DialogBox from "../../../components/DialogBox";

import RowActionsMenu from "../../../components/RowActionsMenu";

import api from "../../../services/base/api";

import getCroppedImg from "../../../utils/cropImage";

import { uploadImage as uploadImageToServer } from "../../../services/upload/uploadService";

import FormField, { FormLabel } from "../../../components/FormField";

// ========================================
// TYPES
// ========================================

interface EventType {
  _id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  date: string;
  time: string;
  featured: boolean;
  active: boolean;
}

const emptyForm = {
  title: "",
  description: "",
  image: "",
  location: "",
  date: "",
  time: "",
  buttonText: "Register Now",
  buttonLink: "/contact",
};

// ========================================
// SHARED INPUT STYLE
// ========================================

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-soft px-4 py-3 text-sm outline-none focus:border-[#E75480]";

const AdminEvents = () => {
  const [events, setEvents] = useState<
    EventType[]
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

  // The event awaiting delete
  // confirmation. Null means the dialog
  // is closed.
  const [eventToDelete, setEventToDelete] =
    useState<EventType | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  // ============================
  // CROPPER STATE
  // ============================

  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] = useState(1);

  const [
    croppedAreaPixels,
    setCroppedAreaPixels,
  ] = useState<Area | null>(null);

  // The picked file, before cropping.
  const [imageSrc, setImageSrc] =
    useState("");

  const [cropping, setCropping] =
    useState(false);

  // ============================
  // FETCH EVENTS
  // ============================

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/api/events/admin/all`
      );

      setEvents(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (error) {
      console.log(error);

      toast.error(
        "Failed to load events"
      );

      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
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
    setImageSrc("");
    setFormOpen(true);
  };

  const openEditForm = (
    item: EventType
  ) => {
    setFormData({
      title: item.title,
      description: item.description,
      image: item.image,
      location: item.location,
      date: item.date.split("T")[0],
      time: item.time,
      buttonText: "Register Now",
      buttonLink: "/contact",
    });

    setEditingId(item._id);
    setImageSrc("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormData(emptyForm);
    setEditingId(null);
    setImageSrc("");
  };

  // ============================
  // IMAGE SELECT + CROP
  // ============================

  const onCropComplete = (
    _: Area,
    areaPixels: Area
  ) => {
    setCroppedAreaPixels(areaPixels);
  };

  const pickImage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageSrc(
      URL.createObjectURL(file)
    );
  };

  const handleCropDone = async () => {
    try {
      setCropping(true);

      const croppedBlob =
        await getCroppedImg(
          imageSrc,
          croppedAreaPixels
        );

      if (!croppedBlob) {
        return;
      }

      const imageUrl =
        await uploadImageToServer(
          croppedBlob,
          "event.jpg"
        );

      setFormData((previous) => ({
        ...previous,
        image: imageUrl,
      }));

      setImageSrc("");
    } catch (error) {
      console.log(error);

      toast.error(
        "Unable to upload the image"
      );
    } finally {
      setCropping(false);
    }
  };

  // ============================
  // CREATE / UPDATE
  // ============================

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (editingId) {
        await api.put(
          `/api/events/${editingId}`,
          formData
        );

        toast.success(
          "Event updated successfully!"
        );
      } else {
        await api.post(
          `/api/events`,
          formData
        );

        toast.success(
          "Event created successfully!"
        );
      }

      await fetchEvents();

      closeForm();
    } catch (error) {
      console.log(error);

      toast.error(
        "Unable to save the event"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // TOGGLES
  // ============================

  const toggleFeatured = async (
    item: EventType
  ) => {
    try {
      setProcessingId(item._id);

      await api.put(
        `/api/events/${item._id}/featured`
      );

      await fetchEvents();
    } catch (error) {
      console.log(error);

      toast.error(
        "Unable to update the event"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const toggleActive = async (
    item: EventType
  ) => {
    try {
      setProcessingId(item._id);

      await api.put(
        `/api/events/${item._id}/active`
      );

      await fetchEvents();
    } catch (error) {
      console.log(error);

      toast.error(
        "Unable to update the event"
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
    if (!eventToDelete) {
      return;
    }

    const id = eventToDelete._id;

    try {
      setDeleting(true);

      await api.delete(
        `/api/events/${id}`
      );

      // Remove from UI immediately
      setEvents((previous) =>
        previous.filter(
          (item) => item._id !== id
        )
      );

      toast.success(
        "Event deleted successfully!"
      );

      if (editingId === id) {
        closeForm();
      }

      setEventToDelete(null);
    } catch (error) {
      console.log(error);

      toast.error(
        "Unable to delete the event"
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
    item: EventType
  ) =>
    item.image ? (
      <img
        src={item.image}
        alt={item.title}
        className="h-14 w-20 rounded-xl object-cover"
      />
    ) : (
      <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-soft text-lg text-[#E75480]">
        ✦
      </div>
    );

  const statusBadge = (
    item: EventType
  ) => (
    <div className="flex flex-wrap gap-2">
      <span
        className={`inline-block rounded-full px-4 py-1 text-xs ${
          item.active
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {item.active
          ? "Active"
          : "Inactive"}
      </span>

      {item.featured && (
        <span className="inline-block rounded-full bg-blush px-4 py-1 text-xs text-[#E75480]">
          Featured
        </span>
      )}
    </div>
  );

  const renderActions = (
    item: EventType
  ) => (
    <RowActionsMenu
      label={`Actions for ${item.title}`}
      busy={processingId === item._id}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: "✎",
          onSelect: () =>
            openEditForm(item),
        },
        {
          key: "featured",
          label: item.featured
            ? "Unfeature"
            : "Make featured",
          icon: "★",
          onSelect: () =>
            toggleFeatured(item),
        },
        {
          key: "active",
          label: item.active
            ? "Deactivate"
            : "Activate",
          icon: item.active
            ? "✕"
            : "✓",
          tone: item.active
            ? "default"
            : "success",
          onSelect: () =>
            toggleActive(item),
        },
        {
          key: "delete",
          label: "Delete",
          icon: "🗑",
          tone: "danger",
          dividerBefore: true,
          onSelect: () =>
            setEventToDelete(item),
        },
      ]}
    />
  );

  // ============================
  // COLUMNS
  // ============================

  const columns: TableColumn<EventType>[] =
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
          "font-medium text-ink",
        render: (item) => item.title,
      },
      {
        key: "location",
        header: "Location",
        render: (item) => item.location,
      },
      {
        key: "date",
        header: "Date",
        cellClassName:
          "whitespace-nowrap",
        render: (item) =>
          new Date(
            item.date
          ).toLocaleDateString(),
      },
      {
        key: "time",
        header: "Time",
        cellClassName:
          "whitespace-nowrap",
        render: (item) => item.time,
      },
      {
        key: "description",
        header: "Description",
        cellClassName: "max-w-sm",
        render: (item) => (
          <p className="line-clamp-2 leading-6">
            {item.description}
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
            Events
          </h1>

          <p className="mt-2 text-muted">
            Create, edit, and manage website
            events.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-full bg-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-white transition hover:bg-[#d94873]"
        >
          Add Event
        </button>
      </div>

      {/* TABLE */}

      <CustomTable
        className="mt-10"
        columns={columns}
        rows={events}
        rowKey={(item) => item._id}
        loading={loading}
        loadingMessage="Loading events..."
        emptyIcon="✦"
        emptyTitle="No events yet"
        emptyMessage="Add your first event using the button above."
        minWidth="1200px"
        mobileTitle={(item) => (
          <span className="flex items-center gap-3">
            {thumbnail(item)}

            <span>{item.title}</span>
          </span>
        )}
        mobileSubtitle={(item) =>
          `${new Date(
            item.date
          ).toLocaleDateString()} · ${
            item.time
          }`
        }
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
            ? "Edit Event"
            : "Create Event"
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
            ? "Update Event"
            : "Create Event"
        }
        // The picked image still needs
        // cropping before it can be saved.
        confirmDisabled={Boolean(
          imageSrc
        )}
        // A half filled form should not
        // vanish on a stray click.
        closeOnBackdrop={false}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Event Title"
            required
          >
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Location"
            required
          >
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className={inputClass}
            />
          </FormField>

          <div>
            <FormLabel
              label="Date"
              required
            />

            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <FormLabel
              label="Time"
              required
            />

            <input
              type="text"
              name="time"
              placeholder="2:00 PM"
              required
              value={formData.time}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <FormField
            label="Description"
            required
            className="md:col-span-2"
          >
            <textarea
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              className={inputClass}
            />
          </FormField>

          <div className="md:col-span-2">
            <FormLabel label="Event Image" />

            <input
              type="file"
              accept="image/*"
              onChange={pickImage}
              className={inputClass}
            />

            <p className="mt-2 text-xs text-muted">
              Recommended size: 1200 × 800
              px
            </p>
          </div>
        </div>

        {/* CROPPER */}

        {imageSrc && (
          <div className="mt-5">
            <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={3 / 2}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={
                  onCropComplete
                }
              />
            </div>

            <div className="mt-4">
              <label className="text-sm text-muted">
                Zoom
              </label>

              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(event) =>
                  setZoom(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-full"
              />
            </div>

            <button
              type="button"
              onClick={handleCropDone}
              disabled={cropping}
              className="mt-3 rounded-full bg-[#E75480] px-6 py-3 text-xs uppercase tracking-[2px] text-white transition hover:bg-[#d94873] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cropping
                ? "Uploading..."
                : "Done Cropping"}
            </button>
          </div>
        )}

        {/* PREVIEW */}

        {!imageSrc && formData.image && (
          <div className="mt-5">
            <p className="mb-2 text-sm text-muted">
              Image Preview
            </p>

            <img
              src={formData.image}
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
        open={Boolean(eventToDelete)}
        onClose={() =>
          setEventToDelete(null)
        }
        eyebrow="Confirm"
        title="Delete event?"
        description={
          eventToDelete
            ? `"${eventToDelete.title}" will be removed from the website. This cannot be undone.`
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
          event on the website.
        </p>
      </DialogBox>
    </div>
  );
};

export default AdminEvents;

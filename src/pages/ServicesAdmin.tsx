import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../components/CustomTable";

import DialogBox from "../components/DialogBox";

import { getApiErrorMessage } from "../services/base/api";

import { uploadImage } from "../services/upload/uploadService";

import {
  createService,
  deleteService,
  getServices,
  updateService,
} from "../services/service/serviceService";

import type {
  Service,
  ServicePayload,
} from "../services/service/service.types";

// ========================================
// FORM DEFAULTS
// ========================================

const categories = [
  "Hair",
  "Skin",
  "Bridal",
  "Nails",
  "Spa",
  "Academy",
  "Other",
];

const emptyForm: ServicePayload = {
  icon: "✦",
  title: "",
  description: "",
  price: "",
  category: "Hair",
  image: "",
};

// ========================================
// SHARED INPUT STYLE
// ========================================

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none focus:border-[#E75480]";

export default function ServicesAdmin() {
  const [services, setServices] =
    useState<Service[]>([]);

  const [loading, setLoading] =
    useState(true);

  // ---- Add / edit dialog ----

  const [formOpen, setFormOpen] =
    useState(false);

  const [form, setForm] =
    useState<ServicePayload>(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [customCategory, setCustomCategory] =
    useState("");

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  // ---- Delete dialog ----

  const [serviceToDelete, setServiceToDelete] =
    useState<Service | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  // ============================
  // FETCH SERVICES
  // ============================

  const fetchServices = async () => {
    try {
      setLoading(true);

      const data = await getServices();

      setServices(data);
    } catch (error) {
      console.error(
        "Fetch services error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load services"
        )
      );

      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // ============================
  // OPEN THE FORM
  //
  // Add and edit share one dialog; the
  // only difference is whether the form
  // starts empty or filled.
  // ============================

  const openAddForm = () => {
    setForm(emptyForm);
    setCustomCategory("");
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditForm = (
    service: Service
  ) => {
    const isKnownCategory =
      categories.includes(
        service.category
      );

    setForm({
      icon: service.icon || "✦",
      title: service.title || "",
      description:
        service.description || "",
      price: service.price || "",
      category: isKnownCategory
        ? service.category
        : "Other",
      image: service.image || "",
    });

    // A category the dropdown does not
    // know about becomes "Other" plus the
    // original text.
    setCustomCategory(
      isKnownCategory
        ? ""
        : service.category || ""
    );

    setEditingId(service._id || null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(emptyForm);
    setCustomCategory("");
    setEditingId(null);
  };

  // ============================
  // IMAGE UPLOAD
  //
  // Uploads as soon as a file is picked,
  // so the form holds a URL and saving is
  // a plain JSON request.
  // ============================

  const handleImageUpload = async (
    file: File
  ) => {
    try {
      setUploading(true);

      const imageUrl = await uploadImage(
        file
      );

      setForm((previous) => ({
        ...previous,
        image: imageUrl,
      }));

      toast.success(
        "Image uploaded successfully!"
      );
    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Image upload failed"
        )
      );
    } finally {
      setUploading(false);
    }
  };

  // ============================
  // SAVE
  //
  // Title, price and description are
  // marked required, so the browser blocks
  // the submit before this runs. Only the
  // rules HTML cannot express are checked
  // here.
  // ============================

  const handleSubmit = async () => {
    const category =
      form.category === "Other"
        ? customCategory.trim()
        : form.category;

    if (!category) {
      toast.error(
        "Please enter a category."
      );

      return;
    }

    if (!form.image) {
      toast.error(
        "Please upload an image."
      );

      return;
    }

    const payload: ServicePayload = {
      ...form,
      category,
    };

    try {
      setSaving(true);

      if (editingId) {
        await updateService(
          editingId,
          payload
        );

        toast.success(
          "Service updated successfully!"
        );
      } else {
        await createService(payload);

        toast.success(
          "Service added successfully!"
        );
      }

      await fetchServices();

      closeForm();
    } catch (error) {
      console.error(
        "Save service error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Service save failed"
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // DELETE
  // ============================

  const confirmDelete = async () => {
    const id = serviceToDelete?._id;

    if (!id) {
      return;
    }

    try {
      setDeleting(true);

      await deleteService(id);

      setServices((previous) =>
        previous.filter(
          (service) =>
            service._id !== id
        )
      );

      toast.success(
        "Service deleted successfully!"
      );

      setServiceToDelete(null);
    } catch (error) {
      console.error(
        "Delete service error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Unable to delete service"
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

  const thumbnail = (
    service: Service
  ) =>
    service.image ? (
      <img
        src={service.image}
        alt={service.title}
        className="h-14 w-14 rounded-xl object-cover"
      />
    ) : (
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FFF5F8] text-lg text-[#E75480]">
        {service.icon || "✦"}
      </div>
    );

  const renderActions = (
    service: Service
  ) => (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() =>
          openEditForm(service)
        }
        className="rounded-full border border-[#E75480] px-5 py-2 text-xs text-[#E75480] transition hover:bg-[#FFF5F8]"
      >
        Edit
      </button>

      <button
        type="button"
        onClick={() =>
          setServiceToDelete(service)
        }
        className="rounded-full bg-[#FCE7EF] px-5 py-2 text-xs text-[#E75480] transition hover:bg-[#FBD5E3]"
      >
        Delete
      </button>
    </div>
  );

  // ============================
  // COLUMNS
  // ============================

  const columns: TableColumn<Service>[] = [
    {
      key: "image",
      header: "Image",
      width: "90px",
      hideOnMobile: true,
      render: thumbnail,
    },
    {
      key: "title",
      header: "Title",
      hideOnMobile: true,
      cellClassName:
        "font-medium text-[#3A2A2F]",
      render: (service) =>
        service.title,
    },
    {
      key: "category",
      header: "Category",
      hideOnMobile: true,
      render: (service) => (
        <span className="inline-block rounded-full bg-[#FCE7EF] px-4 py-1 text-xs uppercase tracking-[1px] text-[#E75480]">
          {service.category}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      cellClassName:
        "whitespace-nowrap font-medium text-[#E75480]",
      render: (service) =>
        service.price,
    },
    {
      key: "description",
      header: "Description",
      cellClassName: "max-w-sm",
      render: (service) => (
        <p className="line-clamp-2 leading-6">
          {service.description}
        </p>
      ),
    },
    {
      key: "actions",
      header: "Actions",
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
            Services
          </h1>

          <p className="mt-2 text-[#8A6F78]">
            Create, edit, delete, and manage website services.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-full bg-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-white transition hover:bg-[#d94873]"
        >
          Add Service
        </button>
      </div>

      {/* TABLE */}

      <CustomTable
        className="mt-10"
        columns={columns}
        rows={services}
        rowKey={(service, index) =>
          service._id ?? String(index)
        }
        loading={loading}
        loadingMessage="Loading services..."
        emptyIcon="✦"
        emptyTitle="No services yet"
        emptyMessage="Add your first service using the button above."
        minWidth="1000px"
        mobileTitle={(service) => (
          <span className="flex items-center gap-3">
            {thumbnail(service)}

            <span>{service.title}</span>
          </span>
        )}
        mobileSubtitle={(service) =>
          service.category
        }
        mobileFooter={renderActions}
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
            ? "Edit Service"
            : "Add New Service"
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
            ? "Update Service"
            : "Add Service"
        }
        confirmDisabled={uploading}
        // A half filled form should not
        // vanish on a stray click.
        closeOnBackdrop={false}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <input
            required
            placeholder="Service Title"
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
            required
            placeholder="Price e.g. From Rs. 800"
            value={form.price}
            onChange={(event) =>
              setForm({
                ...form,
                price:
                  event.target.value,
              })
            }
            className={inputClass}
          />

          <select
            value={form.category}
            onChange={(event) =>
              setForm({
                ...form,
                category:
                  event.target.value,
              })
            }
            className={inputClass}
          >
            {categories.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}
          </select>

          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={(event) => {
              const file =
                event.target.files?.[0];

              if (!file) {
                return;
              }

              handleImageUpload(file);
            }}
            className={inputClass}
          />

          {form.category ===
            "Other" && (
            <input
              required
              placeholder="Enter custom category"
              value={customCategory}
              onChange={(event) =>
                setCustomCategory(
                  event.target.value
                )
              }
              className={`${inputClass} md:col-span-2`}
            />
          )}

          <textarea
            required
            placeholder="Service Description"
            value={form.description}
            onChange={(event) =>
              setForm({
                ...form,
                description:
                  event.target.value,
              })
            }
            rows={4}
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
              src={form.image}
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
        open={Boolean(serviceToDelete)}
        onClose={() =>
          setServiceToDelete(null)
        }
        eyebrow="Confirm"
        title="Delete service?"
        description={
          serviceToDelete
            ? `"${serviceToDelete.title}" will be removed from the website. This cannot be undone.`
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
          Customers will no longer see this
          service on the booking form.
        </p>
      </DialogBox>
    </div>
  );
}

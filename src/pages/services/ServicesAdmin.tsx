import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../components/CustomTable";

import DialogBox from "../../components/DialogBox";

import RowActionsMenu from "../../components/RowActionsMenu";

import { getApiErrorMessage } from "../../services/base/api";

import { uploadImage } from "../../services/upload/uploadService";

import {
  createService,
  deleteService,
  getServices,
  updateService,
} from "../../services/service/serviceService";

import { getServiceCategories } from "../../services/serviceCategory/serviceCategoryService";

import type {
  Service,
  ServicePayload,
} from "../../services/service/service.types";

import type { ServiceCategory } from "../../services/serviceCategory/serviceCategory.types";

import FormField from "../../components/FormField";

// ========================================
// FORM DEFAULTS
//
// Categories live in their own collection
// now, so the form holds a category id and
// the list of options comes from the API.
// ========================================

const emptyForm: ServicePayload = {
  icon: "✦",
  title: "",
  description: "",
  price: "",
  category: "",
  image: "",
};

// Categories are managed on their own
// page; this one only reads them.
const CATEGORIES_PATH =
  "/service-categories";

// How long typing settles before the
// search request goes out.
const SEARCH_DELAY_MS = 350;

// ========================================
// SHARED INPUT STYLE
// ========================================

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none focus:border-[#E75480]";

export default function ServicesAdmin() {
  const navigate = useNavigate();

  // "View services" on the categories page
  // links here with ?category=<id>.
  const [searchParams] =
    useSearchParams();

  const [services, setServices] =
    useState<Service[]>([]);

  const [categories, setCategories] =
    useState<ServiceCategory[]>([]);

  // Only the first load blanks the table.
  // Later loads (a search, a filter) swap
  // the rows in place.
  const [loading, setLoading] =
    useState(true);

  // ---- Search + filter ----
  //
  // `search` follows the keyboard;
  // `appliedSearch` is what was actually
  // sent, so the server is not hit on every
  // keystroke.

  const [search, setSearch] =
    useState("");

  const [appliedSearch, setAppliedSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState(
      () =>
        searchParams.get("category") ??
        ""
    );

  // ---- Add / edit dialog ----

  const [formOpen, setFormOpen] =
    useState(false);

  const [form, setForm] =
    useState<ServicePayload>(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  // ---- Delete dialog ----

  const [serviceToDelete, setServiceToDelete] =
    useState<Service | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  // Counts the service requests, so a slow
  // one cannot overwrite a fresher list.
  const latestRequest = useRef(0);

  // ============================
  // FETCH CATEGORIES
  //
  // Read only here: the dropdowns need the
  // names, and the Service Categories page
  // owns adding and editing them.
  // ============================

  const fetchCategories = async () => {
    try {
      const data =
        await getServiceCategories();

      setCategories(data);

      return data;
    } catch (error) {
      console.error(
        "Fetch categories error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load categories"
        )
      );

      return [];
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ============================
  // FETCH SERVICES
  //
  // Filtering happens on the server, so the
  // search box matches every service, not
  // only the ones already on screen.
  // ============================

  const fetchServices = async () => {
    // Typing fires one request per pause,
    // so an older answer must not land on
    // top of a newer one.
    const requestId = ++latestRequest.current;

    try {
      const data = await getServices({
        search: appliedSearch,
        category: categoryFilter,
      });

      if (
        requestId !==
        latestRequest.current
      ) {
        return;
      }

      setServices(data);
    } catch (error) {
      console.error(
        "Fetch services error:",
        error
      );

      if (
        requestId !==
        latestRequest.current
      ) {
        return;
      }

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load services"
        )
      );

      setServices([]);
    } finally {
      if (
        requestId ===
        latestRequest.current
      ) {
        setLoading(false);
      }
    }
  };

  // ---- Debounce the search box ----

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearch(search.trim());
    }, SEARCH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchServices();
  }, [appliedSearch, categoryFilter]);

  // ============================
  // OPEN THE FORM
  //
  // Add and edit share one dialog; the
  // only difference is whether the form
  // starts empty or filled.
  // ============================

  const openAddForm = () => {
    // A service must belong to a category,
    // so there is nothing to fill in yet.
    if (categories.length === 0) {
      toast.info(
        "Add a service category first."
      );

      navigate(CATEGORIES_PATH);

      return;
    }

    setForm({
      ...emptyForm,
      category:
        categories[0]?._id ?? "",
    });

    setEditingId(null);
    setFormOpen(true);
  };

  const openEditForm = (
    service: Service
  ) => {
    setForm({
      icon: service.icon || "✦",
      title: service.title || "",
      description:
        service.description || "",
      price: service.price || "",
      // Blank when the category was removed
      // underneath this service, so the
      // admin has to pick a live one.
      category:
        service.category?._id ?? "",
      image: service.image || "",
    });

    setEditingId(service._id || null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(emptyForm);
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
  // Title, price, category and description
  // are marked required, so the browser
  // blocks the submit before this runs.
  // Only the rules HTML cannot express are
  // checked here.
  // ============================

  const handleSubmit = async () => {
    if (!form.category) {
      toast.error(
        "Please choose a category."
      );

      return;
    }

    if (!form.image) {
      toast.error(
        "Please upload an image."
      );

      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await updateService(
          editingId,
          form
        );

        toast.success(
          "Service updated successfully!"
        );
      } else {
        await createService(form);

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
    <RowActionsMenu
      label={`Actions for ${service.title}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: "✎",
          onSelect: () =>
            openEditForm(service),
        },
        {
          key: "delete",
          label: "Delete",
          icon: "🗑",
          tone: "danger",
          dividerBefore: true,
          onSelect: () =>
            setServiceToDelete(
              service
            ),
        },
      ]}
    />
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
      render: (service) =>
        service.category ? (
          <span className="inline-block rounded-full bg-[#FCE7EF] px-4 py-1 text-xs uppercase tracking-[1px] text-[#E75480]">
            {service.category.name}
          </span>
        ) : (
          <span className="text-xs uppercase tracking-[1px] text-[#B59AA3]">
            No category
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
      align: "right",
      width: "90px",
      hideOnMobile: true,
      render: renderActions,
    },
  ];

  // ============================
  // UI
  // ============================

  const filtersActive = Boolean(
    appliedSearch || categoryFilter
  );

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

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(CATEGORIES_PATH)
            }
            className="rounded-full border border-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-[#E75480] transition hover:bg-[#FFF5F8]"
          >
            Service Categories
            {categories.length > 0 && (
              <span className="ml-2 rounded-full bg-[#FCE7EF] px-2 py-0.5 text-[10px]">
                {categories.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={openAddForm}
            className="rounded-full bg-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-white transition hover:bg-[#d94873]"
          >
            Add Service
          </button>
        </div>
      </div>

      {/* SEARCH + CATEGORY FILTER */}

      <div className="mt-8 flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-[#8A6F78]">
          {services.length} service
          {services.length === 1
            ? ""
            : "s"}{" "}
          {filtersActive
            ? "found"
            : "in total"}
        </p>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search by service name or category..."
            className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none focus:border-[#E75480] lg:w-80"
          />

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm text-[#3A2A2F] outline-none focus:border-[#E75480]"
          >
            <option value="">
              All Categories
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category._id}
                  value={
                    category._id ?? ""
                  }
                >
                  {category.name}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* TABLE */}

      <CustomTable
        className="mt-6"
        columns={columns}
        rows={services}
        rowKey={(service, index) =>
          service._id ?? String(index)
        }
        loading={loading}
        loadingMessage="Loading services..."
        emptyIcon="✦"
        emptyTitle={
          filtersActive
            ? "No matching services"
            : "No services yet"
        }
        emptyMessage={
          filtersActive
            ? "Try a different name, or pick another category."
            : "Add your first service using the button above."
        }
        minWidth="1000px"
        mobileTitle={(service) => (
          <span className="flex items-center gap-3">
            {thumbnail(service)}

            <span>{service.title}</span>
          </span>
        )}
        mobileSubtitle={(service) =>
          service.category?.name ??
          "No category"
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
          <FormField
            label="Service Title"
            required
          >
            <input
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

          <FormField
            label="Price"
            required
          >
            <input
              required
              placeholder="e.g. From Rs. 800"
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
          </FormField>

          <FormField
            label="Category"
            required
          >
            <select
              required
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
              <option value="">
                Select a category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category._id}
                    value={
                      category._id ?? ""
                    }
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </FormField>

          <FormField
            label="Service Image"
            required
          >
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
          </FormField>

          <FormField
            label="Description"
            required
            className="md:col-span-2"
          >
            <textarea
              required
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description:
                    event.target.value,
                })
              }
              rows={4}
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

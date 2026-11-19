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

import {
  useAdminSession,
  usePermissions,
} from "../../hooks/useAuth";

import { sessionBranches } from "../../services/auth/auth.types";

import { getApiErrorMessage } from "../../services/base/api";

import { getBranches } from "../../services/branch/branchService";

import type { Branch } from "../../services/branch/branch.types";

import { uploadImage } from "../../services/upload/uploadService";

import {
  createService,
  deleteService,
  getServices,
  setServiceAvailability,
  setServiceBranchAvailability,
  updateService,
} from "../../services/service/serviceService";

import { getServiceCategories } from "../../services/serviceCategory/serviceCategoryService";

import type {
  Service,
  ServicePayload,
} from "../../services/service/service.types";

import type { ServiceCategory } from "../../services/serviceCategory/serviceCategory.types";

import FormField from "../../components/FormField";

/* =========================================================
   FORM DEFAULTS
========================================================= */

const emptyForm: ServicePayload = {
  icon: "✦",
  title: "",
  description: "",
  price: "",
  category: "",
  image: "",
  available: true,
};

/* =========================================================
   HELPERS
========================================================= */

// Services saved before availability existed
// count as available.
const isAvailable = (
  service: Service
) =>
  service.available !== false;

// Service is available at a branch unless
// that branch exists in unavailableBranches.
const isOnAtBranch = (
  service: Service,
  branchId: string
) =>
  !service.unavailableBranches?.includes(
    branchId
  );

// Categories are managed separately.
const CATEGORIES_PATH =
  "/service-categories";

// Search debounce.
const SEARCH_DELAY_MS = 350;

/* =========================================================
   SLUG PREVIEW

   This only creates the visual preview shown
   in admin.

   The backend remains responsible for the
   actual unique slug saved in MongoDB.
========================================================= */

const createSlugPreview = (
  value: string
) => {
  const slug = value
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /&/g,
      " and "
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
    .replace(
      /-+/g,
      "-"
    );

  return slug || "service";
};

/* =========================================================
   SHARED INPUT STYLE
========================================================= */

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-soft px-4 py-3 text-sm outline-none focus:border-[#E75480]";

/* =========================================================
   COMPONENT
========================================================= */

export default function ServicesAdmin() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const allowed =
    usePermissions(
      "services"
    );

  const canSeeCategories =
    usePermissions(
      "serviceCategories"
    ).view;

  const canSwitchBranches =
    usePermissions(
      "serviceAvailability"
    ).update;

  /* =======================================================
     SESSION / BRANCH
  ======================================================= */

  // Empty for an account that sees every
  // branch.
  const ownBranchIds =
    sessionBranches(
      useAdminSession(),
    ).map(
      (branch) =>
        branch._id,
    );

  const [
    branches,
    setBranches,
  ] =
    useState<Branch[]>(
      []
    );

  const shownBranches =
    ownBranchIds.length > 0
      ? branches.filter(
          (
            branch
          ) =>
            ownBranchIds.includes(
              branch._id,
            )
        )
      : branches;

  /* =======================================================
     SERVICES / CATEGORIES
  ======================================================= */

  const [
    services,
    setServices,
  ] =
    useState<Service[]>(
      []
    );

  const [
    categories,
    setCategories,
  ] =
    useState<
      ServiceCategory[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  /* =======================================================
     SEARCH / FILTER
  ======================================================= */

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    appliedSearch,
    setAppliedSearch,
  ] =
    useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] =
    useState(
      () =>
        searchParams.get(
          "category"
        ) ?? ""
    );

  /* =======================================================
     ADD / EDIT FORM
  ======================================================= */

  const [
    formOpen,
    setFormOpen,
  ] =
    useState(false);

  const [
    form,
    setForm,
  ] =
    useState<ServicePayload>(
      emptyForm
    );

  const [
    editingId,
    setEditingId,
  ] =
    useState<
      string | null
    >(null);

  /*
   * Stores the actual slug returned
   * from the backend while editing.
   *
   * When adding a new service, this
   * remains blank and we show the
   * title-generated preview instead.
   */
  const [
    editingSlug,
    setEditingSlug,
  ] =
    useState("");

  /*
   * Branch IDs where this service
   * should be turned off.
   */
  const [
    formOffBranches,
    setFormOffBranches,
  ] =
    useState<string[]>(
      []
    );

  const [
    uploading,
    setUploading,
  ] =
    useState(false);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  /* =======================================================
     DELETE
  ======================================================= */

  const [
    serviceToDelete,
    setServiceToDelete,
  ] =
    useState<
      Service | null
    >(null);

  const [
    deleting,
    setDeleting,
  ] =
    useState(false);

  /*
   * Prevent slow older requests from
   * overwriting newer search results.
   */
  const latestRequest =
    useRef(0);

  /* =======================================================
     FETCH CATEGORIES
  ======================================================= */

  const fetchCategories =
    async () => {
      try {
        const data =
          await getServiceCategories();

        setCategories(
          data
        );

        return data;
      } catch (
        error
      ) {
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

  /* =======================================================
     INITIAL DATA
  ======================================================= */

  useEffect(() => {
    fetchCategories();

    getBranches()
      .then(
        setBranches
      )
      .catch(
        (
          error
        ) => {
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
        }
      );
  }, []);

  /* =======================================================
     FETCH SERVICES
  ======================================================= */

  const fetchServices =
    async () => {
      const requestId =
        ++latestRequest.current;

      try {
        const data =
          await getServices({
            search:
              appliedSearch,

            category:
              categoryFilter,
          });

        if (
          requestId !==
          latestRequest.current
        ) {
          return;
        }

        setServices(
          data
        );
      } catch (
        error
      ) {
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

        setServices(
          []
        );
      } finally {
        if (
          requestId ===
          latestRequest.current
        ) {
          setLoading(
            false
          );
        }
      }
    };

  /* =======================================================
     SEARCH DEBOUNCE
  ======================================================= */

  useEffect(() => {
    const timer =
      setTimeout(
        () => {
          setAppliedSearch(
            search.trim()
          );
        },
        SEARCH_DELAY_MS
      );

    return () =>
      clearTimeout(
        timer
      );
  }, [search]);

  useEffect(() => {
    fetchServices();
  }, [
    appliedSearch,
    categoryFilter,
  ]);

  /* =======================================================
     OPEN ADD FORM
  ======================================================= */

  const openAddForm =
    () => {
      if (
        categories.length ===
        0
      ) {
        toast.info(
          "Add a service category first."
        );

        navigate(
          CATEGORIES_PATH
        );

        return;
      }

      setForm({
        ...emptyForm,

        category:
          categories[0]
            ?._id ?? "",
      });

      setFormOffBranches(
        []
      );

      setEditingId(
        null
      );

      setEditingSlug(
        ""
      );

      setFormOpen(
        true
      );
    };

  /* =======================================================
     OPEN EDIT FORM
  ======================================================= */

  const openEditForm = (
    service: Service
  ) => {
    setForm({
      icon:
        service.icon ||
        "✦",

      title:
        service.title ||
        "",

      description:
        service.description ||
        "",

      price:
        service.price ||
        "",

      category:
        service.category?._id ??
        "",

      image:
        service.image ||
        "",

      available:
        isAvailable(
          service
        ),
    });

    setFormOffBranches(
      service
        .unavailableBranches ??
        []
    );

    setEditingId(
      service._id ||
        null
    );

    setEditingSlug(
      service.slug ||
        ""
    );

    setFormOpen(
      true
    );
  };

  /* =======================================================
     CLOSE FORM
  ======================================================= */

  const closeForm =
    () => {
      setFormOpen(
        false
      );

      setForm(
        emptyForm
      );

      setEditingId(
        null
      );

      setEditingSlug(
        ""
      );

      setFormOffBranches(
        []
      );
    };

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  const handleImageUpload =
    async (
      file: File
    ) => {
      try {
        setUploading(
          true
        );

        const imageUrl =
          await uploadImage(
            file
          );

        setForm(
          (
            previous
          ) => ({
            ...previous,

            image:
              imageUrl,
          })
        );

        toast.success(
          "Image uploaded successfully!"
        );
      } catch (
        error
      ) {
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
        setUploading(
          false
        );
      }
    };

  /* =======================================================
     BRANCH SWITCHES
  ======================================================= */

  const saveBranchSwitches =
    async (
      saved: Service
    ) => {
      if (
        !canSwitchBranches ||
        !saved._id
      ) {
        return;
      }

      for (
        const branch
        of shownBranches
      ) {
        const wantOff =
          formOffBranches.includes(
            branch._id
          );

        const isOff =
          !isOnAtBranch(
            saved,
            branch._id
          );

        if (
          wantOff !==
          isOff
        ) {
          await setServiceBranchAvailability(
            saved._id,
            branch._id,
            !wantOff
          );
        }
      }
    };

  const toggleFormBranch =
    (
      branchId: string
    ) => {
      setFormOffBranches(
        (
          previous
        ) =>
          previous.includes(
            branchId
          )
            ? previous.filter(
                (
                  id
                ) =>
                  id !==
                  branchId
              )
            : [
                ...previous,
                branchId,
              ]
      );
    };

  /* =======================================================
     SAVE SERVICE
  ======================================================= */

  const handleSubmit =
    async () => {
      if (
        !form.category
      ) {
        toast.error(
          "Please choose a category."
        );

        return;
      }

      if (
        !form.image
      ) {
        toast.error(
          "Please upload an image."
        );

        return;
      }

      try {
        setSaving(
          true
        );

        /*
         * Important:
         *
         * `form` does NOT contain slug.
         *
         * The backend creates or updates
         * the slug automatically.
         */
        const saved =
          editingId
            ? await updateService(
                editingId,
                form
              )
            : await createService(
                form
              );

        await saveBranchSwitches(
          saved
        );

        toast.success(
          editingId
            ? "Service updated successfully!"
            : "Service added successfully!"
        );

        await fetchServices();

        closeForm();
      } catch (
        error
      ) {
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
        setSaving(
          false
        );
      }
    };

  /* =======================================================
     DELETE
  ======================================================= */

  const confirmDelete =
    async () => {
      const id =
        serviceToDelete
          ?._id;

      if (!id) {
        return;
      }

      try {
        setDeleting(
          true
        );

        await deleteService(
          id
        );

        setServices(
          (
            previous
          ) =>
            previous.filter(
              (
                service
              ) =>
                service._id !==
                id
            )
        );

        toast.success(
          "Service deleted successfully!"
        );

        setServiceToDelete(
          null
        );
      } catch (
        error
      ) {
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
      } finally {
        setDeleting(
          false
        );
      }
    };

  /* =======================================================
     GLOBAL AVAILABILITY
  ======================================================= */

  const toggleAvailability =
    async (
      service: Service
    ) => {
      if (
        !service._id
      ) {
        return;
      }

      const next =
        !isAvailable(
          service
        );

      try {
        const updated =
          await setServiceAvailability(
            service._id,
            next
          );

        setServices(
          (
            previous
          ) =>
            previous.map(
              (
                one
              ) =>
                one._id ===
                updated._id
                  ? updated
                  : one
            )
        );

        toast.success(
          next
            ? `"${service.title}" can be booked again.`
            : `"${service.title}" is now shown as not available.`
        );
      } catch (
        error
      ) {
        console.error(
          "Availability error:",
          error
        );

        toast.error(
          getApiErrorMessage(
            error,
            "Unable to change availability"
          )
        );
      }
    };

  /* =======================================================
     BRANCH AVAILABILITY
  ======================================================= */

  const toggleBranch =
    async (
      service: Service,
      branch: Branch
    ) => {
      if (
        !service._id
      ) {
        return;
      }

      const next =
        !isOnAtBranch(
          service,
          branch._id
        );

      try {
        const updated =
          await setServiceBranchAvailability(
            service._id,
            branch._id,
            next
          );

        setServices(
          (
            previous
          ) =>
            previous.map(
              (
                one
              ) =>
                one._id ===
                updated._id
                  ? updated
                  : one
            )
        );

        toast.success(
          next
            ? `"${service.title}" can be booked at ${branch.name} again.`
            : `"${service.title}" is no longer bookable at ${branch.name}.`
        );
      } catch (
        error
      ) {
        console.error(
          "Branch availability error:",
          error
        );

        toast.error(
          getApiErrorMessage(
            error,
            "Unable to change availability"
          )
        );
      }
    };

  /* =======================================================
     BRANCH CHIPS
  ======================================================= */

  const branchChips = (
    service: Service
  ) => (
    <div
      className="
        flex
        flex-wrap
        gap-2
      "
    >
      {shownBranches.map(
        (
          branch
        ) => {
          const on =
            isOnAtBranch(
              service,
              branch._id
            );

          return (
            <button
              key={
                branch._id
              }
              type="button"
              disabled={
                !canSwitchBranches
              }
              onClick={() =>
                toggleBranch(
                  service,
                  branch
                )
              }
              title={
                canSwitchBranches
                  ? `Click to ${
                      on
                        ? "stop"
                        : "allow"
                    } bookings at ${branch.name}`
                  : undefined
              }
              className={`
                rounded-xl
                px-3
                py-1
                text-left
                text-xs
                font-medium
                transition
                disabled:cursor-default

                ${
                  on
                    ? "bg-green-100 text-green-700 enabled:hover:bg-green-200"
                    : "bg-gray-200 text-gray-600 enabled:hover:bg-gray-300"
                }
              `}
            >
              <span
                className={`
                  block
                  whitespace-nowrap

                  ${
                    on
                      ? ""
                      : "line-through"
                  }
                `}
              >
                {on
                  ? "✓"
                  : "✕"}{" "}
                {
                  branch.name
                }
              </span>

              {branch.address && (
                <span
                  className="
                    block
                    text-[10px]
                    font-normal
                    opacity-75
                  "
                >
                  {
                    branch.address
                  }
                </span>
              )}
            </button>
          );
        }
      )}
    </div>
  );

  /* =======================================================
     AVAILABILITY BADGE
  ======================================================= */

  const availabilityBadge =
    (
      service: Service
    ) =>
      isAvailable(
        service
      ) ? (
        <span
          className="
            inline-block
            whitespace-nowrap
            rounded-full
            bg-green-100
            px-3
            py-1
            text-xs
            font-medium
            text-green-700
          "
        >
          Available
        </span>
      ) : (
        <span
          className="
            inline-block
            whitespace-nowrap
            rounded-full
            bg-gray-200
            px-3
            py-1
            text-xs
            font-medium
            text-gray-600
          "
        >
          Not available
        </span>
      );

  /* =======================================================
     THUMBNAIL
  ======================================================= */

  const thumbnail = (
    service: Service
  ) =>
    service.image ? (
      <img
        src={
          service.image
        }
        alt={
          service.title
        }
        className="
          h-14
          w-14
          rounded-xl
          object-cover
        "
      />
    ) : (
      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-xl
          bg-soft
          text-lg
          text-[#E75480]
        "
      >
        {service.icon ||
          "✦"}
      </div>
    );

  /* =======================================================
     ACTIONS
  ======================================================= */

  const renderActions =
    (
      service: Service
    ) => (
      <RowActionsMenu
        label={`Actions for ${service.title}`}
        actions={[
          ...(allowed.update
            ? [
                {
                  key:
                    "edit",

                  label:
                    "Edit",

                  icon:
                    "✎",

                  onSelect:
                    () =>
                      openEditForm(
                        service
                      ),
                },

                {
                  key:
                    "availability",

                  label:
                    isAvailable(
                      service
                    )
                      ? "Mark not available everywhere"
                      : "Mark available",

                  icon:
                    isAvailable(
                      service
                    )
                      ? "⏸"
                      : "▶",

                  onSelect:
                    () =>
                      toggleAvailability(
                        service
                      ),
                },
              ]
            : []),

          ...(allowed.delete
            ? [
                {
                  key:
                    "delete",

                  label:
                    "Delete",

                  icon:
                    "🗑",

                  tone:
                    "danger" as const,

                  dividerBefore:
                    allowed.update,

                  onSelect:
                    () =>
                      setServiceToDelete(
                        service
                      ),
                },
              ]
            : []),
        ]}
      />
    );

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns:
    TableColumn<Service>[] =
    [
      {
        key: "image",

        header:
          "Image",

        width:
          "90px",

        hideOnMobile:
          true,

        render:
          thumbnail,
      },

      {
        key: "title",

        header:
          "Title",

        hideOnMobile:
          true,

        cellClassName:
          "font-medium text-ink",

        render: (
          service
        ) =>
          service.title,
      },

      /*
       * New slug / URL column.
       */
      {
        key: "slug",

        header:
          "Page URL",

        hideOnMobile:
          true,

        width:
          "230px",

        cellClassName:
          "max-w-[230px]",

        render: (
          service
        ) => (
          <span
            title={
              service.slug
                ? `/services/${service.slug}`
                : "No slug"
            }
            className="
              block
              max-w-[220px]
              truncate
              rounded-lg
              bg-soft
              px-3
              py-1.5
              font-mono
              text-[11px]
              text-muted
            "
          >
            {service.slug
              ? `/services/${service.slug}`
              : "—"}
          </span>
        ),
      },

      {
        key:
          "category",

        header:
          "Category",

        hideOnMobile:
          true,

        render: (
          service
        ) =>
          service.category ? (
            <span
              className="
                inline-block
                rounded-full
                bg-blush
                px-4
                py-1
                text-xs
                uppercase
                tracking-[1px]
                text-[#E75480]
              "
            >
              {
                service
                  .category
                  .name
              }
            </span>
          ) : (
            <span
              className="
                text-xs
                uppercase
                tracking-[1px]
                text-faint
              "
            >
              No category
            </span>
          ),
      },

      {
        key:
          "price",

        header:
          "Price",

        cellClassName:
          "whitespace-nowrap font-medium text-[#E75480]",

        render: (
          service
        ) =>
          service.price,
      },

      {
        key:
          "booking",

        header:
          "Booking",

        render:
          availabilityBadge,
      },

      {
        key:
          "branches",

        header:
          ownBranchIds.length === 1
            ? "Your Branch"
            : ownBranchIds.length > 1
              ? "Your Branches"
              : "Branches",

        render:
          branchChips,
      },

      {
        key:
          "description",

        header:
          "Description",

        cellClassName:
          "max-w-sm",

        render: (
          service
        ) => (
          <p
            className="
              line-clamp-2
              leading-6
            "
          >
            {
              service.description
            }
          </p>
        ),
      },

      {
        key:
          "actions",

        header:
          "Actions",

        align:
          "right",

        width:
          "90px",

        hideOnMobile:
          true,

        render:
          renderActions,
      },
    ];

  /* =======================================================
     FILTER STATE
  ======================================================= */

  const filtersActive =
    Boolean(
      appliedSearch ||
      categoryFilter
    );

  /* =======================================================
     SLUG / URL PREVIEW
  ======================================================= */

  /*
   * When editing:
   * use the actual saved slug from MongoDB.
   *
   * When creating:
   * show a preview generated from the title.
   */
  const serviceSlugPreview =
    editingSlug ||
    createSlugPreview(
      form.title
    );

  const servicePathPreview =
    `/services/${serviceSlugPreview}`;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div>
      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        className="
          flex
          flex-wrap
          items-start
          justify-between
          gap-4
        "
      >
        <div>
          <p
            className="
              text-xs
              uppercase
              tracking-[3px]
              text-[#E75480]
            "
          >
            Management
          </p>

          <h1
            className="
              mt-2
              font-serif
              text-4xl
              text-[#E75480]

              md:text-5xl
            "
          >
            Services
          </h1>

          <p
            className="
              mt-2
              text-muted
            "
          >
            {allowed.update
              ? "Create, edit, delete, and manage website services."
              : "Click a branch to switch a service on or off there."}
          </p>
        </div>

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-3
          "
        >
          {canSeeCategories && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  CATEGORIES_PATH
                )
              }
              className="
                rounded-full
                border
                border-[#E75480]
                px-8
                py-3
                text-xs
                uppercase
                tracking-[2px]
                text-[#E75480]
                transition

                hover:bg-soft
              "
            >
              Service Categories

              {categories.length >
                0 && (
                <span
                  className="
                    ml-2
                    rounded-full
                    bg-blush
                    px-2
                    py-0.5
                    text-[10px]
                  "
                >
                  {
                    categories.length
                  }
                </span>
              )}
            </button>
          )}

          {allowed.create && (
            <button
              type="button"
              onClick={
                openAddForm
              }
              className="
                rounded-full
                bg-[#E75480]
                px-8
                py-3
                text-xs
                uppercase
                tracking-[2px]
                text-white
                transition

                hover:bg-[#d94873]
              "
            >
              Add Service
            </button>
          )}
        </div>
      </div>

      {/* ===================================================
          SEARCH + CATEGORY FILTER
      =================================================== */}

      <div
        className="
          mt-8
          flex
          flex-col
          gap-3
          rounded-3xl
          bg-surface
          p-5
          shadow-sm

          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <p
          className="
            text-sm
            text-muted
          "
        >
          {services.length}{" "}
          service
          {services.length ===
          1
            ? ""
            : "s"}{" "}
          {filtersActive
            ? "found"
            : "in total"}
        </p>

        <div
          className="
            flex
            w-full
            flex-col
            gap-3

            sm:flex-row

            lg:w-auto
          "
        >
          <input
            type="search"
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target
                  .value
              )
            }
            placeholder="Search by service name or category..."
            className="
              w-full
              rounded-xl
              border
              border-[#E75480]/20
              bg-soft
              px-4
              py-3
              text-sm
              outline-none

              focus:border-[#E75480]

              lg:w-80
            "
          />

          <select
            value={
              categoryFilter
            }
            onChange={(
              event
            ) =>
              setCategoryFilter(
                event.target
                  .value
              )
            }
            className="
              rounded-xl
              border
              border-[#E75480]/20
              bg-soft
              px-4
              py-3
              text-sm
              text-ink
              outline-none

              focus:border-[#E75480]
            "
          >
            <option value="">
              All Categories
            </option>

            {categories.map(
              (
                category
              ) => (
                <option
                  key={
                    category._id
                  }
                  value={
                    category._id ??
                    ""
                  }
                >
                  {
                    category.name
                  }
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* ===================================================
          TABLE
      =================================================== */}

      <CustomTable
        className="mt-6"
        columns={
          columns
        }
        rows={
          services
        }
        rowKey={(
          service,
          index
        ) =>
          service._id ??
          String(
            index
          )
        }
        loading={
          loading
        }
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
        minWidth="1400px"
        mobileTitle={(
          service
        ) => (
          <span
            className="
              flex
              items-center
              gap-3
            "
          >
            {thumbnail(
              service
            )}

            <span>
              {
                service.title
              }
            </span>
          </span>
        )}
        mobileSubtitle={(
          service
        ) =>
          service.category
            ?.name ??
          "No category"
        }
        mobileActions={
          renderActions
        }
      />

      {/* ===================================================
          ADD / EDIT DIALOG
      =================================================== */}

      <DialogBox
        open={
          formOpen
        }
        onClose={
          closeForm
        }
        eyebrow="Management"
        title={
          editingId
            ? "Edit Service"
            : "Add New Service"
        }
        size="lg"
        onSubmit={
          handleSubmit
        }
        submitting={
          saving
        }
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
        confirmDisabled={
          uploading
        }
        closeOnBackdrop={
          false
        }
      >
        <div
          className="
            grid
            gap-4

            md:grid-cols-2
          "
        >
          {/* SERVICE TITLE */}

          <FormField
            label="Service Title"
            required
          >
            <input
              required
              value={
                form.title
              }
              onChange={(
                event
              ) =>
                setForm({
                  ...form,

                  title:
                    event
                      .target
                      .value,
                })
              }
              className={
                inputClass
              }
            />
          </FormField>

          {/* PAGE URL */}

          <FormField
            label="Page URL"
          >
            <div
              className="
                flex
                min-h-[46px]
                w-full
                items-center
                rounded-xl
                border
                border-[#E75480]/15
                bg-soft
                px-4
                py-3
              "
            >
              <span
                className="
                  break-all
                  font-mono
                  text-xs
                  text-muted

                  sm:text-sm
                "
              >
                {form.title.trim()
                  ? servicePathPreview
                  : "/services/service"}
              </span>
            </div>

            <p
              className="
                mt-1.5
                text-[11px]
                leading-5
                text-muted
              "
            >
              {editingId
                ? "This is the service's current URL. The backend manages the slug automatically."
                : "Preview only. The backend will generate the final unique URL when the service is saved."}
            </p>
          </FormField>

          {/* PRICE */}

          <FormField
            label="Price"
            required
          >
            <input
              required
              placeholder="e.g. From Rs. 800"
              value={
                form.price
              }
              onChange={(
                event
              ) =>
                setForm({
                  ...form,

                  price:
                    event
                      .target
                      .value,
                })
              }
              className={
                inputClass
              }
            />
          </FormField>

          {/* CATEGORY */}

          <FormField
            label="Category"
            required
          >
            <select
              required
              value={
                form.category
              }
              onChange={(
                event
              ) =>
                setForm({
                  ...form,

                  category:
                    event
                      .target
                      .value,
                })
              }
              className={
                inputClass
              }
            >
              <option value="">
                Select a category
              </option>

              {categories.map(
                (
                  category
                ) => (
                  <option
                    key={
                      category._id
                    }
                    value={
                      category._id ??
                      ""
                    }
                  >
                    {
                      category.name
                    }
                  </option>
                )
              )}
            </select>
          </FormField>

          {/* SERVICE IMAGE */}

          <FormField
            label="Service Image"
            required
          >
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={(
                event
              ) => {
                const file =
                  event.target
                    .files?.[0];

                if (
                  !file
                ) {
                  return;
                }

                void handleImageUpload(
                  file
                );
              }}
              className={
                inputClass
              }
            />
          </FormField>

          {/* DESCRIPTION */}

          <FormField
            label="Description"
            required
            className="md:col-span-2"
          >
            <textarea
              required
              value={
                form.description
              }
              onChange={(
                event
              ) =>
                setForm({
                  ...form,

                  description:
                    event
                      .target
                      .value,
                })
              }
              rows={4}
              className={
                inputClass
              }
            />
          </FormField>

          {/* GLOBAL AVAILABILITY */}

          <label
            className="
              flex
              cursor-pointer
              items-start
              gap-3
              rounded-xl
              border
              border-[#E75480]/20
              bg-soft
              px-4
              py-3

              md:col-span-2
            "
          >
            <input
              type="checkbox"
              checked={
                form.available !==
                false
              }
              onChange={(
                event
              ) =>
                setForm({
                  ...form,

                  available:
                    event
                      .target
                      .checked,
                })
              }
              className="
                mt-1
                h-4
                w-4
                accent-[#E75480]
              "
            />

            <span>
              <span
                className="
                  block
                  text-sm
                  font-medium
                  text-ink
                "
              >
                Available for booking
              </span>

              <span
                className="
                  block
                  text-xs
                  text-muted
                "
              >
                When off, the website shows
                "Currently not available" on
                this service and customers
                cannot book it at any branch.
              </span>
            </span>
          </label>

          {/* BRANCH AVAILABILITY */}

          {canSwitchBranches &&
            shownBranches.length >
              0 && (
              <div
                className="
                  md:col-span-2
                "
              >
                <p
                  className="
                    text-sm
                    font-medium
                    text-ink
                  "
                >
                  Bookable at
                </p>

                <p
                  className="
                    text-xs
                    text-muted
                  "
                >
                  Untick a branch to stop
                  bookings for this service
                  there only.
                </p>

                <div
                  className="
                    mt-2
                    grid
                    gap-2

                    sm:grid-cols-2
                  "
                >
                  {shownBranches.map(
                    (
                      branch
                    ) => (
                      <label
                        key={
                          branch._id
                        }
                        className="
                          flex
                          cursor-pointer
                          items-start
                          gap-3
                          rounded-xl
                          border
                          border-[#E75480]/20
                          bg-soft
                          px-4
                          py-3
                        "
                      >
                        <input
                          type="checkbox"
                          checked={
                            !formOffBranches.includes(
                              branch._id
                            )
                          }
                          onChange={() =>
                            toggleFormBranch(
                              branch._id
                            )
                          }
                          className="
                            mt-1
                            h-4
                            w-4
                            accent-[#E75480]
                          "
                        />

                        <span>
                          <span
                            className="
                              block
                              text-sm
                              font-medium
                              text-ink
                            "
                          >
                            {
                              branch.name
                            }
                          </span>

                          {branch.address && (
                            <span
                              className="
                                block
                                text-xs
                                text-muted
                              "
                            >
                              {
                                branch.address
                              }
                            </span>
                          )}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>
            )}
        </div>

        {/* UPLOADING */}

        {uploading && (
          <p
            className="
              mt-4
              text-sm
              text-muted
            "
          >
            Uploading image...
          </p>
        )}

        {/* IMAGE PREVIEW */}

        {form.image && (
          <div
            className="
              mt-5
            "
          >
            <p
              className="
                mb-2
                text-sm
                text-muted
              "
            >
              Image Preview
            </p>

            <img
              src={
                form.image
              }
              alt="Preview"
              className="
                h-44
                w-full
                rounded-2xl
                object-cover

                md:max-w-md
              "
            />
          </div>
        )}
      </DialogBox>

      {/* ===================================================
          DELETE CONFIRMATION
      =================================================== */}

      <DialogBox
        open={
          Boolean(
            serviceToDelete
          )
        }
        onClose={() =>
          setServiceToDelete(
            null
          )
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
        submitting={
          deleting
        }
        onConfirm={
          confirmDelete
        }
      >
        <p
          className="
            text-sm
            text-muted
          "
        >
          Customers will no longer see this
          service on the booking form.
        </p>
      </DialogBox>
    </div>
  );
}
import {
  useEffect,
  useState,
} from "react";

import {
  toast,
} from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../../components/CustomTable";

import DialogBox from "../../../components/DialogBox";

import RowActionsMenu from "../../../components/RowActionsMenu";

import api from "../../../services/base/api";

import {
  uploadImage as uploadImageToServer,
} from "../../../services/upload/uploadService";

import FormField, {
  FormLabel,
} from "../../../components/FormField";

/* ============================================================
   TYPES
============================================================ */

interface EventType {
  _id: string;

  title: string;

  description: string;

  image: string;

  branchId?: string | null;

  locationType?:
    | "branch"
    | "custom";

  location: string;

  mapUrl?: string;

  date: string;

  time: string;

  buttonText?: string;

  buttonLink?: string;

  featured: boolean;

  active: boolean;
}

interface BranchType {
  _id: string;

  name: string;

  label?: string;

  address: string;

  phone?: string;

  openingHours?: string;

  mapUrl?: string;

  active?: boolean;
}

type EventFormData = {
  title: string;

  description: string;

  image: string;

  branchId: string;

  locationType:
    | "branch"
    | "custom";

  location: string;

  mapUrl: string;

  date: string;

  time: string;

  buttonText: string;

  buttonLink: string;
};

/* ============================================================
   EMPTY FORM
============================================================ */

const emptyForm: EventFormData = {
  title:
    "",

  description:
    "",

  image:
    "",

  branchId:
    "",

  locationType:
    "branch",

  location:
    "",

  mapUrl:
    "",

  date:
    "",

  time:
    "",

  buttonText:
    "Register Now",

  buttonLink:
    "/contact",
};

/* ============================================================
   SHARED INPUT STYLE
============================================================ */

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-soft px-4 py-3 text-sm outline-none transition focus:border-[#E75480] focus:ring-2 focus:ring-[#E75480]/10";

/* ============================================================
   ADMIN EVENTS
============================================================ */

const AdminEvents =
  () => {
    /* ========================================================
       EVENTS
    ======================================================== */

    const [
      events,
      setEvents,
    ] =
      useState<
        EventType[]
      >([]);

    const [
      loading,
      setLoading,
    ] =
      useState(
        true
      );

    const [
      saving,
      setSaving,
    ] =
      useState(
        false
      );

    const [
      processingId,
      setProcessingId,
    ] =
      useState<
        string | null
      >(
        null
      );

    /* ========================================================
       BRANCHES
    ======================================================== */

    const [
      branches,
      setBranches,
    ] =
      useState<
        BranchType[]
      >([]);

    const [
      branchesLoading,
      setBranchesLoading,
    ] =
      useState(
        true
      );

    /* ========================================================
       FORM
    ======================================================== */

    const [
      formOpen,
      setFormOpen,
    ] =
      useState(
        false
      );

    const [
      editingId,
      setEditingId,
    ] =
      useState<
        string | null
      >(
        null
      );

    const [
      formData,
      setFormData,
    ] =
      useState<
        EventFormData
      >(
        emptyForm
      );

    /* ========================================================
       IMAGE UPLOAD
    ======================================================== */

    const [
      uploadingImage,
      setUploadingImage,
    ] =
      useState(
        false
      );

    /* ========================================================
       DELETE
    ======================================================== */

    const [
      eventToDelete,
      setEventToDelete,
    ] =
      useState<
        EventType | null
      >(
        null
      );

    const [
      deleting,
      setDeleting,
    ] =
      useState(
        false
      );

    /* ========================================================
       FETCH EVENTS
    ======================================================== */

    const fetchEvents =
      async () => {
        try {
          setLoading(
            true
          );

          const res =
            await api.get(
              "/api/events/admin/all"
            );

          setEvents(
            Array.isArray(
              res.data
            )
              ? res.data
              : []
          );
        } catch (
          error
        ) {
          console.error(
            "EVENT FETCH ERROR:",
            error
          );

          toast.error(
            "Failed to load events"
          );

          setEvents(
            []
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    /* ========================================================
       FETCH BRANCHES
    ======================================================== */

    const fetchBranches =
      async () => {
        try {
          setBranchesLoading(
            true
          );

          const res =
            await api.get(
              "/api/branches"
            );

          const data =
            Array.isArray(
              res.data
            )
              ? res.data
              : res.data
                    ?.branches ||
                [];

          setBranches(
            data
          );
        } catch (
          error
        ) {
          console.error(
            "BRANCH FETCH ERROR:",
            error
          );

          toast.error(
            "Failed to load branches"
          );

          setBranches(
            []
          );
        } finally {
          setBranchesLoading(
            false
          );
        }
      };

    /* ========================================================
       INITIAL FETCH
    ======================================================== */

    useEffect(
      () => {
        fetchEvents();

        fetchBranches();
      },
      []
    );

    /* ========================================================
       NORMAL FIELD CHANGE
    ======================================================== */

    const handleChange =
      (
        event:
          React.ChangeEvent<
            | HTMLInputElement
            | HTMLTextAreaElement
            | HTMLSelectElement
          >
      ) => {
        const {
          name,
          value,
        } =
          event.target;

        setFormData(
          (
            previous
          ) => ({
            ...previous,

            [name]:
              value,
          })
        );
      };

    /* ========================================================
       BRANCH CHANGE

       Automatically copies:
       - branchId
       - branch address
       - branch map URL
    ======================================================== */

    const handleBranchChange =
      (
        event:
          React.ChangeEvent<HTMLSelectElement>
      ) => {
        const value =
          event.target
            .value;

        /* CUSTOM LOCATION */

        if (
          value ===
          "custom"
        ) {
          setFormData(
            (
              previous
            ) => ({
              ...previous,

              branchId:
                "",

              locationType:
                "custom",

              location:
                "",

              mapUrl:
                "",
            })
          );

          return;
        }

        /* EMPTY */

        if (
          !value
        ) {
          setFormData(
            (
              previous
            ) => ({
              ...previous,

              branchId:
                "",

              locationType:
                "branch",

              location:
                "",

              mapUrl:
                "",
            })
          );

          return;
        }

        /* FIND BRANCH */

        const selectedBranch =
          branches.find(
            (
              branch
            ) =>
              branch._id ===
              value
          );

        if (
          !selectedBranch
        ) {
          return;
        }

        /* COPY BRANCH INFO */

        setFormData(
          (
            previous
          ) => ({
            ...previous,

            branchId:
              selectedBranch._id,

            locationType:
              "branch",

            location:
              selectedBranch.address ||
              "",

            mapUrl:
              selectedBranch.mapUrl ||
              "",
          })
        );
      };

    /* ========================================================
       OPEN ADD FORM
    ======================================================== */

    const openAddForm =
      () => {
        setFormData(
          emptyForm
        );

        setEditingId(
          null
        );

        setFormOpen(
          true
        );
      };

    /* ========================================================
       OPEN EDIT FORM
    ======================================================== */

    const openEditForm =
      (
        item:
          EventType
      ) => {
        const locationType:
          | "branch"
          | "custom" =
          item.locationType ||
          (
            item.branchId
              ? "branch"
              : "custom"
          );

        setFormData({
          title:
            item.title ||
            "",

          description:
            item.description ||
            "",

          image:
            item.image ||
            "",

          branchId:
            item.branchId ||
            "",

          locationType,

          location:
            item.location ||
            "",

          mapUrl:
            item.mapUrl ||
            "",

          date:
            item.date
              ? item.date.split(
                  "T"
                )[0]
              : "",

          time:
            item.time ||
            "",

          buttonText:
            item.buttonText ||
            "Register Now",

          buttonLink:
            item.buttonLink ||
            "/contact",
        });

        setEditingId(
          item._id
        );

        setFormOpen(
          true
        );
      };

    /* ========================================================
       CLOSE FORM
    ======================================================== */

    const closeForm =
      () => {
        if (
          uploadingImage
        ) {
          return;
        }

        setFormOpen(
          false
        );

        setFormData(
          emptyForm
        );

        setEditingId(
          null
        );
      };

    /* ========================================================
       IMAGE UPLOAD

       NO CROPPING.
       Selected file uploads directly.
    ======================================================== */

    const pickImage =
      async (
        event:
          React.ChangeEvent<HTMLInputElement>
      ) => {
        const file =
          event.target
            .files?.[0];

        if (
          !file
        ) {
          return;
        }

        /* IMAGE TYPE */

        if (
          !file.type.startsWith(
            "image/"
          )
        ) {
          toast.error(
            "Please select an image file"
          );

          event.target.value =
            "";

          return;
        }

        /* MAX 5 MB */

        if (
          file.size >
          5 *
            1024 *
            1024
        ) {
          toast.error(
            "Image must be smaller than 5 MB"
          );

          event.target.value =
            "";

          return;
        }

        try {
          setUploadingImage(
            true
          );

          const imageUrl =
            await uploadImageToServer(
              file,
              file.name ||
                "event-image.jpg"
            );

          setFormData(
            (
              previous
            ) => ({
              ...previous,

              image:
                imageUrl,
            })
          );

          toast.success(
            "Event image uploaded successfully"
          );
        } catch (
          error
        ) {
          console.error(
            "IMAGE UPLOAD ERROR:",
            error
          );

          toast.error(
            error instanceof
              Error
              ? error.message
              : "Unable to upload the image"
          );
        } finally {
          setUploadingImage(
            false
          );

          event.target.value =
            "";
        }
      };

    /* ========================================================
       REMOVE IMAGE
    ======================================================== */

    const removeImage =
      () => {
        if (
          uploadingImage
        ) {
          return;
        }

        setFormData(
          (
            previous
          ) => ({
            ...previous,

            image:
              "",
          })
        );
      };

    /* ========================================================
       CREATE / UPDATE
    ======================================================== */

    const handleSubmit =
      async () => {
        if (
          uploadingImage
        ) {
          toast.error(
            "Please wait for the image upload to finish"
          );

          return;
        }

        if (
          !formData.title.trim()
        ) {
          toast.error(
            "Event title is required"
          );

          return;
        }

        if (
          !formData.description.trim()
        ) {
          toast.error(
            "Description is required"
          );

          return;
        }

        if (
          !formData.image
        ) {
          toast.error(
            "Event image is required"
          );

          return;
        }

        if (
          formData.locationType ===
            "branch" &&
          !formData.branchId
        ) {
          toast.error(
            "Please select a branch"
          );

          return;
        }

        if (
          !formData.location.trim()
        ) {
          toast.error(
            "Event location is required"
          );

          return;
        }

        if (
          !formData.date
        ) {
          toast.error(
            "Event date is required"
          );

          return;
        }

        if (
          !formData.time.trim()
        ) {
          toast.error(
            "Event time is required"
          );

          return;
        }

        try {
          setSaving(
            true
          );

          const payload = {
            ...formData,

            branchId:
              formData.locationType ===
              "branch"
                ? formData.branchId
                : null,

            location:
              formData.location.trim(),

            mapUrl:
              formData.mapUrl.trim(),

            buttonText:
              formData.buttonText.trim(),

            buttonLink:
              formData.buttonLink.trim(),
          };

          if (
            editingId
          ) {
            await api.put(
              `/api/events/${editingId}`,
              payload
            );

            toast.success(
              "Event updated successfully!"
            );
          } else {
            await api.post(
              "/api/events",
              payload
            );

            toast.success(
              "Event created successfully!"
            );
          }

          await fetchEvents();

          closeForm();
        } catch (
          error: any
        ) {
          console.error(
            "EVENT SAVE ERROR:",
            error
          );

          const message =
            error?.response
              ?.data
              ?.message ||
            error?.response
              ?.data
              ?.error ||
            "Unable to save the event";

          toast.error(
            message
          );
        } finally {
          setSaving(
            false
          );
        }
      };

    /* ========================================================
       FEATURED
    ======================================================== */

    const toggleFeatured =
      async (
        item:
          EventType
      ) => {
        try {
          setProcessingId(
            item._id
          );

          await api.put(
            `/api/events/${item._id}/featured`
          );

          await fetchEvents();
        } catch (
          error
        ) {
          console.error(
            error
          );

          toast.error(
            "Unable to update the event"
          );
        } finally {
          setProcessingId(
            null
          );
        }
      };

    /* ========================================================
       ACTIVE
    ======================================================== */

    const toggleActive =
      async (
        item:
          EventType
      ) => {
        try {
          setProcessingId(
            item._id
          );

          await api.put(
            `/api/events/${item._id}/active`
          );

          await fetchEvents();
        } catch (
          error
        ) {
          console.error(
            error
          );

          toast.error(
            "Unable to update the event"
          );
        } finally {
          setProcessingId(
            null
          );
        }
      };

    /* ========================================================
       DELETE
    ======================================================== */

    const confirmDelete =
      async () => {
        if (
          !eventToDelete
        ) {
          return;
        }

        const id =
          eventToDelete._id;

        try {
          setDeleting(
            true
          );

          await api.delete(
            `/api/events/${id}`
          );

          setEvents(
            (
              previous
            ) =>
              previous.filter(
                (
                  item
                ) =>
                  item._id !==
                  id
              )
          );

          toast.success(
            "Event deleted successfully!"
          );

          if (
            editingId ===
            id
          ) {
            closeForm();
          }

          setEventToDelete(
            null
          );
        } catch (
          error
        ) {
          console.error(
            error
          );

          toast.error(
            "Unable to delete the event"
          );
        } finally {
          setDeleting(
            false
          );
        }
      };

    /* ========================================================
       HELPERS
    ======================================================== */

    const getBranchName =
      (
        branchId?:
          string | null
      ) => {
        if (
          !branchId
        ) {
          return "";
        }

        const branch =
          branches.find(
            (
              item
            ) =>
              item._id ===
              branchId
          );

        return (
          branch?.name ||
          ""
        );
      };

    /* ========================================================
       THUMBNAIL
    ======================================================== */

    const thumbnail =
      (
        item:
          EventType
      ) =>
        item.image ? (
          <img
            src={
              item.image
            }
            alt={
              item.title
            }
            className="
              h-14
              w-20
              rounded-xl
              object-cover
            "
          />
        ) : (
          <div
            className="
              flex
              h-14
              w-20
              items-center
              justify-center
              rounded-xl
              bg-soft
              text-lg
              text-[#E75480]
            "
          >
            ✦
          </div>
        );

    /* ========================================================
       STATUS BADGE
    ======================================================== */

    const statusBadge =
      (
        item:
          EventType
      ) => (
        <div className="flex flex-wrap gap-2">
          <span
            className={`
              inline-block
              rounded-full
              px-4
              py-1
              text-xs

              ${
                item.active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }
            `}
          >
            {item.active
              ? "Active"
              : "Inactive"}
          </span>

          {item.featured && (
            <span
              className="
                inline-block
                rounded-full
                bg-blush
                px-4
                py-1
                text-xs
                text-[#E75480]
              "
            >
              Featured
            </span>
          )}
        </div>
      );

    /* ========================================================
       ACTIONS
    ======================================================== */

    const renderActions =
      (
        item:
          EventType
      ) => (
        <RowActionsMenu
          label={`Actions for ${item.title}`}
          busy={
            processingId ===
            item._id
          }
          actions={[
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
                    item
                  ),
            },

            {
              key:
                "featured",

              label:
                item.featured
                  ? "Unfeature"
                  : "Make featured",

              icon:
                "★",

              onSelect:
                () =>
                  toggleFeatured(
                    item
                  ),
            },

            {
              key:
                "active",

              label:
                item.active
                  ? "Deactivate"
                  : "Activate",

              icon:
                item.active
                  ? "✕"
                  : "✓",

              tone:
                item.active
                  ? "default"
                  : "success",

              onSelect:
                () =>
                  toggleActive(
                    item
                  ),
            },

            {
              key:
                "delete",

              label:
                "Delete",

              icon:
                "🗑",

              tone:
                "danger",

              dividerBefore:
                true,

              onSelect:
                () =>
                  setEventToDelete(
                    item
                  ),
            },
          ]}
        />
      );

    /* ========================================================
       TABLE COLUMNS
    ======================================================== */

    const columns:
      TableColumn<EventType>[] =
      [
        {
          key:
            "image",

          header:
            "Image",

          width:
            "110px",

          hideOnMobile:
            true,

          render:
            thumbnail,
        },

        {
          key:
            "title",

          header:
            "Title",

          hideOnMobile:
            true,

          cellClassName:
            "font-medium text-ink",

          render:
            (
              item
            ) =>
              item.title,
        },

        {
          key:
            "location",

          header:
            "Location",

          render:
            (
              item
            ) => (
              <div className="max-w-[260px]">
                <p
                  className="
                    font-medium
                    leading-5
                    text-ink
                  "
                >
                  {
                    item.location
                  }
                </p>

                <div
                  className="
                    mt-1.5
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  "
                >
                  {item.locationType ===
                    "branch" && (
                    <span
                      className="
                        rounded-full
                        bg-[#FFF0F5]
                        px-2.5
                        py-1
                        text-[10px]
                        font-medium
                        text-[#E75480]
                      "
                    >
                      {getBranchName(
                        item.branchId
                      ) ||
                        "Nirjara Branch"}
                    </span>
                  )}

                  {(item.locationType ===
                    "custom" ||
                    !item.locationType) && (
                    <span
                      className="
                        rounded-full
                        bg-gray-100
                        px-2.5
                        py-1
                        text-[10px]
                        text-gray-600
                      "
                    >
                      Custom
                    </span>
                  )}

                  {item.mapUrl && (
                    <a
                      href={
                        item.mapUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        text-[10px]
                        font-medium
                        text-[#E75480]
                        underline
                        underline-offset-2
                      "
                    >
                      Map
                    </a>
                  )}
                </div>
              </div>
            ),
        },

        {
          key:
            "date",

          header:
            "Date",

          cellClassName:
            "whitespace-nowrap",

          render:
            (
              item
            ) =>
              new Date(
                item.date
              ).toLocaleDateString(),
        },

        {
          key:
            "time",

          header:
            "Time",

          cellClassName:
            "whitespace-nowrap",

          render:
            (
              item
            ) =>
              item.time,
        },

        {
          key:
            "description",

          header:
            "Description",

          cellClassName:
            "max-w-sm",

          render:
            (
              item
            ) => (
              <p className="line-clamp-2 leading-6">
                {
                  item.description
                }
              </p>
            ),
        },

        {
          key:
            "status",

          header:
            "Status",

          hideOnMobile:
            true,

          render:
            statusBadge,
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

    /* ========================================================
       UI
    ======================================================== */

    return (
      <div>
        {/* ====================================================
            HEADER
        ==================================================== */}

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
              Events
            </h1>

            <p className="mt-2 text-muted">
              Create, edit, and manage
              website events.
            </p>
          </div>

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
            Add Event
          </button>
        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <CustomTable
          className="mt-10"
          columns={
            columns
          }
          rows={
            events
          }
          rowKey={(
            item
          ) =>
            item._id
          }
          loading={
            loading
          }
          loadingMessage="Loading events..."
          emptyIcon="✦"
          emptyTitle="No events yet"
          emptyMessage="Add your first event using the button above."
          minWidth="1250px"
          mobileTitle={(
            item
          ) => (
            <span className="flex items-center gap-3">
              {thumbnail(
                item
              )}

              <span>
                {
                  item.title
                }
              </span>
            </span>
          )}
          mobileSubtitle={(
            item
          ) =>
            `${new Date(
              item.date
            ).toLocaleDateString()} · ${
              item.time
            }`
          }
          mobileActions={
            renderActions
          }
        />

        {/* ====================================================
            ADD / EDIT DIALOG
        ==================================================== */}

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
              ? "Edit Event"
              : "Create Event"
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
              : "Creating..."
          }
          confirmLabel={
            editingId
              ? "Update Event"
              : "Create Event"
          }
          confirmDisabled={
            uploadingImage
          }
          closeOnBackdrop={
            false
          }
        >
          <div
            className="
              grid
              gap-5

              md:grid-cols-2
            "
          >
            {/* EVENT TITLE */}

            <FormField
              label="Event Title"
              required
            >
              <input
                type="text"
                name="title"
                required
                value={
                  formData.title
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </FormField>

            {/* BRANCH SELECT */}

            <FormField
              label="Branch / Event Location"
              required
            >
              <select
                value={
                  formData.locationType ===
                  "custom"
                    ? "custom"
                    : formData.branchId
                }
                onChange={
                  handleBranchChange
                }
                disabled={
                  branchesLoading
                }
                className={`
                  ${inputClass}
                  cursor-pointer

                  disabled:cursor-not-allowed
                  disabled:opacity-60
                `}
              >
                <option value="">
                  {branchesLoading
                    ? "Loading branches..."
                    : "Select a branch"}
                </option>

                {branches
                  .filter(
                    (
                      branch
                    ) =>
                      branch.active !==
                      false
                  )
                  .map(
                    (
                      branch
                    ) => (
                      <option
                        key={
                          branch._id
                        }
                        value={
                          branch._id
                        }
                      >
                        {
                          branch.name
                        }

                        {branch.label
                          ? ` — ${branch.label}`
                          : ""}
                      </option>
                    )
                  )}

                <option value="custom">
                  Custom / External Location
                </option>
              </select>

              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-muted
                "
              >
                Select a Nirjara branch to
                automatically load its address
                and Google Maps link.
              </p>
            </FormField>

            {/* LOCATION ADDRESS */}

            <FormField
              label="Location Address"
              required
            >
              <input
                type="text"
                name="location"
                required
                placeholder="e.g. Kalanki, Kathmandu"
                value={
                  formData.location
                }
                onChange={
                  handleChange
                }
                readOnly={
                  formData.locationType ===
                  "branch"
                }
                className={`
                  ${inputClass}

                  ${
                    formData.locationType ===
                    "branch"
                      ? "cursor-default bg-[#F8F4F6] text-[#765F68]"
                      : ""
                  }
                `}
              />

              {formData.locationType ===
                "branch" &&
                formData.branchId && (
                  <p className="mt-2 text-xs leading-5 text-[#E75480]">
                    Automatically loaded from{" "}
                    {getBranchName(
                      formData.branchId
                    )}
                  </p>
                )}
            </FormField>

            {/* GOOGLE MAPS LINK */}

            <FormField
              label="Google Maps Link"
            >
              <input
                type="url"
                name="mapUrl"
                placeholder="https://maps.google.com/..."
                value={
                  formData.mapUrl
                }
                onChange={
                  handleChange
                }
                readOnly={
                  formData.locationType ===
                  "branch"
                }
                className={`
                  ${inputClass}

                  ${
                    formData.locationType ===
                    "branch"
                      ? "cursor-default bg-[#F8F4F6] text-[#765F68]"
                      : ""
                  }
                `}
              />

              {formData.locationType ===
                "branch" &&
                formData.branchId && (
                  <p className="mt-2 text-xs leading-5 text-muted">
                    Automatically loaded from the selected branch.
                  </p>
                )}
            </FormField>

            {/* MAP PREVIEW */}

            {formData.mapUrl && (
              <div className="md:col-span-2">
                <div
                  className="
                    flex
                    flex-col
                    gap-4

                    rounded-2xl

                    border
                    border-[#E75480]/15

                    bg-[#FFF7FA]

                    p-5

                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div>
                    <p
                      className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[2.5px]
                        text-[#E75480]
                      "
                    >
                      Map Destination
                    </p>

                    <p
                      className="
                        mt-2
                        text-sm
                        font-medium
                        text-ink
                      "
                    >
                      {formData.location ||
                        "Selected Event Location"}
                    </p>

                    <p
                      className="
                        mt-1
                        max-w-xl
                        truncate
                        text-xs
                        text-muted
                      "
                    >
                      {
                        formData.mapUrl
                      }
                    </p>
                  </div>

                  <a
                    href={
                      formData.mapUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex
                      shrink-0
                      items-center
                      justify-center

                      rounded-full

                      border
                      border-[#E75480]/25

                      bg-white

                      px-5
                      py-2.5

                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[1.8px]
                      text-[#E75480]

                      transition-all
                      duration-300

                      hover:border-[#E75480]
                      hover:bg-[#E75480]
                      hover:text-white
                    "
                  >
                    Open Map
                  </a>
                </div>
              </div>
            )}

            {/* DATE */}

            <div>
              <FormLabel
                label="Date"
                required
              />

              <input
                type="date"
                name="date"
                required
                value={
                  formData.date
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </div>

            {/* TIME */}

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
                value={
                  formData.time
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </div>

            {/* BUTTON TEXT */}

            <FormField
              label="Button Text"
            >
              <input
                type="text"
                name="buttonText"
                placeholder="Register Now"
                value={
                  formData.buttonText
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </FormField>

            {/* BUTTON LINK */}

            <FormField
              label="Button Link"
            >
              <input
                type="text"
                name="buttonLink"
                placeholder="/contact"
                value={
                  formData.buttonLink
                }
                onChange={
                  handleChange
                }
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
                name="description"
                required
                rows={
                  5
                }
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </FormField>

            {/* IMAGE */}

            <div className="md:col-span-2">
              <FormLabel
                label="Event Image"
              />

              <input
                type="file"
                accept="image/*"
                onChange={
                  pickImage
                }
                disabled={
                  uploadingImage
                }
                className={`
                  ${inputClass}

                  disabled:cursor-not-allowed
                  disabled:opacity-60
                `}
              />

              <div
                className="
                  mt-2
                  flex
                  flex-wrap
                  items-center
                  justify-between
                  gap-2
                "
              >
                <p className="text-xs text-muted">
                  Recommended size: 1200 × 800 px
                </p>

                {uploadingImage && (
                  <p className="text-xs font-medium text-[#E75480]">
                    Uploading image...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ====================================================
              IMAGE PREVIEW
          ==================================================== */}

          {formData.image && (
            <div className="mt-5">
              <div
                className="
                  mb-2
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <p className="text-sm text-muted">
                  Image Preview
                </p>

                <button
                  type="button"
                  onClick={
                    removeImage
                  }
                  disabled={
                    uploadingImage
                  }
                  className="
                    rounded-full
                    border
                    border-red-200
                    bg-white
                    px-4
                    py-2
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[1.5px]
                    text-red-600
                    transition

                    hover:bg-red-50

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Remove Image
                </button>
              </div>

              <div
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[#E75480]/10
                  bg-[#FFF7FA]
                  p-3

                  md:max-w-md
                "
              >
                <img
                  src={
                    formData.image
                  }
                  alt="Event preview"
                  className="
                    h-52
                    w-full
                    rounded-xl
                    object-cover
                  "
                />
              </div>
            </div>
          )}
        </DialogBox>

        {/* ====================================================
            DELETE
        ==================================================== */}

        <DialogBox
          open={Boolean(
            eventToDelete
          )}
          onClose={() =>
            setEventToDelete(
              null
            )
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
          submitting={
            deleting
          }
          onConfirm={
            confirmDelete
          }
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
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  CSS,
} from "@dnd-kit/utilities";

import {
  GripVertical,
  ImagePlus,
  Link as LinkIcon,
  Plus,
  Search,
} from "lucide-react";

import {
  toast,
} from "react-toastify";

import DialogBox from "../../components/DialogBox";

import RowActionsMenu from "../../components/RowActionsMenu";

import {
  getApiErrorMessage,
} from "../../services/base/api";

import {
  uploadImage,
} from "../../services/upload/uploadService";

import {
  createSocialMedia,
  deleteSocialMedia,
  getSocialMedia,
  reorderSocialMedia,
  toggleFeaturedSocialMedia,
  toggleSocialMedia,
  updateSocialMedia,
} from "../../services/socialMedia/socialMediaService";

import type {
  SocialMedia,
  SocialMediaPayload,
} from "../../services/socialMedia/socialMedia.types";

/* ============================================================
   DEFAULT FORM
============================================================ */

const emptyForm:
  SocialMediaPayload = {
  platform: "",
  accountName: "",
  username: "",
  url: "",
  image: "",
  description: "",
  active: true,
  featured: false,
};

/* ============================================================
   PLATFORM SUGGESTIONS
============================================================ */

const PLATFORM_SUGGESTIONS = [
  "Facebook",
  "Instagram",
  "TikTok",
  "YouTube",
  "WhatsApp",
  "Threads",
  "Pinterest",
  "LinkedIn",
  "Snapchat",
  "X",
];

/* ============================================================
   STYLES
============================================================ */

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm text-[#3A2A2F] outline-none transition placeholder:text-[#B59AA3] focus:border-[#E75480] focus:ring-2 focus:ring-[#E75480]/10";

const labelClass =
  "mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-[#8A6F78]";

/* ============================================================
   PAGE
============================================================ */

export default function SocialMediaAdmin() {
  const [
    accounts,
    setAccounts,
  ] =
    useState<
      SocialMedia[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  /* ==========================================================
     FILTERS
  ========================================================== */

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    platformFilter,
    setPlatformFilter,
  ] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState("");

  /* ==========================================================
     FORM
  ========================================================== */

  const [
    formOpen,
    setFormOpen,
  ] =
    useState(false);

  const [
    editingId,
    setEditingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    form,
    setForm,
  ] =
    useState<
      SocialMediaPayload
    >(
      emptyForm
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    uploading,
    setUploading,
  ] =
    useState(false);

  /* ==========================================================
     PROCESSING
  ========================================================== */

  const [
    processingId,
    setProcessingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    reordering,
    setReordering,
  ] =
    useState(false);

  /* ==========================================================
     DELETE
  ========================================================== */

  const [
    accountToDelete,
    setAccountToDelete,
  ] =
    useState<
      SocialMedia | null
    >(null);

  const [
    deleting,
    setDeleting,
  ] =
    useState(false);

  /* ==========================================================
     DRAG SENSORS
  ========================================================== */

  const sensors =
    useSensors(
      useSensor(
        PointerSensor,
        {
          activationConstraint: {
            distance: 5,
          },
        }
      ),

      useSensor(
        TouchSensor,
        {
          activationConstraint: {
            delay: 150,
            tolerance: 5,
          },
        }
      )
    );

  /* ==========================================================
     FETCH
  ========================================================== */

  const fetchAccounts =
    async () => {
      try {
        setLoading(true);

        const data =
          await getSocialMedia();

        setAccounts(
          data
        );
      } catch (
        error
      ) {
        console.error(
          "Fetch social media error:",
          error
        );

        toast.error(
          getApiErrorMessage(
            error,
            "Failed to load social media accounts"
          )
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(
    () => {
      fetchAccounts();
    },
    []
  );

  /* ==========================================================
     PLATFORM OPTIONS
  ========================================================== */

  const platformOptions =
    useMemo(
      () =>
        Array.from(
          new Set(
            accounts
              .map(
                (
                  account
                ) =>
                  account.platform
                    ?.trim()
              )
              .filter(
                Boolean
              )
          )
        ).sort(
          (
            a,
            b
          ) =>
            a.localeCompare(
              b
            )
        ),

      [
        accounts,
      ]
    );

  /* ==========================================================
     CLIENT SIDE FILTERING
  ========================================================== */

  const visibleAccounts =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        return accounts.filter(
          (
            account
          ) => {
            const matchesSearch =
              !query ||
              account.accountName
                .toLowerCase()
                .includes(
                  query
                ) ||
              account.username
                .toLowerCase()
                .includes(
                  query
                ) ||
              account.platform
                .toLowerCase()
                .includes(
                  query
                );

            const matchesPlatform =
              !platformFilter ||
              account.platform ===
                platformFilter;

            const matchesStatus =
              !statusFilter ||
              String(
                account.active
              ) ===
                statusFilter;

            return (
              matchesSearch &&
              matchesPlatform &&
              matchesStatus
            );
          }
        );
      },

      [
        accounts,
        search,
        platformFilter,
        statusFilter,
      ]
    );

  const filtersActive =
    Boolean(
      search.trim() ||
        platformFilter ||
        statusFilter
    );

  /* ==========================================================
     OPEN ADD
  ========================================================== */

  const openAddForm =
    () => {
      setEditingId(
        null
      );

      setForm({
        ...emptyForm,
      });

      setFormOpen(
        true
      );
    };

  /* ==========================================================
     OPEN EDIT
  ========================================================== */

  const openEditForm =
    (
      account:
        SocialMedia
    ) => {
      setEditingId(
        account._id
      );

      setForm({
        platform:
          account.platform ||
          "",

        accountName:
          account.accountName ||
          "",

        username:
          account.username ||
          "",

        url:
          account.url ||
          "",

        image:
          account.image ||
          "",

        description:
          account.description ||
          "",

        active:
          account.active !==
          false,

        featured:
          Boolean(
            account.featured
          ),
      });

      setFormOpen(
        true
      );
    };

  /* ==========================================================
     CLOSE FORM
  ========================================================== */

  const closeForm =
    () => {
      if (
        saving ||
        uploading
      ) {
        return;
      }

      setFormOpen(
        false
      );

      setEditingId(
        null
      );

      setForm({
        ...emptyForm,
      });
    };

  /* ==========================================================
     IMAGE UPLOAD
  ========================================================== */

  const handleImageUpload =
    async (
      file:
        File
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
          "Social media image upload error:",
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

  /* ==========================================================
     VALIDATE
  ========================================================== */

  const validateForm =
    () => {
      if (
        !form.platform.trim()
      ) {
        toast.error(
          "Platform is required."
        );

        return false;
      }

      if (
        !form.accountName.trim()
      ) {
        toast.error(
          "Account name is required."
        );

        return false;
      }

      if (
        !form.url.trim()
      ) {
        toast.error(
          "Social media URL is required."
        );

        return false;
      }

      return true;
    };

  /* ==========================================================
     SAVE
  ========================================================== */

  const handleSubmit =
    async () => {
      if (
        !validateForm()
      ) {
        return;
      }

      try {
        setSaving(
          true
        );

        const payload:
          SocialMediaPayload =
          {
            platform:
              form.platform.trim(),

            accountName:
              form.accountName.trim(),

            username:
              form.username.trim(),

            url:
              form.url.trim(),

            image:
              form.image.trim(),

            description:
              form.description.trim(),

            active:
              form.active,

            featured:
              form.featured,
          };

        if (
          editingId
        ) {
          await updateSocialMedia(
            editingId,
            payload
          );

          toast.success(
            "Social media account updated."
          );
        } else {
          await createSocialMedia(
            payload
          );

          toast.success(
            "Social media account added."
          );
        }

        /*
          Clear filters after save.

          This prevents a newly-created
          account from looking like it
          disappeared.
        */

        setSearch("");

        setPlatformFilter(
          ""
        );

        setStatusFilter(
          ""
        );

        setFormOpen(
          false
        );

        setEditingId(
          null
        );

        setForm({
          ...emptyForm,
        });

        await fetchAccounts();
      } catch (
        error
      ) {
        console.error(
          "Save social media error:",
          error
        );

        toast.error(
          getApiErrorMessage(
            error,
            "Unable to save social media account"
          )
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  /* ==========================================================
     DRAG / REORDER
  ========================================================== */

  const handleDragEnd =
    async (
      event:
        DragEndEvent
    ) => {
      const {
        active,
        over,
      } =
        event;

      if (
        !over ||
        active.id ===
          over.id
      ) {
        return;
      }

      if (
        filtersActive
      ) {
        toast.info(
          "Clear filters before changing the order."
        );

        return;
      }

      const oldIndex =
        accounts.findIndex(
          (
            account
          ) =>
            account._id ===
            active.id
        );

      const newIndex =
        accounts.findIndex(
          (
            account
          ) =>
            account._id ===
            over.id
        );

      if (
        oldIndex <
          0 ||
        newIndex <
          0
      ) {
        return;
      }

      const previousAccounts =
        accounts;

      const reordered =
        arrayMove(
          accounts,
          oldIndex,
          newIndex
        ).map(
          (
            account,
            index
          ) => ({
            ...account,

            sortOrder:
              index + 1,
          })
        );

      /*
        Immediate visual slide.
      */

      setAccounts(
        reordered
      );

      try {
        setReordering(
          true
        );

        const saved =
          await reorderSocialMedia(
            reordered.map(
              (
                account
              ) =>
                account._id
            )
          );

        setAccounts(
          saved
        );

        toast.success(
          "Display order updated."
        );
      } catch (
        error
      ) {
        /*
          Roll back visually if
          backend save fails.
        */

        setAccounts(
          previousAccounts
        );

        toast.error(
          getApiErrorMessage(
            error,
            "Unable to save the new order"
          )
        );
      } finally {
        setReordering(
          false
        );
      }
    };

  /* ==========================================================
     ACTIVE
  ========================================================== */

  const handleToggleActive =
    async (
      account:
        SocialMedia
    ) => {
      try {
        setProcessingId(
          account._id
        );

        const updated =
          await toggleSocialMedia(
            account._id
          );

        setAccounts(
          (
            previous
          ) =>
            previous.map(
              (
                item
              ) =>
                item._id ===
                updated._id
                  ? updated
                  : item
            )
        );

        toast.success(
          updated.active
            ? "Account activated."
            : "Account deactivated."
        );
      } catch (
        error
      ) {
        toast.error(
          getApiErrorMessage(
            error,
            "Unable to update account status"
          )
        );
      } finally {
        setProcessingId(
          null
        );
      }
    };

  /* ==========================================================
     FEATURED
  ========================================================== */

  const handleToggleFeatured =
    async (
      account:
        SocialMedia
    ) => {
      try {
        setProcessingId(
          account._id
        );

        const updated =
          await toggleFeaturedSocialMedia(
            account._id
          );

        setAccounts(
          (
            previous
          ) =>
            previous.map(
              (
                item
              ) =>
                item._id ===
                updated._id
                  ? updated
                  : item
            )
        );

        toast.success(
          updated.featured
            ? "Account marked as featured."
            : "Account removed from featured."
        );
      } catch (
        error
      ) {
        toast.error(
          getApiErrorMessage(
            error,
            "Unable to update featured status"
          )
        );
      } finally {
        setProcessingId(
          null
        );
      }
    };

  /* ==========================================================
     DELETE
  ========================================================== */

  const confirmDelete =
    async () => {
      if (
        !accountToDelete
      ) {
        return;
      }

      try {
        setDeleting(
          true
        );

        await deleteSocialMedia(
          accountToDelete._id
        );

        setAccountToDelete(
          null
        );

        await fetchAccounts();

        toast.success(
          "Social media account deleted."
        );
      } catch (
        error
      ) {
        toast.error(
          getApiErrorMessage(
            error,
            "Unable to delete social media account"
          )
        );
      } finally {
        setDeleting(
          false
        );
      }
    };

  /* ==========================================================
     STATS
  ========================================================== */

  const activeCount =
    accounts.filter(
      (
        account
      ) =>
        account.active
    ).length;

  const featuredCount =
    accounts.filter(
      (
        account
      ) =>
        account.featured
    ).length;

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex
          flex-wrap
          items-start
          justify-between
          gap-5
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
            Content Management
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
            Social Media
          </h1>

          <p
            className="
              mt-2
              max-w-2xl
              text-[#8A6F78]
            "
          >
            Manage Nirjara's social
            accounts and drag them
            into the order they
            should appear on the
            website.
          </p>
        </div>

        <button
          type="button"
          onClick={
            openAddForm
          }
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            bg-[#E75480]
            px-7
            py-3
            text-xs
            font-medium
            uppercase
            tracking-[2px]
            text-white
            transition

            hover:bg-[#d94873]
          "
        >
          <Plus
            size={
              16
            }
          />

          Add Account
        </button>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div
        className="
          mt-7
          grid
          gap-3
          sm:grid-cols-3
        "
      >
        <StatCard
          label="Accounts"
          value={
            accounts.length
          }
        />

        <StatCard
          label="Active"
          value={
            activeCount
          }
        />

        <StatCard
          label="Featured"
          value={
            featuredCount
          }
        />
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div
        className="
          mt-6
          rounded-3xl
          bg-white
          p-5
          shadow-sm
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4

            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >
          <div>
            <p
              className="
                text-sm
                text-[#8A6F78]
              "
            >
              {
                visibleAccounts.length
              }{" "}
              account
              {visibleAccounts.length ===
              1
                ? ""
                : "s"}
            </p>

            {filtersActive && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");

                  setPlatformFilter(
                    ""
                  );

                  setStatusFilter(
                    ""
                  );
                }}
                className="
                  mt-1
                  text-xs
                  font-medium
                  text-[#E75480]
                "
              >
                Clear filters
              </button>
            )}
          </div>

          <div
            className="
              grid
              w-full
              gap-3

              sm:grid-cols-2

              xl:w-auto
              xl:grid-cols-[300px_190px_170px]
            "
          >
            {/* SEARCH */}

            <div
              className="
                relative
                sm:col-span-2
                xl:col-span-1
              "
            >
              <Search
                size={
                  16
                }
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-[#A98994]
                "
              />

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
                placeholder="Search accounts..."
                className={`${inputClass} pl-10`}
              />
            </div>

            {/* PLATFORM */}

            <select
              value={
                platformFilter
              }
              onChange={(
                event
              ) =>
                setPlatformFilter(
                  event.target
                    .value
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                All Platforms
              </option>

              {platformOptions.map(
                (
                  platform
                ) => (
                  <option
                    key={
                      platform
                    }
                    value={
                      platform
                    }
                  >
                    {
                      platform
                    }
                  </option>
                )
              )}
            </select>

            {/* STATUS */}

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                All Status
              </option>

              <option value="true">
                Active
              </option>

              <option value="false">
                Inactive
              </option>
            </select>
          </div>
        </div>

        {filtersActive && (
          <p
            className="
              mt-3
              text-[11px]
              text-[#A98994]
            "
          >
            Clear search and filters
            to drag accounts into a
            new order.
          </p>
        )}
      </div>

      {/* =====================================================
          SORTABLE LIST
      ===================================================== */}

      <div
        className="
          mt-6
          overflow-hidden
          rounded-3xl
          border
          border-[#E75480]/10
          bg-white
          shadow-sm
        "
      >
        {/* HEADER */}

        <div
          className="
            hidden
            grid-cols-[55px_75px_minmax(190px,1.6fr)_minmax(140px,1fr)_90px_110px_80px]
            gap-4
            bg-[#FCE7EF]
            px-5
            py-4
            text-[11px]
            font-semibold
            text-[#E75480]

            md:grid
          "
        >
          <span>
            Move
          </span>

          <span>
            Image
          </span>

          <span>
            Account
          </span>

          <span>
            Platform
          </span>

          <span>
            Order
          </span>

          <span>
            Status
          </span>

          <span className="text-right">
            Actions
          </span>
        </div>

        {/* CONTENT */}

        {loading ? (
          <div
            className="
              p-10
              text-center
              text-sm
              text-[#8A6F78]
            "
          >
            Loading social media
            accounts...
          </div>
        ) : visibleAccounts.length ===
          0 ? (
          <div
            className="
              p-10
              text-center
            "
          >
            <p
              className="
                font-serif
                text-xl
                text-[#3A2A2F]
              "
            >
              No accounts found
            </p>

            <p
              className="
                mt-2
                text-sm
                text-[#8A6F78]
              "
            >
              Try changing your
              search or filters.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={
              sensors
            }
            collisionDetection={
              closestCenter
            }
            onDragEnd={
              handleDragEnd
            }
          >
            <SortableContext
              items={
                visibleAccounts.map(
                  (
                    account
                  ) =>
                    account._id
                )
              }
              strategy={
                verticalListSortingStrategy
              }
            >
              {visibleAccounts.map(
                (
                  account
                ) => (
                  <SortableAccountRow
                    key={
                      account._id
                    }
                    account={
                      account
                    }
                    dragDisabled={
                      filtersActive ||
                      reordering
                    }
                    busy={
                      processingId ===
                      account._id
                    }
                    onEdit={
                      openEditForm
                    }
                    onToggle={
                      handleToggleActive
                    }
                    onFeatured={
                      handleToggleFeatured
                    }
                    onDelete={
                      setAccountToDelete
                    }
                  />
                )
              )}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* =====================================================
          ADD / EDIT
      ===================================================== */}

      <DialogBox
        open={
          formOpen
        }
        onClose={
          closeForm
        }
        eyebrow="Social Media"
        title={
          editingId
            ? "Edit Account"
            : "Add Social Account"
        }
        description="Add as many social accounts as needed. Their display order can be changed by dragging the list."
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
            ? "Update Account"
            : "Add Account"
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
            gap-5
            md:grid-cols-2
          "
        >
          {/* PLATFORM */}

          <div>
            <label
              className={
                labelClass
              }
            >
              Platform *
            </label>

            <input
              required
              list="social-platform-list"
              value={
                form.platform
              }
              placeholder="e.g. TikTok"
              onChange={(
                event
              ) =>
                setForm({
                  ...form,

                  platform:
                    event.target
                      .value,
                })
              }
              className={
                inputClass
              }
            />

            <datalist
              id="social-platform-list"
            >
              {PLATFORM_SUGGESTIONS.map(
                (
                  platform
                ) => (
                  <option
                    key={
                      platform
                    }
                    value={
                      platform
                    }
                  />
                )
              )}
            </datalist>

            <p
              className="
                mt-2
                text-xs
                text-[#A98994]
              "
            >
              Select a common
              platform or type a
              custom one.
            </p>
          </div>

          {/* ACCOUNT */}

          <div>
            <label
              className={
                labelClass
              }
            >
              Account Name *
            </label>

            <input
              required
              value={
                form.accountName
              }
              placeholder="e.g. Nirjara Beauty"
              onChange={(
                event
              ) =>
                setForm({
                  ...form,

                  accountName:
                    event.target
                      .value,
                })
              }
              className={
                inputClass
              }
            />
          </div>

          {/* USERNAME */}

          <div>
            <label
              className={
                labelClass
              }
            >
              Username
            </label>

            <input
              value={
                form.username
              }
              placeholder="@nirjarabeauty"
              onChange={(
                event
              ) =>
                setForm({
                  ...form,

                  username:
                    event.target
                      .value,
                })
              }
              className={
                inputClass
              }
            />
          </div>

          {/* ORDER INFO */}

          <div>
            <label
              className={
                labelClass
              }
            >
              Display Order
            </label>

            <div
              className="
                rounded-xl
                border
                border-[#E75480]/10
                bg-[#FFF5F8]
                px-4
                py-3
                text-sm
                text-[#8A6F78]
              "
            >
              {editingId
                ? "Change by dragging the account after saving."
                : "New account will be added to the end automatically."}
            </div>
          </div>

          {/* URL */}

          <div
            className="
              md:col-span-2
            "
          >
            <label
              className={
                labelClass
              }
            >
              Social Media URL *
            </label>

            <div className="relative">
              <LinkIcon
                size={
                  16
                }
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-[#A98994]
                "
              />

              <input
                required
                value={
                  form.url
                }
                placeholder="https://www.instagram.com/nirjarabeauty"
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,

                    url:
                      event.target
                        .value,
                  })
                }
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          {/* DESCRIPTION */}

          <div
            className="
              md:col-span-2
            "
          >
            <label
              className={
                labelClass
              }
            >
              Description
            </label>

            <textarea
              rows={
                3
              }
              value={
                form.description
              }
              placeholder="Short description about this account..."
              onChange={(
                event
              ) =>
                setForm({
                  ...form,

                  description:
                    event.target
                      .value,
                })
              }
              className={
                inputClass
              }
            />
          </div>

          {/* IMAGE */}

          <div
            className="
              md:col-span-2
            "
          >
            <label
              className={
                labelClass
              }
            >
              Account Image
            </label>

            <label
              className="
                flex
                cursor-pointer
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-dashed
                border-[#E75480]/30
                bg-[#FFF5F8]
                px-5
                py-5
                text-sm
                text-[#8A6F78]
                transition

                hover:border-[#E75480]
                hover:bg-[#FCE7EF]/40
              "
            >
              <ImagePlus
                size={
                  18
                }
                className="
                  text-[#E75480]
                "
              />

              {uploading
                ? "Uploading..."
                : form.image
                  ? "Replace Image"
                  : "Upload Image"}

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                disabled={
                  uploading
                }
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

                  handleImageUpload(
                    file
                  );

                  event.target.value =
                    "";
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* PREVIEW */}

          {form.image && (
            <div
              className="
                md:col-span-2
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-[#E75480]/10
                  bg-[#FFF5F8]
                  p-4
                "
              >
                <img
                  src={
                    form.image
                  }
                  alt="Preview"
                  className="
                    h-20
                    w-20
                    rounded-2xl
                    object-cover
                  "
                />

                <div
                  className="
                    min-w-0
                    flex-1
                  "
                >
                  <p
                    className="
                      font-medium
                      text-[#3A2A2F]
                    "
                  >
                    Image Preview
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,

                      image:
                        "",
                    })
                  }
                  className="
                    rounded-full
                    border
                    border-[#E75480]/20
                    px-3
                    py-2
                    text-xs
                    text-[#E75480]
                  "
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE */}

          <label
            className="
              flex
              cursor-pointer
              items-start
              gap-3
              rounded-2xl
              border
              border-[#E75480]/10
              bg-[#FFF5F8]
              p-4
            "
          >
            <input
              type="checkbox"
              checked={
                form.active
              }
              onChange={(
                event
              ) =>
                setForm({
                  ...form,

                  active:
                    event.target
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
                  text-[#3A2A2F]
                "
              >
                Active
              </span>

              <span
                className="
                  mt-1
                  block
                  text-xs
                  leading-5
                  text-[#8A6F78]
                "
              >
                Show on the public
                website.
              </span>
            </span>
          </label>

          {/* FEATURED */}

          <label
            className="
              flex
              cursor-pointer
              items-start
              gap-3
              rounded-2xl
              border
              border-[#E75480]/10
              bg-[#FFF5F8]
              p-4
            "
          >
            <input
              type="checkbox"
              checked={
                form.featured
              }
              onChange={(
                event
              ) =>
                setForm({
                  ...form,

                  featured:
                    event.target
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
                  text-[#3A2A2F]
                "
              >
                Featured
              </span>

              <span
                className="
                  mt-1
                  block
                  text-xs
                  leading-5
                  text-[#8A6F78]
                "
              >
                Give this account
                extra prominence.
              </span>
            </span>
          </label>
        </div>
      </DialogBox>

      {/* =====================================================
          DELETE
      ===================================================== */}

      <DialogBox
        open={
          Boolean(
            accountToDelete
          )
        }
        onClose={() =>
          setAccountToDelete(
            null
          )
        }
        eyebrow="Confirm"
        title="Delete social account?"
        description={
          accountToDelete
            ? `"${accountToDelete.accountName}" on ${accountToDelete.platform} will be permanently removed.`
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
            leading-6
            text-[#8A6F78]
          "
        >
          The remaining accounts
          will automatically be
          renumbered after deletion.
        </p>
      </DialogBox>
    </div>
  );
}

/* ============================================================
   SORTABLE ROW
============================================================ */

function SortableAccountRow({
  account,
  dragDisabled,
  busy,
  onEdit,
  onToggle,
  onFeatured,
  onDelete,
}: {
  account:
    SocialMedia;

  dragDisabled:
    boolean;

  busy:
    boolean;

  onEdit:
    (
      account:
        SocialMedia
    ) => void;

  onToggle:
    (
      account:
        SocialMedia
    ) => void;

  onFeatured:
    (
      account:
        SocialMedia
    ) => void;

  onDelete:
    (
      account:
        SocialMedia
    ) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } =
    useSortable({
      id:
        account._id,

      disabled:
        dragDisabled,
    });

  return (
    <div
      ref={
        setNodeRef
      }
      style={{
        transform:
          CSS.Transform.toString(
            transform
          ),

        transition,

        position:
          isDragging
            ? "relative"
            : undefined,

        zIndex:
          isDragging
            ? 30
            : undefined,
      }}
      className={`
        border-b
        border-[#E75480]/10
        px-4
        py-4

        last:border-b-0

        md:grid
        md:grid-cols-[55px_75px_minmax(190px,1.6fr)_minmax(140px,1fr)_90px_110px_80px]
        md:items-center
        md:gap-4
        md:px-5

        ${
          isDragging
            ? `
                bg-white
                shadow-[0_16px_45px_rgba(58,42,47,0.15)]
              `
            : `
                bg-white
                hover:bg-[#FFF9FB]
              `
        }
      `}
    >
      {/* MOVE */}

      <div
        className="
          mb-3
          flex
          items-center
          justify-between

          md:mb-0
          md:block
        "
      >
        <button
          type="button"
          disabled={
            dragDisabled
          }
          {...attributes}
          {...listeners}
          title={
            dragDisabled
              ? "Clear filters to reorder"
              : "Drag to reorder"
          }
          className={`
            flex
            h-9
            w-9
            touch-none
            items-center
            justify-center
            rounded-xl
            border
            border-[#E75480]/10

            ${
              dragDisabled
                ? `
                    cursor-not-allowed
                    text-gray-300
                  `
                : `
                    cursor-grab
                    text-[#E75480]
                    hover:bg-[#FFF5F8]
                    active:cursor-grabbing
                  `
            }
          `}
        >
          <GripVertical
            size={
              17
            }
          />
        </button>

        <span
          className="
            rounded-full
            bg-[#FFF5F8]
            px-3
            py-1
            text-[10px]
            font-semibold
            text-[#E75480]

            md:hidden
          "
        >
          Order{" "}
          {
            account.sortOrder
          }
        </span>
      </div>

      {/* IMAGE */}

      <div
        className="
          hidden
          md:block
        "
      >
        {account.image ? (
          <img
            src={
              account.image
            }
            alt={
              account.accountName
            }
            className="
              h-14
              w-14
              rounded-2xl
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
              rounded-2xl
              border
              border-[#E75480]/10
              bg-[#FFF5F8]
              font-serif
              text-xl
              text-[#E75480]
            "
          >
            {account.platform
              .charAt(
                0
              )
              .toUpperCase()}
          </div>
        )}
      </div>

      {/* ACCOUNT */}

      <div
        className="
          min-w-0
        "
      >
        <p
          className="
            truncate
            font-medium
            text-[#3A2A2F]
          "
        >
          {
            account.accountName
          }
        </p>

        {account.username && (
          <p
            className="
              mt-1
              truncate
              text-xs
              text-[#8A6F78]
            "
          >
            {
              account.username
            }
          </p>
        )}
      </div>

      {/* PLATFORM */}

      <div
        className="
          mt-3
          md:mt-0
        "
      >
        <span
          className="
            inline-flex
            rounded-full
            bg-[#FCE7EF]
            px-3
            py-1.5
            text-[9px]
            font-semibold
            uppercase
            tracking-[1px]
            text-[#E75480]
          "
        >
          {
            account.platform
          }
        </span>
      </div>

      {/* ORDER */}

      <div
        className="
          hidden
          font-medium
          text-[#8A6F78]

          md:block
        "
      >
        {
          account.sortOrder
        }
      </div>

      {/* STATUS */}

      <div
        className="
          mt-3
          md:mt-0
        "
      >
        <span
          className={`
            inline-flex
            rounded-full
            px-3
            py-1.5
            text-[9px]
            font-semibold
            uppercase

            ${
              account.active
                ? `
                    bg-emerald-50
                    text-emerald-700
                  `
                : `
                    bg-gray-100
                    text-gray-500
                  `
            }
          `}
        >
          {account.active
            ? "Active"
            : "Inactive"}
        </span>
      </div>

      {/* ACTIONS */}

      <div
        className="
          mt-3
          flex
          justify-end

          md:mt-0
        "
      >
        <RowActionsMenu
          label={`Actions for ${account.accountName}`}
          busy={
            busy
          }
          actions={[
            {
              key:
                "open",

              label:
                "Open account",

              icon:
                "↗",

              onSelect:
                () =>
                  window.open(
                    account.url,
                    "_blank",
                    "noopener,noreferrer"
                  ),
            },

            {
              key:
                "edit",

              label:
                "Edit",

              icon:
                "✎",

              onSelect:
                () =>
                  onEdit(
                    account
                  ),
            },

            {
              key:
                "featured",

              label:
                account.featured
                  ? "Remove featured"
                  : "Make featured",

              icon:
                "★",

              onSelect:
                () =>
                  onFeatured(
                    account
                  ),
            },

            {
              key:
                "active",

              label:
                account.active
                  ? "Deactivate"
                  : "Activate",

              icon:
                account.active
                  ? "○"
                  : "✓",

              onSelect:
                () =>
                  onToggle(
                    account
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
                  onDelete(
                    account
                  ),
            },
          ]}
        />
      </div>
    </div>
  );
}

/* ============================================================
   STAT
============================================================ */

function StatCard({
  label,
  value,
}: {
  label:
    string;

  value:
    number;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[#E75480]/10
        bg-white
        px-5
        py-4
        shadow-sm
      "
    >
      <p
        className="
          text-[9px]
          font-semibold
          uppercase
          tracking-[2px]
          text-[#A98994]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          font-serif
          text-3xl
          text-[#3A2A2F]
        "
      >
        {value}
      </p>
    </div>
  );
}
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ExternalLink,
  ImagePlus,
  Link as LinkIcon,
  Plus,
  Search,
} from "lucide-react";

import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../components/CustomTable";

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
  toggleFeaturedSocialMedia,
  toggleSocialMedia,
  updateSocialMedia,
} from "../../services/socialMedia/socialMediaService";

import type {
  SocialMedia,
  SocialMediaPayload,
} from "../../services/socialMedia/socialMedia.types";

/* ============================================================
   FORM DEFAULTS
============================================================ */

const emptyForm: SocialMediaPayload = {
  platform: "",
  accountName: "",
  username: "",
  url: "",
  image: "",
  description: "",
  active: true,
  featured: false,
  sortOrder: 0,
};

/* ============================================================
   PLATFORM SUGGESTIONS

   These are only suggestions.
   Admin can type ANY platform manually.
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
   CONFIG
============================================================ */

const SEARCH_DELAY_MS = 350;

/* ============================================================
   SHARED STYLES
============================================================ */

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm text-[#3A2A2F] outline-none transition placeholder:text-[#B59AA3] focus:border-[#E75480] focus:ring-2 focus:ring-[#E75480]/10";

const labelClass =
  "mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-[#8A6F78]";

/* ============================================================
   HELPERS
============================================================ */

function getPlatformInitial(
  platform: string
) {
  return (
    platform
      .trim()
      .charAt(0)
      .toUpperCase() || "✦"
  );
}

/* ============================================================
   SOCIAL MEDIA ADMIN
============================================================ */

export default function SocialMediaAdmin() {
  /* ==========================================================
     DATA
  ========================================================== */

  const [
    accounts,
    setAccounts,
  ] = useState<SocialMedia[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* ==========================================================
     SEARCH / FILTER
  ========================================================== */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    appliedSearch,
    setAppliedSearch,
  ] = useState("");

  const [
    platformFilter,
    setPlatformFilter,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  /* ==========================================================
     ADD / EDIT
  ========================================================== */

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    form,
    setForm,
  ] =
    useState<SocialMediaPayload>(
      emptyForm
    );

  const [
    editingId,
    setEditingId,
  ] =
    useState<string | null>(
      null
    );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  /* ==========================================================
     PROCESSING
  ========================================================== */

  const [
    processingId,
    setProcessingId,
  ] =
    useState<string | null>(
      null
    );

  /* ==========================================================
     DELETE
  ========================================================== */

  const [
    accountToDelete,
    setAccountToDelete,
  ] =
    useState<SocialMedia | null>(
      null
    );

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  /* ==========================================================
     REQUEST TRACKER
  ========================================================== */

  const latestRequest =
    useRef(0);

  /* ==========================================================
     FETCH
  ========================================================== */

  const fetchAccounts =
    async () => {
      const requestId =
        ++latestRequest.current;

      try {
        const data =
          await getSocialMedia({
            search:
              appliedSearch,

            platform:
              platformFilter,

            active:
              statusFilter,
          });

        if (
          requestId !==
          latestRequest.current
        ) {
          return;
        }

        setAccounts(data);
      } catch (error) {
        console.error(
          "Fetch social media error:",
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
            "Failed to load social media accounts"
          )
        );

        setAccounts([]);
      } finally {
        if (
          requestId ===
          latestRequest.current
        ) {
          setLoading(false);
        }
      }
    };

  /* ==========================================================
     SEARCH DEBOUNCE
  ========================================================== */

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          setAppliedSearch(
            search.trim()
          );
        },
        SEARCH_DELAY_MS
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [search]);

  /* ==========================================================
     LOAD
  ========================================================== */

  useEffect(() => {
    fetchAccounts();
  }, [
    appliedSearch,
    platformFilter,
    statusFilter,
  ]);

  /* ==========================================================
     PLATFORM OPTIONS

     We combine:
     - known platforms
     - anything already saved in database
  ========================================================== */

  const platformOptions =
    useMemo(() => {
      const databasePlatforms =
        accounts
          .map(
            (account) =>
              account.platform
                ?.trim()
          )
          .filter(Boolean);

      return Array.from(
        new Set([
          ...PLATFORM_SUGGESTIONS,
          ...databasePlatforms,
        ])
      ).sort((a, b) =>
        a.localeCompare(b)
      );
    }, [accounts]);

  /* ==========================================================
     OPEN ADD
  ========================================================== */

  const openAddForm =
    () => {
      setEditingId(null);

      setForm({
        ...emptyForm,
      });

      setFormOpen(true);
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

        sortOrder:
          Number(
            account.sortOrder ??
              0
          ),
      });

      setFormOpen(true);
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

      setFormOpen(false);

      setEditingId(null);

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
        setUploading(true);

        const imageUrl =
          await uploadImage(file);

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
      } catch (error) {
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
        setUploading(false);
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

      if (
        form.sortOrder <
        0
      ) {
        toast.error(
          "Sort order cannot be negative."
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
        setSaving(true);

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

            sortOrder:
              Number(
                form.sortOrder
              ),
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

        await fetchAccounts();

        setFormOpen(false);

        setEditingId(null);

        setForm({
          ...emptyForm,
        });
      } catch (error) {
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
        setSaving(false);
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
                account._id
                  ? updated
                  : item
            )
        );

        toast.success(
          updated.active
            ? "Account activated."
            : "Account deactivated."
        );
      } catch (error) {
        console.error(
          "Toggle account error:",
          error
        );

        toast.error(
          getApiErrorMessage(
            error,
            "Unable to change account status"
          )
        );
      } finally {
        setProcessingId(null);
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
                account._id
                  ? updated
                  : item
            )
        );

        toast.success(
          updated.featured
            ? "Account marked as featured."
            : "Account removed from featured."
        );
      } catch (error) {
        console.error(
          "Toggle featured error:",
          error
        );

        toast.error(
          getApiErrorMessage(
            error,
            "Unable to update featured status"
          )
        );
      } finally {
        setProcessingId(null);
      }
    };

  /* ==========================================================
     DELETE
  ========================================================== */

  const confirmDelete =
    async () => {
      const id =
        accountToDelete?._id;

      if (!id) {
        return;
      }

      try {
        setDeleting(true);

        await deleteSocialMedia(
          id
        );

        setAccounts(
          (
            previous
          ) =>
            previous.filter(
              (
                account
              ) =>
                account._id !==
                id
            )
        );

        toast.success(
          "Social media account deleted."
        );

        setAccountToDelete(
          null
        );
      } catch (error) {
        console.error(
          "Delete social media error:",
          error
        );

        toast.error(
          getApiErrorMessage(
            error,
            "Unable to delete social media account"
          )
        );
      } finally {
        setDeleting(false);
      }
    };

  /* ==========================================================
     THUMBNAIL
  ========================================================== */

  const thumbnail =
    (
      account:
        SocialMedia
    ) =>
      account.image ? (
        <img
          src={account.image}
          alt={
            account.accountName
          }
          className="
            h-14
            w-14

            rounded-2xl

            border
            border-[#E75480]/10

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
          {getPlatformInitial(
            account.platform
          )}
        </div>
      );

  /* ==========================================================
     PLATFORM BADGE
  ========================================================== */

  const platformBadge =
    (
      account:
        SocialMedia
    ) => (
      <span
        className="
          inline-flex

          items-center
          gap-2

          rounded-full

          bg-[#FCE7EF]

          px-3
          py-1.5

          text-[10px]
          font-semibold
          uppercase
          tracking-[1px]

          text-[#E75480]
        "
      >
        <span
          className="
            flex

            h-5
            w-5

            items-center
            justify-center

            rounded-full

            bg-white

            font-serif
          "
        >
          {getPlatformInitial(
            account.platform
          )}
        </span>

        {account.platform}
      </span>
    );

  /* ==========================================================
     STATUS
  ========================================================== */

  const statusBadge =
    (
      account:
        SocialMedia
    ) => (
      <div
        className="
          flex
          flex-wrap
          gap-2
        "
      >
        <span
          className={`
            inline-flex
            items-center
            gap-1.5

            rounded-full

            px-3
            py-1.5

            text-[9px]
            font-semibold
            uppercase
            tracking-[1px]

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
          <span
            className={`
              h-1.5
              w-1.5

              rounded-full

              ${
                account.active
                  ? "bg-emerald-500"
                  : "bg-gray-400"
              }
            `}
          />

          {account.active
            ? "Active"
            : "Inactive"}
        </span>

        {account.featured && (
          <span
            className="
              inline-flex

              items-center

              rounded-full

              bg-[#FFF5F8]

              px-3
              py-1.5

              text-[9px]
              font-semibold
              uppercase
              tracking-[1px]

              text-[#E75480]
            "
          >
            ★ Featured
          </span>
        )}
      </div>
    );

  /* ==========================================================
     LINK
  ========================================================== */

  const renderLink =
    (
      account:
        SocialMedia
    ) => (
      <a
        href={account.url}
        target="_blank"
        rel="noreferrer"
        className="
          inline-flex

          items-center
          gap-1.5

          whitespace-nowrap

          text-xs
          font-medium

          text-[#E75480]

          transition

          hover:text-[#c93f69]
        "
      >
        Open

        <ExternalLink
          size={13}
        />
      </a>
    );

  /* ==========================================================
     ACTIONS
  ========================================================== */

  const renderActions =
    (
      account:
        SocialMedia
    ) => (
      <RowActionsMenu
        label={`Actions for ${account.accountName}`}
        busy={
          processingId ===
          account._id
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
                openEditForm(
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
                handleToggleFeatured(
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

            tone:
              account.active
                ? "default"
                : "success",

            onSelect:
              () =>
                handleToggleActive(
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
                setAccountToDelete(
                  account
                ),
          },
        ]}
      />
    );

  /* ==========================================================
     TABLE COLUMNS
  ========================================================== */

  const columns:
    TableColumn<SocialMedia>[] =
    [
      {
        key:
          "image",

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
        key:
          "account",

        header:
          "Account",

        render: (
          account
        ) => (
          <div>
            <p
              className="
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
        ),
      },

      {
        key:
          "platform",

        header:
          "Platform",

        hideOnMobile:
          true,

        render:
          platformBadge,
      },

      {
        key:
          "link",

        header:
          "Link",

        hideOnMobile:
          true,

        render:
          renderLink,
      },

      {
        key:
          "order",

        header:
          "Order",

        width:
          "80px",

        hideOnMobile:
          true,

        cellClassName:
          "font-medium text-[#8A6F78]",

        render: (
          account
        ) =>
          account.sortOrder ??
          0,
      },

      {
        key:
          "status",

        header:
          "Status",

        width:
          "210px",

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

  /* ==========================================================
     FILTER STATE
  ========================================================== */

  const filtersActive =
    Boolean(
      appliedSearch ||
        platformFilter ||
        statusFilter
    );

  /* ==========================================================
     STATS
  ========================================================== */

  const activeCount =
    accounts.filter(
      (account) =>
        account.active
    ).length;

  const featuredCount =
    accounts.filter(
      (account) =>
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
            accounts, links and
            featured profiles. You
            can create multiple
            accounts for the same
            platform.
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
            size={16}
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
          <p
            className="
              text-sm
              text-[#8A6F78]
            "
          >
            {accounts.length}{" "}
            account
            {accounts.length ===
            1
              ? ""
              : "s"}{" "}
            {filtersActive
              ? "found"
              : "in total"}
          </p>

          <div
            className="
              grid
              w-full

              gap-3

              sm:grid-cols-2

              xl:w-auto
              xl:grid-cols-[320px_190px_170px]
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
                size={16}
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
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search accounts..."
                className="
                  w-full

                  rounded-xl

                  border
                  border-[#E75480]/20

                  bg-[#FFF5F8]

                  py-3
                  pl-10
                  pr-4

                  text-sm

                  outline-none

                  transition

                  focus:border-[#E75480]
                "
              />
            </div>

            {/* PLATFORM FILTER */}

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
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <CustomTable
        className="mt-6"
        columns={columns}
        rows={accounts}
        rowKey={(account) =>
          account._id
        }
        loading={loading}
        loadingMessage="Loading social media accounts..."
        emptyIcon="◎"
        emptyTitle={
          filtersActive
            ? "No matching accounts"
            : "No social media accounts yet"
        }
        emptyMessage={
          filtersActive
            ? "Try a different search or filter."
            : "Add your first social media account using the button above."
        }
        minWidth="1050px"
        mobileTitle={(
          account
        ) => (
          <span
            className="
              flex
              items-center
              gap-3
            "
          >
            {
              thumbnail(
                account
              )
            }

            <span>
              {
                account.accountName
              }
            </span>
          </span>
        )}
        mobileSubtitle={(
          account
        ) =>
          `${account.platform}${
            account.username
              ? ` • ${account.username}`
              : ""
          }`
        }
        mobileActions={
          renderActions
        }
      />

      {/* =====================================================
          ADD / EDIT
      ===================================================== */}

      <DialogBox
        open={formOpen}
        onClose={
          closeForm
        }
        eyebrow="Social Media"
        title={
          editingId
            ? "Edit Account"
            : "Add Social Account"
        }
        description="Add a social profile to the website. Multiple profiles can belong to the same platform."
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

          {/* ACCOUNT NAME */}

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
              placeholder="e.g. @nirjarabeauty"
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

          {/* SORT */}

          <div>
            <label
              className={
                labelClass
              }
            >
              Sort Order
            </label>

            <input
              type="number"
              min={0}
              step={1}
              value={
                form.sortOrder
              }
              onChange={(
                event
              ) =>
                setForm({
                  ...form,

                  sortOrder:
                    Number(
                      event.target
                        .value
                    ),
                })
              }
              className={
                inputClass
              }
            />

            <p
              className="
                mt-2

                text-xs

                text-[#A98994]
              "
            >
              Lower numbers appear
              first.
            </p>
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

            <div
              className="
                relative
              "
            >
              <LinkIcon
                size={16}
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
              rows={3}
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

          {/* IMAGE UPLOAD */}

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
                size={18}
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

                  if (!file) {
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
                  alt="Social account preview"
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

                  <p
                    className="
                      mt-1

                      text-xs

                      text-[#8A6F78]
                    "
                  >
                    This can be used
                    as the account
                    image on the
                    public page.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    () =>
                      setForm({
                        ...form,

                        image: "",
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

                    transition

                    hover:bg-white
                  "
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE */}

          <div
            className="
              rounded-2xl

              border
              border-[#E75480]/10

              bg-[#FFF5F8]

              p-4
            "
          >
            <label
              className="
                flex

                cursor-pointer

                items-start
                gap-3
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
                  Show this account
                  on the public
                  website.
                </span>
              </span>
            </label>
          </div>

          {/* FEATURED */}

          <div
            className="
              rounded-2xl

              border
              border-[#E75480]/10

              bg-[#FFF5F8]

              p-4
            "
          >
            <label
              className="
                flex

                cursor-pointer

                items-start
                gap-3
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
                  Give this profile
                  extra prominence
                  on the Social
                  Media page.
                </span>
              </span>
            </label>
          </div>
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
          This account will no
          longer appear on the
          public Social Media page.
          This action cannot be
          undone.
        </p>
      </DialogBox>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
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
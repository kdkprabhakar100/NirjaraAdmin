import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FileText,
  Save,
  ShieldCheck,
  ScrollText,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  getLegalPage,
  updateLegalPage,
} from "../../services/legalpage/legalPages";

import { can } from "../../services/auth/authService";

import type {
  LegalPage,
  LegalPageSlug,
} from "../../types/legalPage";

// ========================================
// PAGE CONFIG
// ========================================

const pages: {
  slug: LegalPageSlug;
  label: string;
  description: string;
  icon: typeof ShieldCheck;
}[] = [
  {
    slug: "privacy-policy",
    label: "Privacy Policy",
    description:
      "Manage the privacy information displayed on the public website.",
    icon: ShieldCheck,
  },
  {
    slug: "terms",
    label: "Terms & Conditions",
    description:
      "Manage the terms and conditions displayed on the public website.",
    icon: ScrollText,
  },
];

// ========================================
// COMPONENT
// ========================================

export default function LegalPagesAdmin() {
  const [activeSlug, setActiveSlug] =
    useState<LegalPageSlug>("privacy-policy");

  const [page, setPage] =
    useState<LegalPage | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const canUpdate = can(
    "legalPages",
    "update"
  );

  // ========================================
  // LOAD PAGE
  // ========================================

  const loadPage = useCallback(
    async (slug: LegalPageSlug) => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getLegalPage(slug);

        setPage(data);
        setTitle(data.title || "");
        setContent(data.content || "");
      } catch (error) {
        console.error(error);

        setPage(null);

        setError(
          "Unable to load this legal page."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadPage(activeSlug);
  }, [activeSlug, loadPage]);

  // ========================================
  // CHANGE TAB
  // ========================================

  const handleTabChange = (
    slug: LegalPageSlug
  ) => {
    if (saving) return;

    setActiveSlug(slug);
  };

  // ========================================
  // SAVE
  // ========================================

  const handleSave = async () => {
    if (!canUpdate) {
      toast.error(
        "You do not have permission to update legal pages."
      );

      return;
    }

    if (!title.trim()) {
      toast.error(
        "Please enter a page title."
      );

      return;
    }

    if (!content.trim()) {
      toast.error(
        "Please enter page content."
      );

      return;
    }

    try {
      setSaving(true);

      const updated =
        await updateLegalPage(
          activeSlug,
          {
            title: title.trim(),
            content,
          }
        );

      setPage(updated);

      setTitle(updated.title);
      setContent(updated.content);

      toast.success(
        `${updated.title} updated successfully.`
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update legal page."
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // CURRENT PAGE CONFIG
  // ========================================

  const currentPage =
    pages.find(
      (item) =>
        item.slug === activeSlug
    ) || pages[0];

  const CurrentIcon =
    currentPage.icon;

  const hasChanges =
    Boolean(page) &&
    (title !== page?.title ||
      content !== page?.content);

  // ========================================
  // DATE
  // ========================================

  const updatedAt =
    page?.updatedAt
      ? new Date(
          page.updatedAt
        ).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : null;

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-h-full">
      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="mb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[4px] text-[#E75480]">
              CMS
            </p>

            <h1 className="font-serif text-4xl text-[#3A2A2F] sm:text-5xl">
              Legal Pages
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8A6F78]">
              Manage the Privacy Policy
              and Terms & Conditions
              displayed on the Nirjara
              Beauty website.
            </p>
          </div>

          {/* STATUS */}

          <div
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              border
              border-[#E75480]/10
              bg-white
              px-4
              py-2
              text-xs
              text-[#8A6F78]
              shadow-sm
            "
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            Website Content
          </div>
        </div>
      </div>

      {/* =====================================
          PAGE TABS
      ===================================== */}

      <div
        className="
          mb-6
          grid
          gap-3
          sm:grid-cols-2
        "
      >
        {pages.map((item) => {
          const Icon = item.icon;

          const active =
            activeSlug === item.slug;

          return (
            <button
              key={item.slug}
              type="button"
              onClick={() =>
                handleTabChange(
                  item.slug
                )
              }
              className={`
                group
                flex
                items-center
                gap-4
                rounded-2xl
                border
                p-4
                text-left
                transition-all
                duration-200

                ${
                  active
                    ? `
                      border-[#E75480]/30
                      bg-[#FFF4F7]
                      shadow-[0_8px_25px_rgba(231,84,128,0.08)]
                    `
                    : `
                      border-[#EADDE1]
                      bg-white
                      hover:border-[#E75480]/20
                      hover:bg-[#FFFAFB]
                    `
                }
              `}
            >
              <div
                className={`
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  transition

                  ${
                    active
                      ? "bg-[#E75480] text-white"
                      : "bg-[#FFF0F4] text-[#E75480]"
                  }
                `}
              >
                <Icon size={19} />
              </div>

              <div className="min-w-0">
                <p
                  className={`
                    text-sm
                    font-semibold

                    ${
                      active
                        ? "text-[#E75480]"
                        : "text-[#3A2A2F]"
                    }
                  `}
                >
                  {item.label}
                </p>

                <p className="mt-1 text-xs leading-5 text-[#9A7F88]">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* =====================================
          MAIN CARD
      ===================================== */}

      <div
        className="
          overflow-hidden
          rounded-[24px]
          border
          border-[#E75480]/10
          bg-white
          shadow-[0_8px_35px_rgba(58,42,47,0.04)]
        "
      >
        {/* CARD HEADER */}

        <div
          className="
            flex
            flex-col
            gap-4
            border-b
            border-[#F1E4E8]
            px-5
            py-5

            sm:px-6

            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-[#FFF0F4]
                text-[#E75480]
              "
            >
              <CurrentIcon size={18} />
            </div>

            <div>
              <h2 className="font-serif text-xl text-[#3A2A2F]">
                {currentPage.label}
              </h2>

              {updatedAt && (
                <p className="mt-1 text-[11px] text-[#A18A92]">
                  Last updated{" "}
                  {updatedAt}
                </p>
              )}
            </div>
          </div>

          {/* CHANGE STATUS */}

          {hasChanges && (
            <div
              className="
                flex
                w-fit
                items-center
                gap-2
                rounded-full
                bg-amber-50
                px-3
                py-1.5
                text-[11px]
                font-medium
                text-amber-700
              "
            >
              <AlertCircle size={13} />

              Unsaved changes
            </div>
          )}
        </div>

        {/* =====================================
            LOADING
        ===================================== */}

        {loading && (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="text-center">
              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-[#E75480]"
              />

              <p className="mt-4 text-sm text-[#8A6F78]">
                Loading{" "}
                {currentPage.label}...
              </p>
            </div>
          </div>
        )}

        {/* =====================================
            ERROR
        ===================================== */}

        {!loading && error && (
          <div className="flex min-h-[420px] items-center justify-center p-6">
            <div className="max-w-sm text-center">
              <div
                className="
                  mx-auto
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-red-50
                  text-red-500
                "
              >
                <AlertCircle
                  size={21}
                />
              </div>

              <h3 className="mt-4 font-serif text-xl text-[#3A2A2F]">
                Could not load page
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#8A6F78]">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  loadPage(
                    activeSlug
                  )
                }
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-[#E75480]/20
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  text-[#E75480]
                  transition
                  hover:bg-[#FFF4F7]
                "
              >
                <RefreshCw
                  size={14}
                />

                Try Again
              </button>
            </div>
          </div>
        )}

        {/* =====================================
            EDITOR
        ===================================== */}

        {!loading &&
          !error &&
          page && (
            <>
              <div className="space-y-6 p-5 sm:p-6 lg:p-8">
                {/* PAGE TITLE */}

                <div>
                  <label
                    htmlFor="legal-title"
                    className="
                      mb-2
                      block
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[2px]
                      text-[#8A6F78]
                    "
                  >
                    Page Title
                  </label>

                  <input
                    id="legal-title"
                    type="text"
                    value={title}
                    onChange={(e) =>
                      setTitle(
                        e.target.value
                      )
                    }
                    disabled={
                      !canUpdate
                    }
                    placeholder="Enter page title"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[#EADDE1]
                      bg-white
                      px-4
                      py-3
                      text-sm
                      text-[#3A2A2F]
                      outline-none
                      transition

                      placeholder:text-[#BCA8AF]

                      focus:border-[#E75480]/50
                      focus:ring-4
                      focus:ring-[#E75480]/5

                      disabled:cursor-not-allowed
                      disabled:bg-[#FAF7F8]
                      disabled:text-[#8A6F78]
                    "
                  />
                </div>

                {/* CONTENT */}

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label
                      htmlFor="legal-content"
                      className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[2px]
                        text-[#8A6F78]
                      "
                    >
                      Page Content
                    </label>

                    <span className="text-[10px] text-[#B19AA2]">
                      HTML supported
                    </span>
                  </div>

                  <textarea
                    id="legal-content"
                    value={content}
                    onChange={(e) =>
                      setContent(
                        e.target.value
                      )
                    }
                    disabled={
                      !canUpdate
                    }
                    placeholder="Write your legal page content..."
                    rows={18}
                    className="
                      min-h-[420px]
                      w-full
                      resize-y
                      rounded-xl
                      border
                      border-[#EADDE1]
                      bg-white
                      px-4
                      py-4
                      font-mono
                      text-[13px]
                      leading-7
                      text-[#59464D]
                      outline-none
                      transition

                      placeholder:text-[#BCA8AF]

                      focus:border-[#E75480]/50
                      focus:ring-4
                      focus:ring-[#E75480]/5

                      disabled:cursor-not-allowed
                      disabled:bg-[#FAF7F8]
                    "
                  />
                </div>

                {/* VIEW ONLY NOTICE */}

                {!canUpdate && (
                  <div
                    className="
                      flex
                      items-start
                      gap-3
                      rounded-xl
                      border
                      border-amber-200
                      bg-amber-50
                      p-4
                    "
                  >
                    <FileText
                      size={17}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        View-only access
                      </p>

                      <p className="mt-1 text-xs leading-5 text-amber-700">
                        Your role does not
                        have permission to
                        update legal pages.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* =================================
                  FOOTER ACTIONS
              ================================= */}

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  border-t
                  border-[#F1E4E8]
                  bg-[#FFFBFC]
                  px-5
                  py-4

                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  sm:px-6

                  lg:px-8
                "
              >
                <div className="flex items-center gap-2 text-xs text-[#9A7F88]">
                  {hasChanges ? (
                    <>
                      <AlertCircle
                        size={14}
                        className="text-amber-500"
                      />

                      You have unsaved
                      changes.
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        size={14}
                        className="text-emerald-500"
                      />

                      All changes saved.
                    </>
                  )}
                </div>

                {canUpdate && (
                  <button
                    type="button"
                    onClick={
                      handleSave
                    }
                    disabled={
                      saving ||
                      !hasChanges
                    }
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-[#E75480]
                      px-5
                      py-2.5
                      text-xs
                      font-semibold
                      text-white
                      shadow-[0_5px_18px_rgba(231,84,128,0.18)]
                      transition

                      hover:bg-[#D94B75]

                      disabled:cursor-not-allowed
                      disabled:opacity-50
                      disabled:shadow-none
                    "
                  >
                    {saving ? (
                      <>
                        <RefreshCw
                          size={15}
                          className="animate-spin"
                        />

                        Saving...
                      </>
                    ) : (
                      <>
                        <Save
                          size={15}
                        />

                        Save Changes
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
      </div>
    </div>
  );
}
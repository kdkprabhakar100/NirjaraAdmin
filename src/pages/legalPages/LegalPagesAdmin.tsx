import { useEffect, useState } from "react";
import {
  FileText,
  Save,
  ShieldCheck,
  ScrollText,
  Loader2,
} from "lucide-react";

type LegalPageSlug =
  | "privacy-policy"
  | "terms";

type LegalPage = {
  _id: string;
  title: string;
  slug: LegalPageSlug;
  content: string;
  createdAt: string;
  updatedAt: string;
};

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export default function LegalPagesAdmin() {
  const [activePage, setActivePage] =
    useState<LegalPageSlug>(
      "privacy-policy"
    );

  const [page, setPage] =
    useState<LegalPage | null>(null);

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ==========================================
     LOAD PAGE
  ========================================== */

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const response = await fetch(
          `${API_URL}/api/legal-pages/${activePage}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load legal page."
          );
        }

        const data: LegalPage =
          await response.json();

        setPage(data);
        setTitle(data.title || "");
        setContent(data.content || "");
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [activePage]);

  /* ==========================================
     SAVE PAGE
  ========================================== */

  const handleSave = async () => {
    if (!title.trim()) {
      setError(
        "Page title is required."
      );
      return;
    }

    if (!content.trim()) {
      setError(
        "Page content is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/legal-pages/${activePage}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },

          body: JSON.stringify({
            title,
            content,
          }),
        }
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to save legal page."
        );
      }

      setPage(data);
      setTitle(data.title || "");
      setContent(data.content || "");

      setSuccess(
        "Changes saved successfully."
      );

      window.setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save changes."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================
     DATE
  ========================================== */

  const updatedDate =
    page?.updatedAt
      ? new Date(
          page.updatedAt
        ).toLocaleString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }
        )
      : "";

  return (
    <div
      className="
        min-h-screen
        bg-[#FFF7FA]
        px-5
        py-8

        sm:px-7
        lg:px-8
      "
    >
      <div className="mx-auto max-w-7xl">

        {/* =====================================
            HEADER
        ===================================== */}

        <div
          className="
            flex
            flex-col
            gap-5

            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[4px]
                text-[#E75480]
              "
            >
              Website Content
            </p>

            <h1
              className="
                mt-2
                font-serif
                text-4xl
                text-[#3A2A2F]

                sm:text-5xl
              "
            >
              Legal Pages
            </h1>

            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-7
                text-[#8A6F78]
              "
            >
              Manage the Privacy Policy
              and Terms & Conditions
              displayed on the Nirjara
              Beauty website.
            </p>
          </div>

          {updatedDate && (
            <div
              className="
                rounded-full
                border
                border-[#E75480]/10
                bg-white
                px-5
                py-3
                text-xs
                text-[#8A6F78]
              "
            >
              Last updated{" "}
              <span className="font-medium text-[#3A2A2F]">
                {updatedDate}
              </span>
            </div>
          )}
        </div>

        {/* =====================================
            PAGE SELECTOR
        ===================================== */}

        <div
          className="
            mt-8
            grid
            max-w-2xl
            grid-cols-1
            gap-3

            sm:grid-cols-2
          "
        >
          <button
            type="button"
            onClick={() =>
              setActivePage(
                "privacy-policy"
              )
            }
            className={`
              flex
              items-center
              gap-4
              rounded-[20px]
              border
              p-5
              text-left
              transition-all
              duration-300

              ${
                activePage ===
                "privacy-policy"
                  ? `
                    border-[#E75480]
                    bg-[#E75480]
                    text-white
                    shadow-[0_10px_30px_rgba(231,84,128,0.20)]
                  `
                  : `
                    border-[#E75480]/10
                    bg-white
                    text-[#3A2A2F]
                    hover:border-[#E75480]/30
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
                rounded-full

                ${
                  activePage ===
                  "privacy-policy"
                    ? "bg-white/15"
                    : "bg-[#FCE7EF]"
                }
              `}
            >
              <ShieldCheck
                size={19}
                className={
                  activePage ===
                  "privacy-policy"
                    ? "text-white"
                    : "text-[#E75480]"
                }
              />
            </div>

            <div>
              <p className="font-medium">
                Privacy Policy
              </p>

              <p
                className={`
                  mt-1
                  text-xs

                  ${
                    activePage ===
                    "privacy-policy"
                      ? "text-white/70"
                      : "text-[#9A7F88]"
                  }
                `}
              >
                Privacy & data information
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setActivePage("terms")
            }
            className={`
              flex
              items-center
              gap-4
              rounded-[20px]
              border
              p-5
              text-left
              transition-all
              duration-300

              ${
                activePage === "terms"
                  ? `
                    border-[#E75480]
                    bg-[#E75480]
                    text-white
                    shadow-[0_10px_30px_rgba(231,84,128,0.20)]
                  `
                  : `
                    border-[#E75480]/10
                    bg-white
                    text-[#3A2A2F]
                    hover:border-[#E75480]/30
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
                rounded-full

                ${
                  activePage === "terms"
                    ? "bg-white/15"
                    : "bg-[#FCE7EF]"
                }
              `}
            >
              <ScrollText
                size={19}
                className={
                  activePage === "terms"
                    ? "text-white"
                    : "text-[#E75480]"
                }
              />
            </div>

            <div>
              <p className="font-medium">
                Terms & Conditions
              </p>

              <p
                className={`
                  mt-1
                  text-xs

                  ${
                    activePage ===
                    "terms"
                      ? "text-white/70"
                      : "text-[#9A7F88]"
                  }
                `}
              >
                Website terms of use
              </p>
            </div>
          </button>
        </div>

        {/* =====================================
            EDITOR CARD
        ===================================== */}

        <div
          className="
            mt-7
            overflow-hidden
            rounded-[26px]
            border
            border-[#E75480]/10
            bg-white
            shadow-[0_10px_40px_rgba(72,42,53,0.04)]
          "
        >

          {/* CARD HEADER */}

          <div
            className="
              flex
              items-center
              gap-3
              border-b
              border-[#E75480]/10
              px-6
              py-5

              sm:px-8
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-[#FCE7EF]
                text-[#E75480]
              "
            >
              <FileText size={18} />
            </div>

            <div>
              <h2
                className="
                  font-serif
                  text-xl
                  text-[#3A2A2F]
                "
              >
                {activePage ===
                "privacy-policy"
                  ? "Edit Privacy Policy"
                  : "Edit Terms & Conditions"}
              </h2>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-[#9A7F88]
                "
              >
                Changes will appear on
                the public website.
              </p>
            </div>
          </div>

          {/* BODY */}

          <div
            className="
              p-6
              sm:p-8
            "
          >
            {loading ? (
              <div
                className="
                  flex
                  min-h-[350px]
                  items-center
                  justify-center
                "
              >
                <div className="text-center">
                  <Loader2
                    className="
                      mx-auto
                      animate-spin
                      text-[#E75480]
                    "
                    size={30}
                  />

                  <p
                    className="
                      mt-3
                      text-sm
                      text-[#8A6F78]
                    "
                  >
                    Loading page...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* TITLE */}

                <div>
                  <label
                    className="
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
                    type="text"
                    value={title}
                    onChange={(event) =>
                      setTitle(
                        event.target.value
                      )
                    }
                    className="
                      mt-2
                      w-full
                      rounded-[14px]
                      border
                      border-[#E75480]/15
                      bg-[#FFF9FB]
                      px-5
                      py-4
                      text-sm
                      text-[#3A2A2F]
                      outline-none
                      transition

                      focus:border-[#E75480]/50
                      focus:bg-white
                    "
                  />
                </div>

                {/* CONTENT */}

                <div className="mt-6">
                  <label
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

                  <textarea
                    value={content}
                    onChange={(event) =>
                      setContent(
                        event.target.value
                      )
                    }
                    rows={16}
                    placeholder="Enter page content..."
                    className="
                      mt-2
                      min-h-[420px]
                      w-full
                      resize-y
                      rounded-[18px]
                      border
                      border-[#E75480]/15
                      bg-[#FFF9FB]
                      px-5
                      py-5
                      text-sm
                      leading-7
                      text-[#3A2A2F]
                      outline-none
                      transition

                      focus:border-[#E75480]/50
                      focus:bg-white
                    "
                  />
                </div>

                {/* ERROR */}

                {error && (
                  <div
                    className="
                      mt-5
                      rounded-[14px]
                      border
                      border-red-200
                      bg-red-50
                      px-4
                      py-3
                      text-sm
                      text-red-600
                    "
                  >
                    {error}
                  </div>
                )}

                {/* SUCCESS */}

                {success && (
                  <div
                    className="
                      mt-5
                      rounded-[14px]
                      border
                      border-green-200
                      bg-green-50
                      px-4
                      py-3
                      text-sm
                      text-green-700
                    "
                  >
                    {success}
                  </div>
                )}

                {/* SAVE */}

                <div
                  className="
                    mt-7
                    flex
                    flex-col
                    gap-4
                    border-t
                    border-[#E75480]/10
                    pt-6

                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <p
                    className="
                      text-xs
                      text-[#9A7F88]
                    "
                  >
                    Remember to save after
                    making changes.
                  </p>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-full
                      bg-[#E75480]
                      px-7
                      py-3.5
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[2px]
                      text-white
                      transition-all

                      hover:bg-[#D94873]

                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {saving ? (
                      <>
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />

                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={15} />

                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
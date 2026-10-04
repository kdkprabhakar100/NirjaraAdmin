import {
  useEffect,
  useState,
} from "react";

import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../../components/CustomTable";

import DialogBox from "../../../components/DialogBox";

import RowActionsMenu from "../../../components/RowActionsMenu";

import TiptapEditor from "../../../components/TiptapEditor";

import { uploadImage } from "../../../services/upload/uploadService";

import { FormLabel } from "../../../components/FormField";

/* =========================================================
   TYPES
========================================================= */

type BlogStatus =
  | "draft"
  | "published";

type Blog = {
  _id?: string;

  title: string;

  category: string;

  description: string;

  content: string;

  image?: string;

  readTime: string;

  /* Publishing */

  status: BlogStatus;

  author: string;

  publishedAt:
    | string
    | null;

  createdAt?: string;

  updatedAt?: string;

  /* SEO */

  seoTitle: string;

  seoDescription: string;

  seoKeywords: string[];
};

/* =========================================================
   EMPTY BLOG
========================================================= */

const emptyBlog: Blog = {
  title: "",

  category:
    "Beauty Tips",

  description: "",

  content: "",

  image: "",

  readTime:
    "5 min read",

  /* New blogs begin as drafts */

  status: "draft",

  author:
    "Nirjara Beauty",

  publishedAt: null,

  seoTitle: "",

  seoDescription: "",

  seoKeywords: [],
};

/* =========================================================
   AUTH
========================================================= */

const getAuthHeaders = () => ({
  "Content-Type":
    "application/json",

  Authorization: `Bearer ${localStorage.getItem(
    "adminToken",
  )}`,
});

/* =========================================================
   SHARED STYLES
========================================================= */

const inputClass = `
  w-full

  rounded-xl

  border
  border-[#E75480]/20

  bg-soft

  px-4
  py-3

  text-sm
  text-ink

  outline-none

  transition-all
  duration-200

  placeholder:text-muted/70

  focus:border-[#E75480]
  focus:bg-white
  focus:shadow-[0_0_0_3px_rgba(231,84,128,0.06)]

  disabled:cursor-not-allowed
  disabled:opacity-50
`;

/* =========================================================
   HELPERS
========================================================= */

/**
 * Tiptap can leave these values when the
 * editor has visually been emptied.
 */
const isEmptyContent = (
  content: string,
) => {
  if (!content) {
    return true;
  }

  const normalized =
    content
      .replace(/\s/g, "")
      .toLowerCase();

  return (
    normalized ===
      "<p></p>" ||
    normalized ===
      "<p><br></p>" ||
    normalized === ""
  );
};

/* =========================================================
   LOCAL DATETIME HELPERS
========================================================= */

/**
 * Converts an ISO date into the value expected
 * by <input type="datetime-local" />.
 */
const toDateTimeLocal = (
  value:
    | string
    | null
    | undefined,
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const pad = (
    number: number,
  ) =>
    String(number).padStart(
      2,
      "0",
    );

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1,
  )}-${pad(
    date.getDate(),
  )}T${pad(
    date.getHours(),
  )}:${pad(
    date.getMinutes(),
  )}`;
};

/**
 * Converts datetime-local value back to ISO.
 */
const fromDateTimeLocal = (
  value: string,
) => {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date.toISOString();
};

/* =========================================================
   DATE DISPLAY
========================================================= */

const formatDate = (
  value:
    | string
    | null
    | undefined,
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
};

/* =========================================================
   BLOG ADMIN
========================================================= */

export default function BlogAdmin() {
  const [
    blogs,
    setBlogs,
  ] = useState<Blog[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    form,
    setForm,
  ] =
    useState<Blog>(
      emptyBlog,
    );

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
    isUploading,
    setIsUploading,
  ] =
    useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  const [
    blogToDelete,
    setBlogToDelete,
  ] =
    useState<
      Blog | null
    >(null);

  const [
    deleting,
    setDeleting,
  ] =
    useState(false);

  /* =======================================================
     FETCH BLOGS
  ======================================================= */

const fetchBlogs = async () => {
  try {
    setLoading(true);

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/blogs/admin/all`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "adminToken",
          )}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error(
        "Failed to fetch blogs",
      );
    }

    const data =
      await res.json();

    const normalizedBlogs: Blog[] =
      Array.isArray(data)
        ? data.map(
            (blog) => ({
              ...blog,

              content:
                blog.content ||
                "",

              image:
                blog.image ||
                "",

              readTime:
                blog.readTime ||
                "5 min read",

              status:
                blog.status ===
                  "draft" ||
                blog.status ===
                  "published"
                  ? blog.status
                  : "published",

              author:
                blog.author ||
                "Nirjara Beauty",

              publishedAt:
                blog.publishedAt ||
                blog.createdAt ||
                null,

              seoTitle:
                blog.seoTitle ||
                "",

              seoDescription:
                blog.seoDescription ||
                "",

              seoKeywords:
                Array.isArray(
                  blog.seoKeywords,
                )
                  ? blog.seoKeywords
                  : [],
            }),
          )
        : [];

    setBlogs(
      normalizedBlogs,
    );
  } catch (error) {
    console.error(
      "Fetch blogs error:",
      error,
    );

    toast.error(
      "Failed to load blogs",
    );

    setBlogs([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchBlogs();
  }, []);

  /* =======================================================
     OPEN ADD FORM
  ======================================================= */

  const openAddForm =
    () => {
      setForm({
        ...emptyBlog,

        seoKeywords:
          [],
      });

      setEditingId(
        null,
      );

      setFormOpen(
        true,
      );
    };

  /* =======================================================
     OPEN EDIT FORM
  ======================================================= */

  const openEditForm = (
    blog: Blog,
  ) => {
    setForm({
      ...blog,

      content:
        blog.content ||
        "",

      image:
        blog.image ||
        "",

      readTime:
        blog.readTime ||
        "5 min read",

      status:
        blog.status ||
        "published",

      author:
        blog.author ||
        "Nirjara Beauty",

      publishedAt:
        blog.publishedAt ||
        null,

      seoTitle:
        blog.seoTitle ||
        "",

      seoDescription:
        blog.seoDescription ||
        "",

      seoKeywords:
        Array.isArray(
          blog.seoKeywords,
        )
          ? blog.seoKeywords
          : [],
    });

    setEditingId(
      blog._id ||
        null,
    );

    setFormOpen(
      true,
    );
  };

  /* =======================================================
     CLOSE FORM
  ======================================================= */

  const closeForm =
    () => {
      if (
        isSubmitting ||
        isUploading
      ) {
        return;
      }

      setFormOpen(
        false,
      );

      setForm({
        ...emptyBlog,

        seoKeywords:
          [],
      });

      setEditingId(
        null,
      );
    };

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  const handleImageUpload =
    async (
      file: File,
    ) => {
      try {
        setIsUploading(
          true,
        );

        return await uploadImage(
          file,
        );
      } catch (error) {
        console.error(
          "Upload error:",
          error,
        );

        toast.error(
          error instanceof
            Error
            ? error.message
            : "Image upload failed",
        );

        return null;
      } finally {
        setIsUploading(
          false,
        );
      }
    };

  /* =======================================================
     CHANGE PUBLICATION STATUS
  ======================================================= */

  const setBlogStatus = (
    status: BlogStatus,
  ) => {
    setForm(
      (
        previous,
      ) => ({
        ...previous,

        status,

        publishedAt:
          status ===
          "published"
            ? previous.publishedAt ||
              new Date().toISOString()
            : null,
      }),
    );
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit =
    async () => {
      /* -----------------------------------------
         Draft validation

         Drafts intentionally allow incomplete
         articles. Only a title is required.
      ----------------------------------------- */

      if (
        !form.title.trim()
      ) {
        toast.error(
          "Please enter a blog title.",
        );

        return;
      }

      /* -----------------------------------------
         Published validation
      ----------------------------------------- */

      if (
        form.status ===
        "published"
      ) {
        if (
          !form.category.trim()
        ) {
          toast.error(
            "Please enter a category before publishing.",
          );

          return;
        }

        if (
          !form.description.trim()
        ) {
          toast.error(
            "Please add a short description before publishing.",
          );

          return;
        }

        if (
          isEmptyContent(
            form.content,
          )
        ) {
          toast.error(
            "Please add the full blog content before publishing.",
          );

          return;
        }
      }

      /* -----------------------------------------
         CLEAN SEO KEYWORDS
      ----------------------------------------- */

      const cleanedKeywords =
        form.seoKeywords
          .map(
            (
              keyword,
            ) =>
              keyword.trim(),
          )
          .filter(
            Boolean,
          );

      /* -----------------------------------------
         PAYLOAD
      ----------------------------------------- */

      const payload: Blog =
        {
          ...form,

          title:
            form.title.trim(),

          category:
            form.category.trim(),

          description:
            form.description.trim(),

          content:
            form.content,

          readTime:
            form.readTime.trim() ||
            "5 min read",

          status:
            form.status,

          author:
            form.author.trim() ||
            "Nirjara Beauty",

          publishedAt:
            form.status ===
            "published"
              ? form.publishedAt ||
                new Date().toISOString()
              : null,

          seoTitle:
            form.seoTitle.trim(),

          seoDescription:
            form.seoDescription.trim(),

          seoKeywords:
            cleanedKeywords,
        };

      try {
        setIsSubmitting(
          true,
        );

        const url =
          editingId
            ? `${
                import.meta
                  .env
                  .VITE_API_URL
              }/api/blogs/${editingId}`
            : `${
                import.meta
                  .env
                  .VITE_API_URL
              }/api/blogs`;

        const res =
          await fetch(
            url,
            {
              method:
                editingId
                  ? "PUT"
                  : "POST",

              headers:
                getAuthHeaders(),

              body:
                JSON.stringify(
                  payload,
                ),
            },
          );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
              `Failed to ${
                editingId
                  ? "update"
                  : "add"
              } blog`,
          );
        }

        await fetchBlogs();

if (
  data.status ===
  "published"
) {
  toast.success(
    editingId
      ? "Blog updated and published!"
      : "Blog published successfully!",
  );
} else {
  toast.success(
    editingId
      ? "Draft updated successfully!"
      : "Draft saved successfully!",
  );
}
        setFormOpen(
          false,
        );

        setForm({
          ...emptyBlog,

          seoKeywords:
            [],
        });

        setEditingId(
          null,
        );
      } catch (error) {
        console.error(
          "Save blog error:",
          error,
        );

        toast.error(
          error instanceof
            Error
            ? error.message
            : "Something went wrong while saving the blog.",
        );
      } finally {
        setIsSubmitting(
          false,
        );
      }
    };

  /* =======================================================
     DELETE
  ======================================================= */

  const confirmDelete =
    async () => {
      if (
        !blogToDelete?._id
      ) {
        return;
      }

      const id =
        blogToDelete._id;

      try {
        setDeleting(
          true,
        );

        const res =
          await fetch(
            `${
              import.meta
                .env
                .VITE_API_URL
            }/api/blogs/${id}`,
            {
              method:
                "DELETE",

              headers: {
                Authorization: `Bearer ${localStorage.getItem(
                  "adminToken",
                )}`,
              },
            },
          );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
              "Failed to delete blog",
          );
        }

        if (
          editingId ===
          id
        ) {
          setFormOpen(
            false,
          );

          setEditingId(
            null,
          );
        }

        await fetchBlogs();

        toast.success(
          "Blog deleted successfully!",
        );

        setBlogToDelete(
          null,
        );
      } catch (error) {
        console.error(
          "Delete blog error:",
          error,
        );

        toast.error(
          error instanceof
            Error
            ? error.message
            : "Something went wrong while deleting the blog.",
        );
      } finally {
        setDeleting(
          false,
        );
      }
    };

  /* =======================================================
     TABLE HELPERS
  ======================================================= */

  const thumbnail = (
    blog: Blog,
  ) =>
    blog.image ? (
      <img
        src={blog.image}
        alt={blog.title}
        className="
          h-14
          w-20
          rounded-xl
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
          w-20
          items-center
          justify-center

          rounded-xl

          border
          border-[#E75480]/10

          bg-soft

          text-lg
          text-[#E75480]
        "
      >
        ✎
      </div>
    );

  /* =======================================================
     STATUS BADGE
  ======================================================= */

  const statusBadge = (
    blog: Blog,
  ) => (
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
        tracking-[0.1em]

        ${
          blog.status ===
          "published"
            ? `
              bg-emerald-50
              text-emerald-700
            `
            : `
              bg-amber-50
              text-amber-700
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
            blog.status ===
            "published"
              ? "bg-emerald-500"
              : "bg-amber-500"
          }
        `}
      />

      {blog.status ===
      "published"
        ? "Published"
        : "Draft"}
    </span>
  );

  /* =======================================================
     ROW ACTIONS
  ======================================================= */

  const renderActions = (
    blog: Blog,
  ) => (
    <RowActionsMenu
      label={`Actions for ${blog.title}`}
      actions={[
        {
          key: "edit",

          label: "Edit",

          icon: "✎",

          onSelect:
            () =>
              openEditForm(
                blog,
              ),
        },

        {
          key: "delete",

          label:
            "Delete",

          icon: "🗑",

          tone: "danger",

          dividerBefore:
            true,

          onSelect:
            () =>
              setBlogToDelete(
                blog,
              ),
        },
      ]}
    />
  );

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns: TableColumn<Blog>[] =
    [
      {
        key: "image",

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
        key: "title",

        header:
          "Title",

        hideOnMobile:
          true,

        cellClassName:
          "font-medium text-ink",

        render: (
          blog,
        ) =>
          blog.title,
      },

      {
        key: "category",

        header:
          "Category",

        hideOnMobile:
          true,

        render: (
          blog,
        ) => (
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
            {blog.category ||
              "Uncategorized"}
          </span>
        ),
      },

      {
        key: "status",

        header:
          "Status",

        width:
          "130px",

        render:
          statusBadge,
      },

      {
        key: "publishedAt",

        header:
          "Published",

        width:
          "130px",

        hideOnMobile:
          true,

        render: (
          blog,
        ) =>
          blog.status ===
          "published"
            ? formatDate(
                blog.publishedAt,
              )
            : "—",
      },

      {
        key: "readTime",

        header:
          "Read Time",

        cellClassName:
          "whitespace-nowrap",

        render: (
          blog,
        ) =>
          blog.readTime,
      },

      {
        key: "description",

        header:
          "Description",

        cellClassName:
          "max-w-sm",

        hideOnMobile:
          true,

        render: (
          blog,
        ) => (
          <p
            className="
              line-clamp-2
              leading-6
            "
          >
            {blog.description ||
              "No description yet."}
          </p>
        ),
      },

      {
        key: "actions",

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
     BUTTON LABEL
  ======================================================= */

  const confirmLabel =
    form.status ===
    "published"
      ? editingId
        ? "Update & Publish"
        : "Publish Blog"
      : "Save Draft";

  const submittingLabel =
    form.status ===
    "published"
      ? "Publishing..."
      : "Saving Draft...";

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
            Blogs
          </h1>

          <p
            className="
              mt-2
              max-w-xl
              text-muted
            "
          >
            Create, edit,
            draft and publish
            articles for your
            website.
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

            px-7
            py-3

            text-[10px]
            font-semibold
            uppercase
            tracking-[2px]

            text-white

            shadow-[0_5px_18px_rgba(231,84,128,0.18)]

            transition-all
            duration-200

            hover:-translate-y-[1px]
            hover:bg-[#d94873]

            active:translate-y-0
          "
        >
          + New Blog
        </button>
      </div>

      {/* ===================================================
          SMALL SUMMARY
      =================================================== */}

      {!loading &&
        blogs.length >
          0 && (
          <div
            className="
              mt-7

              flex
              flex-wrap
              gap-2
            "
          >
            <span
              className="
                rounded-full

                border
                border-[#E75480]/10

                bg-white

                px-3
                py-1.5

                text-[10px]
                text-muted
              "
            >
              {blogs.length}{" "}
              total
            </span>

            <span
              className="
                rounded-full

                bg-emerald-50

                px-3
                py-1.5

                text-[10px]
                text-emerald-700
              "
            >
              {
                blogs.filter(
                  (
                    blog,
                  ) =>
                    blog.status ===
                    "published",
                ).length
              }{" "}
              published
            </span>

            <span
              className="
                rounded-full

                bg-amber-50

                px-3
                py-1.5

                text-[10px]
                text-amber-700
              "
            >
              {
                blogs.filter(
                  (
                    blog,
                  ) =>
                    blog.status ===
                    "draft",
                ).length
              }{" "}
              drafts
            </span>
          </div>
        )}

      {/* ===================================================
          TABLE
      =================================================== */}

      <CustomTable
        className="mt-7"
        columns={
          columns
        }
        rows={blogs}
        rowKey={(
          blog,
          index,
        ) =>
          blog._id ??
          String(index)
        }
        loading={
          loading
        }
        loadingMessage="Loading blogs..."
        emptyIcon="✎"
        emptyTitle="No blogs yet"
        emptyMessage="Create your first article using the New Blog button."
        minWidth="1180px"
        mobileTitle={(
          blog,
        ) => (
          <span
            className="
              flex
              items-center
              gap-3
            "
          >
            {thumbnail(
              blog,
            )}

            <span
              className="
                line-clamp-2
              "
            >
              {blog.title}
            </span>
          </span>
        )}
        mobileSubtitle={(
          blog,
        ) =>
          `${blog.category || "Uncategorized"} • ${
            blog.status ===
            "published"
              ? "Published"
              : "Draft"
          }`
        }
        mobileActions={
          renderActions
        }
      />

      {/* ===================================================
          ADD / EDIT BLOG
      =================================================== */}

      <DialogBox
        open={formOpen}
        onClose={
          closeForm
        }
        eyebrow={
          editingId
            ? "Edit Article"
            : "Create Article"
        }
        title={
          editingId
            ? form.title ||
              "Edit Blog"
            : "New Blog Post"
        }
        size="xl"
        onSubmit={
          handleSubmit
        }
        submitting={
          isSubmitting
        }
        submittingLabel={
          submittingLabel
        }
        confirmLabel={
          confirmLabel
        }
        confirmDisabled={
          isUploading
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
          {/* ===============================================
              BLOG DETAILS HEADER
          =============================================== */}

          <div
            className="
              md:col-span-2
            "
          >
            <p
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.22em]
                text-[#E75480]
              "
            >
              Blog Details
            </p>

            <h3
              className="
                mt-1

                font-serif
                text-xl

                text-ink
              "
            >
              Article Information
            </h3>

            <p
              className="
                mt-1

                text-xs
                leading-5

                text-muted
              "
            >
              Add the basic
              information readers
              will see with the
              article.
            </p>
          </div>

          {/* ===============================================
              BLOG TITLE
          =============================================== */}

          <div>
            <FormLabel
              label="Blog Title"
              required
            />

            <input
              type="text"
              placeholder="Enter blog title"
              value={
                form.title
              }
              onChange={(
                event,
              ) =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    title:
                      event
                        .target
                        .value,
                  }),
                )
              }
              className={
                inputClass
              }
            />

            <p
              className="
                mt-1.5
                text-[10px]
                text-muted
              "
            >
              Required even for a
              draft.
            </p>
          </div>

          {/* ===============================================
              CATEGORY
          =============================================== */}

          <div>
            <FormLabel
              label="Category"
            />

            <input
              type="text"
              placeholder="Example: Skincare"
              value={
                form.category
              }
              onChange={(
                event,
              ) =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    category:
                      event
                        .target
                        .value,
                  }),
                )
              }
              className={
                inputClass
              }
            />
          </div>

          {/* ===============================================
              READ TIME
          =============================================== */}

          <div>
            <FormLabel
              label="Read Time"
            />

            <input
              type="text"
              placeholder="Example: 5 min read"
              value={
                form.readTime
              }
              onChange={(
                event,
              ) =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    readTime:
                      event
                        .target
                        .value,
                  }),
                )
              }
              className={
                inputClass
              }
            />
          </div>

          {/* ===============================================
              AUTHOR
          =============================================== */}

          <div>
            <FormLabel
              label="Author"
            />

            <input
              type="text"
              placeholder="Nirjara Beauty"
              value={
                form.author
              }
              onChange={(
                event,
              ) =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    author:
                      event
                        .target
                        .value,
                  }),
                )
              }
              className={
                inputClass
              }
            />
          </div>

          {/* ===============================================
              PUBLISHING SETTINGS
          =============================================== */}

          <div
            className="
              md:col-span-2

              rounded-2xl

              border
              border-[#E75480]/15

              bg-[#FFF9FB]

              p-5

              md:p-6
            "
          >
            {/* HEADER */}

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
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-[#E75480]
                  "
                >
                  Publishing
                </p>

                <h3
                  className="
                    mt-1

                    font-serif
                    text-xl

                    text-ink
                  "
                >
                  Publication
                  Settings
                </h3>

                <p
                  className="
                    mt-1

                    max-w-lg

                    text-xs
                    leading-5

                    text-muted
                  "
                >
                  Save privately
                  while working, or
                  publish the
                  completed article
                  to your website.
                </p>
              </div>

              {/* CURRENT STATUS */}

              <span
                className={`
                  inline-flex
                  items-center
                  gap-2

                  rounded-full

                  px-3
                  py-1.5

                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]

                  ${
                    form.status ===
                    "published"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }
                `}
              >
                <span
                  className={`
                    h-1.5
                    w-1.5
                    rounded-full

                    ${
                      form.status ===
                      "published"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }
                  `}
                />

                {form.status}
              </span>
            </div>

            {/* STATUS CARDS */}

            <div
              className="
                mt-5

                grid
                gap-3

                sm:grid-cols-2
              "
            >
              {/* DRAFT */}

              <button
                type="button"
                onClick={() =>
                  setBlogStatus(
                    "draft",
                  )
                }
                className={`
                  rounded-xl

                  border

                  p-4

                  text-left

                  transition-all
                  duration-200

                  ${
                    form.status ===
                    "draft"
                      ? `
                        border-amber-300
                        bg-amber-50/60
                        shadow-[0_4px_14px_rgba(180,120,20,0.05)]
                      `
                      : `
                        border-[#E8D9DE]
                        bg-white

                        hover:border-[#E75480]/30
                        hover:bg-[#FFFDFE]
                      `
                  }
                `}
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2.5
                  "
                >
                  <span
                    className={`
                      flex
                      h-4
                      w-4
                      items-center
                      justify-center

                      rounded-full

                      border

                      ${
                        form.status ===
                        "draft"
                          ? "border-amber-500"
                          : "border-[#C9B7BD]"
                      }
                    `}
                  >
                    {form.status ===
                      "draft" && (
                      <span
                        className="
                          h-2
                          w-2
                          rounded-full
                          bg-amber-500
                        "
                      />
                    )}
                  </span>

                  <span
                    className="
                      text-sm
                      font-semibold
                      text-ink
                    "
                  >
                    Draft
                  </span>
                </div>

                <p
                  className="
                    mt-2
                    pl-[26px]

                    text-xs
                    leading-5

                    text-muted
                  "
                >
                  Keep this article
                  private while you
                  are still working
                  on it.
                </p>
              </button>

              {/* PUBLISHED */}

              <button
                type="button"
                onClick={() =>
                  setBlogStatus(
                    "published",
                  )
                }
                className={`
                  rounded-xl

                  border

                  p-4

                  text-left

                  transition-all
                  duration-200

                  ${
                    form.status ===
                    "published"
                      ? `
                        border-emerald-300
                        bg-emerald-50/60
                        shadow-[0_4px_14px_rgba(20,140,90,0.05)]
                      `
                      : `
                        border-[#E8D9DE]
                        bg-white

                        hover:border-[#E75480]/30
                        hover:bg-[#FFFDFE]
                      `
                  }
                `}
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2.5
                  "
                >
                  <span
                    className={`
                      flex
                      h-4
                      w-4
                      items-center
                      justify-center

                      rounded-full

                      border

                      ${
                        form.status ===
                        "published"
                          ? "border-emerald-500"
                          : "border-[#C9B7BD]"
                      }
                    `}
                  >
                    {form.status ===
                      "published" && (
                      <span
                        className="
                          h-2
                          w-2
                          rounded-full
                          bg-emerald-500
                        "
                      />
                    )}
                  </span>

                  <span
                    className="
                      text-sm
                      font-semibold
                      text-ink
                    "
                  >
                    Published
                  </span>
                </div>

                <p
                  className="
                    mt-2
                    pl-[26px]

                    text-xs
                    leading-5

                    text-muted
                  "
                >
                  Make the finished
                  article available
                  to website
                  visitors.
                </p>
              </button>
            </div>

            {/* PUBLICATION DATE */}

            <div
              className="
                mt-5

                border-t
                border-[#E8D9DE]

                pt-5
              "
            >
              <div
                className="
                  max-w-md
                "
              >
                <FormLabel
                  label="Published At"
                />

                <input
                  type="datetime-local"
                  disabled={
                    form.status ===
                    "draft"
                  }
                  value={toDateTimeLocal(
                    form.publishedAt,
                  )}
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (
                        previous,
                      ) => ({
                        ...previous,

                        publishedAt:
                          fromDateTimeLocal(
                            event
                              .target
                              .value,
                          ),
                      }),
                    )
                  }
                  className={
                    inputClass
                  }
                />

                <p
                  className="
                    mt-2
                    text-[10px]
                    leading-4
                    text-muted
                  "
                >
                  When publishing,
                  this automatically
                  uses the current
                  time unless you
                  choose another
                  date.
                </p>
              </div>
            </div>
          </div>

          {/* ===============================================
              FEATURED IMAGE
          =============================================== */}

          <div
            className="
              md:col-span-2
            "
          >
            <div
              className="
                mb-3
              "
            >
              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                  text-[#E75480]
                "
              >
                Media
              </p>

              <h3
                className="
                  mt-1

                  font-serif
                  text-xl

                  text-ink
                "
              >
                Featured Image
              </h3>
            </div>

            <div
              className="
                grid
                gap-4

                sm:grid-cols-[180px_1fr]
                sm:items-center
              "
            >
              {/* PREVIEW */}

              <div
                className="
                  aspect-[16/10]

                  overflow-hidden

                  rounded-xl

                  border
                  border-[#E75480]/15

                  bg-soft
                "
              >
                {form.image ? (
                  <img
                    src={
                      form.image
                    }
                    alt="Blog preview"
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-full
                      items-center
                      justify-center

                      text-center

                      text-[10px]
                      uppercase
                      tracking-[0.14em]

                      text-muted
                    "
                  >
                    No image
                  </div>
                )}
              </div>

              {/* UPLOAD */}

              <div>
                <FormLabel
                  label="Upload Image"
                />

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  disabled={
                    isUploading
                  }
                  onChange={async (
                    event,
                  ) => {
                    const file =
                      event
                        .target
                        .files?.[0];

                    if (!file) {
                      return;
                    }

                    const imageUrl =
                      await handleImageUpload(
                        file,
                      );

                    if (
                      imageUrl
                    ) {
                      setForm(
                        (
                          previous,
                        ) => ({
                          ...previous,

                          image:
                            imageUrl,
                        }),
                      );
                    }

                    event.target.value =
                      "";
                  }}
                  className={`
                    ${inputClass}

                    file:mr-3
                    file:rounded-full
                    file:border-0
                    file:bg-blush
                    file:px-4
                    file:py-2
                    file:text-xs
                    file:text-[#E75480]
                  `}
                />

                {isUploading && (
                  <p
                    className="
                      mt-2
                      text-xs
                      text-[#E75480]
                    "
                  >
                    Uploading
                    image...
                  </p>
                )}

                {form.image &&
                  !isUploading && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm(
                          (
                            previous,
                          ) => ({
                            ...previous,

                            image:
                              "",
                          }),
                        )
                      }
                      className="
                        mt-2

                        text-[10px]
                        font-medium

                        text-red-500

                        transition

                        hover:text-red-600
                      "
                    >
                      Remove image
                    </button>
                  )}
              </div>
            </div>
          </div>

          {/* ===============================================
              SHORT DESCRIPTION
          =============================================== */}

          <div
            className="
              md:col-span-2
            "
          >
            <FormLabel
              label="Short Description"
            />

            <textarea
              placeholder="Write a short summary for blog cards and previews..."
              value={
                form.description
              }
              onChange={(
                event,
              ) =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    description:
                      event
                        .target
                        .value,
                  }),
                )
              }
              rows={3}
              className={`
                ${inputClass}

                resize-y
              `}
            />

            <div
              className="
                mt-1.5

                flex
                items-center
                justify-between

                text-[10px]
                text-muted
              "
            >
              <span>
                Keep this concise
                and useful.
              </span>

              <span>
                {
                  form
                    .description
                    .length
                }{" "}
                characters
              </span>
            </div>
          </div>

          {/* ===============================================
              CONTENT
          =============================================== */}

          <div
            className="
              mt-2
              md:col-span-2
            "
          >
            <div
              className="
                mb-3
              "
            >
              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                  text-[#E75480]
                "
              >
                Content
              </p>

              <h3
                className="
                  mt-1

                  font-serif
                  text-xl

                  text-ink
                "
              >
                Full Blog Content
              </h3>

              <p
                className="
                  mt-1

                  text-xs
                  leading-5

                  text-muted
                "
              >
                Use Visual mode
                for normal editing
                or Source mode to
                edit the raw HTML.
              </p>
            </div>

            <TiptapEditor
              value={
                form.content
              }
              onChange={(
                html,
              ) =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    content:
                      html,
                  }),
                )
              }
            />
          </div>

          {/* ===============================================
              SEO SETTINGS
          =============================================== */}

          <div
            className="
              mt-3
              md:col-span-2
            "
          >
            <div
              className="
                rounded-2xl

                border
                border-[#E75480]/15

                bg-[#fff8fa]

                p-5

                md:p-6
              "
            >
              {/* SEO HEADER */}

              <div
                className="
                  mb-6
                "
              >
                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-[#E75480]
                  "
                >
                  Search Engine
                  Optimization
                </p>

                <h3
                  className="
                    mt-1

                    font-serif
                    text-xl

                    text-ink
                  "
                >
                  SEO Settings
                </h3>

                <p
                  className="
                    mt-1

                    max-w-2xl

                    text-xs
                    leading-5

                    text-muted
                  "
                >
                  Customize how
                  this blog may
                  appear in search
                  results. These
                  fields are
                  optional.
                </p>
              </div>

              <div
                className="
                  grid
                  gap-5
                "
              >
                {/* SEO TITLE */}

                <div>
                  <div
                    className="
                      mb-1

                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >
                    <FormLabel
                      label="SEO Title"
                    />

                    <span
                      className={`
                        text-xs

                        ${
                          form
                            .seoTitle
                            .length >
                          60
                            ? "text-red-500"
                            : "text-muted"
                        }
                      `}
                    >
                      {
                        form
                          .seoTitle
                          .length
                      }
                      /60
                    </span>
                  </div>

                  <input
                    type="text"
                    maxLength={
                      100
                    }
                    placeholder="Example: Glass Skin Routine in Nepal | Nirjara Beauty"
                    value={
                      form.seoTitle
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          previous,
                        ) => ({
                          ...previous,

                          seoTitle:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    className={
                      inputClass
                    }
                  />

                  <p
                    className="
                      mt-2
                      text-xs
                      leading-5
                      text-muted
                    "
                  >
                    Recommended:
                    approximately
                    50–60
                    characters.
                  </p>
                </div>

                {/* SEO DESCRIPTION */}

                <div>
                  <div
                    className="
                      mb-1

                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >
                    <FormLabel
                      label="SEO Description"
                    />

                    <span
                      className={`
                        text-xs

                        ${
                          form
                            .seoDescription
                            .length >
                          160
                            ? "text-red-500"
                            : "text-muted"
                        }
                      `}
                    >
                      {
                        form
                          .seoDescription
                          .length
                      }
                      /160
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    maxLength={
                      300
                    }
                    placeholder="Write a concise description of this blog for search engines..."
                    value={
                      form.seoDescription
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          previous,
                        ) => ({
                          ...previous,

                          seoDescription:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    className={`
                      ${inputClass}

                      resize-y
                    `}
                  />

                  <p
                    className="
                      mt-2
                      text-xs
                      leading-5
                      text-muted
                    "
                  >
                    Recommended:
                    approximately
                    140–160
                    characters.
                  </p>
                </div>

                {/* SEO KEYWORDS */}

                <div>
                  <FormLabel
                    label="SEO Keywords"
                  />

                  <input
                    type="text"
                    placeholder="glass skin Nepal, skincare Nepal, beauty tips Nepal"
                    value={form.seoKeywords.join(
                      ", ",
                    )}
                    onChange={(
                      event,
                    ) => {
                      const keywords =
                        event.target.value
                          .split(
                            ",",
                          )
                          .map(
                            (
                              keyword,
                            ) =>
                              keyword.trimStart(),
                          );

                      setForm(
                        (
                          previous,
                        ) => ({
                          ...previous,

                          seoKeywords:
                            keywords,
                        }),
                      );
                    }}
                    onBlur={() =>
                      setForm(
                        (
                          previous,
                        ) => ({
                          ...previous,

                          seoKeywords:
                            previous.seoKeywords
                              .map(
                                (
                                  keyword,
                                ) =>
                                  keyword.trim(),
                              )
                              .filter(
                                Boolean,
                              ),
                        }),
                      )
                    }
                    className={
                      inputClass
                    }
                  />

                  <p
                    className="
                      mt-2
                      text-xs
                      leading-5
                      text-muted
                    "
                  >
                    Separate
                    keywords using
                    commas.
                  </p>
                </div>

                {/* =========================================
                    GOOGLE STYLE PREVIEW
                ========================================= */}

                <div
                  className="
                    mt-1

                    rounded-xl

                    border
                    border-[#E8D9DE]

                    bg-white

                    p-4

                    shadow-[0_3px_12px_rgba(58,42,47,0.025)]
                  "
                >
                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-[#C77A95]
                    "
                  >
                    Search Preview
                  </p>

                  <p
                    className="
                      mt-3

                      text-[11px]

                      text-[#4D5156]
                    "
                  >
                    nirjarabeauty.com
                    › blogs
                  </p>

                  <p
                    className="
                      mt-1

                      text-[18px]
                      leading-6

                      text-[#1a0dab]
                    "
                  >
                    {form.seoTitle.trim() ||
                      form.title.trim() ||
                      "Your blog title"}
                  </p>

                  <p
                    className="
                      mt-1

                      max-w-3xl

                      text-[12px]
                      leading-5

                      text-[#4D5156]
                    "
                  >
                    {form.seoDescription.trim() ||
                      form.description.trim() ||
                      "Your blog description will appear here."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================
              PUBLICATION REMINDER
          =============================================== */}

          <div
            className="
              md:col-span-2

              rounded-xl

              border
              border-[#E8D9DE]

              bg-white

              px-4
              py-3
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <span
                className={`
                  mt-0.5
                  h-2
                  w-2
                  shrink-0
                  rounded-full

                  ${
                    form.status ===
                    "published"
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }
                `}
              />

              <div>
                <p
                  className="
                    text-xs
                    font-semibold
                    text-ink
                  "
                >
                  {form.status ===
                  "published"
                    ? "This article will be published."
                    : "This article will remain a draft."}
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    leading-4
                    text-muted
                  "
                >
                  {form.status ===
                  "published"
                    ? "Make sure the content, featured image and SEO information are ready before publishing."
                    : "You can save an incomplete draft and return to finish it later."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogBox>

      {/* ===================================================
          DELETE CONFIRMATION
      =================================================== */}

      <DialogBox
        open={
          Boolean(
            blogToDelete,
          )
        }
        onClose={() => {
          if (
            deleting
          ) {
            return;
          }

          setBlogToDelete(
            null,
          );
        }}
        eyebrow="Delete Blog"
        title="Delete this article?"
        size="sm"
        onSubmit={
          confirmDelete
        }
        submitting={
          deleting
        }
        submittingLabel="Deleting..."
        confirmLabel="Delete Blog"
        closeOnBackdrop={
          false
        }
      >
        <div
          className="
            rounded-xl

            border
            border-red-100

            bg-red-50/50

            p-4
          "
        >
          <p
            className="
              text-sm
              leading-6
              text-ink
            "
          >
            Are you sure
            you want to
            permanently
            delete{" "}
            <strong>
              {blogToDelete?.title}
            </strong>
            ?
          </p>

          <p
            className="
              mt-2
              text-xs
              leading-5
              text-muted
            "
          >
            This action
            cannot be
            undone.
          </p>
        </div>
      </DialogBox>
    </div>
  );
}
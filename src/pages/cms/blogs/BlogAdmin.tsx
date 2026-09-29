import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../../components/CustomTable";

import DialogBox from "../../../components/DialogBox";
import RowActionsMenu from "../../../components/RowActionsMenu";
import TiptapEditor from "../../../components/TiptapEditor";

import { uploadImage } from "../../../services/upload/uploadService";

import {
  required,
  validate,
} from "../../../utils/validation";

import { FormLabel } from "../../../components/FormField";

/* =========================================================
   TYPES
========================================================= */

type Blog = {
  _id?: string;

  title: string;
  category: string;

  /** Short summary shown on blog cards. */
  description: string;

  /** Rich-text HTML from admin editor. */
  content: string;

  image?: string;
  readTime: string;

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
  category: "Beauty Tips",
  description: "",
  content: "",
  image: "",
  readTime: "5 min read",

  seoTitle: "",
  seoDescription: "",
  seoKeywords: [],
};

/* =========================================================
   AUTH
========================================================= */

const getAuthHeaders = () => ({
  "Content-Type": "application/json",

  Authorization: `Bearer ${localStorage.getItem(
    "adminToken",
  )}`,
});

/* =========================================================
   SHARED INPUT STYLE
========================================================= */

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-soft px-4 py-3 text-sm outline-none transition focus:border-[#E75480]";

/* =========================================================
   HELPERS
========================================================= */

/**
 * Tiptap leaves these values behind when
 * the editor is emptied.
 */
const isEmptyContent = (content: string) =>
  !content ||
  content === "<p></p>" ||
  content === "<p><br></p>";

/* =========================================================
   BLOG ADMIN
========================================================= */

export default function BlogAdmin() {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [form, setForm] =
    useState<Blog>(emptyBlog);

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [isUploading, setIsUploading] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /**
   * The blog awaiting delete confirmation.
   * Null means the dialog is closed.
   */
  const [blogToDelete, setBlogToDelete] =
    useState<Blog | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  /* =======================================================
     FETCH BLOGS
  ======================================================= */

  const fetchBlogs = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/blogs`,
      );

      if (!res.ok) {
        throw new Error(
          "Failed to fetch blogs",
        );
      }

      const data = await res.json();

      const normalizedBlogs: Blog[] =
        Array.isArray(data)
          ? data.map((blog) => ({
              ...blog,

              content:
                blog.content || "",

              image:
                blog.image || "",

              readTime:
                blog.readTime ||
                "5 min read",

              seoTitle:
                blog.seoTitle || "",

              seoDescription:
                blog.seoDescription || "",

              seoKeywords:
                Array.isArray(
                  blog.seoKeywords,
                )
                  ? blog.seoKeywords
                  : [],
            }))
          : [];

      setBlogs(normalizedBlogs);
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
     FORM
  ======================================================= */

  const openAddForm = () => {
    setForm({
      ...emptyBlog,
      seoKeywords: [],
    });

    setEditingId(null);

    setFormOpen(true);
  };

  const openEditForm = (blog: Blog) => {
    setForm({
      ...blog,

      content:
        blog.content || "",

      image:
        blog.image || "",

      readTime:
        blog.readTime ||
        "5 min read",

      seoTitle:
        blog.seoTitle || "",

      seoDescription:
        blog.seoDescription || "",

      seoKeywords:
        Array.isArray(
          blog.seoKeywords,
        )
          ? blog.seoKeywords
          : [],
    });

    setEditingId(
      blog._id || null,
    );

    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);

    setForm({
      ...emptyBlog,
      seoKeywords: [],
    });

    setEditingId(null);
  };

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  const handleImageUpload = async (
    file: File,
  ) => {
    try {
      setIsUploading(true);

      return await uploadImage(
        file,
      );
    } catch (error) {
      console.error(
        "Upload error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Image upload failed",
      );

      return null;
    } finally {
      setIsUploading(false);
    }
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async () => {
    const error = validate(
      form,
      {
        title: [
          "Title",
          [required()],
        ],

        category: [
          "Category",
          [required()],
        ],

        description: [
          "Description",
          [required()],
        ],
      },
    );

    if (error) {
      toast.error(error);

      return;
    }

    if (
      isEmptyContent(
        form.content,
      )
    ) {
      toast.error(
        "Please add the full blog content.",
      );

      return;
    }

    /* -----------------------------------------
       Clean SEO keywords before sending them.
    ----------------------------------------- */

    const cleanedKeywords =
      form.seoKeywords
        .map((keyword) =>
          keyword.trim(),
        )
        .filter(Boolean);

    const payload: Blog = {
      ...form,

      title:
        form.title.trim(),

      category:
        form.category.trim(),

      description:
        form.description.trim(),

      readTime:
        form.readTime.trim() ||
        "5 min read",

      seoTitle:
        form.seoTitle.trim(),

      seoDescription:
        form.seoDescription.trim(),

      seoKeywords:
        cleanedKeywords,
    };

    try {
      setIsSubmitting(true);

      const url = editingId
        ? `${
            import.meta.env
              .VITE_API_URL
          }/api/blogs/${editingId}`
        : `${
            import.meta.env
              .VITE_API_URL
          }/api/blogs`;

      const res = await fetch(
        url,
        {
          method: editingId
            ? "PUT"
            : "POST",

          headers:
            getAuthHeaders(),

          body: JSON.stringify(
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

      toast.success(
        editingId
          ? "Blog updated successfully!"
          : "Blog added successfully!",
      );

      closeForm();
    } catch (error) {
      console.error(
        "Save blog error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the blog.",
      );
    } finally {
      setIsSubmitting(false);
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
        setDeleting(true);

        const res =
          await fetch(
            `${
              import.meta.env
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
          editingId === id
        ) {
          closeForm();
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
          error instanceof Error
            ? error.message
            : "Something went wrong while deleting the blog.",
        );
      } finally {
        setDeleting(false);
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
        className="h-14 w-20 rounded-xl object-cover"
      />
    ) : (
      <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-soft text-lg text-[#E75480]">
        ✎
      </div>
    );

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

          onSelect: () =>
            openEditForm(
              blog,
            ),
        },

        {
          key: "delete",

          label: "Delete",

          icon: "🗑",

          tone: "danger",

          dividerBefore:
            true,

          onSelect: () =>
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

        header: "Image",

        width: "110px",

        hideOnMobile:
          true,

        render:
          thumbnail,
      },

      {
        key: "title",

        header: "Title",

        hideOnMobile:
          true,

        cellClassName:
          "font-medium text-ink",

        render: (blog) =>
          blog.title,
      },

      {
        key: "category",

        header:
          "Category",

        hideOnMobile:
          true,

        render: (blog) => (
          <span className="inline-block rounded-full bg-blush px-4 py-1 text-xs uppercase tracking-[1px] text-[#E75480]">
            {
              blog.category
            }
          </span>
        ),
      },

      {
        key: "readTime",

        header:
          "Read Time",

        cellClassName:
          "whitespace-nowrap",

        render: (blog) =>
          blog.readTime,
      },

      {
        key: "description",

        header:
          "Description",

        cellClassName:
          "max-w-sm",

        render: (blog) => (
          <p className="line-clamp-2 leading-6">
            {
              blog.description
            }
          </p>
        ),
      },

      {
        key: "actions",

        header:
          "Actions",

        align: "right",

        width: "90px",

        hideOnMobile:
          true,

        render:
          renderActions,
      },
    ];

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div>
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[3px] text-[#E75480]">
            Management
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#E75480] md:text-5xl">
            Blogs
          </h1>

          <p className="mt-2 text-muted">
            Add, edit, and
            delete blog posts.
          </p>
        </div>

        <button
          type="button"
          onClick={
            openAddForm
          }
          className="rounded-full bg-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-white transition hover:bg-[#d94873]"
        >
          Add Blog
        </button>
      </div>

      {/* ===================================================
          TABLE
      =================================================== */}

      <CustomTable
        className="mt-10"
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
        emptyMessage="Add your first blog post using the button above."
        minWidth="1050px"
        mobileTitle={(
          blog,
        ) => (
          <span className="flex items-center gap-3">
            {thumbnail(
              blog,
            )}

            <span>
              {
                blog.title
              }
            </span>
          </span>
        )}
        mobileSubtitle={(
          blog,
        ) =>
          blog.category
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
        eyebrow="Management"
        title={
          editingId
            ? "Edit Blog"
            : "Add New Blog"
        }
        size="xl"
        onSubmit={
          handleSubmit
        }
        submitting={
          isSubmitting
        }
        submittingLabel={
          editingId
            ? "Updating..."
            : "Adding..."
        }
        confirmLabel={
          editingId
            ? "Update Blog"
            : "Add Blog"
        }
        confirmDisabled={
          isUploading
        }
        closeOnBackdrop={
          false
        }
      >
        <div className="grid gap-4 md:grid-cols-2">

          {/* ===============================================
              BLOG TITLE
          =============================================== */}

          <div>
            <FormLabel
              label="Blog Title"
              required
            />

            <input
              required
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
          </div>

          {/* ===============================================
              CATEGORY
          =============================================== */}

          <div>
            <FormLabel
              label="Category"
              required
            />

            <input
              required
              type="text"
              placeholder="Enter category"
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
              FEATURED IMAGE
          =============================================== */}

          <div>
            <FormLabel
              label="Featured Image"
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
              className={`${inputClass} file:mr-3 file:rounded-full file:border-0 file:bg-blush file:px-4 file:py-2 file:text-xs file:text-[#E75480] disabled:cursor-not-allowed disabled:opacity-60`}
            />

            {isUploading && (
              <p className="mt-2 text-xs text-[#E75480]">
                Uploading
                image...
              </p>
            )}
          </div>

          {/* ===============================================
              DESCRIPTION
          =============================================== */}

          <div className="md:col-span-2">
            <FormLabel
              label="Short Description"
              required
            />

            <textarea
              required
              placeholder="Write a short blog description"
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
              className={`${inputClass} resize-y`}
            />
          </div>

          {/* ===============================================
              FULL BLOG CONTENT
          =============================================== */}

          <div className="md:col-span-2">
            <FormLabel
              label="Full Blog Content"
              required
            />

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

          <div className="mt-3 md:col-span-2">
            <div className="rounded-2xl border border-[#E75480]/15 bg-[#fff8fa] p-5 md:p-6">

              {/* SEO HEADER */}

              <div className="mb-6">
                <p className="text-[10px] font-medium uppercase tracking-[3px] text-[#E75480]">
                  Search Engine
                  Optimization
                </p>

                <h3 className="mt-2 font-serif text-2xl text-ink">
                  SEO Settings
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  Customize how
                  this blog appears
                  in search
                  results. These
                  fields are
                  optional. If left
                  empty, the blog
                  title and
                  description can
                  be used instead.
                </p>
              </div>

              <div className="grid gap-5">

                {/* SEO TITLE */}

                <div>
                  <div className="mb-1 flex items-center justify-between gap-4">
                    <FormLabel
                      label="SEO Title"
                    />

                    <span
                      className={`text-xs ${
                        form
                          .seoTitle
                          .length >
                        60
                          ? "text-red-500"
                          : "text-muted"
                      }`}
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
                    placeholder="Example: Bridal Makeup in Kathmandu | Nirjara Beauty"
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

                  <p className="mt-2 text-xs leading-5 text-muted">
                    Recommended:
                    around 50–60
                    characters.
                  </p>
                </div>

                {/* SEO DESCRIPTION */}

                <div>
                  <div className="mb-1 flex items-center justify-between gap-4">
                    <FormLabel
                      label="SEO Description"
                    />

                    <span
                      className={`text-xs ${
                        form
                          .seoDescription
                          .length >
                        160
                          ? "text-red-500"
                          : "text-muted"
                      }`}
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
                    className={`${inputClass} resize-y`}
                  />

                  <p className="mt-2 text-xs leading-5 text-muted">
                    Recommended:
                    around 140–160
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
                    placeholder="bridal makeup, beauty salon kathmandu, makeup artist nepal"
                    value={
                      form.seoKeywords.join(
                        ", ",
                      )
                    }
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
                    onBlur={() => {
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
                      );
                    }}
                    className={
                      inputClass
                    }
                  />

                  <p className="mt-2 text-xs leading-5 text-muted">
                    Separate each
                    keyword or
                    phrase with a
                    comma.
                  </p>

                  {form.seoKeywords.filter(
                    Boolean,
                  ).length >
                    0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {form.seoKeywords
                        .filter(
                          Boolean,
                        )
                        .map(
                          (
                            keyword,
                            index,
                          ) => (
                            <span
                              key={`${keyword}-${index}`}
                              className="rounded-full border border-[#E75480]/10 bg-white px-3 py-1.5 text-xs text-[#E75480]"
                            >
                              {
                                keyword
                              }
                            </span>
                          ),
                        )}
                    </div>
                  )}
                </div>

                {/* =========================================
                    GOOGLE SEARCH PREVIEW
                ========================================= */}

                <div className="pt-2">
                  <FormLabel
                    label="Search Preview"
                  />

                  <div className="mt-2 rounded-2xl border border-black/5 bg-white p-5 shadow-[0_4px_20px_rgba(58,42,47,0.04)]">

                    <p className="truncate text-xs text-[#4d5156]">
                      nirjarabeauty.com
                      › blog
                    </p>

                    <p className="mt-1 break-words text-[18px] font-medium leading-6 text-[#1a0dab]">
                      {form.seoTitle.trim() ||
                        form.title.trim() ||
                        "Your Blog Title"}
                    </p>

                    <p className="mt-1 line-clamp-2 break-words text-sm leading-5 text-[#4d5156]">
                      {form.seoDescription.trim() ||
                        form.description.trim() ||
                        "Your blog description will appear here."}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            IMAGE PREVIEW
        ================================================= */}

        {form.image && (
          <div className="mt-5">
            <p className="mb-2 text-sm text-muted">
              Image Preview
            </p>

            <div className="relative max-w-md">
              <img
                src={
                  form.image
                }
                alt="Blog preview"
                className="h-44 w-full rounded-2xl object-cover"
              />

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
                className="absolute right-3 top-3 rounded-full bg-surface px-4 py-2 text-xs font-medium text-[#E75480] shadow"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </DialogBox>

      {/* ===================================================
          DELETE CONFIRMATION
      =================================================== */}

      <DialogBox
        open={Boolean(
          blogToDelete,
        )}
        onClose={() =>
          setBlogToDelete(
            null,
          )
        }
        eyebrow="Confirm"
        title="Delete blog?"
        description={
          blogToDelete
            ? `"${blogToDelete.title}" will be removed from the website. This cannot be undone.`
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
          Readers will no
          longer see this post
          on the blog page.
        </p>
      </DialogBox>
    </div>
  );
}
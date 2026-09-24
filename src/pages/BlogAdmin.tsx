import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../components/CustomTable";

import DialogBox from "../components/DialogBox";

import RowActionsMenu from "../components/RowActionsMenu";

import TiptapEditor from "../components/TiptapEditor";

import { uploadImage } from "../services/upload/uploadService";

import {
  required,
  validate,
} from "../utils/validation";

// ========================================
// TYPES
// ========================================

type Blog = {
  _id?: string;
  title: string;
  category: string;
  description: string;
  content: string;
  image?: string;
  readTime: string;
};

const emptyBlog: Blog = {
  title: "",
  category: "Beauty Tips",
  description: "",
  content: "",
  image: "",
  readTime: "5 min read",
};

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

// ========================================
// SHARED INPUT STYLE
// ========================================

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none focus:border-[#E75480]";

const labelClass =
  "mb-2 block text-sm font-medium text-[#3A2A2F]";

// Tiptap leaves these behind when the
// editor is emptied.
const isEmptyContent = (
  content: string
) =>
  !content ||
  content === "<p></p>" ||
  content === "<p><br></p>";

export default function BlogAdmin() {
  const [blogs, setBlogs] = useState<
    Blog[]
  >([]);

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

  // The blog awaiting delete
  // confirmation. Null means the dialog
  // is closed.
  const [blogToDelete, setBlogToDelete] =
    useState<Blog | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  // ============================
  // FETCH BLOGS
  // ============================

  const fetchBlogs = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/blogs`
      );

      if (!res.ok) {
        throw new Error(
          "Failed to fetch blogs"
        );
      }

      const data = await res.json();

      setBlogs(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Fetch blogs error:",
        error
      );

      toast.error(
        "Failed to load blogs"
      );

      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // ============================
  // FORM
  // ============================

  const openAddForm = () => {
    setForm({ ...emptyBlog });
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditForm = (blog: Blog) => {
    setForm({
      ...blog,
      content: blog.content || "",
      image: blog.image || "",
    });

    setEditingId(blog._id || null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm({ ...emptyBlog });
    setEditingId(null);
  };

  const handleImageUpload = async (
    file: File
  ) => {
    try {
      setIsUploading(true);

      return await uploadImage(file);
    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Image upload failed"
      );

      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    const error = validate(form, {
      title: ["Title", [required()]],
      category: ["Category", [required()]],
      description: [
        "Description",
        [required()],
      ],
    });

    if (error) {
      toast.error(error);

      return;
    }

    if (isEmptyContent(form.content)) {
      toast.error(
        "Please add the full blog content."
      );

      return;
    }

    try {
      setIsSubmitting(true);

      const url = editingId
        ? `${import.meta.env.VITE_API_URL}/api/blogs/${editingId}`
        : `${import.meta.env.VITE_API_URL}/api/blogs`;

      const res = await fetch(url, {
        method: editingId
          ? "PUT"
          : "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            `Failed to ${
              editingId
                ? "update"
                : "add"
            } blog`
        );
      }

      await fetchBlogs();

      toast.success(
        editingId
          ? "Blog updated successfully!"
          : "Blog added successfully!"
      );

      closeForm();
    } catch (error) {
      console.error(
        "Save blog error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the blog."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================
  // DELETE
  //
  // Asking happens in the dialog; this
  // only runs once the admin confirms.
  // ============================

  const confirmDelete = async () => {
    if (!blogToDelete?._id) {
      return;
    }

    const id = blogToDelete._id;

    try {
      setDeleting(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/blogs/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to delete blog"
        );
      }

      if (editingId === id) {
        closeForm();
      }

      await fetchBlogs();

      toast.success(
        "Blog deleted successfully!"
      );

      setBlogToDelete(null);
    } catch (error) {
      console.error(
        "Delete blog error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the blog."
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

  const thumbnail = (blog: Blog) =>
    blog.image ? (
      <img
        src={blog.image}
        alt={blog.title}
        className="h-14 w-20 rounded-xl object-cover"
      />
    ) : (
      <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-[#FFF5F8] text-lg text-[#E75480]">
        ✎
      </div>
    );

  const renderActions = (blog: Blog) => (
    <RowActionsMenu
      label={`Actions for ${blog.title}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: "✎",
          onSelect: () =>
            openEditForm(blog),
        },
        {
          key: "delete",
          label: "Delete",
          icon: "🗑",
          tone: "danger",
          dividerBefore: true,
          onSelect: () =>
            setBlogToDelete(blog),
        },
      ]}
    />
  );

  // ============================
  // COLUMNS
  // ============================

  const columns: TableColumn<Blog>[] = [
    {
      key: "image",
      header: "Image",
      width: "110px",
      hideOnMobile: true,
      render: thumbnail,
    },
    {
      key: "title",
      header: "Title",
      hideOnMobile: true,
      cellClassName:
        "font-medium text-[#3A2A2F]",
      render: (blog) => blog.title,
    },
    {
      key: "category",
      header: "Category",
      hideOnMobile: true,
      render: (blog) => (
        <span className="inline-block rounded-full bg-[#FCE7EF] px-4 py-1 text-xs uppercase tracking-[1px] text-[#E75480]">
          {blog.category}
        </span>
      ),
    },
    {
      key: "readTime",
      header: "Read Time",
      cellClassName: "whitespace-nowrap",
      render: (blog) => blog.readTime,
    },
    {
      key: "description",
      header: "Description",
      cellClassName: "max-w-sm",
      render: (blog) => (
        <p className="line-clamp-2 leading-6">
          {blog.description}
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

  return (
    <div>
      {/* HEADER */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[3px] text-[#E75480]">
            Management
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#E75480] md:text-5xl">
            Blogs
          </h1>

          <p className="mt-2 text-[#8A6F78]">
            Add, edit, and delete blog posts.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-full bg-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-white transition hover:bg-[#d94873]"
        >
          Add Blog
        </button>
      </div>

      {/* TABLE */}

      <CustomTable
        className="mt-10"
        columns={columns}
        rows={blogs}
        rowKey={(blog, index) =>
          blog._id ?? String(index)
        }
        loading={loading}
        loadingMessage="Loading blogs..."
        emptyIcon="✎"
        emptyTitle="No blogs yet"
        emptyMessage="Add your first blog post using the button above."
        minWidth="1050px"
        mobileTitle={(blog) => (
          <span className="flex items-center gap-3">
            {thumbnail(blog)}

            <span>{blog.title}</span>
          </span>
        )}
        mobileSubtitle={(blog) =>
          blog.category
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
            ? "Edit Blog"
            : "Add New Blog"
        }
        size="xl"
        onSubmit={handleSubmit}
        submitting={isSubmitting}
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
        confirmDisabled={isUploading}
        // A half filled form should not
        // vanish on a stray click.
        closeOnBackdrop={false}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              className={labelClass}
            >
              Blog Title
            </label>

            <input
              type="text"
              placeholder="Enter blog title"
              value={form.title}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  title:
                    event.target.value,
                }))
              }
              className={inputClass}
            />
          </div>

          <div>
            <label
              className={labelClass}
            >
              Category
            </label>

            <input
              type="text"
              placeholder="Enter category"
              value={form.category}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  category:
                    event.target.value,
                }))
              }
              className={inputClass}
            />
          </div>

          <div>
            <label
              className={labelClass}
            >
              Read Time
            </label>

            <input
              type="text"
              placeholder="Example: 5 min read"
              value={form.readTime}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  readTime:
                    event.target.value,
                }))
              }
              className={inputClass}
            />
          </div>

          <div>
            <label
              className={labelClass}
            >
              Featured Image
            </label>

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              disabled={isUploading}
              onChange={async (
                event
              ) => {
                const file =
                  event.target
                    .files?.[0];

                if (!file) {
                  return;
                }

                const imageUrl =
                  await handleImageUpload(
                    file
                  );

                if (imageUrl) {
                  setForm(
                    (previous) => ({
                      ...previous,
                      image: imageUrl,
                    })
                  );
                }

                event.target.value = "";
              }}
              className={`${inputClass} file:mr-3 file:rounded-full file:border-0 file:bg-[#FCE7EF] file:px-4 file:py-2 file:text-xs file:text-[#E75480] disabled:cursor-not-allowed disabled:opacity-60`}
            />

            {isUploading && (
              <p className="mt-2 text-xs text-[#E75480]">
                Uploading image...
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              className={labelClass}
            >
              Short Description
            </label>

            <textarea
              placeholder="Write a short blog description"
              value={form.description}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  description:
                    event.target.value,
                }))
              }
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </div>

          <div className="md:col-span-2">
            <label
              className={labelClass}
            >
              Full Blog Content
            </label>

            <TiptapEditor
              value={form.content}
              onChange={(html) =>
                setForm((previous) => ({
                  ...previous,
                  content: html,
                }))
              }
            />
          </div>
        </div>

        {form.image && (
          <div className="mt-5">
            <p className="mb-2 text-sm text-[#8A6F78]">
              Image Preview
            </p>

            <div className="relative max-w-md">
              <img
                src={form.image}
                alt="Blog preview"
                className="h-44 w-full rounded-2xl object-cover"
              />

              <button
                type="button"
                onClick={() =>
                  setForm((previous) => ({
                    ...previous,
                    image: "",
                  }))
                }
                className="absolute right-3 top-3 rounded-full bg-white px-4 py-2 text-xs font-medium text-[#E75480] shadow"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </DialogBox>

      {/* ============================ */}
      {/* DELETE CONFIRMATION          */}
      {/* ============================ */}

      <DialogBox
        open={Boolean(blogToDelete)}
        onClose={() =>
          setBlogToDelete(null)
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
        submitting={deleting}
        onConfirm={confirmDelete}
      >
        <p className="text-sm text-[#8A6F78]">
          Readers will no longer see this
          post on the blog page.
        </p>
      </DialogBox>
    </div>
  );
}

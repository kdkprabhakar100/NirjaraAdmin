import { useEffect, useState } from "react";
import TiptapEditor from "../components/TiptapEditor";

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

export default function BlogAdmin() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [form, setForm] = useState<Blog>(emptyBlog);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBlogs = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/blogs`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch blogs");
      }

      const data = await res.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch blogs error:", error);
      setBlogs([]);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const resetForm = () => {
    setForm({ ...emptyBlog });
    setEditingId(null);
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Image upload failed");
      }

      return data.imageUrl as string;
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Image upload failed"
      );

      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.category.trim() ||
      !form.description.trim()
    ) {
      alert("Please fill title, category, and description.");
      return;
    }

    if (
      !form.content ||
      form.content === "<p></p>" ||
      form.content === "<p><br></p>"
    ) {
      alert("Please add the full blog content.");
      return;
    }

    try {
      setIsSubmitting(true);

      const url = editingId
        ? `${import.meta.env.VITE_API_URL}/api/blogs/${editingId}`
        : `${import.meta.env.VITE_API_URL}/api/blogs`;

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            `Failed to ${editingId ? "update" : "add"} blog`
        );
      }

      await fetchBlogs();
      resetForm();

      alert(
        editingId
          ? "Blog updated successfully."
          : "Blog added successfully."
      );
    } catch (error) {
      console.error("Save blog error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the blog."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (blog: Blog) => {
    setForm({
      ...blog,
      content: blog.content || "",
      image: blog.image || "",
    });

    setEditingId(blog._id || null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;

    const shouldDelete = window.confirm(
      "Are you sure you want to delete this blog?"
    );

    if (!shouldDelete) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/blogs/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "adminToken"
            )}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete blog");
      }

      if (editingId === id) {
        resetForm();
      }

      await fetchBlogs();
    } catch (error) {
      console.error("Delete blog error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the blog."
      );
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl text-[#E75480] md:text-5xl">
        Blogs
      </h1>

      <p className="mt-2 text-sm text-[#8A6F78] md:text-base">
        Add, edit, and delete blog posts.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-3xl bg-white p-4 shadow-sm md:p-6"
      >
        <h2 className="font-serif text-2xl text-[#3A2A2F] md:text-3xl">
          {editingId ? "Edit Blog" : "Add New Blog"}
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#3A2A2F]">
              Blog Title
            </label>

            <input
              type="text"
              placeholder="Enter blog title"
              value={form.title}
              onChange={(e) =>
                setForm((previous) => ({
                  ...previous,
                  title: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none transition focus:border-[#E75480] md:text-base"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#3A2A2F]">
              Category
            </label>

            <input
              type="text"
              placeholder="Enter category"
              value={form.category}
              onChange={(e) =>
                setForm((previous) => ({
                  ...previous,
                  category: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none transition focus:border-[#E75480] md:text-base"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#3A2A2F]">
              Read Time
            </label>

            <input
              type="text"
              placeholder="Example: 5 min read"
              value={form.readTime}
              onChange={(e) =>
                setForm((previous) => ({
                  ...previous,
                  readTime: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none transition focus:border-[#E75480] md:text-base"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#3A2A2F]">
              Featured Image
            </label>

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              disabled={isUploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];

                if (!file) return;

                const imageUrl = await handleImageUpload(file);

                if (imageUrl) {
                  setForm((previous) => ({
                    ...previous,
                    image: imageUrl,
                  }));
                }

                e.target.value = "";
              }}
              className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-[#FCE7EF] file:px-4 file:py-2 file:text-xs file:text-[#E75480] disabled:cursor-not-allowed disabled:opacity-60"
            />

            {isUploading && (
              <p className="mt-2 text-xs text-[#E75480]">
                Uploading image...
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#3A2A2F]">
              Short Description
            </label>

            <textarea
              placeholder="Write a short blog description"
              value={form.description}
              onChange={(e) =>
                setForm((previous) => ({
                  ...previous,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full resize-y rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none transition focus:border-[#E75480] md:text-base"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#3A2A2F]">
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
            <p className="mb-2 text-sm font-medium text-[#3A2A2F]">
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

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="rounded-full bg-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-white transition hover:bg-[#d94873] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? editingId
                ? "Updating..."
                : "Adding..."
              : editingId
                ? "Update Blog"
                : "Add Blog"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="rounded-full border border-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-[#E75480] transition hover:bg-[#FFF5F8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <div
            key={blog._id}
            className="overflow-hidden rounded-3xl bg-white shadow-sm"
          >
            {blog.image && (
              <img
                src={blog.image}
                alt={blog.title}
                className="h-44 w-full object-cover"
              />
            )}

            <div className="p-5 md:p-6">
              <p className="break-words text-xs uppercase tracking-[2px] text-[#E75480]">
                {blog.category}
              </p>

              <h2 className="mt-2 break-words font-serif text-xl text-[#3A2A2F] md:text-2xl">
                {blog.title}
              </h2>

              <p className="mt-2 break-words text-sm leading-6 text-[#8A6F78]">
                {blog.description}
              </p>

              <p className="mt-3 text-xs text-[#8A6F78]">
                {blog.readTime}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleEdit(blog)}
                  className="rounded-full border border-[#E75480] px-5 py-2 text-xs text-[#E75480] transition hover:bg-[#FFF5F8]"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(blog._id)}
                  className="rounded-full bg-[#FCE7EF] px-5 py-2 text-xs text-[#E75480] transition hover:bg-[#f8d5e2]"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {blogs.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center text-[#8A6F78] shadow-sm sm:col-span-2 lg:col-span-3">
            No blogs available.
          </div>
        )}
      </div>
    </div>
  );
}
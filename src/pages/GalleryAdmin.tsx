import { useEffect, useState } from "react";

type ImageItem = {
  _id?: string;
  title: string;
  category: string;
  image: string;
};

const emptyItem: ImageItem = {
  title: "",
  category: "Salon",
  image: "",
};

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

const getImageUrl = (image?: string) => {
  if (!image) return "";

  if (image.startsWith("http://localhost:5000")) {
    return image.replace("http://localhost:5000", import.meta.env.VITE_API_URL);
  }

  if (image.startsWith("/uploads")) {
    return `${import.meta.env.VITE_API_URL}${image}`;
  }

  return image;
};

export default function GalleryAdmin() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [form, setForm] = useState<ImageItem>(emptyItem);
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/gallery`);
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Image upload failed");
        return;
      }

      setForm((prev) => ({ ...prev, image: data.imageUrl }));
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.image) {
      alert("Please upload an image.");
      return;
    }

    await fetch(`${import.meta.env.VITE_API_URL}/api/gallery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(form),
    });

    setForm(emptyItem);
    fetchItems();
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this image?")) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/gallery/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    fetchItems();
  };

  return (
    <div>
      <h1 className="font-serif text-4xl text-[#E75480] md:text-5xl">
        Gallery
      </h1>

      <p className="mt-2 text-sm text-[#8A6F78] md:text-base">
        Upload and manage gallery images.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-3xl bg-white p-4 shadow-sm md:p-6"
      >
        <h2 className="font-serif text-2xl text-[#3A2A2F] md:text-3xl">
          Add Image
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none md:text-base"
          />

          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none md:text-base"
          />

          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              handleUpload(file);
            }}
            className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none md:col-span-2"
          />
        </div>

        {uploading && (
          <p className="mt-4 text-sm text-[#8A6F78]">Uploading image...</p>
        )}

        {form.image && (
          <img
            src={getImageUrl(form.image)}
            alt="Preview"
            className="mt-5 h-44 w-full rounded-2xl object-cover md:max-w-md"
          />
        )}

        <button
          disabled={uploading}
          className="mt-6 rounded-full bg-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-white disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
      </form>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item._id}
            className="overflow-hidden rounded-3xl bg-white shadow-sm"
          >
            <img
              src={getImageUrl(item.image)}
              alt={item.title}
              className="h-40 w-full object-cover"
            />

            <div className="p-4">
              <h3 className="truncate font-medium text-[#3A2A2F]">
                {item.title || "Untitled"}
              </h3>

              <p className="mt-1 text-xs text-[#8A6F78]">{item.category}</p>

              <button
                onClick={() => handleDelete(item._id)}
                className="mt-3 w-full rounded-full bg-[#FCE7EF] px-4 py-2 text-xs text-[#E75480]"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="col-span-full rounded-3xl bg-white p-8 text-center text-[#8A6F78] shadow-sm">
            No images uploaded.
          </div>
        )}
      </div>
    </div>
  );
}
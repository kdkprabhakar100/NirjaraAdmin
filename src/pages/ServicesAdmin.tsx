import { useEffect, useState } from "react";

type Service = {
  _id?: string;
  icon: string;
  title: string;
  description: string;
  price: string;
  category: string;
  image?: string;
};

const categories = ["Hair", "Skin", "Bridal", "Nails", "Spa", "Academy", "Other"];

const emptyForm: Service = {
  icon: "✦",
  title: "",
  description: "",
  price: "",
  category: "Hair",
  image: "",
};

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

export default function ServicesAdmin() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<Service>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchServices = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/services`);
    const data = await res.json();
    setServices(data);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setCustomCategory("");
  };

  const handleImageUpload = async (file: File) => {
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

    const finalService = {
      ...form,
      category: form.category === "Other" ? customCategory : form.category,
    };

    if (
      !finalService.title ||
      !finalService.price ||
      !finalService.category ||
      !finalService.description
    ) {
      alert("Please fill title, price, category, and description.");
      return;
    }

    if (!finalService.image) {
      alert("Please upload an image.");
      return;
    }

    const res = await fetch(
      editingId
        ? `${import.meta.env.VITE_API_URL}/api/services/${editingId}`
        : `${import.meta.env.VITE_API_URL}/api/services`,
      {
        method: editingId ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(finalService),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Service save failed");
      return;
    }

    await fetchServices();
    resetForm();
  };

  const handleEdit = (service: Service) => {
    setForm({
      icon: service.icon || "✦",
      title: service.title || "",
      description: service.description || "",
      price: service.price || "",
      category: categories.includes(service.category) ? service.category : "Other",
      image: service.image || "",
    });

    if (!categories.includes(service.category)) {
      setCustomCategory(service.category || "");
    }

    setEditingId(service._id || null);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this service?")) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/services/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    await fetchServices();
  };

  return (
    <div>
      <h1 className="font-serif text-4xl text-[#E75480] md:text-5xl">
        Services
      </h1>

      <p className="mt-2 text-sm text-[#8A6F78] md:text-base">
        Create, edit, delete, and manage website services.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-3xl bg-white p-4 shadow-sm md:p-6"
      >
        <h2 className="font-serif text-2xl text-[#3A2A2F] md:text-3xl">
          {editingId ? "Edit Service" : "Add New Service"}
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            placeholder="Service Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none md:text-base"
          />

          <input
            placeholder="Price e.g. From Rs. 800"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none md:text-base"
          />

          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none md:text-base"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              handleImageUpload(file);
            }}
            className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none"
          />

          {form.category === "Other" && (
            <input
              placeholder="Enter custom category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none md:col-span-2 md:text-base"
            />
          )}

          <textarea
            placeholder="Service Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none md:col-span-2 md:text-base"
          />
        </div>

        {uploading && (
          <p className="mt-4 text-sm text-[#8A6F78]">Uploading image...</p>
        )}

        {form.image && (
          <div className="mt-5">
            <p className="mb-2 text-sm text-[#8A6F78]">Image Preview</p>
            <img
              src={form.image}
              alt="Preview"
              className="h-44 w-full rounded-2xl object-cover md:max-w-md"
            />
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            disabled={uploading}
            className="rounded-full bg-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-white disabled:opacity-60"
          >
            {uploading
              ? "Uploading..."
              : editingId
              ? "Update Service"
              : "Add Service"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-[#E75480]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service._id}
            className="overflow-hidden rounded-3xl bg-white shadow-sm"
          >
            {service.image && (
              <img
                src={service.image}
                alt={service.title}
                className="h-44 w-full object-cover"
              />
            )}

            <div className="p-5 md:p-6">
              <p className="break-words text-xs uppercase tracking-[2px] text-[#E75480]">
                {service.category}
              </p>

              <h3 className="mt-2 break-words font-serif text-xl text-[#3A2A2F] md:text-2xl">
                {service.title}
              </h3>

              <p className="mt-2 break-words text-sm leading-6 text-[#8A6F78]">
                {service.description}
              </p>

              <p className="mt-3 font-medium text-[#E75480]">
                {service.price}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => handleEdit(service)}
                  className="rounded-full border border-[#E75480] px-5 py-2 text-xs text-[#E75480]"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(service._id)}
                  className="rounded-full bg-[#FCE7EF] px-5 py-2 text-xs text-[#E75480]"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center text-[#8A6F78] shadow-sm sm:col-span-2 lg:col-span-3">
            No services available.
          </div>
        )}
      </div>
    </div>
  );
}
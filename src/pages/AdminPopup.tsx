import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

type Popup = {
  _id: string;

  title: string;

  subtitle: string;

  image: string;

  buttonText: string;

  buttonLink: string;

  delay: number;

  startDate: string;

  endDate: string;

  active: boolean;
};

export default function AdminPopup() {
  const [popups, setPopups] = useState<Popup[]>([]);

  const [loading, setLoading] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",

    subtitle: "",

    image: "",

    buttonText: "",

    buttonLink: "",

    delay: 3000,

    startDate: "",

    endDate: "",
  });

  // FETCH POPUPS
  const fetchPopups = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/popup`
      );

      const data = await res.json();

      setPopups(data);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch popups");
    }
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  // IMAGE UPLOAD
  const uploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("image", file);

    try {
      setUploading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/upload`,
        {
          method: "POST",

          body: formData,
        }
      );

      const data = await res.json();

      setForm((prev) => ({
        ...prev,

        image: data.imageUrl,
      }));

      toast.success("Image uploaded 💖");
    } catch (error) {
      console.log(error);

      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // CREATE OR UPDATE
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (editingId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/popup/${editingId}`,
          form
        );

        toast.success("Popup updated 💖");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/popup`,
          form
        );

        toast.success("Popup created 💖");
      }

      setForm({
        title: "",

        subtitle: "",

        image: "",

        buttonText: "",

        buttonLink: "",

        delay: 3000,

        startDate: "",

        endDate: "",
      });

      setEditingId(null);

      fetchPopups();
    } catch (error) {
      console.log(error);

      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const deletePopup = async (id: string) => {
    if (!window.confirm("Delete popup?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/popup/${id}`
      );

      toast.success("Popup deleted");

      fetchPopups();
    } catch (error) {
      console.log(error);

      toast.error("Delete failed");
    }
  };

  // TOGGLE ACTIVE
const togglePopup = async (id: string) => {
  try {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/popup/${id}/toggle`
    );

    toast.success("Popup updated 💖");

    fetchPopups();

  } catch (error) {
    console.log(error);

    toast.error("Toggle failed");
  }
};

  // EDIT
  const editPopup = (popup: Popup) => {
    setEditingId(popup._id);

    setForm({
      title: popup.title,

      subtitle: popup.subtitle,

      image: popup.image,

      buttonText: popup.buttonText,

      buttonLink: popup.buttonLink,

      delay: popup.delay,

      startDate: popup.startDate
        ?.split("T")[0],

      endDate: popup.endDate?.split("T")[0],
    });

    window.scrollTo({
      top: 0,

      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-10">
      {/* FORM */}
      <div className="rounded-[40px] bg-white p-8 shadow-sm">
        <h1 className="font-serif text-5xl text-[#E75480]">
          Website Popup
        </h1>

        <p className="mt-3 text-[#8A6F78]">
          Manage website offers &
          announcements
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <input
              type="text"
              placeholder="Popup Title"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,

                  title: e.target.value,
                })
              }
              className="rounded-2xl border border-[#E75480]/20 p-4 outline-none"
              required
            />

            <input
              type="text"
              placeholder="Button Text"
              value={form.buttonText}
              onChange={(e) =>
                setForm({
                  ...form,

                  buttonText:
                    e.target.value,
                })
              }
              className="rounded-2xl border border-[#E75480]/20 p-4 outline-none"
            />

            <input
              type="text"
              placeholder="Button Link"
              value={form.buttonLink}
              onChange={(e) =>
                setForm({
                  ...form,

                  buttonLink:
                    e.target.value,
                })
              }
              className="rounded-2xl border border-[#E75480]/20 p-4 outline-none"
            />

            <input
              type="number"
              placeholder="Delay"
              value={form.delay}
              onChange={(e) =>
                setForm({
                  ...form,

                  delay: Number(
                    e.target.value
                  ),
                })
              }
              className="rounded-2xl border border-[#E75480]/20 p-4 outline-none"
            />

            <input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm({
                  ...form,

                  startDate:
                    e.target.value,
                })
              }
              className="rounded-2xl border border-[#E75480]/20 p-4 outline-none"
            />

            <input
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm({
                  ...form,

                  endDate:
                    e.target.value,
                })
              }
              className="rounded-2xl border border-[#E75480]/20 p-4 outline-none"
            />
          </div>

          <textarea
            placeholder="Popup Subtitle"
            value={form.subtitle}
            onChange={(e) =>
              setForm({
                ...form,

                subtitle: e.target.value,
              })
            }
            className="h-40 w-full rounded-3xl border border-[#E75480]/20 p-5 outline-none"
          />

          {/* IMAGE */}
          <div>
            <p className="mb-3 text-sm text-[#8A6F78]">
              Popup Image
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={uploadImage}
              className="w-full rounded-2xl border border-[#E75480]/20 p-4"
            />

            {uploading && (
              <p className="mt-3 text-sm text-[#E75480]">
                Uploading...
              </p>
            )}

            {form.image && (
              <img
                src={form.image}
                alt="Preview"
                className="mt-5 h-64 w-full rounded-3xl object-cover"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#E75480] px-10 py-4 text-sm uppercase tracking-[4px] text-white"
          >
            {editingId
              ? "Update Popup"
              : "Create Popup"}
          </button>
        </form>
      </div>

      {/* POPUP LIST */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {popups.map((popup) => (
          <div
            key={popup._id}
            className="overflow-hidden rounded-[35px] bg-white shadow-sm"
          >
            <div className="relative">
              <img
                src={popup.image}
                alt={popup.title}
                className="h-72 w-full object-cover"
              />

              <span
                className={`absolute right-5 top-5 rounded-full px-5 py-2 text-sm ${
                  popup.active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {popup.active
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>

            <div className="space-y-3 p-6">
              <h2 className="font-serif text-5xl text-[#3A2A2F]">
                {popup.title}
              </h2>

              <p className="text-[#8A6F78]">
                {popup.subtitle}
              </p>

              <div className="space-y-1 text-sm text-[#E75480]">
                <p>
                  <strong>Start:</strong>{" "}
                  {new Date(
                    popup.startDate
                  ).toLocaleDateString()}
                </p>

                <p>
                  <strong>End:</strong>{" "}
                  {new Date(
                    popup.endDate
                  ).toLocaleDateString()}
                </p>

                <p>
                  <strong>Delay:</strong>{" "}
                  {popup.delay} ms
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-3">
                <button
                  onClick={() =>
                    editPopup(popup)
                  }
                  className="rounded-full bg-blue-100 px-5 py-2 text-sm text-blue-700"
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    deletePopup(
                      popup._id
                    )
                  }
                  className="rounded-full bg-red-100 px-5 py-2 text-sm text-red-700"
                >
                  Delete
                </button>

                <button
                  onClick={() => togglePopup(popup._id)}
                  className={`mt-4 rounded-full px-5 py-2 text-sm ${
                    popup.active
                      ? "bg-[#F7E7A9] text-[#9A7B00]"
                      : "bg-[#DDF8E7] text-[#008A4E]"
                  }`}
                >
                  {popup.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
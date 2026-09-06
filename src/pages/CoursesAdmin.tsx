import { useEffect, useState } from "react";

type Course = {
  _id?: string;
  title: string;
  duration: string;
  description: string;
  fee: string;
  certificate: string;
  image?: string;
};

const emptyCourse: Course = {
  title: "",
  duration: "",
  description: "",
  fee: "",
  certificate: "",
  image: "",
};

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

export default function CoursesAdmin() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState<Course>(emptyCourse);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchCourses = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/courses`);
    const data = await res.json();
    setCourses(data);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const resetForm = () => {
    setForm(emptyCourse);
    setEditingId(null);
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

    if (!form.title || !form.duration || !form.fee || !form.certificate) {
      alert("Please fill title, duration, fee, and certificate.");
      return;
    }

    if (!form.image) {
      alert("Please upload an image.");
      return;
    }

    await fetch(
      editingId
        ? `${import.meta.env.VITE_API_URL}/api/courses/${editingId}`
        : `${import.meta.env.VITE_API_URL}/api/courses`,
      {
        method: editingId ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      }
    );

    await fetchCourses();
    resetForm();
  };

const handleEdit = (course: Course) => {
  setForm({
    title: course.title || "",
    duration: course.duration || "",
    description: course.description || "",
    fee: course.fee || "",
    certificate: course.certificate || "",
    image: course.image || "",
  });

  setEditingId(course._id || null);
  window.scrollTo(0, 0);
};

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this course?")) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/courses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    await fetchCourses();
  };

  return (
    <div>
      <h1 className="font-serif text-4xl text-[#E75480] md:text-5xl">
        Courses
      </h1>

      <p className="mt-2 text-sm text-[#8A6F78] md:text-base">
        Manage academy courses.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-3xl bg-white p-4 shadow-sm md:p-6"
      >
        <h2 className="font-serif text-2xl text-[#3A2A2F] md:text-3xl">
          {editingId ? "Edit Course" : "Add New Course"}
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            placeholder="Course Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none md:text-base"
          />

          <input
            placeholder="Duration e.g. 3 Months"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none md:text-base"
          />

          <input
            placeholder="Fee e.g. Rs. 25,000"
            value={form.fee}
            onChange={(e) => setForm({ ...form, fee: e.target.value })}
            className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none md:text-base"
          />

          <input
            placeholder="Certificate e.g. Included"
            value={form.certificate}
            onChange={(e) =>
              setForm({ ...form, certificate: e.target.value })
            }
            className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none md:text-base"
          />

          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              handleImageUpload(file);
            }}
            className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none md:col-span-2"
          />

          <textarea
            placeholder="Course Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            rows={4}
            className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none md:col-span-2 md:text-base"
          />
        </div>

        {uploading && (
          <p className="mt-4 text-sm text-[#8A6F78]">Uploading image...</p>
        )}

        {form.image && (
          <img
            src={form.image}
            alt="Preview"
            className="mt-5 h-44 w-full rounded-2xl object-cover md:max-w-md"
          />
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            disabled={uploading}
            className="rounded-full bg-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-white disabled:opacity-60"
          >
            {uploading
              ? "Uploading..."
              : editingId
              ? "Update Course"
              : "Add Course"}
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
        {courses.map((course) => (
          <div
            key={course._id}
            className="overflow-hidden rounded-3xl bg-white shadow-sm"
          >
            {course.image && (
              <img
                src={course.image}
                alt={course.title}
                className="h-44 w-full object-cover"
              />
            )}

            <div className="p-5 md:p-6">
              <h2 className="break-words font-serif text-xl text-[#3A2A2F] md:text-2xl">
                {course.title}
              </h2>

              <p className="mt-2 text-sm text-[#8A6F78]">
                <strong>Duration:</strong> {course.duration}
              </p>

              <p className="mt-2 break-words text-sm text-[#8A6F78]">
                {course.description}
              </p>

              <p className="mt-3 font-medium text-[#E75480]">
                {course.fee}
              </p>

              <p className="mt-1 text-sm text-[#8A6F78]">
                <strong>Certificate:</strong> {course.certificate}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => handleEdit(course)}
                  className="rounded-full border border-[#E75480] px-5 py-2 text-xs text-[#E75480]"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(course._id)}
                  className="rounded-full bg-[#FCE7EF] px-5 py-2 text-xs text-[#E75480]"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center text-[#8A6F78] shadow-sm sm:col-span-2 lg:col-span-3">
            No courses available.
          </div>
        )}
      </div>
    </div>
  );
}
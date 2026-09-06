import { useEffect, useState } from "react";
import axios from "axios";

type Career = {
  _id: string;
  title: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string;
  active: boolean;
};

export default function AdminCareers() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    type: "",
    salary: "",
    description: "",
    requirements: "",
  });

  const fetchCareers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/careers/admin/all`
      );
      setCareers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      location: "",
      type: "",
      salary: "",
      description: "",
      requirements: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/careers/${editingId}`,
          formData
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/careers`,
          formData
        );
      }

      resetForm();
      fetchCareers();
    } catch (error) {
      console.log(error);
    }
  };

  const editCareer = (career: Career) => {
    setEditingId(career._id);

    setFormData({
      title: career.title,
      location: career.location,
      type: career.type,
      salary: career.salary || "",
      description: career.description,
      requirements: career.requirements || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteCareer = async (id: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/careers/${id}`
      );

      fetchCareers();
    } catch (error) {
      console.log(error);
    }
  };

  const toggleActive = async (id: string) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/careers/${id}/active`
      );

      fetchCareers();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F8] p-6">
      <h1 className="mb-8 text-4xl font-bold text-[#E75480]">
        Admin Careers
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mb-12 rounded-[30px] bg-white p-6 shadow-lg"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <input
            name="title"
            placeholder="Job Title"
            value={formData.title}
            onChange={handleChange}
            className="rounded-2xl border border-pink-100 bg-[#FFF7FA] p-4 outline-none"
            required
          />

          <input
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="rounded-2xl border border-pink-100 bg-[#FFF7FA] p-4 outline-none"
            required
          />

          <input
            name="type"
            placeholder="Full Time / Part Time"
            value={formData.type}
            onChange={handleChange}
            className="rounded-2xl border border-pink-100 bg-[#FFF7FA] p-4 outline-none"
            required
          />

          <input
            name="salary"
            placeholder="Salary"
            value={formData.salary}
            onChange={handleChange}
            className="rounded-2xl border border-pink-100 bg-[#FFF7FA] p-4 outline-none"
          />
        </div>

        <textarea
          name="description"
          placeholder="Job Description"
          value={formData.description}
          onChange={handleChange}
          className="mt-5 h-36 w-full rounded-2xl border border-pink-100 bg-[#FFF7FA] p-4 outline-none"
          required
        />

        <textarea
          name="requirements"
          placeholder="Requirements"
          value={formData.requirements}
          onChange={handleChange}
          className="mt-5 h-36 w-full rounded-2xl border border-pink-100 bg-[#FFF7FA] p-4 outline-none"
        />

        <div className="mt-6 flex flex-wrap gap-4">
          <button
            type="submit"
            className="rounded-full bg-[#E75480] px-8 py-3 font-semibold text-white"
          >
            {editingId ? "Update Career" : "Add Career"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full bg-gray-300 px-8 py-3 font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {careers.map((career) => (
          <div
            key={career._id}
            className="rounded-[30px] bg-white p-6 shadow-lg"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 className="font-serif text-2xl font-bold text-[#E75480]">
                {career.title}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs text-white ${
                  career.active ? "bg-green-500" : "bg-gray-400"
                }`}
              >
                {career.active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mb-5 space-y-2 text-sm text-[#8A6F78]">
              <p>📍 {career.location}</p>
              <p>🕒 {career.type}</p>
              {career.salary && <p>💰 {career.salary}</p>}
            </div>

            <p className="mb-4 text-sm leading-7 text-[#6B5B61]">
              {career.description}
            </p>

            {career.requirements && (
              <p className="mb-5 text-sm leading-7 text-[#6B5B61]">
                <strong>Requirements:</strong> {career.requirements}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => editCareer(career)}
                className="rounded-xl bg-blue-500 px-4 py-2 text-white"
              >
                Edit
              </button>

              <button
                onClick={() => toggleActive(career._id)}
                className={`rounded-xl px-4 py-2 text-white ${
                  career.active ? "bg-orange-500" : "bg-gray-500"
                }`}
              >
                {career.active ? "Active" : "Inactive"}
              </button>

              <button
                onClick={() => deleteCareer(career._id)}
                className="rounded-xl bg-red-500 px-4 py-2 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
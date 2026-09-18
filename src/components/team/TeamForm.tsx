import { useEffect, useState } from "react";
import type {
  TeamMember,
  TeamMemberFormData,
  TeamStatus,
} from "../../types/team";

type TeamFormProps = {
  editingMember: TeamMember | null;
  onSubmit: (data: TeamMemberFormData) => void;
  onCancelEdit: () => void;
};

const initialForm: TeamMemberFormData = {
  name: "",
  designation: "",
  bio: "",
  image: "",
  displayOrder: 1,
  status: "Active",
};

export default function TeamForm({
  editingMember,
  onSubmit,
  onCancelEdit,
}: TeamFormProps) {
  const [form, setForm] =
    useState<TeamMemberFormData>(initialForm);

  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (editingMember) {
      setForm({
        name: editingMember.name,
        designation: editingMember.designation,
        bio: editingMember.bio,
        image: editingMember.image,
        displayOrder: editingMember.displayOrder,
        status: editingMember.status,
      });

      setPreview(editingMember.image);
    } else {
      setForm(initialForm);
      setPreview("");
    }
  }, [editingMember]);

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setPreview(imageUrl);

    // Temporary frontend-only storage.
    // Later this will upload the actual file to backend.
    setForm((previous) => ({
      ...previous,
      image: imageUrl,
    }));
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter the team member's name.");
      return;
    }

    if (!form.designation.trim()) {
      alert("Please enter a designation.");
      return;
    }

    onSubmit(form);

    if (!editingMember) {
      setForm(initialForm);
      setPreview("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8 lg:p-10"
    >
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-[#3A2A2F]">
          {editingMember
            ? "Edit Team Member"
            : "Add Team Member"}
        </h2>

        <p className="mt-2 text-sm text-[#8A6F78]">
          Add the staff information that will appear on the
          Nirjara Beauty About Us page.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">

        {/* IMAGE */}
        <div>
          <p className="mb-3 text-sm font-medium text-[#3A2A2F]">
            Profile Photo
          </p>

          <label className="group block cursor-pointer">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] border-2 border-dashed border-[#E75480]/30 bg-[#FFF5F8]">

              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Team member preview"
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                    <span className="rounded-full bg-white px-4 py-2 text-xs text-[#E75480] opacity-0 transition group-hover:opacity-100">
                      Change Photo
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-5 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FCE7EF] text-2xl text-[#E75480]">
                    +
                  </div>

                  <p className="mt-4 text-sm font-medium text-[#E75480]">
                    Upload Photo
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#8A6F78]">
                    JPG, PNG or WebP
                  </p>
                </div>
              )}

            </div>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* FIELDS */}
        <div className="space-y-5">

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-[#3A2A2F]">
                Full Name *
              </label>

              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name: event.target.value,
                  })
                }
                placeholder="Enter full name"
                className="w-full rounded-2xl border border-[#E75480]/25 bg-[#FFF9FB] px-5 py-4 outline-none transition focus:border-[#E75480]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#3A2A2F]">
                Designation / Role *
              </label>

              <input
                type="text"
                value={form.designation}
                onChange={(event) =>
                  setForm({
                    ...form,
                    designation: event.target.value,
                  })
                }
                placeholder="e.g. Founder & Director"
                className="w-full rounded-2xl border border-[#E75480]/25 bg-[#FFF9FB] px-5 py-4 outline-none transition focus:border-[#E75480]"
              />
            </div>

          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#3A2A2F]">
              Short Bio
            </label>

            <textarea
              value={form.bio}
              onChange={(event) =>
                setForm({
                  ...form,
                  bio: event.target.value,
                })
              }
              rows={5}
              placeholder="Write a short professional introduction..."
              className="w-full resize-none rounded-2xl border border-[#E75480]/25 bg-[#FFF9FB] px-5 py-4 outline-none transition focus:border-[#E75480]"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-[#3A2A2F]">
                Display Order
              </label>

              <input
                type="number"
                min="1"
                value={form.displayOrder}
                onChange={(event) =>
                  setForm({
                    ...form,
                    displayOrder:
                      Number(event.target.value) || 1,
                  })
                }
                className="w-full rounded-2xl border border-[#E75480]/25 bg-[#FFF9FB] px-5 py-4 outline-none transition focus:border-[#E75480]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#3A2A2F]">
                Status
              </label>

              <select
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status:
                      event.target.value as TeamStatus,
                  })
                }
                className="w-full rounded-2xl border border-[#E75480]/25 bg-[#FFF9FB] px-5 py-4 outline-none transition focus:border-[#E75480]"
              >
                <option value="Active">
                  Active
                </option>

                <option value="Hidden">
                  Hidden
                </option>
              </select>
            </div>

          </div>

          <div className="flex flex-wrap gap-3 pt-3">

            <button
              type="submit"
              className="rounded-full bg-[#E75480] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:opacity-90"
            >
              {editingMember
                ? "Update Member"
                : "Add Team Member"}
            </button>

            {editingMember && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded-full border border-[#E75480] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#E75480]"
              >
                Cancel
              </button>
            )}

          </div>

        </div>
      </div>
    </form>
  );
}
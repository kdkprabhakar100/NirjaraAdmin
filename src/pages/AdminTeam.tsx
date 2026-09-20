import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  createTeamMember,
  deleteTeamMember,
  getTeamMembers,
  reorderTeamMembers,
  updateTeamMember,
} from "../services/team/teamService";

import type {
  TeamMember,
  TeamMemberPayload,
  TeamStatus,
} from "../services/team/team.types";

import { uploadImage } from "../services/upload/uploadService";

import { toast } from "react-toastify";

// ========================================
// FORM TYPE
// ========================================

type TeamFormState = {
  name: string;
  designation: string;
  bio: string;
  image: string;
  status: TeamStatus;
};

const EMPTY_FORM: TeamFormState = {
  name: "",
  designation: "",
  bio: "",
  image: "",
  status: "Active",
};

// ========================================
// IMAGE SETTINGS
// ========================================

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

// ========================================
// COMPONENT
// ========================================

export default function AdminTeam() {
  // ======================================
  // TEAM STATE
  // ======================================

  const [members, setMembers] = useState<
    TeamMember[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  // ======================================
  // FORM STATE
  // ======================================

  const [form, setForm] =
    useState<TeamFormState>(EMPTY_FORM);

  const [editingMember, setEditingMember] =
    useState<TeamMember | null>(null);

  // ======================================
  // IMAGE STATE
  // ======================================

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  // ======================================
  // PAGINATION
  // ======================================

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] =
    useState(5);

  // ======================================
  // DRAG AND DROP
  // ======================================

  const [draggedId, setDraggedId] =
    useState<string | null>(null);

  const [dragOverId, setDragOverId] =
    useState<string | null>(null);

  const [reordering, setReordering] =
    useState(false);

  // ======================================
  // API URL
  // ======================================

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  // ======================================
  // LOAD TEAM
  // ======================================

  const loadTeam = async () => {
    try {
      setLoading(true);

      const data = await getTeamMembers();

      const sorted = [...data].sort(
        (a, b) =>
          (a.order ?? 0) -
          (b.order ?? 0)
      );

      setMembers(sorted);
    } catch (error) {
      console.error(
        "LOAD TEAM ERROR:",
        error
      );

      toast.error(
        "Unable to load team members."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  // ======================================
  // PAGINATION CALCULATIONS
  // ======================================

  const totalPages = Math.max(
    1,
    Math.ceil(members.length / pageSize)
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedMembers = useMemo(() => {
    const start =
      (page - 1) * pageSize;

    return members.slice(
      start,
      start + pageSize
    );
  }, [members, page, pageSize]);

  // ======================================
  // FORM CHANGE
  // ======================================

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<
          HTMLTextAreaElement
        >
      | React.ChangeEvent<
          HTMLSelectElement
        >
  ) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================
  // IMAGE SELECT
  // ======================================

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !ACCEPTED_IMAGE_TYPES.includes(
        file.type
      )
    ) {
      toast.error(
        "Please upload a JPG, PNG or WebP image."
      );

      event.target.value = "";

      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(
        "Image must be smaller than 5 MB."
      );

      event.target.value = "";

      return;
    }

    setImageFile(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      const result =
        typeof reader.result === "string"
          ? reader.result
          : "";

      setImagePreview(result);
    };

    reader.readAsDataURL(file);
  };

  // ======================================
  // RESET FORM
  // ======================================

  const resetForm = () => {
    setForm(EMPTY_FORM);

    setEditingMember(null);

    setImageFile(null);

    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ======================================
  // SUBMIT
  // ======================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const name = form.name.trim();

    const designation =
      form.designation.trim();

    if (!name) {
      toast.error(
        "Please enter the team member's name."
      );

      return;
    }

    if (!designation) {
      toast.error(
        "Please enter a designation or role."
      );

      return;
    }

    try {
      setSaving(true);

      let image = form.image;

      // Upload newly selected image
      if (imageFile) {
        image =
          await uploadImage(imageFile);
      }

      // ================================
      // EDIT
      // ================================

      if (editingMember) {
        const updated =
          await updateTeamMember(
            editingMember._id,
            {
              name,
              designation,
              bio: form.bio.trim(),
              image,
              status: form.status,
            }
          );

        setMembers((previous) =>
          previous.map((member) =>
            member._id === updated._id
              ? updated
              : member
          )
        );

        toast.success(
          "Team member updated successfully."
        );

        resetForm();

        return;
      }

      // ================================
      // CREATE
      // ================================

      const payload: TeamMemberPayload = {
        name,
        designation,
        bio: form.bio.trim(),
        image,
        status: form.status,

        // New member goes at the end
        order: members.length + 1,
      };

      const created =
        await createTeamMember(
          payload
        );

      setMembers((previous) => [
        ...previous,
        created,
      ]);

      toast.success(
        "Team member added successfully."
      );

      resetForm();

      // Go to page containing new member
      const newCount =
        members.length + 1;

      setPage(
        Math.ceil(
          newCount / pageSize
        )
      );
    } catch (error) {
      console.error(
        "SAVE TEAM ERROR:",
        error
      );

      toast.error(
        editingMember
          ? "Unable to update team member."
          : "Unable to add team member."
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // EDIT
  // ======================================

  const handleEdit = (
    member: TeamMember
  ) => {
    setEditingMember(member);

    setForm({
      name: member.name,
      designation:
        member.designation,
      bio: member.bio || "",
      image: member.image || "",
      status: member.status,
    });

    setImageFile(null);

    setImagePreview(
      member.image || ""
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================================
  // DELETE
  // ======================================

  const handleDelete = async (
    member: TeamMember
  ) => {
    const confirmed =
      window.confirm(
        `Delete ${member.name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(member._id);

      await deleteTeamMember(
        member._id
      );

      const remaining =
        members.filter(
          (item) =>
            item._id !== member._id
        );

      // Reassign local order
      const reordered =
        remaining.map(
          (item, index) => ({
            ...item,
            order: index + 1,
          })
        );

      setMembers(reordered);

      // Save normalized order
      if (reordered.length > 0) {
        try {
          const updated =
            await reorderTeamMembers(
              reordered
            );

          setMembers(updated);
        } catch (reorderError) {
          console.error(
            "REORDER AFTER DELETE ERROR:",
            reorderError
          );
        }
      }

      if (
        editingMember?._id ===
        member._id
      ) {
        resetForm();
      }

      toast.success(
        "Team member deleted."
      );
    } catch (error) {
      console.error(
        "DELETE TEAM ERROR:",
        error
      );

      toast.error(
        "Unable to delete team member."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ======================================
  // ACTIVE / HIDDEN
  // ======================================

  const handleToggleStatus = async (
    member: TeamMember
  ) => {
    const newStatus: TeamStatus =
      member.status === "Active"
        ? "Hidden"
        : "Active";

    try {
      const updated =
        await updateTeamMember(
          member._id,
          {
            status: newStatus,
          }
        );

      setMembers((previous) =>
        previous.map((item) =>
          item._id === member._id
            ? updated
            : item
        )
      );

      toast.success(
        newStatus === "Active"
          ? `${member.name} is now visible.`
          : `${member.name} is now hidden.`
      );
    } catch (error) {
      console.error(
        "UPDATE STATUS ERROR:",
        error
      );

      toast.error(
        "Unable to update team member status."
      );
    }
  };

  // ======================================
  // DRAG START
  // ======================================

  const handleDragStart = (
    member: TeamMember
  ) => {
    setDraggedId(member._id);
  };

  // ======================================
  // DRAG OVER
  // ======================================

  const handleDragOver = (
    event: React.DragEvent,
    member: TeamMember
  ) => {
    event.preventDefault();

    if (
      draggedId &&
      draggedId !== member._id
    ) {
      setDragOverId(member._id);
    }
  };

  // ======================================
  // DRAG END
  // ======================================

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // ======================================
  // DROP
  // ======================================

  const handleDrop = async (
    event: React.DragEvent,
    targetMember: TeamMember
  ) => {
    event.preventDefault();

    if (
      !draggedId ||
      draggedId === targetMember._id
    ) {
      handleDragEnd();
      return;
    }

    const oldMembers = [
      ...members,
    ];

    const draggedIndex =
      members.findIndex(
        (member) =>
          member._id === draggedId
      );

    const targetIndex =
      members.findIndex(
        (member) =>
          member._id ===
          targetMember._id
      );

    if (
      draggedIndex === -1 ||
      targetIndex === -1
    ) {
      handleDragEnd();
      return;
    }

    const reordered = [
      ...members,
    ];

    const [draggedMember] =
      reordered.splice(
        draggedIndex,
        1
      );

    reordered.splice(
      targetIndex,
      0,
      draggedMember
    );

    const normalized =
      reordered.map(
        (member, index) => ({
          ...member,
          order: index + 1,
        })
      );

    // Optimistic update
    setMembers(normalized);

    handleDragEnd();

    try {
      setReordering(true);

      const updated =
        await reorderTeamMembers(
          normalized
        );

      setMembers(updated);

      toast.success(
        "Team order updated."
      );
    } catch (error) {
      console.error(
        "REORDER TEAM ERROR:",
        error
      );

      // Restore old state
      setMembers(oldMembers);

      toast.error(
        "Unable to save team order."
      );
    } finally {
      setReordering(false);
    }
  };

  // ======================================
  // IMAGE URL HELPER
  // ======================================

  const getImageUrl = (
    image?: string
  ) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    if (image.startsWith("/")) {
      return `${API_URL}${image}`;
    }

    return `${API_URL}/${image}`;
  };

  // ======================================
  // DISPLAY PREVIEW
  // ======================================

  const displayPreview =
    imagePreview ||
    getImageUrl(form.image);

  // ======================================
  // RENDER
  // ======================================

  return (
    <div className="min-h-screen bg-[#FFF5F8] px-4 py-8 md:px-8 lg:px-12">

      {/* =================================
          PAGE HEADER
      ================================= */}

      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#E75480]">
            Website Management
          </p>

          <h1 className="font-serif text-4xl text-[#3A2A2F] md:text-5xl">
            Team
          </h1>

          <p className="mt-3 text-sm text-[#8A6F78]">
            Add, edit, organize and
            manage the team members
            displayed on the Nirjara
            Beauty website.
          </p>
        </div>

        {/* =================================
            ADD / EDIT FORM
        ================================= */}

        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-3xl bg-white p-6 shadow-sm md:p-8"
        >
          <div className="mb-6">
            <h2 className="font-serif text-3xl text-[#3A2A2F]">
              {editingMember
                ? "Edit Team Member"
                : "Add Team Member"}
            </h2>

            <p className="mt-2 text-sm text-[#8A6F78]">
              {editingMember
                ? "Update the team member information shown on the website."
                : "Add the staff information that will appear on the Nirjara Beauty About Us page."}
            </p>
          </div>

          <div className="grid gap-7 lg:grid-cols-[200px_1fr]">

            {/* PHOTO */}

            <div>
              <label className="mb-3 block text-sm font-medium text-[#3A2A2F]">
                Profile Photo
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={
                  handleImageChange
                }
                className="hidden"
              />

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="relative flex aspect-[4/5] w-full max-w-[200px] overflow-hidden rounded-3xl border-2 border-dashed border-[#E75480]/30 bg-[#FFF5F8] transition hover:border-[#E75480]"
              >
                {displayPreview ? (
                  <img
                    src={displayPreview}
                    alt="Team preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-5 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FCE7EF] text-2xl text-[#E75480]">
                      +
                    </div>

                    <span className="text-sm font-medium text-[#E75480]">
                      Upload Photo
                    </span>

                    <span className="mt-2 text-xs text-[#8A6F78]">
                      JPG, PNG or WebP
                    </span>

                    <span className="mt-1 text-xs text-[#8A6F78]">
                      Maximum 5 MB
                    </span>
                  </div>
                )}
              </button>

              {displayPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                    setForm(
                      (previous) => ({
                        ...previous,
                        image: "",
                      })
                    );

                    if (
                      fileInputRef.current
                    ) {
                      fileInputRef.current.value =
                        "";
                    }
                  }}
                  className="mt-3 text-xs font-medium text-red-500 hover:underline"
                >
                  Remove photo
                </button>
              )}
            </div>

            {/* FORM FIELDS */}

            <div className="space-y-5">

              <div className="grid gap-5 md:grid-cols-2">

                {/* NAME */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#3A2A2F]">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={
                      handleChange
                    }
                    placeholder="Enter full name"
                    className="w-full rounded-2xl border border-[#E75480]/25 bg-[#FFF9FB] px-5 py-4 outline-none transition focus:border-[#E75480]"
                  />
                </div>

                {/* DESIGNATION */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#3A2A2F]">
                    Designation / Role *
                  </label>

                  <input
                    type="text"
                    name="designation"
                    value={
                      form.designation
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Senior Beauty Professional"
                    className="w-full rounded-2xl border border-[#E75480]/25 bg-[#FFF9FB] px-5 py-4 outline-none transition focus:border-[#E75480]"
                  />
                </div>
              </div>

              {/* BIO */}

              <div>
                <label className="mb-2 block text-sm font-medium text-[#3A2A2F]">
                  Short Bio
                </label>

                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Write a short professional introduction..."
                  className="w-full resize-none rounded-2xl border border-[#E75480]/25 bg-[#FFF9FB] px-5 py-4 outline-none transition focus:border-[#E75480]"
                />
              </div>

              {/* STATUS */}

              <div className="max-w-sm">
                <label className="mb-2 block text-sm font-medium text-[#3A2A2F]">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E75480]/25 bg-[#FFF9FB] px-5 py-4 outline-none focus:border-[#E75480]"
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Hidden">
                    Hidden
                  </option>
                </select>
              </div>

              {/* BUTTONS */}

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#E75480] px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingMember
                      ? "Update Team Member"
                      : "Add Team Member"}
                </button>

                {editingMember && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-full border border-[#E75480] px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#E75480]"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* =================================
            TEAM LIST
        ================================= */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

          {/* LIST HEADER */}

          <div className="flex flex-col gap-4 border-b border-[#E75480]/10 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-serif text-3xl text-[#3A2A2F]">
                Team Members
              </h2>

              <p className="mt-1 text-sm text-[#8A6F78]">
                {members.length}{" "}
                {members.length === 1
                  ? "team member"
                  : "team members"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {reordering && (
                <span className="text-xs text-[#E75480]">
                  Saving order...
                </span>
              )}

              <span className="text-xs text-[#8A6F78]">
                Show
              </span>

              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(
                    Number(
                      event.target.value
                    )
                  );

                  setPage(1);
                }}
                className="rounded-xl border border-[#E75480]/20 bg-[#FFF9FB] px-4 py-2 text-sm outline-none"
              >
                <option value={5}>
                  5
                </option>

                <option value={10}>
                  10
                </option>

                <option value={15}>
                  15
                </option>

                <option value={20}>
                  20
                </option>
              </select>
            </div>
          </div>

          {/* =================================
              DESKTOP TABLE
          ================================= */}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] border-collapse">

              <thead className="bg-[#FCE7EF] text-left text-xs font-semibold text-[#E75480]">
                <tr>
                  <th className="px-5 py-4">
                    Move
                  </th>

                  <th className="px-5 py-4">
                    Photo
                  </th>

                  <th className="px-5 py-4">
                    Name
                  </th>

                  <th className="px-5 py-4">
                    Designation
                  </th>

                  <th className="px-5 py-4">
                    Order
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-12 text-center text-[#8A6F78]"
                    >
                      Loading team members...
                    </td>
                  </tr>
                ) : paginatedMembers.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-12 text-center"
                    >
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF5F8] text-xl text-[#E75480]">
                        ♡
                      </div>

                      <p className="font-medium text-[#3A2A2F]">
                        No team members yet
                      </p>

                      <p className="mt-2 text-sm text-[#8A6F78]">
                        Add your first team
                        member using the form
                        above.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedMembers.map(
                    (member) => (
                      <tr
                        key={member._id}
                        draggable
                        onDragStart={() =>
                          handleDragStart(
                            member
                          )
                        }
                        onDragOver={(
                          event
                        ) =>
                          handleDragOver(
                            event,
                            member
                          )
                        }
                        onDrop={(event) =>
                          handleDrop(
                            event,
                            member
                          )
                        }
                        onDragEnd={
                          handleDragEnd
                        }
                        className={`border-t border-[#E75480]/10 transition ${
                          dragOverId ===
                          member._id
                            ? "bg-[#FFF0F5]"
                            : "bg-white"
                        } ${
                          draggedId ===
                          member._id
                            ? "opacity-50"
                            : ""
                        }`}
                      >
                        {/* MOVE */}

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            title="Drag to reorder"
                            className="cursor-grab rounded-lg px-2 py-2 text-xl text-[#8A6F78] active:cursor-grabbing"
                          >
                            ☰
                          </button>
                        </td>

                        {/* PHOTO */}

                        <td className="px-5 py-4">
                          {member.image ? (
                            <img
                              src={getImageUrl(
                                member.image
                              )}
                              alt={
                                member.name
                              }
                              className="h-14 w-14 rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF5F8] text-[#E75480]">
                              ♡
                            </div>
                          )}
                        </td>

                        {/* NAME */}

                        <td className="px-5 py-4">
                          <p className="font-medium text-[#3A2A2F]">
                            {member.name}
                          </p>

                          {member.bio && (
                            <p className="mt-1 max-w-[220px] truncate text-xs text-[#8A6F78]">
                              {member.bio}
                            </p>
                          )}
                        </td>

                        {/* DESIGNATION */}

                        <td className="px-5 py-4 text-sm text-[#8A6F78]">
                          {
                            member.designation
                          }
                        </td>

                        {/* ORDER */}

                        <td className="px-5 py-4 text-sm text-[#8A6F78]">
                          {member.order}
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                              member.status ===
                              "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  member
                                )
                              }
                              className="rounded-full border border-[#E75480] px-4 py-2 text-xs text-[#E75480] transition hover:bg-[#FFF5F8]"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleToggleStatus(
                                  member
                                )
                              }
                              className="rounded-full bg-[#FFF5F8] px-4 py-2 text-xs text-[#E75480]"
                            >
                              {member.status ===
                              "Active"
                                ? "Hide"
                                : "Show"}
                            </button>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                member._id
                              }
                              onClick={() =>
                                handleDelete(
                                  member
                                )
                              }
                              className="rounded-full bg-red-50 px-4 py-2 text-xs text-red-600 disabled:opacity-50"
                            >
                              {deletingId ===
                              member._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* =================================
              MOBILE CARDS
          ================================= */}

          <div className="space-y-4 p-4 md:hidden">
            {loading ? (
              <div className="py-10 text-center text-sm text-[#8A6F78]">
                Loading team members...
              </div>
            ) : paginatedMembers.length ===
              0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF5F8] text-[#E75480]">
                  ♡
                </div>

                <p className="font-medium text-[#3A2A2F]">
                  No team members yet
                </p>
              </div>
            ) : (
              paginatedMembers.map(
                (member) => (
                  <div
                    key={member._id}
                    className="rounded-2xl border border-[#E75480]/10 p-4"
                  >
                    <div className="flex gap-4">

                      {member.image ? (
                        <img
                          src={getImageUrl(
                            member.image
                          )}
                          alt={
                            member.name
                          }
                          className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-[#FFF5F8] text-[#E75480]">
                          ♡
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#3A2A2F]">
                          {member.name}
                        </p>

                        <p className="mt-1 text-sm text-[#8A6F78]">
                          {
                            member.designation
                          }
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              member.status ===
                              "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {
                              member.status
                            }
                          </span>

                          <span className="text-xs text-[#8A6F78]">
                            Order{" "}
                            {member.order}
                          </span>
                        </div>
                      </div>
                    </div>

                    {member.bio && (
                      <p className="mt-4 text-sm leading-6 text-[#8A6F78]">
                        {member.bio}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(
                            member
                          )
                        }
                        className="rounded-full border border-[#E75480] px-4 py-2 text-xs text-[#E75480]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStatus(
                            member
                          )
                        }
                        className="rounded-full bg-[#FFF5F8] px-4 py-2 text-xs text-[#E75480]"
                      >
                        {member.status ===
                        "Active"
                          ? "Hide"
                          : "Show"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            member
                          )
                        }
                        disabled={
                          deletingId ===
                          member._id
                        }
                        className="rounded-full bg-red-50 px-4 py-2 text-xs text-red-600 disabled:opacity-50"
                      >
                        {deletingId ===
                        member._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                )
              )
            )}
          </div>

          {/* =================================
              PAGINATION
          ================================= */}

          {!loading &&
            members.length > 0 && (
              <div className="flex flex-col gap-4 border-t border-[#E75480]/10 p-5 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-sm text-[#8A6F78]">
                  Showing{" "}
                  {(page - 1) *
                    pageSize +
                    1}
                  {" - "}
                  {Math.min(
                    page * pageSize,
                    members.length
                  )}{" "}
                  of {members.length}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() =>
                      setPage(
                        (previous) =>
                          previous - 1
                      )
                    }
                    className="rounded-full border border-[#E75480]/30 px-4 py-2 text-xs text-[#E75480] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="px-3 text-sm text-[#8A6F78]">
                    Page {page} of{" "}
                    {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      page === totalPages
                    }
                    onClick={() =>
                      setPage(
                        (previous) =>
                          previous + 1
                      )
                    }
                    className="rounded-full border border-[#E75480]/30 px-4 py-2 text-xs text-[#E75480] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
import { useMemo, useState } from "react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

type TeamStatus = "Active" | "Hidden";

type TeamMember = {
  id: string;
  name: string;
  designation: string;
  bio: string;
  photo: string;
  order: number;
  status: TeamStatus;
};

type TeamForm = {
  name: string;
  designation: string;
  bio: string;
  photo: string;
  status: TeamStatus;
};

const initialMembers: TeamMember[] = [
  {
    id: "1",
    name: "Demo Team Member",
    designation: "Founder & Director",
    bio: "Professional beauty specialist and member of the Nirjara Beauty team.",
    photo: "",
    order: 1,
    status: "Active",
  },
  {
    id: "2",
    name: "Demo Team Member",
    designation: "Senior Beauty Professional",
    bio: "Providing professional and personalized beauty services.",
    photo: "",
    order: 2,
    status: "Active",
  },
];

const emptyForm: TeamForm = {
  name: "",
  designation: "",
  bio: "",
  photo: "",
  status: "Active",
};

/* ========================================
   SORTABLE TEAM ROW
======================================== */

type SortableTeamRowProps = {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
};

function SortableTeamRow({
  member,
  onEdit,
  onToggleStatus,
  onDelete,
}: SortableTeamRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: member.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-t border-[#E75480]/10 ${
        isDragging ? "bg-[#FFF5F8]" : "bg-white"
      }`}
    >
      {/* DRAG */}
      <td className="px-4 py-4">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab rounded-lg px-2 py-2 text-xl text-[#E75480] hover:bg-[#FFF0F5] active:cursor-grabbing"
          title="Drag to reorder"
        >
          ☷
        </button>
      </td>

      {/* PHOTO */}
      <td className="px-4 py-4">
        {member.photo ? (
          <img
            src={member.photo}
            alt={member.name}
            className="h-14 w-14 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF5F8] text-lg text-[#E75480]">
            ♡
          </div>
        )}
      </td>

      {/* NAME */}
      <td className="px-4 py-4">
        <div className="font-medium text-[#3A2A2F]">
          {member.name}
        </div>

        <div className="mt-1 max-w-[260px] truncate text-xs text-[#8A6F78]">
          {member.bio || "No biography added."}
        </div>
      </td>

      {/* DESIGNATION */}
      <td className="px-4 py-4 text-sm text-[#8A6F78]">
        {member.designation}
      </td>

      {/* ORDER */}
      <td className="px-4 py-4 text-sm text-[#8A6F78]">
        {member.order}
      </td>

      {/* STATUS */}
      <td className="px-4 py-4">
        <span
          className={`rounded-full px-3 py-1 text-xs ${
            member.status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {member.status}
        </span>
      </td>

      {/* ACTIONS */}
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onEdit(member)}
            className="rounded-full border border-[#E75480] px-4 py-2 text-xs text-[#E75480] transition hover:bg-[#E75480] hover:text-white"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onToggleStatus(member.id)}
            className="rounded-full bg-[#FFF5F8] px-4 py-2 text-xs text-[#E75480] transition hover:bg-[#FCE7EF]"
          >
            {member.status === "Active" ? "Hide" : "Show"}
          </button>

          <button
            type="button"
            onClick={() => onDelete(member.id)}
            className="rounded-full bg-red-50 px-4 py-2 text-xs text-red-600 transition hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ========================================
   ADMIN TEAM
======================================== */

export default function AdminTeam() {
  const [members, setMembers] =
    useState<TeamMember[]>(initialMembers);

  const [form, setForm] =
    useState<TeamForm>(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(5);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  /* ========================================
     PAGINATION
  ======================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(members.length / pageSize)
  );

  const startIndex =
    (currentPage - 1) * pageSize;

  const endIndex =
    startIndex + pageSize;

  const paginatedMembers = useMemo(
    () =>
      members.slice(
        startIndex,
        endIndex
      ),
    [
      members,
      startIndex,
      endIndex,
    ]
  );

  /* ========================================
     FORM
  ======================================== */

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ========================================
     PHOTO
  ======================================== */

  const handlePhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const preview =
      URL.createObjectURL(file);

    setForm((previous) => ({
      ...previous,
      photo: preview,
    }));
  };

  /* ========================================
     ADD / UPDATE
  ======================================== */

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.designation.trim()
    ) {
      alert(
        "Please enter the team member name and designation."
      );

      return;
    }

    if (editingId) {
      setMembers((previous) =>
        previous.map((member) =>
          member.id === editingId
            ? {
                ...member,
                ...form,
              }
            : member
        )
      );

      setEditingId(null);
    } else {
      const newMember: TeamMember = {
        id: crypto.randomUUID(),
        ...form,
        order: members.length + 1,
      };

      setMembers((previous) => [
        ...previous,
        newMember,
      ]);

      /*
       * Move to the page containing
       * the newly-added member.
       */
      const newTotal =
        members.length + 1;

      const newPage =
        Math.ceil(
          newTotal / pageSize
        );

      setCurrentPage(
        Math.max(1, newPage)
      );
    }

    setForm(emptyForm);
  };

  /* ========================================
     EDIT
  ======================================== */

  const handleEdit = (
    member: TeamMember
  ) => {
    setEditingId(member.id);

    setForm({
      name: member.name,
      designation:
        member.designation,
      bio: member.bio,
      photo: member.photo,
      status: member.status,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ========================================
     CANCEL EDIT
  ======================================== */

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  /* ========================================
     HIDE / SHOW
  ======================================== */

  const handleToggleStatus = (
    id: string
  ) => {
    setMembers((previous) =>
      previous.map((member) =>
        member.id === id
          ? {
              ...member,
              status:
                member.status ===
                "Active"
                  ? "Hidden"
                  : "Active",
            }
          : member
      )
    );
  };

  /* ========================================
     DELETE
  ======================================== */

  const handleDelete = (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this team member?"
      );

    if (!confirmed) return;

    setMembers((previous) => {
      const updated =
        previous
          .filter(
            (member) =>
              member.id !== id
          )
          .map(
            (member, index) => ({
              ...member,
              order: index + 1,
            })
          );

      return updated;
    });

    /*
     * Prevent empty page after delete.
     */
    const remaining =
      members.length - 1;

    const newTotalPages =
      Math.max(
        1,
        Math.ceil(
          remaining / pageSize
        )
      );

    if (
      currentPage >
      newTotalPages
    ) {
      setCurrentPage(
        newTotalPages
      );
    }
  };

  /* ========================================
     DRAG END
  ======================================== */

  const handleDragEnd = (
    event: DragEndEvent
  ) => {
    const {
      active,
      over,
    } = event;

    if (
      !over ||
      active.id === over.id
    ) {
      return;
    }

    setMembers((previous) => {
      /*
       * Find the GLOBAL positions.
       * This keeps the order correct
       * even when pagination is active.
       */
      const oldIndex =
        previous.findIndex(
          (member) =>
            member.id === active.id
        );

      const newIndex =
        previous.findIndex(
          (member) =>
            member.id === over.id
        );

      if (
        oldIndex === -1 ||
        newIndex === -1
      ) {
        return previous;
      }

      const reordered =
        arrayMove(
          previous,
          oldIndex,
          newIndex
        );

      return reordered.map(
        (member, index) => ({
          ...member,
          order: index + 1,
        })
      );
    });
  };

  /* ========================================
     PAGE SIZE
  ======================================== */

  const handlePageSizeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPageSize(
      Number(e.target.value)
    );

    setCurrentPage(1);
  };

  /* ========================================
     RENDER
  ======================================== */

  return (
    <div className="min-h-screen bg-[#FFF5F8] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.35em] text-[#E75480]">
            Management
          </p>

          <h1 className="font-serif text-4xl text-[#E75480] sm:text-5xl">
            Our Team
          </h1>

          <p className="mt-3 text-[#8A6F78]">
            Add, edit, organize and manage
            the team members displayed on
            the Nirjara Beauty website.
          </p>
        </div>

        {/* =================================
            FORM
        ================================= */}

        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl text-[#3A2A2F]">
                {editingId
                  ? "Edit Team Member"
                  : "Add Team Member"}
              </h2>

              <p className="mt-1 text-sm text-[#8A6F78]">
                Enter the member's
                professional information.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={
                  handleCancelEdit
                }
                className="rounded-full border border-[#E75480] px-4 py-2 text-sm text-[#E75480]"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[200px_1fr]">

            {/* PHOTO */}

            <label className="flex min-h-[210px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-[#E75480]/40 bg-[#FFF5F8]">
              {form.photo ? (
                <img
                  src={form.photo}
                  alt="Team preview"
                  className="h-full min-h-[210px] w-full object-cover"
                />
              ) : (
                <>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FCE7EF] text-2xl text-[#E75480]">
                    +
                  </div>

                  <span className="text-sm font-medium text-[#E75480]">
                    Upload Photo
                  </span>

                  <span className="mt-2 text-xs text-[#8A6F78]">
                    JPG, PNG or WebP
                  </span>
                </>
              )}

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={
                  handlePhotoChange
                }
                className="hidden"
              />
            </label>

            {/* DETAILS */}

            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-[#3A2A2F]">
                    Full Name
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={
                      handleChange
                    }
                    placeholder="Full name"
                    className="w-full rounded-2xl border border-[#E75480]/20 bg-[#FFF9FB] px-4 py-4 outline-none focus:border-[#E75480]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[#3A2A2F]">
                    Designation / Role
                  </label>

                  <input
                    name="designation"
                    value={
                      form.designation
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Founder, Makeup Artist..."
                    className="w-full rounded-2xl border border-[#E75480]/20 bg-[#FFF9FB] px-4 py-4 outline-none focus:border-[#E75480]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#3A2A2F]">
                  Short Bio
                </label>

                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={
                    handleChange
                  }
                  rows={4}
                  placeholder="Write a short professional introduction..."
                  className="w-full resize-none rounded-2xl border border-[#E75480]/20 bg-[#FFF9FB] px-4 py-4 outline-none focus:border-[#E75480]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#3A2A2F]">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-2xl border border-[#E75480]/20 bg-[#FFF9FB] px-4 py-4 outline-none"
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Hidden">
                    Hidden
                  </option>
                </select>
              </div>

              <button
                type="submit"
                className="rounded-full bg-[#E75480] px-8 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-90"
              >
                {editingId
                  ? "Update Team Member"
                  : "Add Team Member"}
              </button>
            </div>
          </div>
        </form>

        {/* =================================
            TEAM TABLE
        ================================= */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

          {/* TABLE HEADER */}

          <div className="flex flex-col gap-4 border-b border-[#E75480]/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl text-[#3A2A2F]">
                Team Members
              </h2>

              <p className="mt-1 text-sm text-[#8A6F78]">
                {members.length} team{" "}
                {members.length === 1
                  ? "member"
                  : "members"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-[#8A6F78]">
                Show
              </span>

              <select
                value={pageSize}
                onChange={
                  handlePageSizeChange
                }
                className="rounded-xl border border-[#E75480]/20 bg-[#FFF9FB] px-4 py-2 text-sm text-[#3A2A2F] outline-none"
              >
                <option value={5}>
                  5
                </option>

                <option value={10}>
                  10
                </option>

                <option value={20}>
                  20
                </option>
              </select>
            </div>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={
                closestCenter
              }
              onDragEnd={
                handleDragEnd
              }
            >
              <table className="w-full min-w-[950px] border-collapse">
                <thead className="bg-[#FCE7EF] text-left text-sm text-[#E75480]">
                  <tr>
                    <th className="w-[60px] px-4 py-4">
                      Move
                    </th>

                    <th className="px-4 py-4">
                      Photo
                    </th>

                    <th className="px-4 py-4">
                      Name
                    </th>

                    <th className="px-4 py-4">
                      Designation
                    </th>

                    <th className="px-4 py-4">
                      Order
                    </th>

                    <th className="px-4 py-4">
                      Status
                    </th>

                    <th className="px-4 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>

                <SortableContext
                  items={paginatedMembers.map(
                    (member) =>
                      member.id
                  )}
                  strategy={
                    verticalListSortingStrategy
                  }
                >
                  <tbody>
                    {paginatedMembers.map(
                      (member) => (
                        <SortableTeamRow
                          key={
                            member.id
                          }
                          member={
                            member
                          }
                          onEdit={
                            handleEdit
                          }
                          onToggleStatus={
                            handleToggleStatus
                          }
                          onDelete={
                            handleDelete
                          }
                        />
                      )
                    )}

                    {paginatedMembers.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-12 text-center text-[#8A6F78]"
                        >
                          No team members
                          available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </SortableContext>
              </table>
            </DndContext>
          </div>

          {/* =================================
              PAGINATION
          ================================= */}

          {members.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-[#E75480]/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

              {/* SHOWING */}

              <p className="text-sm text-[#8A6F78]">
                Showing{" "}
                {startIndex + 1}–
                {Math.min(
                  endIndex,
                  members.length
                )}{" "}
                of {members.length} members
              </p>

              {/* CONTROLS */}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                  className="rounded-full border border-[#E75480]/30 px-4 py-2 text-sm text-[#E75480] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ← Previous
                </button>

                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() =>
                      setCurrentPage(
                        page
                      )
                    }
                    className={`h-9 w-9 rounded-full text-sm transition ${
                      currentPage ===
                      page
                        ? "bg-[#E75480] text-white"
                        : "bg-[#FFF5F8] text-[#E75480] hover:bg-[#FCE7EF]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                  className="rounded-full border border-[#E75480]/30 px-4 py-2 text-sm text-[#E75480] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
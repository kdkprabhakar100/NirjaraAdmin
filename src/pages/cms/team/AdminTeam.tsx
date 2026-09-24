import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../../components/CustomTable";

import DialogBox from "../../../components/DialogBox";

import RowActionsMenu from "../../../components/RowActionsMenu";

import {
  createTeamMember,
  deleteTeamMember,
  getTeamMembers,
  reorderTeamMembers,
  updateTeamMember,
} from "../../../services/team/teamService";

import type {
  TeamMember,
  TeamMemberPayload,
  TeamStatus,
} from "../../../services/team/team.types";

import {
  validImage,
  required,
  validate,
  validateField,
} from "../../../utils/validation";

import { uploadImage } from "../../../services/upload/uploadService";

import { FormLabel } from "../../../components/FormField";

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
// SHARED INPUT STYLE
// ========================================

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-soft px-4 py-3 text-sm outline-none focus:border-[#E75480]";

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

  const [deleting, setDeleting] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  // ======================================
  // FORM STATE
  // ======================================

  const [form, setForm] =
    useState<TeamFormState>(EMPTY_FORM);

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingMember, setEditingMember] =
    useState<TeamMember | null>(null);

  // The member awaiting delete
  // confirmation. Null means the dialog
  // is closed.
  const [
    memberToDelete,
    setMemberToDelete,
  ] = useState<TeamMember | null>(null);

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
          (a.order ?? 0) - (b.order ?? 0)
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
    const start = (page - 1) * pageSize;

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
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

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
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const fileError = validateField(
      file,
      "Profile photo",
      [validImage()]
    );

    if (fileError) {
      toast.error(fileError);

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
  // FORM OPEN / CLOSE
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

  const openAddForm = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEditForm = (
    member: TeamMember
  ) => {
    setEditingMember(member);

    setForm({
      name: member.name,
      designation: member.designation,
      bio: member.bio || "",
      image: member.image || "",
      status: member.status,
    });

    setImageFile(null);

    setImagePreview(member.image || "");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    resetForm();
  };

  // ======================================
  // SUBMIT
  // ======================================

  const handleSubmit = async () => {
    const name = form.name.trim();

    const designation =
      form.designation.trim();

    const error = validate(form, {
      name: ["Name", [required()]],
      designation: [
        "Designation",
        [required()],
      ],
    });

    if (error) {
      toast.error(error);

      return;
    }

    try {
      setSaving(true);

      let image = form.image;

      // Upload newly selected image
      if (imageFile) {
        image = await uploadImage(
          imageFile
        );
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

        closeForm();

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
        await createTeamMember(payload);

      setMembers((previous) => [
        ...previous,
        created,
      ]);

      toast.success(
        "Team member added successfully."
      );

      closeForm();

      // Go to page containing new member
      const newCount = members.length + 1;

      setPage(
        Math.ceil(newCount / pageSize)
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
  // DELETE
  //
  // Asking happens in the dialog; this
  // only runs once the admin confirms.
  // ======================================

  const confirmDelete = async () => {
    if (!memberToDelete) {
      return;
    }

    const member = memberToDelete;

    try {
      setDeleting(true);

      await deleteTeamMember(member._id);

      const remaining = members.filter(
        (item) => item._id !== member._id
      );

      // Reassign local order
      const reordered = remaining.map(
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
        editingMember?._id === member._id
      ) {
        closeForm();
      }

      toast.success(
        "Team member deleted."
      );

      setMemberToDelete(null);
    } catch (error) {
      console.error(
        "DELETE TEAM ERROR:",
        error
      );

      toast.error(
        "Unable to delete team member."
      );

      // Dialog stays open so the admin can
      // retry.
    } finally {
      setDeleting(false);
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
      setProcessingId(member._id);

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
    } finally {
      setProcessingId(null);
    }
  };

  // ======================================
  // DRAG AND DROP
  // ======================================

  const handleDragStart = (
    member: TeamMember
  ) => {
    setDraggedId(member._id);
  };

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

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

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

    const oldMembers = [...members];

    const draggedIndex =
      members.findIndex(
        (member) =>
          member._id === draggedId
      );

    const targetIndex =
      members.findIndex(
        (member) =>
          member._id === targetMember._id
      );

    if (
      draggedIndex === -1 ||
      targetIndex === -1
    ) {
      handleDragEnd();
      return;
    }

    const reordered = [...members];

    const [draggedMember] =
      reordered.splice(draggedIndex, 1);

    reordered.splice(
      targetIndex,
      0,
      draggedMember
    );

    const normalized = reordered.map(
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

  const displayPreview =
    imagePreview ||
    getImageUrl(form.image);

  // ======================================
  // ROW PIECES
  // ======================================

  const photo = (member: TeamMember) =>
    member.image ? (
      <img
        src={getImageUrl(member.image)}
        alt={member.name}
        className="h-14 w-14 rounded-2xl object-cover"
      />
    ) : (
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-soft text-[#E75480]">
        ♡
      </div>
    );

  const statusBadge = (
    member: TeamMember
  ) => (
    <span
      className={`inline-block rounded-full px-4 py-1 text-xs ${
        member.status === "Active"
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {member.status}
    </span>
  );

  const renderActions = (
    member: TeamMember
  ) => (
    <RowActionsMenu
      label={`Actions for ${member.name}`}
      busy={
        processingId === member._id ||
        (deleting &&
          memberToDelete?._id ===
            member._id)
      }
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: "✎",
          onSelect: () =>
            openEditForm(member),
        },
        {
          key: "status",
          label:
            member.status === "Active"
              ? "Hide"
              : "Show",
          icon:
            member.status === "Active"
              ? "✕"
              : "✓",
          tone:
            member.status === "Active"
              ? "default"
              : "success",
          onSelect: () =>
            handleToggleStatus(member),
        },
        {
          key: "delete",
          label: "Delete",
          icon: "🗑",
          tone: "danger",
          dividerBefore: true,
          onSelect: () =>
            setMemberToDelete(member),
        },
      ]}
    />
  );

  // ======================================
  // COLUMNS
  // ======================================

  const columns: TableColumn<TeamMember>[] =
    [
      {
        key: "move",
        header: "Move",
        width: "70px",
        hideOnMobile: true,
        render: () => (
          <span
            title="Drag the row to reorder"
            className="cursor-grab text-xl text-muted active:cursor-grabbing"
          >
            ☰
          </span>
        ),
      },
      {
        key: "photo",
        header: "Photo",
        width: "90px",
        hideOnMobile: true,
        render: photo,
      },
      {
        key: "name",
        header: "Name",
        hideOnMobile: true,
        render: (member) => (
          <>
            <p className="font-medium text-ink">
              {member.name}
            </p>

            {member.bio && (
              <p className="mt-1 max-w-[220px] truncate text-xs">
                {member.bio}
              </p>
            )}
          </>
        ),
      },
      {
        key: "designation",
        header: "Designation",
        render: (member) =>
          member.designation,
      },
      {
        key: "order",
        header: "Order",
        width: "80px",
        render: (member) => member.order,
      },
      {
        key: "status",
        header: "Status",
        hideOnMobile: true,
        render: statusBadge,
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

  // ======================================
  // PAGINATION FOOTER
  // ======================================

  const paginationFooter =
    members.length > 0 ? (
      <div className="flex flex-col gap-4 rounded-3xl border-t border-[#E75480]/10 bg-surface p-5 sm:flex-row sm:items-center sm:justify-between md:rounded-none">
        <p className="text-sm text-muted">
          Showing{" "}
          {(page - 1) * pageSize + 1}
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
                (previous) => previous - 1
              )
            }
            className="rounded-full border border-[#E75480]/30 px-4 py-2 text-xs text-[#E75480] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="px-3 text-sm text-muted">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={
              page === totalPages
            }
            onClick={() =>
              setPage(
                (previous) => previous + 1
              )
            }
            className="rounded-full border border-[#E75480]/30 px-4 py-2 text-xs text-[#E75480] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    ) : undefined;

  // ======================================
  // RENDER
  // ======================================

  return (
    <div>
      {/* HEADER */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[3px] text-[#E75480]">
            Website Management
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#E75480] md:text-5xl">
            Team
          </h1>

          <p className="mt-2 text-muted">
            Add, edit, organize and manage
            the team members displayed on
            the Nirjara Beauty website.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-full bg-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-white transition hover:bg-[#d94873]"
        >
          Add Team Member
        </button>
      </div>

      {/* LIST TOOLBAR */}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-surface p-5 shadow-sm">
        <div>
          <h2 className="font-serif text-2xl text-ink">
            Team Members
          </h2>

          <p className="mt-1 text-sm text-muted">
            {members.length}{" "}
            {members.length === 1
              ? "team member"
              : "team members"}{" "}
            · drag a row to reorder
          </p>
        </div>

        <div className="flex items-center gap-3">
          {reordering && (
            <span className="text-xs text-[#E75480]">
              Saving order...
            </span>
          )}

          <span className="text-xs text-muted">
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
            className="rounded-xl border border-[#E75480]/20 bg-softer px-4 py-2 text-sm outline-none"
          >
            <option value={5}>5</option>

            <option value={10}>10</option>

            <option value={15}>15</option>

            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* TABLE */}

      <CustomTable
        className="mt-6"
        columns={columns}
        rows={paginatedMembers}
        rowKey={(member) => member._id}
        loading={loading}
        loadingMessage="Loading team members..."
        emptyIcon="♡"
        emptyTitle="No team members yet"
        emptyMessage="Add your first team member using the button above."
        minWidth="950px"
        // Rows carry the drag handlers, so
        // the list can be reordered without
        // CustomTable knowing about it.
        rowProps={(member) => ({
          draggable: true,
          onDragStart: () =>
            handleDragStart(member),
          onDragOver: (event) =>
            handleDragOver(
              event as React.DragEvent,
              member
            ),
          onDrop: (event) =>
            handleDrop(
              event as React.DragEvent,
              member
            ),
          onDragEnd: handleDragEnd,
          className: `${
            dragOverId === member._id
              ? "bg-soft"
              : ""
          } ${
            draggedId === member._id
              ? "opacity-50"
              : ""
          }`,
        })}
        mobileTitle={(member) => (
          <span className="flex items-center gap-3">
            {photo(member)}

            <span>{member.name}</span>
          </span>
        )}
        mobileSubtitle={(member) =>
          member.designation
        }
        mobileBadge={statusBadge}
        mobileActions={renderActions}
        footer={paginationFooter}
      />

      {/* ============================ */}
      {/* ADD / EDIT                   */}
      {/* ============================ */}

      <DialogBox
        open={formOpen}
        onClose={closeForm}
        eyebrow="Website Management"
        title={
          editingMember
            ? "Edit Team Member"
            : "Add Team Member"
        }
        description={
          editingMember
            ? "Update the team member information shown on the website."
            : "Add the staff information that will appear on the About Us page."
        }
        size="lg"
        onSubmit={handleSubmit}
        submitting={saving}
        submittingLabel="Saving..."
        confirmLabel={
          editingMember
            ? "Update Team Member"
            : "Add Team Member"
        }
        // A half filled form should not
        // vanish on a stray click.
        closeOnBackdrop={false}
      >
        <div className="grid gap-7 lg:grid-cols-[200px_1fr]">
          {/* PHOTO */}

          <div>
            <FormLabel label="Profile Photo" />

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
              className="relative flex aspect-[4/5] w-full max-w-[200px] overflow-hidden rounded-3xl border-2 border-dashed border-[#E75480]/30 bg-soft transition hover:border-[#E75480]"
            >
              {displayPreview ? (
                <img
                  src={displayPreview}
                  alt="Team preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-5 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blush text-2xl text-[#E75480]">
                    +
                  </div>

                  <span className="text-sm font-medium text-[#E75480]">
                    Upload Photo
                  </span>

                  <span className="mt-2 text-xs text-muted">
                    JPG, PNG or WebP
                  </span>

                  <span className="mt-1 text-xs text-muted">
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

          {/* FIELDS */}

          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <FormLabel
                  label="Full Name"
                  required
                />

                <input
                  required
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className={inputClass}
                />
              </div>

              <div>
                <FormLabel
                  label="Designation / Role"
                  required
                />

                <input
                  required
                  type="text"
                  name="designation"
                  value={
                    form.designation
                  }
                  onChange={handleChange}
                  placeholder="e.g. Senior Beauty Professional"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <FormLabel label="Short Bio" />

              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={5}
                placeholder="Write a short professional introduction..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="max-w-sm">
              <FormLabel label="Status" />

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputClass}
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
        </div>
      </DialogBox>

      {/* ============================ */}
      {/* DELETE CONFIRMATION          */}
      {/* ============================ */}

      <DialogBox
        open={Boolean(memberToDelete)}
        onClose={() =>
          setMemberToDelete(null)
        }
        eyebrow="Confirm"
        title="Delete team member?"
        description={
          memberToDelete
            ? `${memberToDelete.name} will be removed from the website. This cannot be undone.`
            : undefined
        }
        size="sm"
        destructive
        confirmLabel="Delete"
        submittingLabel="Deleting..."
        submitting={deleting}
        onConfirm={confirmDelete}
      >
        <p className="text-sm text-muted">
          The remaining members are
          renumbered so the website order
          stays correct.
        </p>
      </DialogBox>
    </div>
  );
}

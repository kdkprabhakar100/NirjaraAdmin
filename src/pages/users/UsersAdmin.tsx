import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../components/CustomTable";

import DialogBox from "../../components/DialogBox";

import FormField from "../../components/FormField";

import RowActionsMenu from "../../components/RowActionsMenu";

import {
  getAdminSession,
  hasPermission,
} from "../../services/auth/authService";

import type { AdminRole } from "../../services/auth/auth.types";

import { getApiErrorMessage } from "../../services/base/api";

import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
} from "../../services/adminUser/adminUserService";

import {
  ADMIN_ROLES,
  type AdminUser,
  type AdminUserPayload,
} from "../../services/adminUser/adminUser.types";

import {
  email,
  maxLength,
  minLength,
  required,
  validate,
} from "../../utils/validation";

// ========================================
// FORM DEFAULTS
// ========================================

const EMPTY_FORM: AdminUserPayload = {
  name: "",
  email: "",
  role: "staff",
  password: "",
};

// ========================================
// SHARED INPUT STYLE
// ========================================

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-soft px-4 py-3 text-sm outline-none focus:border-[#E75480] disabled:cursor-not-allowed disabled:opacity-60";

const roleLabel = (role: AdminRole) =>
  ADMIN_ROLES.find(
    (item) => item.value === role
  )?.label ?? role;

export default function UsersAdmin() {
  // Staff reach this page only by typing
  // the URL; the API would refuse them
  // anyway, so say so instead of showing
  // a failed load.
  const canManage =
    hasPermission("users.manage");

  const currentUserId =
    getAdminSession()?.id;

  const [users, setUsers] = useState<
    AdminUser[]
  >([]);

  const [loading, setLoading] =
    useState(canManage);

  const [form, setForm] =
    useState<AdminUserPayload>(EMPTY_FORM);

  const [formOpen, setFormOpen] =
    useState(false);

  // Null while adding a new user.
  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  // The user awaiting delete
  // confirmation. Null means the dialog
  // is closed.
  const [userToDelete, setUserToDelete] =
    useState<AdminUser | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const editingSelf =
    editingId !== null &&
    editingId === currentUserId;

  // ============================
  // FETCH
  // ============================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      setUsers(await getAdminUsers());
    } catch (error) {
      console.error(
        "Fetch users error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load admin users"
        )
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage) {
      fetchUsers();
    }
  }, [canManage]);

  // ============================
  // FORM
  // ============================

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditForm = (user: AdminUser) => {
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
    });

    setEditingId(user._id);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const updateField = <
    K extends keyof AdminUserPayload,
  >(
    field: K,
    value: AdminUserPayload[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ============================
  // SAVE
  // ============================

  const handleSubmit = async () => {
    const error = validate(form, {
      name: ["Name", [required()]],
      email: ["Email", [required(), email()]],
      // Blank keeps the current password
      // when editing.
      password: [
        "Password",
        [
          ...(editingId ? [] : [required()]),
          minLength(8),
          maxLength(128),
        ],
      ],
    });

    if (error) {
      toast.error(error);

      return;
    }

    const payload: AdminUserPayload = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
    };

    try {
      setSaving(true);

      if (editingId) {
        await updateAdminUser(
          editingId,
          payload
        );

        toast.success(
          "Admin user updated successfully!"
        );
      } else {
        await createAdminUser(payload);

        toast.success(
          "Admin user added successfully!"
        );
      }

      closeForm();

      await fetchUsers();
    } catch (error) {
      console.error(
        "Save user error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Unable to save the admin user"
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // DELETE
  //
  // Asking happens in the dialog; this
  // only runs once the admin confirms.
  // ============================

  const confirmDelete = async () => {
    if (!userToDelete) {
      return;
    }

    try {
      setDeleting(true);

      await deleteAdminUser(
        userToDelete._id
      );

      toast.success(
        "Admin user deleted successfully!"
      );

      setUserToDelete(null);

      await fetchUsers();
    } catch (error) {
      console.error(
        "Delete user error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Unable to delete the admin user"
        )
      );

      // Dialog stays open so the admin can
      // retry.
    } finally {
      setDeleting(false);
    }
  };

  // ============================
  // ROW PIECES
  // ============================

  const roleBadge = (user: AdminUser) => (
    <span
      className={`inline-block rounded-full px-4 py-1 text-xs uppercase tracking-[1px] ${
        user.role === "admin"
          ? "bg-blush text-[#E75480]"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {roleLabel(user.role)}
    </span>
  );

  const nameCell = (user: AdminUser) => (
    <span className="font-medium text-ink">
      {user.name}

      {user._id === currentUserId && (
        <span className="ml-2 text-xs font-normal text-muted">
          (you)
        </span>
      )}
    </span>
  );

  const renderActions = (user: AdminUser) => (
    <RowActionsMenu
      label={`Actions for ${user.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: "✎",
          onSelect: () =>
            openEditForm(user),
        },
        // The API refuses deleting
        // yourself; hiding it saves the
        // round trip.
        ...(user._id === currentUserId
          ? []
          : [
              {
                key: "delete",
                label: "Delete",
                icon: "🗑",
                tone: "danger" as const,
                dividerBefore: true,
                onSelect: () =>
                  setUserToDelete(user),
              },
            ]),
      ]}
    />
  );

  // ============================
  // COLUMNS
  // ============================

  const columns: TableColumn<AdminUser>[] = [
    {
      key: "name",
      header: "Name",
      hideOnMobile: true,
      render: nameCell,
    },
    {
      key: "email",
      header: "Email",
      cellClassName: "break-all",
      render: (user) => user.email,
    },
    {
      key: "role",
      header: "Role",
      width: "130px",
      hideOnMobile: true,
      render: roleBadge,
    },
    {
      key: "created",
      header: "Added",
      width: "140px",
      cellClassName:
        "whitespace-nowrap text-sm text-muted",
      render: (user) =>
        user.createdAt
          ? new Date(
              user.createdAt
            ).toLocaleDateString()
          : "—",
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

  // ============================
  // UI
  // ============================

  if (!canManage) {
    return (
      <div className="rounded-3xl bg-surface px-6 py-14 text-center shadow-sm">
        <p className="font-medium text-ink">
          Admins only
        </p>

        <p className="mt-2 text-sm text-muted">
          Ask an admin if you need an account
          added or changed.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[3px] text-[#E75480]">
            Management
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#E75480] md:text-5xl">
            Admin Users
          </h1>

          <p className="mt-2 text-muted">
            People who can sign in to this admin
            panel.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-full bg-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-white transition hover:bg-[#d94873]"
        >
          Add Admin User
        </button>
      </div>

      {/* TABLE */}

      <CustomTable
        className="mt-10"
        columns={columns}
        rows={users}
        rowKey={(user) => user._id}
        loading={loading}
        loadingMessage="Loading users..."
        emptyIcon="☺"
        emptyTitle="No admin users yet"
        emptyMessage="Add your first admin user using the button above."
        minWidth="760px"
        mobileTitle={nameCell}
        mobileBadge={roleBadge}
        mobileActions={renderActions}
      />

      {/* ============================ */}
      {/* ADD / EDIT                   */}
      {/* ============================ */}

      <DialogBox
        open={formOpen}
        onClose={closeForm}
        eyebrow="Management"
        title={
          editingId ? "Edit Admin User" : "Add Admin User"
        }
        size="lg"
        onSubmit={handleSubmit}
        submitting={saving}
        submittingLabel={
          editingId
            ? "Updating..."
            : "Adding..."
        }
        confirmLabel={
          editingId
            ? "Update Admin User"
            : "Add Admin User"
        }
        // A half filled form should not
        // vanish on a stray click.
        closeOnBackdrop={false}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Name" required>
            <input
              required
              value={form.name}
              onChange={(e) =>
                updateField(
                  "name",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>

          <FormField label="Email" required>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) =>
                updateField(
                  "email",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Role"
            required
            hint={
              editingSelf
                ? "you cannot change your own role"
                : undefined
            }
          >
            <select
              required
              value={form.role}
              disabled={editingSelf}
              onChange={(e) =>
                updateField(
                  "role",
                  e.target.value as AdminRole
                )
              }
              className={inputClass}
            >
              {ADMIN_ROLES.map((role) => (
                <option
                  key={role.value}
                  value={role.value}
                >
                  {role.label} —{" "}
                  {role.description}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Password"
            required={!editingId}
            hint={
              editingId
                ? "leave blank to keep the current one"
                : "at least 8 characters"
            }
          >
            <input
              required={!editingId}
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              value={form.password}
              onChange={(e) =>
                updateField(
                  "password",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>
        </div>
      </DialogBox>

      {/* ============================ */}
      {/* DELETE CONFIRMATION          */}
      {/* ============================ */}

      <DialogBox
        open={Boolean(userToDelete)}
        onClose={() =>
          setUserToDelete(null)
        }
        eyebrow="Confirm"
        title="Delete admin user?"
        description={
          userToDelete
            ? `${userToDelete.name} will no longer be able to sign in. This cannot be undone.`
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
          They are signed out on their next
          request.
        </p>
      </DialogBox>
    </div>
  );
}

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../components/CustomTable";

import DialogBox from "../../components/DialogBox";

import RowActionsMenu from "../../components/RowActionsMenu";

import { getApiErrorMessage } from "../../services/base/api";

import {
  required,
  validate,
} from "../../utils/validation";

import {
  createServiceCategory,
  deleteServiceCategory,
  getServiceCategories,
  updateServiceCategory,
} from "../../services/serviceCategory/serviceCategoryService";

import type {
  ServiceCategory,
  ServiceCategoryPayload,
} from "../../services/serviceCategory/serviceCategory.types";

import FormField from "../../components/FormField";

// ========================================
// FORM DEFAULTS
// ========================================

const emptyForm: ServiceCategoryPayload = {
  name: "",
  icon: "✦",
  description: "",
};

// How long typing settles before the
// search request goes out.
const SEARCH_DELAY_MS = 350;

// ========================================
// SHARED INPUT STYLE
// ========================================

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none focus:border-[#E75480]";

export default function ServiceCategoriesAdmin() {
  const navigate = useNavigate();

  const [categories, setCategories] =
    useState<ServiceCategory[]>([]);

  // Only the first load blanks the table.
  // Later loads (a search) swap the rows in
  // place.
  const [loading, setLoading] =
    useState(true);

  // ---- Search ----
  //
  // `search` follows the keyboard;
  // `appliedSearch` is what was actually
  // sent, so the server is not hit on every
  // keystroke.

  const [search, setSearch] =
    useState("");

  const [appliedSearch, setAppliedSearch] =
    useState("");

  // ---- Add / edit dialog ----

  const [formOpen, setFormOpen] =
    useState(false);

  const [form, setForm] =
    useState<ServiceCategoryPayload>(
      emptyForm
    );

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  // ---- Delete dialog ----

  const [
    categoryToDelete,
    setCategoryToDelete,
  ] = useState<ServiceCategory | null>(
    null
  );

  const [deleting, setDeleting] =
    useState(false);

  // Counts the category requests, so a slow
  // one cannot overwrite a fresher list.
  const latestRequest = useRef(0);

  // ============================
  // FETCH CATEGORIES
  //
  // Filtering happens on the server, so the
  // search box matches every category, not
  // only the ones already on screen.
  // ============================

  const fetchCategories = async () => {
    const requestId = ++latestRequest.current;

    try {
      const data =
        await getServiceCategories({
          search: appliedSearch,
        });

      if (
        requestId !==
        latestRequest.current
      ) {
        return;
      }

      setCategories(data);
    } catch (error) {
      console.error(
        "Fetch categories error:",
        error
      );

      if (
        requestId !==
        latestRequest.current
      ) {
        return;
      }

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load categories"
        )
      );

      setCategories([]);
    } finally {
      if (
        requestId ===
        latestRequest.current
      ) {
        setLoading(false);
      }
    }
  };

  // ---- Debounce the search box ----

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearch(search.trim());
    }, SEARCH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchCategories();
  }, [appliedSearch]);

  // ============================
  // OPEN THE FORM
  //
  // Add and edit share one dialog; the
  // only difference is whether the form
  // starts empty or filled.
  // ============================

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditForm = (
    category: ServiceCategory
  ) => {
    setForm({
      name: category.name || "",
      icon: category.icon || "✦",
      description:
        category.description || "",
    });

    setEditingId(category._id || null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  // ============================
  // SAVE
  //
  // The name is marked required, so the
  // browser blocks the submit before this
  // runs. Only the rules HTML cannot
  // express are checked here.
  // ============================

  const handleSubmit = async () => {
    const name = form.name.trim();

    const error = validate(form, {
      name: ["Category name", [required()]],
    });

    if (error) {
      toast.error(error);

      return;
    }

    const payload: ServiceCategoryPayload =
      { ...form, name };

    try {
      setSaving(true);

      if (editingId) {
        await updateServiceCategory(
          editingId,
          payload
        );

        toast.success(
          "Category updated successfully!"
        );
      } else {
        await createServiceCategory(
          payload
        );

        toast.success(
          "Category added successfully!"
        );
      }

      await fetchCategories();

      closeForm();
    } catch (error) {
      console.error(
        "Save category error:",
        error
      );

      // 409 when the name is already taken;
      // the server says which one.
      toast.error(
        getApiErrorMessage(
          error,
          "Category save failed"
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // DELETE
  // ============================

  const confirmDelete = async () => {
    const id = categoryToDelete?._id;

    if (!id) {
      return;
    }

    try {
      setDeleting(true);

      await deleteServiceCategory(id);

      setCategories((previous) =>
        previous.filter(
          (category) =>
            category._id !== id
        )
      );

      toast.success(
        "Category deleted successfully!"
      );

      setCategoryToDelete(null);
    } catch (error) {
      console.error(
        "Delete category error:",
        error
      );

      // The server refuses while services
      // still use it, and says how many.
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to delete category"
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

  const badge = (
    category: ServiceCategory
  ) => (
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FFF5F8] text-lg text-[#E75480]">
      {category.icon || "✦"}
    </div>
  );

  const renderActions = (
    category: ServiceCategory
  ) => (
    <RowActionsMenu
      label={`Actions for ${category.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: "✎",
          onSelect: () =>
            openEditForm(category),
        },
        {
          key: "services",
          label: "View services",
          icon: "✦",
          onSelect: () =>
            navigate(
              `/services?category=${category._id ?? ""}`
            ),
        },
        {
          key: "delete",
          label: "Delete",
          icon: "🗑",
          tone: "danger",
          dividerBefore: true,
          onSelect: () =>
            setCategoryToDelete(
              category
            ),
        },
      ]}
    />
  );

  // ============================
  // COLUMNS
  // ============================

  const columns: TableColumn<ServiceCategory>[] =
    [
      {
        key: "icon",
        header: "Icon",
        width: "90px",
        hideOnMobile: true,
        render: badge,
      },
      {
        key: "name",
        header: "Name",
        hideOnMobile: true,
        cellClassName:
          "font-medium text-[#3A2A2F]",
        render: (category) => (
          <span className="inline-block rounded-full bg-[#FCE7EF] px-4 py-1 text-xs uppercase tracking-[1px] text-[#E75480]">
            {category.name}
          </span>
        ),
      },
      {
        key: "services",
        header: "Services",
        cellClassName:
          "whitespace-nowrap font-medium text-[#E75480]",
        render: (category) =>
          `${category.serviceCount ?? 0} service${
            category.serviceCount === 1
              ? ""
              : "s"
          }`,
      },
      {
        key: "description",
        header: "Description",
        cellClassName: "max-w-sm",
        render: (category) =>
          category.description ? (
            <p className="line-clamp-2 leading-6">
              {category.description}
            </p>
          ) : (
            <span className="text-[#B59AA3]">
              —
            </span>
          ),
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

  return (
    <div>
      {/* HEADER */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[3px] text-[#E75480]">
            Management
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#E75480] md:text-5xl">
            Service Categories
          </h1>

          <p className="mt-2 text-[#8A6F78]">
            Create, edit, delete, and manage the categories services are grouped by.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate("/services")
            }
            className="rounded-full border border-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-[#E75480] transition hover:bg-[#FFF5F8]"
          >
            Services
          </button>

          <button
            type="button"
            onClick={openAddForm}
            className="rounded-full bg-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-white transition hover:bg-[#d94873]"
          >
            Add Category
          </button>
        </div>
      </div>

      {/* SEARCH */}

      <div className="mt-8 flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-[#8A6F78]">
          {categories.length} categor
          {categories.length === 1
            ? "y"
            : "ies"}{" "}
          {appliedSearch
            ? "found"
            : "in total"}
        </p>

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search by category name..."
          className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 text-sm outline-none focus:border-[#E75480] lg:w-80"
        />
      </div>

      {/* TABLE */}

      <CustomTable
        className="mt-6"
        columns={columns}
        rows={categories}
        rowKey={(category, index) =>
          category._id ?? String(index)
        }
        loading={loading}
        loadingMessage="Loading categories..."
        emptyIcon="✦"
        emptyTitle={
          appliedSearch
            ? "No matching categories"
            : "No categories yet"
        }
        emptyMessage={
          appliedSearch
            ? "Try a different name."
            : "Add your first category using the button above."
        }
        minWidth="900px"
        mobileTitle={(category) => (
          <span className="flex items-center gap-3">
            {badge(category)}

            <span>{category.name}</span>
          </span>
        )}
        mobileSubtitle={(category) =>
          `${category.serviceCount ?? 0} service${
            category.serviceCount === 1
              ? ""
              : "s"
          }`
        }
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
          editingId
            ? "Edit Category"
            : "Add New Category"
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
            ? "Update Category"
            : "Add Category"
        }
        // A half filled form should not
        // vanish on a stray click.
        closeOnBackdrop={false}
      >
        <div className="grid gap-4 md:grid-cols-[120px_1fr]">
          <FormField label="Icon">
            <input
              value={form.icon ?? ""}
              onChange={(event) =>
                setForm({
                  ...form,
                  icon: event.target.value,
                })
              }
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Category Name"
            required
          >
            <input
              required
              placeholder="e.g. Hair"
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Description"
            className="md:col-span-2"
          >
            <textarea
              placeholder="Short description (optional)"
              value={form.description ?? ""}
              onChange={(event) =>
                setForm({
                  ...form,
                  description:
                    event.target.value,
                })
              }
              rows={3}
              className={inputClass}
            />
          </FormField>
        </div>

        <p className="mt-4 text-sm text-[#8A6F78]">
          The name shows on the website as a
          filter above the services, so keep
          it short.
        </p>
      </DialogBox>

      {/* ============================ */}
      {/* DELETE CONFIRMATION          */}
      {/* ============================ */}

      <DialogBox
        open={Boolean(categoryToDelete)}
        onClose={() =>
          setCategoryToDelete(null)
        }
        eyebrow="Confirm"
        title="Delete category?"
        description={
          categoryToDelete
            ? `"${categoryToDelete.name}" will be removed from the website. This cannot be undone.`
            : undefined
        }
        size="sm"
        destructive
        confirmLabel="Delete"
        submittingLabel="Deleting..."
        submitting={deleting}
        onConfirm={confirmDelete}
      >
        <p className="text-sm text-[#8A6F78]">
          {categoryToDelete?.serviceCount
            ? `${categoryToDelete.serviceCount} service${
                categoryToDelete.serviceCount ===
                1
                  ? ""
                  : "s"
              } still use this category. Move them to another one first — the delete will be refused until then.`
            : "The category is empty, so no service loses its group."}
        </p>
      </DialogBox>
    </div>
  );
}

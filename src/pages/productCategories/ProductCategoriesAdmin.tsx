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
  createProductCategory,
  deleteProductCategory,
  getProductCategories,
  updateProductCategory,
} from "../../services/productCategory/productCategoryService";

import type {
  ProductCategory,
  ProductCategoryPayload,
} from "../../services/productCategory/productCategory.types";

import FormField from "../../components/FormField";

// ========================================
// FORM DEFAULTS
// ========================================

const emptyForm: ProductCategoryPayload = {
  name: "",
  description: "",
};

// How long typing settles before the
// search request goes out.
const SEARCH_DELAY_MS = 350;

// ========================================
// SHARED INPUT STYLE
// ========================================

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-soft px-4 py-3 text-sm outline-none focus:border-[#E75480]";

const productCountLabel = (
  category: ProductCategory
) =>
  `${category.productCount ?? 0} product${
    category.productCount === 1 ? "" : "s"
  }`;

export default function ProductCategoriesAdmin() {
  const navigate = useNavigate();

  const [categories, setCategories] =
    useState<ProductCategory[]>([]);

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
    useState<ProductCategoryPayload>(
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
  ] = useState<ProductCategory | null>(
    null
  );

  const [deleting, setDeleting] =
    useState(false);

  // Counts the category requests, so a slow
  // one cannot overwrite a fresher list.
  const latestRequest = useRef(0);

  // ============================
  // FETCH CATEGORIES
  // ============================

  const fetchCategories = async () => {
    const requestId = ++latestRequest.current;

    try {
      const data =
        await getProductCategories({
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
        "Fetch product categories error:",
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
  // ============================

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditForm = (
    category: ProductCategory
  ) => {
    setForm({
      name: category.name || "",
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

    const payload: ProductCategoryPayload =
      { ...form, name };

    try {
      setSaving(true);

      if (editingId) {
        await updateProductCategory(
          editingId,
          payload
        );

        toast.success(
          "Category updated successfully!"
        );
      } else {
        await createProductCategory(
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
        "Save product category error:",
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

      await deleteProductCategory(id);

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
        "Delete product category error:",
        error
      );

      // The server refuses while products
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

  const renderActions = (
    category: ProductCategory
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

  const columns: TableColumn<ProductCategory>[] =
    [
      {
        key: "name",
        header: "Name",
        hideOnMobile: true,
        cellClassName:
          "font-medium text-ink",
        render: (category) => (
          <span className="inline-block rounded-full bg-blush px-4 py-1 text-xs uppercase tracking-[1px] text-[#E75480]">
            {category.name}
          </span>
        ),
      },
      {
        key: "products",
        header: "Products",
        cellClassName:
          "whitespace-nowrap font-medium text-[#E75480]",
        render: productCountLabel,
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
            <span className="text-faint">
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
            Product Categories
          </h1>

          <p className="mt-2 text-muted">
            Create, edit, delete, and manage the categories products are grouped by.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
            className="rounded-full border border-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-[#E75480] transition hover:bg-soft"
          >
            Products
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

      <div className="mt-8 flex flex-col gap-3 rounded-3xl bg-surface p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-muted">
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
          className="w-full rounded-xl border border-[#E75480]/20 bg-soft px-4 py-3 text-sm outline-none focus:border-[#E75480] lg:w-80"
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
        emptyIcon="🛍"
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
        minWidth="800px"
        mobileTitle={(category) =>
          category.name
        }
        mobileSubtitle={productCountLabel}
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
        <div className="grid gap-4">
          <FormField
            label="Category Name"
            required
          >
            <input
              required
              placeholder="e.g. Skincare"
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

          <FormField label="Description">
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
            ? `"${categoryToDelete.name}" will be removed from the store. This cannot be undone.`
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
          {categoryToDelete?.productCount
            ? `${productCountLabel(
                categoryToDelete
              )} still ${
                categoryToDelete.productCount ===
                1
                  ? "uses"
                  : "use"
              } this category. Move them to another one first — the delete will be refused until then.`
            : "The category is empty, so no product loses its group."}
        </p>
      </DialogBox>
    </div>
  );
}

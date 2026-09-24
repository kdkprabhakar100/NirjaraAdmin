import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../components/CustomTable";

import DialogBox from "../../components/DialogBox";

import RowActionsMenu from "../../components/RowActionsMenu";

import {
  number,
  required,
  url,
  validate,
} from "../../utils/validation";

import api, {
  getApiErrorMessage,
} from "../../services/base/api";

import FormField from "../../components/FormField";

// ========================================
// TYPES
// ========================================

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  featured: boolean;
  brand: string;
};

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  brand: "",
  image: "",
};

// ========================================
// SHARED INPUT STYLE
// ========================================

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-soft px-4 py-3 text-sm outline-none focus:border-[#E75480]";

export default function AdminProducts() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [form, setForm] =
    useState(emptyForm);

  const [formOpen, setFormOpen] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  // The product awaiting delete
  // confirmation. Null means the dialog
  // is closed.
  const [
    productToDelete,
    setProductToDelete,
  ] = useState<Product | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  // ============================
  // FETCH PRODUCTS
  // ============================

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get<
        Product[]
      >("/api/products");

      setProducts(res.data);
    } catch (error) {
      console.log(error);

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load products"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ============================
  // FORM
  // ============================

  const openAddForm = () => {
    setForm(emptyForm);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    const error = validate(form, {
      name: ["Product name", [required()]],
      category: ["Category", [required()]],
      price: ["Price", [required(), number({ min: 0 })]],
      stock: [
        "Stock",
        [required(), number({ min: 0, integer: true })],
      ],
      brand: ["Brand", [required()]],
      image: ["Image URL", [required(), url()]],
      description: ["Description", [required()]],
    });

    if (error) {
      toast.error(error);

      return;
    }

    try {
      setSaving(true);

      await api.post("/api/products", {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        stock: Number(form.stock),
        brand: form.brand,
        images: [form.image],
        featured: false,
      });

      toast.success(
        "Product added successfully"
      );

      await fetchProducts();

      closeForm();
    } catch (error) {
      console.log(error);

      toast.error(
        getApiErrorMessage(error)
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
    if (!productToDelete) {
      return;
    }

    const id = productToDelete._id;

    try {
      setDeleting(true);

      await api.delete(
        `/api/products/${id}`
      );

      // Remove from UI immediately
      setProducts((previous) =>
        previous.filter(
          (product) =>
            product._id !== id
        )
      );

      toast.success(
        "Product deleted successfully"
      );

      setProductToDelete(null);
    } catch (error) {
      console.log(error);

      toast.error(
        getApiErrorMessage(
          error,
          "Unable to delete product"
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

  const thumbnail = (
    product: Product
  ) =>
    product.images?.[0] ? (
      <img
        src={product.images[0]}
        alt={product.name}
        className="h-14 w-20 rounded-xl object-cover"
      />
    ) : (
      <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-soft text-lg text-[#E75480]">
        🛍
      </div>
    );

  const renderActions = (
    product: Product
  ) => (
    <RowActionsMenu
      label={`Actions for ${product.name}`}
      actions={[
        {
          key: "delete",
          label: "Delete",
          icon: "🗑",
          tone: "danger",
          onSelect: () =>
            setProductToDelete(product),
        },
      ]}
    />
  );

  // ============================
  // COLUMNS
  // ============================

  const columns: TableColumn<Product>[] =
    [
      {
        key: "image",
        header: "Image",
        width: "110px",
        hideOnMobile: true,
        render: thumbnail,
      },
      {
        key: "name",
        header: "Product",
        hideOnMobile: true,
        cellClassName:
          "font-medium text-ink",
        render: (product) =>
          product.name,
      },
      {
        key: "category",
        header: "Category",
        hideOnMobile: true,
        render: (product) => (
          <span className="inline-block rounded-full bg-blush px-4 py-1 text-xs uppercase tracking-[1px] text-[#E75480]">
            {product.category}
          </span>
        ),
      },
      {
        key: "brand",
        header: "Brand",
        render: (product) =>
          product.brand,
      },
      {
        key: "price",
        header: "Price",
        cellClassName:
          "whitespace-nowrap font-medium text-[#E75480]",
        render: (product) =>
          `$${product.price}`,
      },
      {
        key: "stock",
        header: "Stock",
        cellClassName:
          "whitespace-nowrap",
        render: (product) =>
          product.stock,
      },
      {
        key: "description",
        header: "Description",
        cellClassName: "max-w-sm",
        render: (product) => (
          <p className="line-clamp-2 leading-6">
            {product.description}
          </p>
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
            Products
          </h1>

          <p className="mt-2 text-muted">
            Manage ecommerce products.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-full bg-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-white transition hover:bg-[#d94873]"
        >
          Add Product
        </button>
      </div>

      {/* TABLE */}

      <CustomTable
        className="mt-10"
        columns={columns}
        rows={products}
        rowKey={(product) =>
          product._id
        }
        loading={loading}
        loadingMessage="Loading products..."
        emptyIcon="🛍"
        emptyTitle="No products yet"
        emptyMessage="Add your first product using the button above."
        minWidth="1150px"
        mobileTitle={(product) => (
          <span className="flex items-center gap-3">
            {thumbnail(product)}

            <span>{product.name}</span>
          </span>
        )}
        mobileSubtitle={(product) =>
          product.category
        }
        mobileActions={renderActions}
      />

      {/* ============================ */}
      {/* ADD                          */}
      {/* ============================ */}

      <DialogBox
        open={formOpen}
        onClose={closeForm}
        eyebrow="Management"
        title="Add Product"
        size="lg"
        onSubmit={handleSubmit}
        submitting={saving}
        submittingLabel="Adding..."
        confirmLabel="Add Product"
        // A half filled form should not
        // vanish on a stray click.
        closeOnBackdrop={false}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Product Name"
            required
          >
            <input
              type="text"
              required
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
            label="Category"
            required
          >
            <input
              type="text"
              required
              value={form.category}
              onChange={(event) =>
                setForm({
                  ...form,
                  category:
                    event.target.value,
                })
              }
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Price"
            required
          >
            <input
              type="number"
              required
              value={form.price}
              onChange={(event) =>
                setForm({
                  ...form,
                  price:
                    event.target.value,
                })
              }
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Stock"
            required
          >
            <input
              type="number"
              required
              value={form.stock}
              onChange={(event) =>
                setForm({
                  ...form,
                  stock:
                    event.target.value,
                })
              }
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Brand"
            required
          >
            <input
              type="text"
              required
              value={form.brand}
              onChange={(event) =>
                setForm({
                  ...form,
                  brand:
                    event.target.value,
                })
              }
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Image URL"
            required
          >
            <input
              type="text"
              required
              value={form.image}
              onChange={(event) =>
                setForm({
                  ...form,
                  image:
                    event.target.value,
                })
              }
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Description"
            required
            className="md:col-span-2"
          >
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description:
                    event.target.value,
                })
              }
              className={inputClass}
            />
          </FormField>
        </div>

        {form.image && (
          <div className="mt-5">
            <p className="mb-2 text-sm text-muted">
              Image Preview
            </p>

            <img
              src={form.image}
              alt="Preview"
              className="h-44 w-full rounded-2xl object-cover md:max-w-md"
            />
          </div>
        )}
      </DialogBox>

      {/* ============================ */}
      {/* DELETE CONFIRMATION          */}
      {/* ============================ */}

      <DialogBox
        open={Boolean(productToDelete)}
        onClose={() =>
          setProductToDelete(null)
        }
        eyebrow="Confirm"
        title="Delete product?"
        description={
          productToDelete
            ? `"${productToDelete.name}" will be removed from the store. This cannot be undone.`
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
          Customers will no longer be able
          to order this product.
        </p>
      </DialogBox>
    </div>
  );
}

import { useEffect, useState } from "react";

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

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    brand: "",
    image: "",
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products`
      );

      const data = await res.json();

      setProducts(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const createProduct = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: form.name,
            description: form.description,
            price: Number(form.price),
            category: form.category,
            stock: Number(form.stock),
            brand: form.brand,
            images: [form.image],
            featured: false,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed");
      }

      alert("Product added successfully");

      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        brand: "",
        image: "",
      });

      fetchProducts();
    } catch (error) {
      console.log(error);

      alert("Something went wrong");
    }
  };

  const deleteProduct = async (
    id: string
  ) => {
    const confirmDelete = window.confirm(
      "Delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${id}`,
        {
          method: "DELETE",
        }
      );

      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className="p-8">
      <div className="mb-10">
        <h1 className="font-serif text-5xl text-[#E75480]">
          Products
        </h1>

        <p className="mt-3 text-[#8A6F78]">
          Manage ecommerce products
        </p>
      </div>

      <div className="mb-10 rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-semibold text-[#3A2A2F]">
          Add Product
        </h2>

        <form
          onSubmit={createProduct}
          className="grid gap-5 md:grid-cols-2"
        >
          <input
            type="text"
            placeholder="Product Name"
            required
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            className="rounded-2xl border p-4 outline-none"
          />

          <input
            type="text"
            placeholder="Category"
            required
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
            className="rounded-2xl border p-4 outline-none"
          />

          <input
            type="number"
            placeholder="Price"
            required
            value={form.price}
            onChange={(e) =>
              setForm({
                ...form,
                price: e.target.value,
              })
            }
            className="rounded-2xl border p-4 outline-none"
          />

          <input
            type="number"
            placeholder="Stock"
            required
            value={form.stock}
            onChange={(e) =>
              setForm({
                ...form,
                stock: e.target.value,
              })
            }
            className="rounded-2xl border p-4 outline-none"
          />

          <input
            type="text"
            placeholder="Brand"
            required
            value={form.brand}
            onChange={(e) =>
              setForm({
                ...form,
                brand: e.target.value,
              })
            }
            className="rounded-2xl border p-4 outline-none"
          />

          <input
            type="text"
            placeholder="Image URL"
            required
            value={form.image}
            onChange={(e) =>
              setForm({
                ...form,
                image: e.target.value,
              })
            }
            className="rounded-2xl border p-4 outline-none"
          />

          <textarea
            placeholder="Description"
            required
            rows={5}
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            className="rounded-2xl border p-4 outline-none md:col-span-2"
          />

          <button className="rounded-full bg-[#E75480] px-8 py-4 text-white transition hover:bg-[#d63c6d] md:col-span-2">
            Add Product
          </button>
        </form>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <div
              key={product._id}
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <img
                src={product.images?.[0]}
                alt={product.name}
                className="h-56 w-full rounded-2xl object-cover"
              />

              <div className="mt-5">
                <p className="text-sm text-[#C77A95]">
                  {product.category}
                </p>

                <h3 className="mt-2 text-2xl font-semibold text-[#3A2A2F]">
                  {product.name}
                </h3>

                <p className="mt-2 text-[#8A6F78]">
                  ${product.price}
                </p>

                <p className="mt-1 text-sm text-[#8A6F78]">
                  Stock: {product.stock}
                </p>

                <button
                  onClick={() =>
                    deleteProduct(product._id)
                  }
                  className="mt-5 rounded-full bg-red-500 px-5 py-2 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
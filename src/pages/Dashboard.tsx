import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

type DashboardStats = {
  bookings: number;
  services: number;
  messages: number;
  blogs: number;
  orders: number;
  products: number;
  events: number;
  careers: number;
};

const initialStats: DashboardStats = {
  bookings: 0,
  services: 0,
  messages: 0,
  blogs: 0,
  orders: 0,
  products: 0,
  events: 0,
  careers: 0,
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const results = await Promise.allSettled([
          api.get("/api/bookings"),
          api.get("/api/services"),
          api.get("/api/contact"),
          api.get("/api/blogs"),
          api.get("/api/orders"),
          api.get("/api/products"),
          api.get("/api/events"),
          api.get("/api/careers"),
        ]);

        const getCount = (result: PromiseSettledResult<any>) => {
          if (result.status !== "fulfilled") {
            return 0;
          }

          const data = result.value.data;

          if (Array.isArray(data)) {
            return data.length;
          }

          if (Array.isArray(data?.data)) {
            return data.data.length;
          }

          if (Array.isArray(data?.items)) {
            return data.items.length;
          }

          if (Array.isArray(data?.bookings)) {
            return data.bookings.length;
          }

          if (Array.isArray(data?.services)) {
            return data.services.length;
          }

          if (Array.isArray(data?.messages)) {
            return data.messages.length;
          }

          if (Array.isArray(data?.blogs)) {
            return data.blogs.length;
          }

          if (Array.isArray(data?.orders)) {
            return data.orders.length;
          }

          if (Array.isArray(data?.products)) {
            return data.products.length;
          }

          if (Array.isArray(data?.events)) {
            return data.events.length;
          }

          if (Array.isArray(data?.careers)) {
            return data.careers.length;
          }

          return 0;
        };

        setStats({
          bookings: getCount(results[0]),
          services: getCount(results[1]),
          messages: getCount(results[2]),
          blogs: getCount(results[3]),
          orders: getCount(results[4]),
          products: getCount(results[5]),
          events: getCount(results[6]),
          careers: getCount(results[7]),
        });
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cards = [
    {
      title: "Bookings",
      value: stats.bookings,
      path: "/bookings",
      icon: "📅",
    },
    {
      title: "Services",
      value: stats.services,
      path: "/services",
      icon: "✨",
    },
    {
      title: "Messages",
      value: stats.messages,
      path: "/messages",
      icon: "💬",
    },
    {
      title: "Blogs",
      value: stats.blogs,
      path: "/blogs",
      icon: "📝",
    },
    {
      title: "Orders",
      value: stats.orders,
      path: "/orders",
      icon: "🛍️",
    },
    {
      title: "Products",
      value: stats.products,
      path: "/products",
      icon: "🧴",
    },
    {
      title: "Events",
      value: stats.events,
      path: "/events",
      icon: "🎉",
    },
    {
      title: "Careers",
      value: stats.careers,
      path: "/careers",
      icon: "💼",
    },
  ];

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[3px] text-[#E75480]">
          Overview
        </p>

        <h1 className="mt-2 font-serif text-4xl text-[#3A2A2F] md:text-5xl">
          Dashboard
        </h1>

        <p className="mt-3 text-sm text-[#8A6F78]">
          Manage your website content and activity from one place.
        </p>
      </div>

      {/* STATS */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => navigate(card.path)}
            className="group rounded-3xl border border-[#E75480]/10 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#8A6F78]">
                  {card.title}
                </p>

                <p className="mt-3 text-3xl font-semibold text-[#3A2A2F]">
                  {loading ? "..." : card.value}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF5F8] text-xl">
                {card.icon}
              </div>
            </div>

            <div className="mt-5 text-xs font-medium uppercase tracking-[1px] text-[#E75480]">
              Manage {card.title} →
            </div>
          </button>
        ))}
      </div>

      {/* LOWER SECTION */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* QUICK ACTIONS */}
        <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6">
            <h2 className="font-serif text-2xl text-[#3A2A2F]">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-[#8A6F78]">
              Quickly access frequently used sections.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => navigate("/services")}
              className="rounded-2xl bg-[#FFF5F8] p-4 text-left transition hover:bg-[#FCE7EF]"
            >
              <p className="font-medium text-[#3A2A2F]">
                Manage Services
              </p>

              <p className="mt-1 text-xs text-[#8A6F78]">
                Add or update salon services
              </p>
            </button>

            <button
              onClick={() => navigate("/blogs")}
              className="rounded-2xl bg-[#FFF5F8] p-4 text-left transition hover:bg-[#FCE7EF]"
            >
              <p className="font-medium text-[#3A2A2F]">
                Create Blog
              </p>

              <p className="mt-1 text-xs text-[#8A6F78]">
                Publish new website content
              </p>
            </button>

            <button
              onClick={() => navigate("/events")}
              className="rounded-2xl bg-[#FFF5F8] p-4 text-left transition hover:bg-[#FCE7EF]"
            >
              <p className="font-medium text-[#3A2A2F]">
                Manage Events
              </p>

              <p className="mt-1 text-xs text-[#8A6F78]">
                Add and update upcoming events
              </p>
            </button>

            <button
              onClick={() => navigate("/products")}
              className="rounded-2xl bg-[#FFF5F8] p-4 text-left transition hover:bg-[#FCE7EF]"
            >
              <p className="font-medium text-[#3A2A2F]">
                Manage Products
              </p>

              <p className="mt-1 text-xs text-[#8A6F78]">
                Update your store products
              </p>
            </button>
          </div>
        </div>

        {/* WEBSITE */}
        <div className="rounded-3xl bg-[#E75480] p-6 text-white shadow-sm">
          <p className="text-xs uppercase tracking-[3px] text-white/70">
            Nirjara
          </p>

          <h2 className="mt-3 font-serif text-3xl">
            Website Control
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/80">
            Update your business information, contact details,
            content and website settings.
          </p>

          <button
            onClick={() => navigate("/settings")}
            className="mt-8 rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[2px] text-[#E75480]"
          >
            Website Settings
          </button>
        </div>
      </div>
    </div>
  );
}
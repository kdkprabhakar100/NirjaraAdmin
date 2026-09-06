import { NavLink, useNavigate } from "react-router-dom";

type AdminLayoutProps = {
  children: React.ReactNode;
};

const adminLinks = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Bookings", path: "/admin/bookings" },
  { label: "Services", path: "/admin/services" },
  { label: "Gallery", path: "/admin/gallery" },
  { label: "Courses", path: "/admin/courses" },
  { label: "Messages", path: "/admin/messages" },
  { label: "Blogs", path: "/admin/blogs" },
  { label: "Orders", path: "/admin/orders" },
  { label: "Products", path: "/admin/products" },
  { label: "Popups", path: "/admin/popup" },
  { label: "Events", path: "/admin/events" },
  { label: "Careers", path: "/admin/careers" },
  { label: "Settings", path: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    navigate("/admin/login");
  };

  return (
    <main className="min-h-screen bg-[#FFF5F8] text-[#3A2A2F]">
      {/* MOBILE NAVBAR */}
      <nav className="flex items-center justify-between bg-white px-4 py-4 shadow-sm md:hidden">
        <h1 className="font-serif text-xl text-[#E75480]">
          Nirjara Admin
        </h1>

        <select
          onChange={(e) => {
            if (e.target.value) {
              navigate(e.target.value);
            }
          }}
          className="rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-3 py-2 text-sm outline-none"
          defaultValue=""
        >
          <option value="" disabled>
            Menu
          </option>

          {adminLinks.map((link) => (
            <option
              key={link.path}
              value={link.path}
            >
              {link.label}
            </option>
          ))}

          <option value="/">
            View Website
          </option>
        </select>
      </nav>

      <div className="flex min-h-screen">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden w-64 shrink-0 border-r border-[#E75480]/10 bg-white p-6 md:block">
          <h1 className="font-serif text-2xl text-[#E75480]">
            Nirjara Admin
          </h1>

          <div className="mt-10 space-y-3">
            {adminLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-[#E75480] text-white"
                      : "text-[#8A6F78] hover:bg-[#FCE7EF] hover:text-[#E75480]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-10 w-full rounded-xl border border-[#E75480] px-4 py-3 text-sm text-[#E75480]"
          >
            View Website
          </button>

          <button
            type="button"
            onClick={logout}
            className="mt-4 w-full rounded-xl bg-[#FCE7EF] px-4 py-3 text-sm text-[#E75480]"
          >
            Logout
          </button>
        </aside>

        {/* PAGE CONTENT */}
        <section className="min-w-0 flex-1 p-4 md:p-8">
          {children}
        </section>
      </div>
    </main>
  );
}
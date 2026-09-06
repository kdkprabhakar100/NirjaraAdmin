import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { navigation } from "../config/navigation";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    navigate("/login");
  };

  return (
    <main className="min-h-screen bg-[#FFF5F8] text-[#3A2A2F]">
      {/* MOBILE NAV */}
      <nav className="flex items-center justify-between bg-white px-4 py-4 shadow-sm md:hidden">
        <h1 className="font-serif text-xl text-[#E75480]">
          Admin Panel
        </h1>

        <select
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              navigate(e.target.value);
            }
          }}
          className="rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-3 py-2 text-sm outline-none"
        >
          <option value="" disabled>
            Menu
          </option>

          {navigation.map((link) => (
            <option key={link.path} value={link.path}>
              {link.label}
            </option>
          ))}
        </select>
      </nav>

      <div className="flex min-h-screen">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden w-64 shrink-0 border-r border-[#E75480]/10 bg-white p-6 md:block">
          <h1 className="font-serif text-2xl text-[#E75480]">
            Admin Panel
          </h1>

          <div className="mt-10 space-y-3">
            {navigation.map((link) => (
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
            onClick={logout}
            className="mt-10 w-full rounded-xl bg-[#FCE7EF] px-4 py-3 text-sm text-[#E75480]"
          >
            Logout
          </button>
        </aside>

        {/* PAGE */}
        <section className="min-w-0 flex-1 p-4 md:p-8">
          {children}
        </section>
      </div>
    </main>
  );
}
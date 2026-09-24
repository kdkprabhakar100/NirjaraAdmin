import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  isNavGroup,
  visibleNavigation,
  type NavGroup,
  type NavLinkItem,
} from "../config/navigation";
import {
  getAdminSession,
  logoutAdmin,
  refreshAdminSession,
} from "../services/auth/authService";
import axios from "axios";
import Topbar from "../components/Topbar";

type AdminLayoutProps = {
  children: ReactNode;
};

const linkClass = (isActive: boolean) =>
  `block rounded-xl px-4 py-3 text-sm transition ${
    isActive
      ? "bg-[#E75480] text-white"
      : "text-muted hover:bg-blush hover:text-[#E75480]"
  }`;

// ========================================
// SIDEBAR LINK
// ========================================

function SidebarLink({
  link,
}: {
  link: NavLinkItem;
}) {
  const { pathname } = useLocation();

  const activeElsewhere =
    link.activeFor?.includes(pathname) ??
    false;

  return (
    <NavLink
      to={link.path}
      className={({ isActive }) =>
        linkClass(
          isActive || activeElsewhere
        )
      }
    >
      {link.label}
    </NavLink>
  );
}

// ========================================
// SIDEBAR GROUP
//
// A dropdown of links, e.g. CMS. Starts
// open when the current page is inside
// it, and opens itself when the admin
// lands on one of its pages from
// elsewhere.
// ========================================

function SidebarGroup({
  group,
}: {
  group: NavGroup;
}) {
  const { pathname } = useLocation();

  const hasActiveChild =
    group.children.some(
      (link) => link.path === pathname
    );

  const [open, setOpen] =
    useState(hasActiveChild);

  // Adjusting state during render rather
  // than in an effect, so the group never
  // flashes closed.
  const [lastPath, setLastPath] =
    useState(pathname);

  if (pathname !== lastPath) {
    setLastPath(pathname);

    if (hasActiveChild) {
      setOpen(true);
    }
  }

  const panelId = `nav-group-${group.label}`;

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          setOpen((previous) => !previous)
        }
        aria-expanded={open}
        aria-controls={panelId}
        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition ${
          // A closed group still shows that
          // the current page is inside it.
          hasActiveChild && !open
            ? "bg-blush text-[#E75480]"
            : "text-muted hover:bg-blush hover:text-[#E75480]"
        }`}
      >
        {group.label}

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`h-4 w-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          id={panelId}
          className="mt-2 ml-3 space-y-2 border-l border-[#E75480]/15 pl-3"
        >
          {group.children.map((link) => (
            <SidebarLink
              key={link.path}
              link={link}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const navigate = useNavigate();

  const [session, setSession] = useState(
    getAdminSession
  );

  // Picks up a role changed since login,
  // and signs out an account that was
  // deleted.
  useEffect(() => {
    refreshAdminSession()
      .then(setSession)
      .catch((error: unknown) => {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {
          logoutAdmin();
          navigate("/login", {
            replace: true,
          });
        }
      });
  }, [navigate]);

  const navigation = visibleNavigation(
    session?.permissions ?? []
  );

  const logout = () => {
    logoutAdmin();
    navigate("/login");
  };

  return (
    <main className="min-h-screen bg-soft text-ink">
      <div className="flex min-h-screen">
        {/* DESKTOP SIDEBAR */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-[#E75480]/10 bg-surface p-6 md:block">
          <h1 className="font-serif text-2xl text-[#E75480]">
            Admin Panel
          </h1>

          <div className="mt-10 space-y-3">
            {navigation.map((item) =>
              isNavGroup(item) ? (
                <SidebarGroup
                  key={item.label}
                  group={item}
                />
              ) : (
                <SidebarLink
                  key={item.path}
                  link={item}
                />
              )
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            session={session}
            onLogout={logout}
          />

          {/* MOBILE MENU: the sidebar's links, as a native picker */}
          <div className="border-b border-[#E75480]/10 bg-surface px-4 py-3 md:hidden">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  navigate(e.target.value);
                }
              }}
              aria-label="Go to page"
              className="w-full rounded-xl border border-[#E75480]/20 bg-soft px-3 py-2 text-sm text-ink outline-none"
            >
              <option value="" disabled>
                Menu
              </option>

              {navigation.map((item) =>
                isNavGroup(item) ? (
                  <optgroup
                    key={item.label}
                    label={item.label}
                  >
                    {item.children.map((link) => (
                      <option
                        key={link.path}
                        value={link.path}
                      >
                        {link.label}
                      </option>
                    ))}
                  </optgroup>
                ) : (
                  <option
                    key={item.path}
                    value={item.path}
                  >
                    {item.label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* PAGE */}
          <section className="min-w-0 flex-1 p-4 md:p-8">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}

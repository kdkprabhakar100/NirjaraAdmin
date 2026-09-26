// ========================================
// NAVIGATION
//
// The sidebar, top to bottom. An entry is
// either a link or a group of links that
// the sidebar shows as a dropdown.
// ========================================

import type { Permission } from "../services/auth/auth.types";

export type NavLinkItem = {
  label: string;
  path: string;
  // Pages reached from this one that are
  // not in the sidebar themselves; the
  // link stays highlighted on them.
  activeFor?: string[];
  // Hidden from accounts without it. The
  // API enforces the same permission.
  permission?: Permission;
};

export type NavGroup = {
  label: string;
  children: NavLinkItem[];
};

export type NavItem = NavLinkItem | NavGroup;

export const isNavGroup = (
  item: NavItem
): item is NavGroup => "children" in item;

export const navigation: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    permission: "dashboard.view",
  },
  {
    label: "Branches",
    path: "/branches",
    permission: "branches.view",
  },
  {
    label: "Bookings",
    path: "/bookings",
    permission: "bookings.view",
  },
  {
    label: "Services",
    path: "/services",
    activeFor: ["/service-categories"],
    permission: "services.view",
  },
  {
    label: "Courses",
    path: "/courses",
    permission: "courses.view",
  },
  {
    label: "Messages",
    path: "/messages",
    permission: "messages.view",
  },
  {
    label: "CMS",
    children: [
      {
        label: "Blogs",
        path: "/blogs",
        permission: "blogs.view",
      },
      {
        label: "Gallery",
        path: "/gallery",
        permission: "gallery.view",
      },
      {
        label: "Popups",
        path: "/popups",
        permission: "popups.view",
      },
      {
        label: "Events",
        path: "/events",
        permission: "events.view",
      },
      {
        label: "Careers",
        path: "/careers",
        permission: "careers.view",
      },
      {
        label: "Team",
        path: "/team",
        permission: "team.view",
      },
    ],
  },
  {
    label: "Orders",
    path: "/orders",
    permission: "orders.view",
  },
  {
    label: "Products",
    path: "/products",
    permission: "products.view",
  },
  {
    label: "Customers",
    path: "/customers",
    permission: "customers.view",
  },
  {
    label: "Admin Users",
    path: "/users",
    permission: "adminUsers.view",
  },
  {
    label: "Roles & Permissions",
    path: "/roles",
    permission: "roles.view",
  },
  {
    label: "Settings",
    path: "/settings",
    permission: "settings.view",
  },
];

// The sidebar for one account: links it
// lacks the permission for are dropped,
// and so is a group left empty.
export const visibleNavigation = (
  permissions: Permission[]
): NavItem[] => {
  const allowed = (link: NavLinkItem) =>
    !link.permission ||
    permissions.includes(link.permission);

  return navigation.flatMap<NavItem>((item) => {
    if (!isNavGroup(item)) {
      return allowed(item) ? [item] : [];
    }

    const children =
      item.children.filter(allowed);

    return children.length
      ? [{ ...item, children }]
      : [];
  });
};

// ========================================
// QUICK LINKS
//
// The shortcuts in the top navbar: the
// pages opened most in a working day.
// Everything is still in the sidebar.
// ========================================

export const quickLinks: NavLinkItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    permission: "dashboard.view",
  },
  {
    label: "Bookings",
    path: "/bookings",
    permission: "bookings.view",
  },
  {
    label: "Orders",
    path: "/orders",
    permission: "orders.view",
  },
  {
    label: "Messages",
    path: "/messages",
    permission: "messages.view",
  },
];

export const visibleQuickLinks = (
  permissions: Permission[]
): NavLinkItem[] =>
  quickLinks.filter(
    (link) =>
      !link.permission ||
      permissions.includes(link.permission)
  );

// ========================================
// HOME
//
// Where "/" and unknown URLs land: the
// first sidebar page the account can
// open, so an account without the
// dashboard does not start on a
// "no access" screen.
// ========================================

export const homePath = (
  permissions: Permission[]
): string => {
  const [first] =
    visibleNavigation(permissions);

  if (!first) {
    return "/dashboard";
  }

  return isNavGroup(first)
    ? first.children[0].path
    : first.path;
};

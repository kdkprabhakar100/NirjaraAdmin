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
  { label: "Dashboard", path: "/dashboard" },
  { label: "Branches", path: "/branches" },
  { label: "Bookings", path: "/bookings" },
  {
    label: "Services",
    path: "/services",
    activeFor: ["/service-categories"],
  },
  { label: "Courses", path: "/courses" },
  { label: "Messages", path: "/messages" },
  {
    label: "CMS",
    children: [
      { label: "Blogs", path: "/blogs" },
      { label: "Gallery", path: "/gallery" },
      { label: "Popups", path: "/popups" },
      { label: "Events", path: "/events" },
      { label: "Careers", path: "/careers" },
      { label: "Team", path: "/team" },
    ],
  },
  { label: "Orders", path: "/orders" },
  { label: "Products", path: "/products" },
  { label: "Customers", path: "/customers" },
  {
    label: "Users",
    path: "/users",
    permission: "users.manage",
  },
  { label: "Settings", path: "/settings" },
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
  { label: "Dashboard", path: "/dashboard" },
  { label: "Bookings", path: "/bookings" },
  { label: "Orders", path: "/orders" },
  { label: "Messages", path: "/messages" },
];

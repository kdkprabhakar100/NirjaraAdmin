// ========================================
// NAVIGATION
//
// The sidebar, top to bottom. An entry is
// either a link or a group of links that
// the sidebar shows as a dropdown.
// ========================================

export type NavLinkItem = {
  label: string;
  path: string;
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
  { label: "Bookings", path: "/bookings" },
  { label: "Services", path: "/services" },
  { label: "Service Categories", path: "/service-categories" },
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
  { label: "Settings", path: "/settings" },
];

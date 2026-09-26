import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import RequirePermission, {
  HomeRedirect,
} from "./components/RequirePermission";
import type { Permission } from "./services/auth/auth.types";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import BookingsAdmin from "./pages/bookings/BookingsAdmin";
import ServicesAdmin from "./pages/services/ServicesAdmin";
import ServiceCategoriesAdmin from "./pages/serviceCategories/ServiceCategoriesAdmin";
import GalleryAdmin from "./pages/cms/gallery/GalleryAdmin";
import CoursesAdmin from "./pages/courses/CoursesAdmin";
import ContactMessagesAdmin from "./pages/messages/ContactMessagesAdmin";
import BlogAdmin from "./pages/cms/blogs/BlogAdmin";
import AdminOrders from "./pages/orders/AdminOrders";
import AdminProducts from "./pages/products/AdminProducts";
import AdminPopup from "./pages/cms/popups/AdminPopup";
import AdminEvents from "./pages/cms/events/AdminEvents";
import AdminCareers from "./pages/cms/careers/AdminCareers";
import CustomersAdmin from "./pages/customers/CustomersAdmin";
import AdminTeam from "./pages/cms/team/AdminTeam";
import AdminSettings from "./pages/settings/AdminSettings";
import BranchesAdmin from "./pages/branches/BranchesAdmin";
import UsersAdmin from "./pages/users/UsersAdmin";
import RolesAdmin from "./pages/roles/RolesAdmin";

// A page inside the admin layout. With
// `permission`, accounts whose role lacks
// it see a "no access" note instead.
function ProtectedPage({
  permission,
  children,
}: {
  permission?: Permission;
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <RequirePermission
          permission={permission}
        >
          {children}
        </RequirePermission>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />

      <Routes>
        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedPage permission="dashboard.view">
              <Dashboard />
            </ProtectedPage>
          }
        />

        {/* BRANCHES */}
        <Route
          path="/branches"
          element={
            <ProtectedPage permission="branches.view">
              <BranchesAdmin />
            </ProtectedPage>
          }
        />

        {/* BOOKINGS */}
        <Route
          path="/bookings"
          element={
            <ProtectedPage permission="bookings.view">
              <BookingsAdmin />
            </ProtectedPage>
          }
        />

        {/* SERVICES */}
        <Route
          path="/services"
          element={
            <ProtectedPage permission="services.view">
              <ServicesAdmin />
            </ProtectedPage>
          }
        />

        {/* SERVICE CATEGORIES */}
        <Route
          path="/service-categories"
          element={
            <ProtectedPage permission="serviceCategories.view">
              <ServiceCategoriesAdmin />
            </ProtectedPage>
          }
        />

        {/* GALLERY */}
        <Route
          path="/gallery"
          element={
            <ProtectedPage permission="gallery.view">
              <GalleryAdmin />
            </ProtectedPage>
          }
        />

        {/* COURSES */}
        <Route
          path="/courses"
          element={
            <ProtectedPage permission="courses.view">
              <CoursesAdmin />
            </ProtectedPage>
          }
        />

        {/* MESSAGES */}
        <Route
          path="/messages"
          element={
            <ProtectedPage permission="messages.view">
              <ContactMessagesAdmin />
            </ProtectedPage>
          }
        />

        {/* BLOGS */}
        <Route
          path="/blogs"
          element={
            <ProtectedPage permission="blogs.view">
              <BlogAdmin />
            </ProtectedPage>
          }
        />

        {/* ORDERS */}
        <Route
          path="/orders"
          element={
            <ProtectedPage permission="orders.view">
              <AdminOrders />
            </ProtectedPage>
          }
        />

        {/* PRODUCTS */}
        <Route
          path="/products"
          element={
            <ProtectedPage permission="products.view">
              <AdminProducts />
            </ProtectedPage>
          }
        />

        {/* POPUPS */}
        <Route
          path="/popups"
          element={
            <ProtectedPage permission="popups.view">
              <AdminPopup />
            </ProtectedPage>
          }
        />

        {/* EVENTS */}
        <Route
          path="/events"
          element={
            <ProtectedPage permission="events.view">
              <AdminEvents />
            </ProtectedPage>
          }
        />

        {/* CAREERS */}
        <Route
          path="/careers"
          element={
            <ProtectedPage permission="careers.view">
              <AdminCareers />
            </ProtectedPage>
          }
        />

        {/* CUSTOMERS */}
        <Route
          path="/customers"
          element={
            <ProtectedPage permission="customers.view">
              <CustomersAdmin />
            </ProtectedPage>
          }
        />

        {/* TEAM */}
        <Route
          path="/team"
          element={
            <ProtectedPage permission="team.view">
              <AdminTeam />
            </ProtectedPage>
          }
        />

        {/* USERS */}
        <Route
          path="/users"
          element={
            <ProtectedPage permission="adminUsers.view">
              <UsersAdmin />
            </ProtectedPage>
          }
        />

        {/* ROLES & PERMISSIONS */}
        <Route
          path="/roles"
          element={
            <ProtectedPage permission="roles.view">
              <RolesAdmin />
            </ProtectedPage>
          }
        />

        {/* SETTINGS */}
        <Route
          path="/settings"
          element={
            <ProtectedPage permission="settings.view">
              <AdminSettings />
            </ProtectedPage>
          }
        />

        {/* ROOT */}
        <Route
          path="/"
          element={<HomeRedirect />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={<HomeRedirect />}
        />
      </Routes>
    </BrowserRouter>
  );
}

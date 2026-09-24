import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

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

function ProtectedPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AdminLayout>
        {children}
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
            <ProtectedPage>
              <Dashboard />
            </ProtectedPage>
          }
        />

        {/* BRANCHES */}
        <Route
          path="/branches"
          element={
            <ProtectedPage>
              <BranchesAdmin />
            </ProtectedPage>
          }
        />

        {/* BOOKINGS */}
        <Route
          path="/bookings"
          element={
            <ProtectedPage>
              <BookingsAdmin />
            </ProtectedPage>
          }
        />

        {/* SERVICES */}
        <Route
          path="/services"
          element={
            <ProtectedPage>
              <ServicesAdmin />
            </ProtectedPage>
          }
        />

        {/* SERVICE CATEGORIES */}
        <Route
          path="/service-categories"
          element={
            <ProtectedPage>
              <ServiceCategoriesAdmin />
            </ProtectedPage>
          }
        />

        {/* GALLERY */}
        <Route
          path="/gallery"
          element={
            <ProtectedPage>
              <GalleryAdmin />
            </ProtectedPage>
          }
        />

        {/* COURSES */}
        <Route
          path="/courses"
          element={
            <ProtectedPage>
              <CoursesAdmin />
            </ProtectedPage>
          }
        />

        {/* MESSAGES */}
        <Route
          path="/messages"
          element={
            <ProtectedPage>
              <ContactMessagesAdmin />
            </ProtectedPage>
          }
        />

        {/* BLOGS */}
        <Route
          path="/blogs"
          element={
            <ProtectedPage>
              <BlogAdmin />
            </ProtectedPage>
          }
        />

        {/* ORDERS */}
        <Route
          path="/orders"
          element={
            <ProtectedPage>
              <AdminOrders />
            </ProtectedPage>
          }
        />

        {/* PRODUCTS */}
        <Route
          path="/products"
          element={
            <ProtectedPage>
              <AdminProducts />
            </ProtectedPage>
          }
        />

        {/* POPUPS */}
        <Route
          path="/popups"
          element={
            <ProtectedPage>
              <AdminPopup />
            </ProtectedPage>
          }
        />

        {/* EVENTS */}
        <Route
          path="/events"
          element={
            <ProtectedPage>
              <AdminEvents />
            </ProtectedPage>
          }
        />

        {/* CAREERS */}
        <Route
          path="/careers"
          element={
            <ProtectedPage>
              <AdminCareers />
            </ProtectedPage>
          }
        />

        {/* CUSTOMERS */}
        <Route
          path="/customers"
          element={
            <ProtectedPage>
              <CustomersAdmin />
            </ProtectedPage>
          }
        />

        {/* TEAM */}
        <Route
          path="/team"
          element={
            <ProtectedPage>
              <AdminTeam />
            </ProtectedPage>
          }
        />

        {/* SETTINGS */}
        <Route
          path="/settings"
          element={
            <ProtectedPage>
              <AdminSettings />
            </ProtectedPage>
          }
        />

        {/* ROOT */}
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
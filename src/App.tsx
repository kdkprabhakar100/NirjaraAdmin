import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BookingsAdmin from "./pages/BookingsAdmin";
import ServicesAdmin from "./pages/ServicesAdmin";
import GalleryAdmin from "./pages/GalleryAdmin";
import CoursesAdmin from "./pages/CoursesAdmin";
import ContactMessagesAdmin from "./pages/ContactMessagesAdmin";
import BlogAdmin from "./pages/BlogAdmin";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import AdminPopup from "./pages/AdminPopup";
import AdminEvents from "./pages/AdminEvents";
import AdminCareers from "./pages/AdminCareers";
import AdminSettings from "./pages/AdminSettings";
import TiptapEditor from "./components/TiptapEditor";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          }
        />

        <Route
          path="/bookings"
          element={
            <AdminLayout>
              <BookingsAdmin />
            </AdminLayout>
          }
        />

        <Route
          path="/services"
          element={
            <AdminLayout>
              <ServicesAdmin />
            </AdminLayout>
          }
        />

        <Route
          path="/gallery"
          element={
            <AdminLayout>
              <GalleryAdmin />
            </AdminLayout>
          }
        />

        <Route
          path="/courses"
          element={
            <AdminLayout>
              <CoursesAdmin />
            </AdminLayout>
          }
        />

        <Route
          path="/messages"
          element={
            <AdminLayout>
              <ContactMessagesAdmin />
            </AdminLayout>
          }
        />

        <Route
          path="/blogs"
          element={
            <AdminLayout>
              <BlogAdmin />
            </AdminLayout>
          }
        />

        <Route
          path="/orders"
          element={
            <AdminLayout>
              <AdminOrders />
            </AdminLayout>
          }
        />

        <Route
          path="/products"
          element={
            <AdminLayout>
              <AdminProducts />
            </AdminLayout>
          }
        />

        <Route
          path="/popups"
          element={
            <AdminLayout>
              <AdminPopup />
            </AdminLayout>
          }
        />

        <Route
          path="/events"
          element={
            <AdminLayout>
              <AdminEvents />
            </AdminLayout>
          }
        />

        <Route
          path="/careers"
          element={
            <AdminLayout>
              <AdminCareers />
            </AdminLayout>
          }
        />

        <Route
          path="/settings"
          element={
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          }
        />

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
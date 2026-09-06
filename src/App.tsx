import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

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

function ProtectedPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
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
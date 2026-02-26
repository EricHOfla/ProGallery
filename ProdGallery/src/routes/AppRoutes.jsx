import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "../pages/Home";
import Gallery from "../pages/Gallery";
import PhotoDetails from "../pages/PhotoDetails";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Services from "../pages/Services";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import OrderDetails from "../pages/OrderDetails";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ChangePassword from "../pages/ChangePassword";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import NotFound from "../pages/NotFound";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminPhotos from "../pages/admin/Photos";
import AdminOrders from "../pages/admin/Orders";
import AdminCategories from "../pages/admin/Categories";
import AdminPhotoForm from "../pages/admin/PhotoForm";
import AdminPhotoEdit from "../pages/admin/PhotoEdit";
import AdminOrderDetails from "../pages/admin/OrderDetails";
import AdminContactMessages from "../pages/admin/ContactMessages";
import AdminAnalytics from "../pages/admin/Analytics";
import AdminUsers from "../pages/admin/Users";

function AppRoutesContent() {
  const location = useLocation();
  const hideNavFooter = ["/login", "/register", "/forgot-password", "/reset-password"].includes(location.pathname) || location.pathname.startsWith("/admin");

  return (
    <>
      {!hideNavFooter && <Navbar />}
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/photo/:id" element={<PhotoDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="photos" element={<AdminPhotos />} />
            <Route path="photos/new" element={<AdminPhotoForm />} />
            <Route path="photos/edit/:photoId" element={<AdminPhotoEdit />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:orderId" element={<AdminOrderDetails />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="messages" element={<AdminContactMessages />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideNavFooter && <Footer />}
    </>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AppRoutesContent />
    </BrowserRouter>
  );
}

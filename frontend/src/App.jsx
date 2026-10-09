import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Intro from "./Intro";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Materials from "./pages/Materials";
import Login from "./pages/Login";
import LoginRequired from "./pages/LoginRequired";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import MaterialDetails from "./pages/MaterialDetails";
import Order from "./pages/Order";
import MyOrders from "./pages/MyOrders";
import CreateListing from "./pages/CreateListing";
import MyListings from "./pages/MyListings";
import EditListing from "./pages/EditListing";
import OrderDetails from "./pages/OrderDetails";
import SellerOrders from "./pages/SellerOrders";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminMaterials from "./pages/admin/AdminMaterials";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminTransporters from "./pages/admin/AdminTransporters";
import AdminLayout from "./pages/admin/AdminLayout";

import Footer from "./components/Footer";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return (
      <LoginRequired
        from={location}
      />
    );
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const payload = JSON.parse(atob(token.split(".")[1]));

  if (payload.role !== "admin") {
    return <Navigate to="/materials" replace />;
  }

  return children;
};

function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro && (
        <Intro onComplete={() => setShowIntro(false)} />
      )}

      {!showIntro && (
        <BrowserRouter>
          <Navbar />

          <main style={{ paddingTop: "80px" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/materials/:id" element={<MaterialDetails />} />

              <Route
                path="/order" element={
                  <ProtectedRoute>
                    <Order />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/sell" element={
                  <ProtectedRoute>
                    <CreateListing />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-listings" element={
                  <ProtectedRoute>
                    <MyListings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/edit-listing/:id" element={
                  <ProtectedRoute>
                    <EditListing />
                  </ProtectedRoute>
                }
              />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              <Route
                path="/my-orders" element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/orders/:id" element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />

                <Route
                  path="users"
                  element={<AdminUsers />}
                />

                <Route
                  path="materials"
                  element={<AdminMaterials />}
                />

                <Route
                  path="orders"
                  element={<AdminOrders />}
                />

                <Route
                  path="transporters"
                  element={<AdminTransporters />}
                />
              </Route>
              <Route
                path="/seller-orders"
                element={
                  <ProtectedRoute>
                    <SellerOrders />
                  </ProtectedRoute>
                }
              />
            </Routes>

            <Footer />
          </main>
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
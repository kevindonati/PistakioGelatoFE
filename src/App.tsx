import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import Login from "./pages/guest pages/Login"
import ProtectedRoute from "./components/ProtectedRoute"
import Loading from "./components/Loading"
import AdminRoute from "./components/AdminRoute"
import Navbar from "./components/Navbar"
import GuestRoute from "./components/GuestRoute"
import Register from "./pages/guest pages/Register"
import "../src/App.css"
import Catalog from "./pages/guest pages/Catalog"
import FlavorDetails from "./pages/guest pages/FlavorDetails"
import { CartProvider } from "./context/CartContext"
import Cart from "./pages/guest pages/Cart"
import Checkout from "./pages/guest pages/Checkout"
import NewAddress from "./pages/guest pages/NewAddress"
import PaymentSuccess from "./pages/guest pages/PaymentSuccess"
import Orders from "./pages/guest pages/Order"
import OrderDetails from "./pages/guest pages/OrderDetails"
import AdminLayout from "./components/AdminLayout"
import AdminDashboard from "./pages/admin pages/AdminDashboard"
import AdminOrders from "./pages/admin pages/AdminOrders"
import AdminOrderDetails from "./pages/admin pages/AdminOrderDetails"
import AdminFlavors from "./pages/admin pages/AdminFlavors"
import AdminFlavorForm from "./pages/admin pages/AdminFlavorForm"
import AdminTubs from "./pages/admin pages/AdminTubs"
import AdminTubForm from "./pages/admin pages/AdminTubForm"
import AdminCategories from "./pages/admin pages/AdminCategories"
import AdminCategoryForm from "./pages/admin pages/AdminCategoryForm"
import AdminCustomers from "./pages/admin pages/AdminCustomers"
import AdminCustomerDetails from "./pages/admin pages/AdminCustomerDetails"
import Home from "./pages/guest pages/Home"
import Footer from "./components/Footer"
import Account from "./pages/guest pages/Account"
import Addresses from "./pages/guest pages/Addresses"
import EditAddress from "./pages/guest pages/EditAddress"
import PaymentFailed from "./pages/guest pages/PaymentFailed"
import AdminSettings from "./pages/admin pages/AdminSettings"
import ForgotPassword from "./pages/guest pages/ForgotPassword"
import ResetPassword from "./pages/guest pages/ResetPassword"

function NotFound() {
  return <h1>404 - Pagina non trovata</h1>
}

function AppContent() {
  const location = useLocation()

  const isAdminRoute = location.pathname.startsWith("/admin")
  const isLoginRoute = location.pathname.startsWith("/login")
  const isRegisterRoute = location.pathname.startsWith("/register")

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* ADMIN */}

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />

            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
            <Route path="/admin/catalog/flavors" element={<AdminFlavors />} />
            <Route
              path="/admin/catalog/flavors/new"
              element={<AdminFlavorForm />}
            />
            <Route
              path="/admin/catalog/flavors/:id/edit"
              element={<AdminFlavorForm />}
            />
            <Route path="/admin/catalog/tubs" element={<AdminTubs />} />
            <Route path="/admin/catalog/tubs/new" element={<AdminTubForm />} />

            <Route
              path="/admin/catalog/tubs/:id/edit"
              element={<AdminTubForm />}
            />
            <Route
              path="/admin/catalog/categories"
              element={<AdminCategories />}
            />

            <Route
              path="/admin/catalog/categories/new"
              element={<AdminCategoryForm />}
            />

            <Route
              path="/admin/catalog/categories/:id/edit"
              element={<AdminCategoryForm />}
            />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route
              path="/admin/customers/:id"
              element={<AdminCustomerDetails />}
            />
            <Route path="/admin/settings" element={<AdminSettings />} />
            {/* 
            
            <Route
              path="/admin/shipments"
              element={<AdminShipments />}
            />
            <Route
              path="/admin/payments"
              element={<AdminPayments />}
            />
            */}
          </Route>
        </Route>

        {/* HOME */}

        <Route path="/" element={<Home />} />

        {/* GUEST */}

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* CATALOGO */}

        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/flavors/:id" element={<FlavorDetails />} />

        {/* CART */}

        <Route path="/cart" element={<Cart />} />

        {/* PROTECTED */}

        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
          <Route path="/account/addresses/new" element={<NewAddress />} />
          <Route path="/account/addresses" element={<Addresses />} />
          <Route path="/account/addresses/:id/edit" element={<EditAddress />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failed" element={<PaymentFailed />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
        </Route>

        {/* TEST */}

        <Route path="/aa" element={<Loading />} />

        {/* 404 */}

        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdminRoute && !isLoginRoute && !isRegisterRoute && <Footer />}
    </>
  )
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </CartProvider>
  )
}

export default App

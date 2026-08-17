import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import ProtectedRoute from "./components/ProtectedRoute"
import Loading from "./components/Loading"
import AdminRoute from "./components/AdminRoute"
import Navbar from "./components/Navbar"
import GuestRoute from "./components/GuestRoute"
import Register from "./pages/Register"

function Home() {
  return <h1>Home</h1>
}

function Catalog() {
  return <h1>Catalog</h1>
}

function Cart() {
  return <h1>Cart</h1>
}

function Checkout() {
  return <h1>Checkout</h1>
}

function Account() {
  return <h1>Account</h1>
}

function Admin() {
  return <h1>Admin</h1>
}

function NotFound() {
  return <h1>404 - Pagina non trovata</h1>
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="/catalog" element={<Catalog />} />
        <Route path="/cart" element={<Cart />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="/aa" element={<Loading />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import React, { useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./homepage/HomePage";
import ProductsPage from "./products/ProductsPage";
import ProductDetailPage from "./products/ProductDetailPage";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";
import ProfilePage from "./auth/ProfilePage";
import InventoryPage from "./inventory/InventoryPage";
import type { User } from "./auth/auth.types";
import ReportsGenerating from "./inventory/ReportsGeneratingPage";
import CartPage from "./cart/CartPage";
import { ToastContainer } from "react-toastify"; //Dodany import dla ToastContainer do powiadomień
import 'react-toastify/dist/ReactToastify.css';

const getStoredUser = (): User | null => {
  const savedUser = localStorage.getItem("auth_user");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser) as User;
  } catch {
    localStorage.removeItem("auth_user");
    return null;
  }
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [searchInput, setSearchInput] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  });

  const handleLogin = (user: User, token: string) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
    navigate("/login");
  };

  const handleSearch = () => {
    const trimmed = searchInput.trim();
    const currentParams = new URLSearchParams(location.search);
    if (!trimmed){
      currentParams.delete("search");
    } else {
      currentParams.set("search", trimmed)
    }
    navigate(`/products?${currentParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-sky-50 text-slate-900">
      {/* HEADER */}
      <Header
        user={user}
        onLogout={handleLogout}
        search={searchInput}
        setSearch={setSearchInput}
        onSearch={handleSearch}
      />

      {/* VIEWS CONTAINER */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route
            path="/inventory"
            element={<InventoryPage currentUser={user} />}
          />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
          <Route 
            path="/profile" 
            element={
              <ProfilePage 
                currentUser={user} 
                onUpdateUser={setUser} 
                onLogout={handleLogout} 
              />
            } 
          />
          <Route path="/reports" element={<ReportsGenerating />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </main>
      <ToastContainer
        style={{ marginTop: "90px" }}
        position="top-right"
        autoClose={3000}
        theme="light"
        limit={3}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
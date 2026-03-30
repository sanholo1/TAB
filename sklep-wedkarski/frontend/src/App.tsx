import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";

import Header from "./components/Header.tsx";
import CategoryFilter from "./components/CategoryFilter.tsx";
import PriceFilter from "./components/PriceFilter.tsx";
import ProductsPage from "./products/ProductsPage";
import ProductDetailPage from "./products/ProductDetailPage";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";
import ProfilePage from "./auth/ProfilePage";
import type { User } from "./auth/auth.types";

export interface Product {
  id_przedmiotu: number;
  nazwa: string;
  opis: string | null;
  cena_sprzedazy: number;
  id_kategorii: number;
}

export interface Category {
  id_kategorii: number;
  nazwa: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  const goToProducts = (options?: { category?: number | null; price?: string | null }) => {
    const params = new URLSearchParams();
    if (options?.category) params.set("category", String(options.category));
    if (options?.price) params.set("price", options.price);
    const query = params.toString();
    navigate(`/products${query ? `?${query}` : ""}`);
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      goToProducts({
        category: categoryId,
        price: selectedPrice,
      });
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get<Category[]>("http://localhost:3000/categories");
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-300/20">
        <h1 className="text-4xl font-semibold text-slate-900">Sklep Wędkarski</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Minimalistyczny interfejs w morskich odcieniach. Wybierz kategorię lub wyświetl wszystkie produkty.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[2rem] border border-slate-200 bg-slate-50/90 p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">Filtry</h2>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}
          />
          <div className="mt-6">
            <PriceFilter
              selectedPrice={selectedPrice}
              setSelectedPrice={setSelectedPrice}
            />
          </div>
        </aside>

        <main className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-slate-900">Witaj nad wodą</h2>
            <p className="text-slate-600">
              Skorzystaj z prostego wyszukiwania i znajdź akcesoria oraz sprzęt wędkarski.
            </p>
          </div>
        </main>
      </section>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("auth_user");
      }
    }
  }, []);

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
    if (!trimmed) return;
    navigate(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen bg-sky-50 text-slate-900">
      <Header
        user={user}
        onLogout={handleLogout}
        search={searchInput}
        setSearch={setSearchInput}
        onSearch={handleSearch}
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage currentUser={user} onUpdateUser={setUser} onLogout={handleLogout} />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default App;

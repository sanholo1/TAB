import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";

import Header from "./components/Header.tsx";
import CategoryFilter from "./components/CategoryFilter.tsx";
import ProductsPage from "./products/ProductsPage";
import ProductDetailPage from "./products/ProductDetailPage";

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
  const [searchInput, setSearchInput] = useState<string>("");

  const goToProducts = (options?: { category?: number | null; search?: string }) => {
    const params = new URLSearchParams();
    const searchValue = options?.search?.trim();
    if (searchValue) params.set("search", searchValue);
    if (options?.category) params.set("category", String(options.category));
    const query = params.toString();
    navigate(`/products${query ? `?${query}` : ""}`);
  };

  const handleSearchClick = () => {
    if (!searchInput.trim() && !selectedCategory) {
      return;
    }
    goToProducts({
      search: searchInput,
      category: selectedCategory,
    });
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      goToProducts({
        category: categoryId,
        search: searchInput,
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
    <div>
      <Header
        search={searchInput}
        setSearch={setSearchInput}
        onSearch={handleSearchClick}
      />
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={handleCategoryChange}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
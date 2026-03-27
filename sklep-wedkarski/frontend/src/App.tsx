import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import debounce from "lodash.debounce";

import Header from "./components/Header.tsx";
import CategoryFilter from "./components/CategoryFilter.tsx";
import PriceFilter from "./components/PriceFilter.tsx";
import ProductList from "./components/ProductList.tsx";

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

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");

const fetchProducts = async (overrideSearch?: string) => {
  try {
    const params: any = {};
    const searchValue = overrideSearch ?? search;
    if (searchValue) params.search = searchValue;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedPrice) params.price = selectedPrice;

    const res = await axios.get("http://localhost:3000/products", { params });
    setProducts(res.data);
  } catch (err) {
    console.error(err);
  }
};

const debouncedFetchProducts = useMemo(
  () => debounce(() => fetchProducts(), 100),
  [selectedCategory, selectedPrice]
);

useEffect(() => {
  debouncedFetchProducts();
  return debouncedFetchProducts.cancel;
}, [selectedCategory, selectedPrice]);

const handleSearchClick = () => {
  setSearch(searchInput);
  fetchProducts(searchInput);
};

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:3000/categories");
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
        setSelectedCategory={setSelectedCategory}
      />
      <PriceFilter
        selectedPrice={selectedPrice}
        setSelectedPrice={setSelectedPrice}
      />
      <ProductList products={products} />
    </div>
  );
};

export default App;
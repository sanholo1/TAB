import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCategories, fetchProducts } from "../products/products.api";
import type { Category, Product } from "../products/products.types";
import ProductCard from "../components/ProductCard";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error("Błąd pobierania kategorii:", err));

    fetchProducts()
      .then((products) => {
        // SLICE NA 4 PRODUKTACH
        // TODO: parametr limit? od strony endpointu albo osobny endpoint na topowe produkty
        setFeaturedProducts(products.slice(0, 4));
      })
      .catch((err) => console.error("Błąd pobierania produktów:", err));
  }, []);

  const goToCategory = (categoryId: number) => {
    navigate(`/products?category=${categoryId}`);
  };

  return (
    <div className="flex flex-col gap-12 py-6">
      {/* HELLO */}
      <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-sky-800 px-8 py-16 text-center text-white shadow-lg md:py-24">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-sky-700/50 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-sky-600/50 blur-3xl"></div>
        
        <div className="relative z-10 mx-auto max-w-2xl">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
            Witaj w Sklepie Wędkarskim!
          </h1>
          <p className="mb-10 text-lg font-medium text-sky-100 md:text-xl">
            Wszystko, czego potrzebujesz żeby złowić największą sztukę. Najlepszy sprzęt, topowe marki i gwarancja udanego połowu.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="rounded-2xl bg-white px-8 py-4 text-base font-bold text-sky-900 shadow-sm transition hover:bg-sky-50 hover:shadow-md"
          >
            Przejdź do pełnego katalogu
          </button>
        </div>
      </div>

      {/* 2. Pasek zaufania (USPs) */}
      <div className="grid grid-cols-1 gap-4 rounded-[1.5rem] bg-white p-6 shadow-sm sm:grid-cols-3 border border-slate-100">
        <div className="flex flex-col items-center text-center">
          <span className="mb-2 text-2xl">[ikonka]</span>
          <h3 className="font-semibold text-slate-900">Darmowa dostawa</h3>
          <p className="text-sm text-slate-500">Dla zamówień powyżej 200 zł</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="mb-2 text-2xl">[ikonka]</span>
          <h3 className="font-semibold text-slate-900">Najwyższa jakość</h3>
          <p className="text-sm text-slate-500">Każda ryba chciałaby dać się złapać</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="mb-2 text-2xl">[ikonka]</span>
          <h3 className="font-semibold text-slate-900">30 dni na zwrot</h3>
          <p className="text-sm text-slate-500">Ale nie będzie on potrzebny</p>
        </div>
      </div>

      {/* CATEGORY */}
      <section>
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Popularne kategorie</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((cat) => (
            <button
              key={cat.id_kategorii}
              onClick={() => goToCategory(cat.id_kategorii)}
              className="group flex h-24 items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white p-4 text-lg font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-700 hover:shadow-md"
            >
              {cat.nazwa}
            </button>
          ))}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Polecane dla Ciebie</h2>
          <button 
            onClick={() => navigate("/products")}
            className="text-sm font-semibold text-sky-700 hover:text-sky-900"
          >
            Zobacz więcej &rarr;
          </button>
        </div>
        
        {featuredProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id_przedmiotu} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500">--- polecane ---</p>
        )}
      </section>
    </div>
  );
};

export default HomePage;
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchProducts, fetchCategories } from "./products.api";
import type { Product, Category } from "./products.types";
import ProductList from "../components/ProductList";
import FilterSidebar from "../components/FilterSidebar";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const searchParam = searchParams.get("search");
  const categoryIdParam = searchParams.get("category");
  const priceParam = searchParams.get("price");
  const minPriceParam = searchParams.get("min_price");
  const maxPriceParam = searchParams.get("max_price");

  useEffect(() => {
    fetchProducts({
      search: searchParam ?? undefined,
      category: categoryIdParam ? Number(categoryIdParam) : undefined,
      price: priceParam ?? undefined,
      min_price: minPriceParam ? Number(minPriceParam) : undefined,
      max_price: maxPriceParam ? Number(maxPriceParam) : undefined,
    })
      .then(setProducts)
      .catch(console.error);
  }, [searchParam, categoryIdParam, priceParam, minPriceParam, maxPriceParam]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);


  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-300/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Produkty</h1>
            {searchParam && (
              <p className="mt-2 text-slate-600">
                Wyniki wyszukiwania dla: <span className="font-semibold text-slate-900">{searchParam}</span>
              </p>
            )}
          </div>
          <Link
            to="/"
            className="rounded-2xl bg-sky-100 px-4 py-3 text-sm font-semibold text-sky-900 transition hover:bg-sky-200"
          >
            Powrót do strony głównej
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterSidebar
          categories={categories}
          selectedCategory={Number(categoryIdParam) || null}
          onCategoryChange={(id) => {
            const newParams = new URLSearchParams(searchParams);
            if (id) newParams.set("category", id.toString());
            else newParams.delete("category");
            setSearchParams(newParams);
          }}
          minPrice={minPriceParam || ""}
          maxPrice={maxPriceParam || ""}
          onPriceChange={(min, max) => {
            const newParams = new URLSearchParams(searchParams);
            if (min) newParams.set("min_price", min);
            else newParams.delete("min_price");
            
            if (max) newParams.set("max_price", max);
            else newParams.delete("max_price");
            
            setSearchParams(newParams);
          }}
          onClearFilters={() => {
            setSearchParams(new URLSearchParams()); // Czyści cały URL
          }}
        />

        <main className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">Lista produktów ({products.length})</h2>
          </div>

          <ProductList products={products} />

          {products.length === 0 && (
            <p className="mt-6 text-center text-slate-500">Brak produktów do wyświetlenia. Spróbuj zmienić filtr.</p>
          )}
        </main>
      </div>
    </div>
  );
}

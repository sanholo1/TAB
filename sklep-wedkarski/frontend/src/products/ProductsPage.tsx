import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchProducts, fetchCategories } from "./products.api";
import type { Product, Category } from "./products.types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const searchParam = searchParams.get("search");
  const categoryIdParam = searchParams.get("category");
  const priceParam = searchParams.get("price");
  const minPriceParam = searchParams.get("min_price");
  const maxPriceParam = searchParams.get("max_price");

  const [minPriceInput, setMinPriceInput] = useState(minPriceParam || "");
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam || "");
  const priceOptions = [
    { label: "do 50 zł", value: "low" },
    { label: "50-200 zł", value: "mid" },
    { label: "powyżej 200 zł", value: "high" },
  ];

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

  const handlePriceFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("price");
    if (minPriceInput) newParams.set("min_price", minPriceInput);
    else newParams.delete("min_price");

    if (maxPriceInput) newParams.set("max_price", maxPriceInput);
    else newParams.delete("max_price");

    setSearchParams(newParams);
  };

  const handlePresetPriceChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (priceParam === value) newParams.delete("price");
    else newParams.set("price", value);
    newParams.delete("min_price");
    newParams.delete("max_price");
    setMinPriceInput("");
    setMaxPriceInput("");
    setSearchParams(newParams);
  };

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
        <aside className="rounded-[2rem] border border-slate-200 bg-slate-50/90 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Filtry</h2>
            <p className="mt-2 text-slate-600">Dopasuj wyniki do swojego wypadu nad wodę.</p>
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Kategorie</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/products" className="text-slate-700 hover:text-sky-900">
                    Wszystkie
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id_kategorii}>
                    <Link to={`/products?category=${cat.id_kategorii}`} className="text-slate-700 hover:text-sky-900">
                      {cat.nazwa}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Cena</h3>
              <div className="flex flex-col gap-2">
                {priceOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`rounded-2xl px-4 py-3 text-left text-sm transition ${
                      priceParam === opt.value ? "bg-sky-700 text-white" : "bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                    onClick={() => handlePresetPriceChange(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                />
              </div>
              <button
                className="mt-4 w-full rounded-2xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
                type="button"
                onClick={handlePriceFilter}
              >
                Zastosuj
              </button>
            </div>
          </div>
        </aside>

        <main className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">Lista produktów ({products.length})</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p.id_przedmiotu} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="mb-4 flex h-32 items-center justify-center rounded-3xl bg-slate-100 text-sm text-slate-500">
                  [Zdjęcie produktu]
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{p.nazwa}</h3>
                <p className="mb-4 text-sm text-slate-600">{p.opis ?? "Brak opisu"}</p>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Kategoria: {p.id_kategorii}</p>
                  <p className="text-lg font-semibold text-slate-900">{p.cena_sprzedazy} zł</p>
                </div>
                <Link
                  to={`/products/${p.id_przedmiotu}`}
                  className="mt-4 inline-flex w-full justify-center rounded-2xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
                >
                  Szczegóły
                </Link>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <p className="mt-6 text-center text-slate-500">Brak produktów do wyświetlenia. Spróbuj zmienić filtr.</p>
          )}
        </main>
      </div>
    </div>
  );
}

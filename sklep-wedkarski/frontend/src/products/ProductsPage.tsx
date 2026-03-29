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
  const [searchInput, setSearchInput] = useState(searchParam || "");

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

  const handleSearchFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    const value = searchInput.trim();
    if (value) newParams.set("search", value);
    else newParams.delete("search");
    setSearchParams(newParams);
  };

  return (
    <div className="p-4 border border-dashed border-gray-400 min-h-screen">
      <header className="mb-4 pb-2 border-b border-gray-300">
        <h1 className="text-2xl font-bold">Produkty (Szkielet Układu)</h1>
        {searchParam && <p className="text-sm text-gray-500">Wyniki dla: <b>{searchParam}</b></p>}
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Lewa strona - Filtry */}
        <aside className="w-full md:w-64 border border-gray-300 p-4 flex-shrink-0">
          <div className="mb-2">
            <Link to="/" className="text-blue-600 underline">← Strona główna</Link>
          </div>

          <h2 className="font-bold mb-2">Wyszukiwanie</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Szukaj produktu..."
              className="border w-full p-1"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
              className="border bg-gray-200 px-3 py-1"
              onClick={handleSearchFilter}
            >
              Szukaj
            </button>
          </div>

          <h2 className="font-bold mb-2">Kategorie (Filtry)</h2>
          <ul className="space-y-1 mb-4">
            <li>
              <Link to="/products" className="text-blue-600 underline">Wszystkie</Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id_kategorii}>
                <Link to={`/products?category=${cat.id_kategorii}`} className="text-blue-600 underline">
                  {cat.nazwa}
                </Link>
              </li>
            ))}
          </ul>
          
          <h2 className="font-bold mb-2">Cena</h2>
          <div className="flex flex-col gap-2 mb-3">
            {priceOptions.map((opt) => (
              <button
                key={opt.value}
                className={priceParam === opt.value ? "active" : ""}
                onClick={() => handlePresetPriceChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-2">
            <input 
              type="number" 
              placeholder="Min" 
              className="border w-full p-1" 
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
            />
            <input 
              type="number" 
              placeholder="Max" 
              className="border w-full p-1" 
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
            />
          </div>
          <button 
            className="border bg-gray-200 px-4 py-1 w-full"
            onClick={handlePriceFilter}
          >
            Zastosuj
          </button>
        </aside>

        {/* Prawa strona - Lista produktów w siatce */}
        <main className="flex-1 border border-gray-300 p-4">
          <h2 className="font-bold mb-4">Lista produktów ({products.length})</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id_przedmiotu} className="border border-gray-400 p-2 flex flex-col">
                {/* Miejsce na zdjęcie */}
                <div className="bg-gray-200 h-32 mb-2 flex items-center justify-center text-gray-500 text-sm">
                  [Obrazek produktu]
                </div>
                
                <h3 className="font-bold">{p.nazwa}</h3>
                <div className="mt-auto pt-2">
                  <p className="text-sm">Ilość: {p.ilosc}</p>
                  {p.cena_prom ? (
                    <div>
                      <span className="line-through text-gray-400 text-xs">{p.cena_sprzedazy} zł</span>
                      <span className="text-red-600 font-bold ml-2">{p.cena_prom} zł</span>
                    </div>
                  ) : (
                    <span className="font-bold">{p.cena_sprzedazy} zł</span>
                  )}
                  
                  <Link 
                    to={`/products/${p.id_przedmiotu}`} 
                    className="block text-center border bg-blue-100 mt-2 py-1 text-blue-800"
                  >
                    Szczegóły
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {products.length === 0 && <p className="text-gray-500 italic">Brak produktów do wyświetlenia.</p>}
        </main>
      </div>
    </div>
  );
}
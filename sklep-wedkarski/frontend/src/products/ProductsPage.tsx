import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchProducts, fetchCategories } from "./products.api";
import type { Product, Category } from "./products.types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams] = useSearchParams();
  
  // Np. /products?kategoria=1
  const categoryIdParam = searchParams.get("kategoria");

  useEffect(() => {
    fetchProducts(categoryIdParam ? { id_kategorii: Number(categoryIdParam) } : undefined)
      .then(setProducts)
      .catch(console.error);
    fetchCategories().then(setCategories).catch(console.error);
  }, [categoryIdParam]);

  return (
    <div className="p-4 border border-dashed border-gray-400 min-h-screen">
      <header className="mb-4 pb-2 border-b border-gray-300">
        <h1 className="text-2xl font-bold">Produkty (Szkielet Układu)</h1>
        <p className="text-sm text-gray-500">Strona sklepu (dla danej kategorii lub wszystkich)</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Lewa strona - Filtry */}
        <aside className="w-full md:w-64 border border-gray-300 p-4 bg-gray-50 flex-shrink-0">
          <h2 className="font-bold mb-2">Kategorie (Filtry)</h2>
          <ul className="space-y-1 mb-4">
            <li>
              <Link to="/products" className="text-blue-600 underline">Wszystkie</Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id_kategorii}>
                <Link to={`/products?kategoria=${cat.id_kategorii}`} className="text-blue-600 underline">
                  {cat.nazwa}
                </Link>
              </li>
            ))}
          </ul>
          
          <h2 className="font-bold mb-2">Cena</h2>
          <div className="flex gap-2 mb-2">
            <input type="number" placeholder="Min" className="border w-full p-1" />
            <input type="number" placeholder="Max" className="border w-full p-1" />
          </div>
          <button className="border bg-gray-200 px-4 py-1 w-full">Zastosuj</button>
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

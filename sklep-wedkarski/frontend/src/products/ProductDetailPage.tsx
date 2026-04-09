import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductById, fetchProductReviews } from "./products.api";
import type { Product, Review } from "./products.types";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetchProductById(Number(id)).then(setProduct),
      fetchProductReviews(Number(id)).then(setReviews)
    ])
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const handleInventoryChange = () => {
      if (!id) return;
      setLoading(true);
      Promise.all([
        fetchProductById(Number(id)).then(setProduct),
        fetchProductReviews(Number(id)).then(setReviews)
      ])
      .catch(console.error)
      .finally(() => setLoading(false));
    };

    window.addEventListener("inventory:changed", handleInventoryChange);

    return () => window.removeEventListener("inventory:changed", handleInventoryChange);
  }, [id]);

  if (loading) return <div className="p-4">Ładowanie danych produktu...</div>;
  if (!product) return <div className="p-4">Nie znaleziono produktu. <Link to="/products" className="underline">Wróć</Link></div>;

  const imageUrl = product.zdjecie_url
    ? product.zdjecie_url.startsWith("http")
      ? product.zdjecie_url
      : `http://localhost:3000${product.zdjecie_url}`
    : null;

  return (
    <div className="p-4 rounded-lg border border-gray-300 min-h-screen bg-white shadow-xl">
      <button className="bg-sky-700 p-2.5 rounded-full">
        <Link to="/products" className="text-white">&larr; Powrót do listy </Link>
      </button>
      {/* Główny kontener 2 kolumny */}
      <div className="flex flex-col md:flex-row gap-6 p-4">
        
        {/* Lewa: Zdjęcie */}
        <div className="w-full md:w-1/2 bg-gray-200 h-64 md:h-auto flex items-center justify-center text-gray-500 border border-gray-300">
          {imageUrl ? (
            <img src={imageUrl} alt={product.nazwa} className="h-full w-full object-cover" />
          ) : (
            "[Miejsce na główne zdjęcie produktu]"
          )}
        </div>
        
        {/* Prawa: Informacje */}
        <div className=" bg-gray-50 border border-gray-300 w-full md:w-1/2 flex flex-col gap-4 p-8">
          <div className="">
            <span className="text-sm text-gray-500 uppercase">Kategoria {product.id_kategorii}</span>
            <h1 className="text-4xl font-bold">{product.nazwa}</h1>
          </div>

          {/* Lewo: Informacje o cenie i dostępności; Prawo: Przycisk do koszyka */}
          <div className="flex flex-row flex-wrap justify-between w-full items-center border-t border-gray-300 mt-4 pt-4">
            <div>
              {product.cena_prom ? (
                <div className="flex items-center gap-4 whitespace-nowrap">
                  <span className="line-through text-gray-400 text-lg">{product.cena_sprzedazy} zł</span>
                  <span className="text-4xl font-bold text-red-600">{product.cena_prom} zł</span>
                </div>
              ) : (
                <span className="text-4xl font-bold">{product.cena_sprzedazy} zł</span>
              )}
              
              <div className="mt-2 text-base opacity-80 pl-0.5">
                Dostępność: <strong className={product.ilosc > 0 ? "text-green-600" : "text-red-600"}>
                  {product.ilosc > 0 ? `${product.ilosc} szt.` : "Brak"}
                </strong>
              </div>
            </div>
            
            <button 
              onClick={() => alert("TODO: Wrzuć tu koszyk")} 
              disabled={product.ilosc <= 0}
              className={`py-6 px-8 !font-bold !text-lg border rounded-2xl whitespace-nowrap ${product.ilosc > 0 ? 'bg-sky-700 border-blue-400 text-white' : 'bg-gray-200 border-gray-400 text-gray-500'}`}
            >
              Dodaj do koszyka
            </button>
          </div>
        </div>
      </div>

      {/* Sekcja opisu produktu */}
      <div className="p-4 min-h-[100px] mt-10">
        <h3 className="font-bold border-b border-gray-300 mb-2 pb-1">Opis produktu</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{product.opis || "Brak opisu."}</p>
      </div>

      {/* Sekcja opinii pod spodem */}
      <div className="mt-6 rounded border border-gray-300 p-4">
        <h2 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">Opinie ({reviews.length})</h2>
        
        {reviews.length === 0 ? (
          <p className="text-gray-500 italic">Brak opinii dla tego produktu.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id_opinia} className="border border-gray-200 p-3 bg-gray-50">
                <div className="flex justify-between border-b border-gray-200 mb-2 pb-1">
                  <strong>Użytkownik #{r.id_uzytkownika}</strong>
                  <span>Ocena: {r.ocena}/5</span>
                </div>
                <p>{r.komentarz || "Brak treści."}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
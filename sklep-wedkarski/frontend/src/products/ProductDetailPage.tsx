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

  if (loading) return <div className="p-4">Ładowanie danych produktu...</div>;
  if (!product) return <div className="p-4">Nie znaleziono produktu. <Link to="/products" className="underline">Wróć</Link></div>;

  return (
    <div className="p-4 border border-dashed border-gray-400 min-h-screen">
      <div className="mb-4">
        <Link to="/products" className="text-blue-600 underline">&larr; Powrót do listy</Link>
      </div>
      
      {/* Główny kontener 2 kolumny */}
      <div className="flex flex-col md:flex-row gap-6 border border-gray-300 p-4">
        
        {/* Lewa: Zdjęcie */}
        <div className="w-full md:w-1/2 bg-gray-200 h-64 md:h-auto flex items-center justify-center text-gray-500 border border-gray-300">
          [Miejsce na główne zdjęcie produktu]
        </div>
        
        {/* Prawa: Informacje */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div>
            <span className="text-xs text-gray-500 uppercase">Kategoria {product.id_kategorii}</span>
            <h1 className="text-3xl font-bold">{product.nazwa}</h1>
          </div>
          
          <div className="border border-gray-300 p-4 bg-gray-50">
            {product.cena_prom ? (
              <div className="flex items-center gap-4">
                <span className="line-through text-gray-400 text-lg">{product.cena_sprzedazy} zł</span>
                <span className="text-3xl font-bold text-red-600">{product.cena_prom} zł</span>
              </div>
            ) : (
              <span className="text-3xl font-bold">{product.cena_sprzedazy} zł</span>
            )}
            
            <p className="mt-2 text-sm">
              Dostępność: <strong className={product.ilosc > 0 ? "text-green-600" : "text-red-600"}>
                {product.ilosc > 0 ? `${product.ilosc} szt.` : "Brak"}
              </strong>
            </p>
          </div>
          
          <div className="border border-gray-300 p-4 min-h-[100px]">
            <h3 className="font-bold border-b border-gray-300 mb-2 pb-1">Opis produktu</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{product.opis || "Brak opisu."}</p>
          </div>
          
          <button 
            onClick={() => alert("TODO: endpoint koszyka (Janek)")} 
            disabled={product.ilosc <= 0}
            className={`p-3 font-bold border ${product.ilosc > 0 ? 'bg-blue-100 border-blue-400' : 'bg-gray-200 border-gray-400 text-gray-500'}`}
          >
            Dodaj do koszyka
          </button>
        </div>
      </div>

      {/* Sekcja opinii pod spodem */}
      <div className="mt-6 border border-gray-300 p-4">
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

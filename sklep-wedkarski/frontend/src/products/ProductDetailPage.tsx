import { useEffect, useState } from "react";
import { useParams, Link, NavLink } from "react-router-dom";
import { addToCart, fetchProductById, fetchProductReviews, addProductReview } from "./products.api";
import type { Product, Review } from "./products.types";
import { toast } from "react-toastify";
import { ShieldCheck, Shrimp, Truck } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState("5");
  const token = localStorage.getItem("auth_token");

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

  // Obsługa dodawania do koszyka
  const handleAddToCart = async () => {
    if (!token)
    {
      let guest_cart = localStorage.getItem("Guest_cart") || "[]";
      let guest_cart_array = JSON.parse(guest_cart);
      const existingItem = guest_cart_array.find((item: any) => item.id_przedmiotu === product.id_przedmiotu);
      if (existingItem)
      {
        if(existingItem.ilosc < product.ilosc) {
          existingItem.ilosc++;
          toast.success(`Dodano produkt: ${product.nazwa} do koszyka.`);
        }
        else {
          toast.error(`Nie udało się dodać produktu: ${product.nazwa} do koszyka. Sprawdź dostępną ilość lub spróbuj ponownie później.`);
        }
      }
      else
      {
        guest_cart_array.push({ id_przedmiotu: product.id_przedmiotu, ilosc: 1 });
        toast.success(`Dodano produkt: ${product.nazwa} do koszyka.`);
      }
      guest_cart = JSON.stringify(guest_cart_array);
      localStorage.setItem("Guest_cart", guest_cart);
    }
    else    
    {
      try {
      await addToCart(product.id_przedmiotu, 1); // Na razie dodajemy na sztywno 1 sztukę, rozbuduję o możliwość wyboru ilości
      toast.success(`Dodano produkt: ${product.nazwa} do koszyka.`);
      } catch (error) {
      toast.error(`Nie udało się dodać produktu: ${product.nazwa} do koszyka. Sprawdź dostępną ilość lub spróbuj ponownie później.`);
      }
    }
  };

  const handleAddReview = async () => {
    if (!token) {
      toast.error("Musisz być zalogowany, aby dodać opinię.");
      return;
    }
    if (newReview.trim() === "") {
      toast.error("Treść opinii nie może być pusta.");
      return;
    }
    try {
        await addProductReview(product.id_przedmiotu, {rating: Number(rating), comment: newReview});
        toast.success("Twoja opinia została dodana!");
        setNewReview("");
        setRating("5");
    } catch (error) {
      toast.error("Nie udało się dodać opinii. Upewnij się, iż kupiłeś uprzednio ten produkt lub spróbuj ponownie później.");
    }
  }
  return (
    <div className="p-4 rounded-lg border border-gray-300 min-h-screen bg-white shadow-xl">
      <div className="mb-2 mt-2">
      <NavLink className="rounded-2xl bg-sky-700 p-3.5 text-white transition hover:bg-sky-800"
      to="/products"
      >&larr; Powrót do listy 
      </NavLink>
      </div>
      {/* Główny kontener 2 kolumny */}
      <div className="flex flex-col md:flex-row gap-6 p-4">
        
        {/* Lewa: Zdjęcie */}
        <div className="w-full md:w-1/2 bg-gray-200 h-64 md:h-auto flex items-center justify-center text-gray-500 border border-gray-300 relative overflow-hidden">
          {imageUrl ? (
            <div>
            <img src={imageUrl} alt={product.nazwa} className="h-full w-full object-cover absolute inset-0 blur-2xl opacity-50 scale-110 object-center" />
            <img src={imageUrl} alt={product.nazwa} className="h-100 w-200 object-contain relative drop-shadow-2xl object-center" />
            </div>
          ) : (
            "[Miejsce na główne zdjęcie produktu]"
          )}
        </div>
        
        {/* Prawa: Informacje */}
        <div className="bg-gray-50 border border-gray-300 w-full md:w-1/2 flex flex-col gap-6 p-8 rounded-3xl">
          <div>
          <span className="text-sm text-gray-500 uppercase tracking-wide">Kategoria: {product.kategoria?.nazwa}</span>
          <h1 className="text-4xl font-bold text-slate-900 mt-1">{product.nazwa}</h1>
        </div>

  <div className="flex flex-row flex-wrap justify-between w-full items-end border-t border-gray-300 mt-4 pt-6 gap-4">
    <div className="flex flex-col">
      {product.cena_prom ? (
        <div className="flex flex-col">
          <span className="line-through text-gray-400 text-base">{Number(product.cena_sprzedazy).toFixed(2)} zł</span>
          <span className="text-4xl font-black text-rose-600">{Number(product.cena_prom).toFixed(2)} zł</span>
        </div>
      ) : (
        <span className="text-4xl font-black text-slate-900">{Number(product.cena_sprzedazy).toFixed(2)} zł</span>
      )}
      
      <div className="mt-3 text-sm font-medium">
        Status: <span className={product.ilosc > 0 ? "text-green-600" : "text-red-600"}>
          {product.ilosc > 0 ? `Dostępne ${product.ilosc} szt.` : "Brak na stanie"}
        </span>
      </div>
    </div>
    
    <button 
      onClick={() => handleAddToCart()} 
      disabled={product.ilosc <= 0}
      className={`py-5 px-10 font-bold text-lg rounded-2xl transition-all active:scale-95 shadow-md ${
        product.ilosc > 0 
        ? 'bg-sky-700 text-white hover:bg-sky-800 shadow-sky-900/10' 
        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
    >
      Dodaj do koszyka
    </button>
    
  </div>
<div className="mt-auto pt-6 flex flex-row gap-4 border-t border-gray-200">
  <div className="flex items-center gap-3 text-slate-600">
    <Truck className="mb-3 h-8 w-8 text-sky-600" strokeWidth={1.5} />
    <div className="flex flex-col">
      <span className="text-sm font-bold">Szybka wysyłka</span>
      <span className="text-xs text-gray-500">Dostawa u Ciebie w 24-48h</span>
    </div>
  </div>

  <div className="flex items-center gap-3 text-slate-600">
    <ShieldCheck className="mb-3 h-8 w-8 text-sky-600" strokeWidth={1.5} />
    <div className="flex flex-col">
      <span className="text-sm font-bold">30 dni na zwrot</span>
      <span className="text-xs text-gray-500">Bezproblemowy zwrot towaru</span>
    </div>
  </div>

  <div className="flex items-center gap-3 text-slate-600">
    <Shrimp className="mb-3 h-8 w-8 text-sky-600" strokeWidth={1.5} />
    <div className="flex flex-col">
      <span className="text-sm font-bold">Gwarancja jakości</span>
      <span className="text-xs text-gray-500">Sprawdzony sprzęt wędkarski</span>
    </div>
  </div>
</div>
</div>
</div>

      {/* Sekcja opisu produktu */}
      <div className="mt-8 pl-4 pr-4">
        <h3 className="text-xl border-b border-gray-300 font-bold text-gray-900 mb-4">Opis produktu</h3>
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {product.opis || (
            <span className="text-gray-400 italic font-normal text-sm">Brak opisu dla tego produktu.</span>
          )}
        </div>
      </div>

      {/* Sekcja opinii pod spodem */}
<div className="mt-12 rounded p-4">
  <h2 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">Opinie ({reviews.length})</h2>
  {token ? (
    <div className="mt-4 mb-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
    <h4 className="font-semibold mb-3 text-slate-800">Dodaj swoją opinię!</h4>
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-600">Twoja ocena:</label>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
          <label 
          key={num} 
          className={`flex-1 flex flex-col items-center p-2 rounded-xl border cursor-pointer transition-all ${
          rating === String(num) 
          ? 'bg-sky-100 border-sky-500 text-sky-700 shadow-sm' 
          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
          }`}
        >
        <input 
          type="radio" 
          name="rating" 
          value={num} 
          checked={rating === String(num)}
          onChange={(e) => setRating(e.target.value)}
          className="hidden" 
        />
        <span className="text-lg font-bold">{num}</span>
      </label>
      ))}
    </div>
  </div>
</div>
      <textarea 
        placeholder="Napisz co sądzisz o tym produkcie..."
        className="w-full border border-slate-300 rounded-xl p-4 min-h-[100px] focus:ring-2 focus:ring-sky-500 outline-none transition bg-white"
        value={newReview}
        onChange={(e) => setNewReview(e.target.value)}
      />
      
      <div className="flex justify-end">
        <button 
          onClick={() => {handleAddReview()}}
          className="bg-sky-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-sky-800 transition shadow-lg shadow-sky-900/20"
        >
          Opublikuj opinię
        </button>
      </div>
    </div>
  </div>
  ) : (
    <p className="mt-4 p-2 "></p>
  )}

  {reviews.length === 0 ? (
    <p className="text-gray-500 italic">Brak opinii dla tego produktu.</p>
  ) : (
    <div className="space-y-4">
      {reviews.map(r => (
        <div key={r.id_opinia} className="border border-gray-200 p-4 rounded-xl bg-gray-50">
          <div className="flex justify-between border-b border-gray-200 mb-2 pb-1">
            <strong className="text-sky-900">Użytkownik #{r.id_uzytkownika}</strong>
            <span className="font-bold text-slate-700">Ocena: {r.ocena}/5</span>
          </div>
          <p className="text-slate-700">{r.komentarz || "Brak treści."}</p>
        </div>
      ))}
    </div>
  )}
</div>
    </div>
  );
}
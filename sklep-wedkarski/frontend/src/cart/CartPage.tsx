import { useState, useEffect } from "react";
import { addToCart, fetchProductById, getCart, removeFromCart } from "../products/products.api";
import { toast } from "react-toastify";
import { createGuestOrder, createOrder, fetchLastAddress } from "../orders/orders.api";

export default function CartPage() {
const [loading, setLoading] = useState(true);
const [cartItems, setCartItems] = useState<any[]>([]);
const [email, setEmail] = useState("");
const [city, setCity] = useState("");
const [postalCode, setPostalCode] = useState("");
const [street, setStreet] = useState("");
const [houseNumber, setHouseNumber] = useState("");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const postalCodeRegex = /^[0-9]{2}-[0-9]{3}$/;
const cityRegex = /^[\p{L}0-9\s.-]{2,}$/u;
const streetRegex = /^[\p{L}0-9\s.-]{2,}$/u;

useEffect(() => {
const loadCartItems = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem("auth_token");
        let cart_items;
        if (!token) {
            cart_items = localStorage.getItem("Guest_cart") || "[]";
            cart_items = JSON.parse(cart_items);    
        } else {
            cart_items = await getCart();
        }
        const detailedItems = await Promise.all(cart_items.map(async (item: any) => 
            {
                const product = await fetchProductById(item.id_przedmiotu);
                return {
                    id_przedmiotu: item.id_przedmiotu,
                    ilosc: item.ilosc,
                    stan_magazynowy: product.ilosc,
                    nazwa: product.nazwa,
                    kategoria: product.kategoria?.nazwa,
                    cena_sprzedazy: product.cena_sprzedazy,
                    cena_prom: product.cena_prom         
                };
            }));
        setCartItems(detailedItems);
        if (token) {
            const lastAddress = await fetchLastAddress();
            setEmail(lastAddress.address?.email || "");
            setCity(lastAddress.address?.miasto || "");
            setPostalCode(lastAddress.address?.kod_pocztowy || "");
            setStreet(lastAddress.address?.ulica || "");
            setHouseNumber(lastAddress.address?.nr_domu || "");
        }
} catch (error) {
    console.error("Failed to load cart items:", error);
}
finally {
    setLoading(false);
}
}

loadCartItems();
}, []);

const invalidProductIDs = cartItems.filter(item => item.ilosc > item.stan_magazynowy).map(item => item.id_przedmiotu);

const calculateTotal = cartItems.reduce((total, item) => {
    const price = item.cena_prom ?? item.cena_sprzedazy;
    return total + (price * item.ilosc);
}, 0);

const handleRemove = async (id_przedmiotu: number) => {
    setCartItems(cartItems.filter(item => item.id_przedmiotu !== id_przedmiotu));
    const token = localStorage.getItem("auth_token");
    if (!token) {
    const rawData = localStorage.getItem("Guest_cart") || "[]";
    const guestCart = JSON.parse(rawData);
    const filteredGuestCart = guestCart.filter((item: any) => item.id_przedmiotu !== id_przedmiotu);
    localStorage.setItem("Guest_cart", JSON.stringify(filteredGuestCart));
    }
    else {
        await removeFromCart(id_przedmiotu);
    }
};

const handleRemoveOne = async (id_przedmiotu: number) => {
    setCartItems(cartItems.map(item => item.id_przedmiotu === id_przedmiotu ? { ...item, ilosc: item.ilosc - 1 } : item).filter(item => item.ilosc > 0));
    const token = localStorage.getItem("auth_token");
    if (!token) {
    const rawData = localStorage.getItem("Guest_cart") || "[]";
    const guestCart = JSON.parse(rawData);
    const filteredGuestCart = guestCart.map((item: any) => item.id_przedmiotu === id_przedmiotu ? { ...item, ilosc: item.ilosc - 1 } : item).filter((item: any) => item.ilosc > 0);
    localStorage.setItem("Guest_cart", JSON.stringify(filteredGuestCart));
    }
    else {
        const itemToChange = cartItems.find(i => i.id_przedmiotu === id_przedmiotu);
        const newQuantity = itemToChange.ilosc - 1;
        if (newQuantity === 0) {
            await removeFromCart(id_przedmiotu);
        } else {
            // Ponieważ API nie ma na razie endpointu do aktualizacji ilości, usuwamy i dodajemy ponownie z nową ilością. W przyszłosci mozna dodać endpoint do aktualizacji ilości i wtedy tutaj będzie tylko jedno wywołanie API.
            await removeFromCart(id_przedmiotu);
            await addToCart(id_przedmiotu, newQuantity);
        }
    }
};

const handleCheckout = async () => {
    try {
    if (email.trim() === "" || city.trim() === "" || postalCode.trim() === "" || street.trim() === "" || houseNumber.trim() === "") {
        toast.error("Proszę wypełnić wszystkie dane dostawy przed przejściem do płatności.");
        return;
    }
    if (emailRegex.test(email) === false) {
        toast.error("Proszę wpisać poprawny adres email.");
        return;
    }
    if (postalCodeRegex.test(postalCode) === false) {
        toast.error("Proszę wpisać poprawny kod pocztowy.");
        return;
    }
    if (cityRegex.test(city) === false || streetRegex.test(street) === false) {
        toast.error("Proszę wpisać poprawną nazwę miasta lub ulicy.");
        return;
    }

    const checkoutItems = await Promise.all(cartItems.map(async (item: any) => 
            {
                const product = await fetchProductById(item.id_przedmiotu);
                return {
                    id_przedmiotu: item.id_przedmiotu,
                    ilosc: item.ilosc,
                    stan_magazynowy: product.ilosc,
                    nazwa: product.nazwa,
                    kategoria: product.kategoria?.nazwa,
                    cena_sprzedazy: product.cena_sprzedazy,
                    cena_prom: product.cena_prom         
                };
            }));
    const invalidItems = checkoutItems.filter(item => item.ilosc > item.stan_magazynowy);
    if (invalidItems.length > 0) {
        setCartItems(checkoutItems);
        toast.error("Niektóre produkty przekraczają stan magazynowy. Proszę dostosować ilości przed przejściem do płatności.");
        return;
    }
    else {
        const token = localStorage.getItem("auth_token");
        if(token)
        {
        await createOrder({
            email,
            miasto: city,
            kod_pocztowy: postalCode,
            ulica: street,
            nr_domu: houseNumber
        });
        toast.success("Przechodzenie do płatności!");
        }
        else 
        {
        const itemsForApi = cartItems.map(item => ({
        id_przedmiotu: item.id_przedmiotu,
        ilosc: item.ilosc
        }));

        await createGuestOrder({
        email: email,
        miasto: city,
        kod_pocztowy: postalCode,
        ulica: street,
        nr_domu: houseNumber,
        items: itemsForApi
        });
        toast.success("Przechodzenie do płatności!");
        }
    }
} catch (error) {
    console.error("Checkout failed:", error);
    toast.error("Wystąpił błąd podczas przechodzenia do płatności. Proszę spróbować ponownie.");
    }
};

if (loading) return <div className="p-4">Ładowanie danych koszyka...</div>;
  
return (
    <div className="p-4 rounded-lg border border-gray-300 h-auto bg-white shadow-xl">
        <h1 className="text-2xl font-bold">Twój koszyk</h1>
            {cartItems.length === 0 ? (
                <div className="pt-2 text-xl text-slate-900">Brak produktów w koszyku!</div>
                ) : (cartItems.map(item => 
                <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4 mt-4 mb-4">
                    <div className="flex flex-row items-center justify-centerpb-1 gap-8">
                    <div className="flex flex-col w-70">
                      <div className="text-xs uppercase tracking-[0.3em] text-sky-700">Kategoria: {item.kategoria}</div>
                      <h3 className=" truncate mt-2 text-xl font-semibold text-slate-900">{item.nazwa}</h3>
                    </div>
                    <div className="space-y-4 w-55">
                        {item.cena_prom ? (
                        <div className="flex items-baseline gap-2 text-lg font-semibold">
                            Cena:
                            <div className="text-xl font-bold text-rose-700">
                                {item.cena_prom} zł
                            </div>
                            <div className="text-lg text-slate-900 line-through">
                                {item.cena_sprzedazy} zł
                            </div>
                        </div>
                        ) : (
                            <div className="flex items-baseline gap-2 text-lg font-semibold">
                            Cena: 
                                <div className="text-xl font-bold text-rose-700">
                                    {item.cena_sprzedazy} zł
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex-col text-lg font-semibold">
                        Ilość w koszyku: <strong className ="text-green-600">
                        {item.ilosc} szt.
                    </strong>
                    </div>
                    <div className="flex-col text-lg font-semibold">
                        Dostępność: <strong className={item.stan_magazynowy > 0 ? "text-green-600" : "text-red-600"}>
                        {item.stan_magazynowy > 0 ? `${item.stan_magazynowy} szt.` : "Brak"}
                    </strong>
                    </div>
                    <div className="flex ml-auto gap-2">
                        <button onClick={() => handleRemoveOne(item.id_przedmiotu)} className="bg-rose-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-rose-700 transition">
                            Usuń jedną
                        </button>
                        <button onClick={() => handleRemove(item.id_przedmiotu)} className="bg-rose-700 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-rose-900 transition">
                            Usuń
                        </button>
                    </div>
                </div>
                <div className="text-red-500 text-sm"> 
                    {invalidProductIDs.includes(item.id_przedmiotu) ? "Przekracza stan magazynowy!" : ""}
                </div>
        </article>
        ))
        }

<div className="flex flex-col lg:flex-row gap-12 items-start mt-8 justify-center pb-2 pl-1">
  <div className="flex-1 w-full">
    <h2 className="text-2xl font-bold mb-6 text-slate-900 pb-4">Dane dostawy</h2>
    <div className="flex flex-col gap-4">
      <input 
        type="text" 
        placeholder="Adres e-mail" 
        className="border border-slate-200 rounded-xl p-3 w-full max-w-md focus:ring-2 focus:ring-sky-500 outline-none transition" 
        maxLength={30} 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <div className="flex gap-4 max-w-md">
        <input 
          type="text" 
          placeholder="Miasto" 
          className="border border-slate-200 rounded-xl p-3 flex-1 focus:ring-2 focus:ring-sky-500 outline-none transition" 
          maxLength={30} 
          value={city} 
          onChange={(e) => setCity(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Kod" 
          className="border border-slate-200 rounded-xl p-3 w-32 focus:ring-2 focus:ring-sky-500 outline-none transition" 
          maxLength={10} 
          value={postalCode} 
          onChange={(e) => setPostalCode(e.target.value)} 
        />
      </div>
      <input 
        type="text" 
        placeholder="Ulica" 
        className="border border-slate-200 rounded-xl p-3 w-full max-w-md focus:ring-2 focus:ring-sky-500 outline-none transition" 
        maxLength={30} 
        value={street} 
        onChange={(e) => setStreet(e.target.value)} 
      />
      <input 
        type="text" 
        placeholder="Numer domu" 
        className="border border-slate-200 rounded-xl p-3 w-full max-w-md focus:ring-2 focus:ring-sky-500 outline-none transition" 
        maxLength={10} 
        value={houseNumber} 
        onChange={(e) => setHouseNumber(e.target.value)} 
      />
    </div>
  </div>

  <div className="w-full top-8 mt-26 pr-1">
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <h3 className="text-slate-500 uppercase tracking-wider text-xs font-bold mb-4">Twoje zamówienie</h3>
      
      <div className="flex justify-between items-end mb-6">
        <span className="text-slate-900 font-medium">Do zapłaty:</span>
        <span className="text-3xl font-black text-rose-700">
          {calculateTotal.toFixed(2)} zł
        </span>
      </div>

      <button 
        onClick={() => handleCheckout()} 
        disabled={cartItems.length === 0 || invalidProductIDs.length > 0}
        className="w-full bg-sky-700 hover:bg-sky-800 text-white font-bold py-4 rounded-2xl transition-all disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-sky-900/20"
      >
        Przejdź do płatności
      </button>

      {invalidProductIDs.length > 0 && (
        <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-100">
          <p className="text-rose-600 text-sm font-medium leading-tight">
            Niektóre produkty przekraczają stan magazynowy.
          </p>
        </div>
      )}
    </div>
  </div>
</div>
</div>
)};
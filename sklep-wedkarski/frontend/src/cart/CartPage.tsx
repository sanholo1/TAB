import { useState, useEffect } from "react";
import { addToCart, fetchProductById, getCart, removeFromCart } from "../products/products.api";
import { toast } from "react-toastify";
import { createGuestOrder, createOrder, fetchLastAddress } from "../orders/orders.api";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
const [loading, setLoading] = useState(true);
const [cartItems, setCartItems] = useState<any[]>([]);
const [email, setEmail] = useState("");
const [city, setCity] = useState("");
const [postalCode, setPostalCode] = useState("");
const [street, setStreet] = useState("");
const [houseNumber, setHouseNumber] = useState("");
const navigate = useNavigate();
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
        let order;
        if(token)
        {
        order = await createOrder({
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

        order = await createGuestOrder({
        email: email,
        miasto: city,
        kod_pocztowy: postalCode,
        ulica: street,
        nr_domu: houseNumber,
        items: itemsForApi
        });
        toast.success("Przechodzenie do płatności!");
        }
        navigate(`/payment/${order.id_transakcji}`)
    }
} catch (error) {
    console.error("Checkout failed:", error);
    toast.error("Wystąpił błąd podczas przechodzenia do płatności. Proszę spróbować ponownie.");
    }
};

if (loading) return <div className="p-4">Ładowanie danych koszyka...</div>;
  
return (
    <div className="p-4 rounded-lg border border-gray-300 min-h-screen bg-white shadow-xl">
        <h1 className="text-2xl font-bold mb-4">Twój koszyk</h1>
            {cartItems.length === 0 ? (
                <p>Tu będzie lista produktów w koszyku oraz możliwość przejścia do płatności.</p>
                ) : (cartItems.map(item => <div key={item.id_przedmiotu}>Id przedmiotu: {item.id_przedmiotu}, Ilość: {item.ilosc}, Stan Magazynowy: {item.stan_magazynowy}, Nazwa: {item.nazwa}, Kategoria: {item.kategoria}, Cena sprzedaży: {item.cena_sprzedazy}, Cena promocji: {item.cena_prom} | <button onClick={() => handleRemove(item.id_przedmiotu)}>Usuń</button> | <button onClick={() => handleRemoveOne(item.id_przedmiotu)}>Usuń jedną </button> 
                    <p className="text-red-500 text-sm"> {invalidProductIDs.includes(item.id_przedmiotu) ? "Przekracza stan magazynowy!" : ""}</p>
                </div>))
            }
        <div>     
                <p> Podsumowanie ceny: {calculateTotal.toFixed(2)} zł</p>
        </div>
            <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-sky-700">Zamówienie #costam</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-900">Costam zł</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Status: costam •
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                    </div>
                </div>
            </article>
        <div className="text-2xl font-bold mb-4 mt-10">Dane dostawy</div>
        <div className="flex flex-col gap-4 mb-6">
            <input type="text" placeholder="Adres e-mail" className="border border-gray-300 rounded-md p-2 mt-4 w-full max-w-sm" maxLength={30} value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="text" placeholder="Miasto" className="border border-gray-300 rounded-md p-2 mt-4 w-full max-w-sm" maxLength={30} value={city} onChange={(e) => setCity(e.target.value)} />
            <input type="text" placeholder="Kod pocztowy" className="border border-gray-300 rounded-md p-2 mt-4 w-full max-w-sm" maxLength={10} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            <input type="text" placeholder="Ulica" className="border border-gray-300 rounded-md p-2 mt-4 w-full max-w-sm" maxLength={30} value={street} onChange={(e) => setStreet(e.target.value)} />
            <input type="text" placeholder="Numer domu" className="border border-gray-300 rounded-md p-2 mt-4 w-full max-w-sm" maxLength={10} value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} />
        </div>
        <button onClick={() => handleCheckout()} className="bg-sky-700 p-2.5 rounded-full text-white mt-4 disabled:bg-gray-500" disabled={cartItems.length === 0 || invalidProductIDs.length > 0}>
                Przejdź do płatności
        </button>
            {invalidProductIDs.length > 0 && (
                <p className="text-red-500 text-sm mt-2">Niektóre produkty przekraczają stan magazynowy.</p>
            )}
    </div>
  );
}
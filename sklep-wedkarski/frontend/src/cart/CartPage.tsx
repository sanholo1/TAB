import { useState, useEffect } from "react";
import { fetchProductById, getCart } from "../products/products.api";

export default function CartPage() {
const [loading, setLoading] = useState(true);
const [cartItems, setCartItems] = useState<any[]>([]);

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
                    nazwa: product.nazwa,
                    kategoria: product.kategoria?.nazwa,
                    cena_sprzedazy: product.cena_sprzedazy,
                    cena_prom: product.cena_prom         
                };
            }));
        setCartItems(detailedItems);
} catch (error) {
    console.error("Failed to load cart items:", error);
}
finally {
    setLoading(false);
}
}

loadCartItems();
}, []);

const calculateTotal = cartItems.reduce((total, item) => {
    const price = item.cena_prom ?? item.cena_sprzedazy;
    return total + (price * item.ilosc);
}, 0);

const handleRemove = (id_przedmiotu: number) => {
    setCartItems(cartItems.filter(item => item.id_przedmiotu !== id_przedmiotu));
    const token = localStorage.getItem("auth_token");
    if (!token) {
    const rawData = localStorage.getItem("Guest_cart") || "[]";
    const guestCart = JSON.parse(rawData);
    const filteredGuestCart = guestCart.filter((item: any) => item.id_przedmiotu !== id_przedmiotu);
    localStorage.setItem("Guest_cart", JSON.stringify(filteredGuestCart));
    }
};

const handleRemoveOne = (id_przedmiotu: number) => {
    setCartItems(cartItems.map(item => item.id_przedmiotu === id_przedmiotu ? { ...item, ilosc: item.ilosc - 1 } : item).filter(item => item.ilosc > 0));
    const token = localStorage.getItem("auth_token");
    if (!token) {
    const rawData = localStorage.getItem("Guest_cart") || "[]";
    const guestCart = JSON.parse(rawData);
    const filteredGuestCart = guestCart.map((item: any) => item.id_przedmiotu === id_przedmiotu ? { ...item, ilosc: item.ilosc - 1 } : item).filter((item: any) => item.ilosc > 0);
    localStorage.setItem("Guest_cart", JSON.stringify(filteredGuestCart));
    }
};

if (loading) return <div className="p-4">Ładowanie danych koszyka...</div>;
  
return (
    <div className="p-4 rounded-lg border border-gray-300 min-h-screen bg-white shadow-xl">
        <h1 className="text-2xl font-bold mb-4">Twój koszyk</h1>
        {cartItems.length === 0 ? (
            <p>Tu będzie lista produktów w koszyku oraz możliwość przejścia do płatności.</p>
            ) : (cartItems.map(item => <div key={item.id_przedmiotu}>Id przedmiotu: {item.id_przedmiotu}, Ilość: {item.ilosc}, Nazwa: {item.nazwa}, Kategoria: {item.kategoria}, Cena sprzedaży: {item.cena_sprzedazy}, Cena promocji: {item.cena_prom} | <button onClick={() => handleRemove(item.id_przedmiotu)}>Usuń</button> | <button onClick={() => handleRemoveOne(item.id_przedmiotu)}>Usuń jedną</button> </div>))
        }
        <div>     
            <p> Podsumowanie ceny: {calculateTotal.toFixed(2)} zł</p>
        </div>
    </div>
  );
}
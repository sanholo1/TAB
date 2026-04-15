import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getCart } from "../products/products.api";
import type { User } from "../auth/auth.types";
import { X, ShoppingCart } from "lucide-react";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  search: string;
  setSearch: (value: string) => void;
  onSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, search, setSearch, onSearch }) => {
  const canAccessInventory = user?.roleId === 2 || user?.roleId === 3;

  const location = useLocation();
  const navigate = useNavigate();
  const currentParams = new URLSearchParams(location.search);
  const activeSearch = currentParams.get("search");
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) { // logged user
          const userCart = await getCart(); 
          const total = userCart.reduce((acc: number, item: any) => acc + item.ilosc, 0);
          setCartCount(total);
        } else { // guest
        const guestCart = JSON.parse(localStorage.getItem("Guest_cart") || "[]");
        const total = guestCart.reduce((acc: number, item: any) => acc + item.ilosc, 0);
        setCartCount(total);
        }
      }catch (err) {
          console.error("Błąd pobierania koszyka z bazy:", err);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    currentParams.delete("search");
    navigate(`/products?${currentParams.toString()}`); // <- does not erase other filters
  };

  useEffect(() => {
    refreshCartCount();
    // localStorage
    window.addEventListener("storage", refreshCartCount);
    // custom event
    window.addEventListener("cart-updated", refreshCartCount);

    return () => {
      window.removeEventListener("storage", refreshCartCount);
      window.removeEventListener("cart-updated", refreshCartCount);
    };
  }, [user]);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex flex-wrap items-center gap-4 px-4 py-4 max-w-7xl">
        
          <NavLink to="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Gruba Ryba - Sklep Wędkarski" 
              className="h-24 w-auto object-contain transition-transform hover:scale-105" 
            />
          </NavLink>

        <nav className="flex flex-wrap items-center gap-2">
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `rounded-full px-3 py-2 text-sm transition ${
                isActive ? "bg-sky-700 text-white" : "text-slate-600 hover:text-slate-900"
              }`
            }
          >
            Produkty
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `rounded-full px-3 py-2 text-sm transition ${
                isActive ? "bg-sky-700 text-white" : "text-slate-600 hover:text-slate-900"
              }`
            }
          >
            Profil
          </NavLink>

          {canAccessInventory && (
            <NavLink
              to="/inventory"
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm transition ${
                  isActive ? "bg-sky-700 text-white" : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              Magazyn
            </NavLink>
          )}
        </nav>

        <div className="flex flex-1 items-center gap-2">
  
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white py-2.5 pl-2.5 pr-4 transition focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
            
            {activeSearch && (
              <button className="flex shrink-0 items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-200"
                onClick={handleClearSearch}
              >
                <X className="h-3.5 w-3.5" />
                Wyczyść
              </button>
            )}

            <input className="w-full flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-slate-400"
              type="text"
              placeholder="Szukaj produktów..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
          </div>

          <button className="shrink-0 rounded-2xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-800"
            type="button"
            onClick={onSearch}
          >
            Szukaj
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user ? (
            <>
              <span className="text-sm text-slate-700">Cześć, <strong className="text-slate-900">{user.username}</strong></span>
              <button className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                type="button"
                onClick={onLogout}
              >
                Wyloguj
              </button>
            </>
          ) : (
            <>
              <NavLink className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                to="/login"
                
              >
                Zaloguj
              </NavLink>
              <NavLink className="rounded-2xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
                to="/register"
              >
                Rejestracja
              </NavLink>
            </>
          )}
        <NavLink to="/cart" className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 transition hover:border-sky-500 hover:text-sky-700 hover:shadow-md">
          <ShoppingCart className="h-6 w-6" />
          {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sky-700 px-1 text-[12px] font-bold text-white shadow-sm ring-2 ring-white">
                {cartCount}
              </span>
            )}
        </NavLink>
        </div>
      </div>
    </header>
  );
};

export default Header;

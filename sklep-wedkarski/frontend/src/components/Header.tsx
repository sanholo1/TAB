import React from "react";
import { NavLink } from "react-router-dom";
import type { User } from "../auth/auth.types";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  search: string;
  setSearch: (value: string) => void;
  onSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, search, setSearch, onSearch }) => {
  const canAccessInventory = user?.roleId === 2 || user?.roleId === 3;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex flex-wrap items-center gap-4 px-4 py-4 max-w-7xl">
        <NavLink to="/" className="text-xl font-semibold tracking-tight text-sky-900">
          Sklep Wędkarski
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

        <div className="flex flex-1 min-w-[240px] items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Szukaj produktu..."
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
          />
          <button
            type="button"
            onClick={onSearch}
            className="rounded-2xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
          >
            Szukaj
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user ? (
            <>
              <span className="text-sm text-slate-700">Cześć, <strong className="text-slate-900">{user.username}</strong></span>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Wyloguj
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                Zaloguj
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-2xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
              >
                Rejestracja
              </NavLink>
            </>
          )}
        <NavLink to="/cart" className="text-lg tracking-tight text-black pl-4">
          Koszyk
        </NavLink>
        </div>
      </div>
    </header>
  );
};

export default Header;

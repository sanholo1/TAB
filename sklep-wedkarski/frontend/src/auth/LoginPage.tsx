import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "./auth.api";
import type { User } from "./auth.types";
import { mergeCart } from "../products/products.api";

interface LoginPageProps {
  onLogin: (user: User, token: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await loginUser({ email, password });
      onLogin(result.user, result.accessToken);

      //Dodano przerzucenie koszyka gościa do koszyka użytkownika po zalogowaniu
      const guestCart = localStorage.getItem("Guest_cart");
      const parsedCart = JSON.parse(guestCart || "[]");
      if(parsedCart.length > 0) {
        try {
          await mergeCart(parsedCart); //Na razie wywala sie przy próbie przeniesienia większej ilości niż jest w magazynie, do dopracowania
          localStorage.removeItem("Guest_cart");
        } catch (error) {
          console.error("Dokładny błąd:", error); // Sprawdź to w konsoli F12!
          //console.error("Błąd podczas łączenia koszyka:", error);
          //alert("Nie udało się przenieść koszyka. Liczba elementów przekracza dostępne ilości w magazynie. Proszę spróbować ponownie po zmianie ilości.");
        }
      }

      navigate("/profile");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Nie udało się zalogować. Spróbuj ponownie.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-300/30">
      <div className="mb-6">
        <p className="uppercase text-sm tracking-[0.2em] text-sky-700">Zapraszamy do logowania</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Zaloguj się do swojego konta</h1>
        <p className="mt-2 text-slate-600">Dostęp do zamówień, koszyka i ustawień profilu.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Hasło</label>
          <input
            type="password"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-2xl bg-sky-700 px-5 py-3 text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Ładowanie..." : "Zaloguj się"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Nie masz konta? <Link to="/register" className="font-semibold text-sky-700 hover:text-sky-900">Zarejestruj się</Link>
      </p>
    </div>
  );
}

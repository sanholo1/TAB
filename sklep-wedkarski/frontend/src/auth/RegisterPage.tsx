import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, registerUser } from "./auth.api";
import type { User } from "./auth.types";

interface RegisterPageProps {
  onLogin: (user: User, token: string) => void;
}

export default function RegisterPage({ onLogin }: RegisterPageProps) {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Hasła nie są zgodne");
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser({ username, firstName, lastName, email, password, confirmPassword });
      if (result.user && result.accessToken) {
        onLogin(result.user, result.accessToken);
      } else {
        const loginResult = await loginUser({ email, password });
        onLogin(loginResult.user, loginResult.accessToken);
      }
      navigate("/profile");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Nie udało się zarejestrować. Spróbuj ponownie.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-300/30">
      <div className="mb-6">
        <p className="uppercase text-sm tracking-[0.2em] text-sky-700">Nowe konto</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Zarejestruj się</h1>
        <p className="mt-2 text-slate-600">Stwórz konto i korzystaj z pełnej oferty sklepu wędkarskiego.</p>
      </div>

      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Nazwa użytkownika
            <input
              type="text"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Imię
            <input
              type="text"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Nazwisko
            <input
              type="text"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Hasło
            <input
              type="password"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Powtórz hasło
            <input
              type="password"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </label>
        </div>

        {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-2xl bg-sky-700 px-5 py-3 text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Tworzę konto..." : "Zarejestruj się"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Masz już konto? <Link to="/login" className="font-semibold text-sky-700 hover:text-sky-900">Zaloguj się</Link>
      </p>
    </div>
  );
}

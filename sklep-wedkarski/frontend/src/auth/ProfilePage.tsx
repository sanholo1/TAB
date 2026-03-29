import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProfile, updateProfile } from "./auth.api";
import type { User } from "./auth.types";

interface ProfilePageProps {
  currentUser: User | null;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
}

export default function ProfilePage({ currentUser, onUpdateUser, onLogout }: ProfilePageProps) {
  const [profile, setProfile] = useState<User | null>(currentUser);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const result = await fetchProfile();
        setProfile(result);
        setUsername(result.username);
        setFirstName(result.firstName);
        setLastName(result.lastName);
        setEmail(result.email);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Nie udało się pobrać profilu.");
        }
      }
    };

    if (!currentUser) {
      loadProfile();
    } else {
      setProfile(currentUser);
      setUsername(currentUser.username);
      setFirstName(currentUser.firstName);
      setLastName(currentUser.lastName);
      setEmail(currentUser.email);
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const payload: Record<string, string> = {};
    if (username !== profile?.username) payload.username = username;
    if (firstName !== profile?.firstName) payload.firstName = firstName;
    if (lastName !== profile?.lastName) payload.lastName = lastName;
    if (email !== profile?.email) payload.email = email;
    if (newPassword) {
      payload.newPassword = newPassword;
      payload.currentPassword = currentPassword;
    }

    if (Object.keys(payload).length === 0) {
      setError("Wprowadź zmiany, aby zaktualizować profil.");
      setLoading(false);
      return;
    }

    try {
      const result = await updateProfile(payload);
      setProfile(result.profile);
      onUpdateUser(result.profile);
      setMessage("Profil został zaktualizowany.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Nie udało się zaktualizować profilu.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-300/20">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="uppercase text-sm tracking-[0.3em] text-sky-600">Twoje konto</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Ustawienia profilu</h1>
            <p className="mt-2 text-slate-600">Aktualizuj dane konta oraz hasło.</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            Wyloguj się
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-sky-50 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-700">ID użytkownika</p>
            <p className="mt-4 text-2xl font-semibold text-slate-900">{profile?.id}</p>
            <p className="mt-2 text-slate-600">Rola: {profile?.roleName}</p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-700">Zalogowany jako</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{profile?.username}</p>
            <p className="mt-1 text-slate-600">{profile?.email}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-300/20">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Nazwa użytkownika
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Imię
              <input
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Nazwisko
              <input
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Aktualne hasło
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
                placeholder="Wpisz tylko przy zmianie hasła"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Nowe hasło
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
                placeholder="Co najmniej 8 znaków"
              />
            </label>
          </div>

          {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {message && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}

          <button
            type="submit"
            className="inline-flex w-full justify-center rounded-2xl bg-sky-700 px-6 py-3 text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Zapisywanie..." : "Zapisz zmiany"}
          </button>
        </form>
      </section>
    </div>
  );
}

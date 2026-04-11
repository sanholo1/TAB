import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrders, fetchProfile, updateProfile } from "./auth.api";
import type { User } from "./auth.types";
import type { Order } from "../orders/orders.types";

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const navigate = useNavigate();
  const isGuestAccount = profile?.email === "gosc@sklep.pl" || profile?.username === "GoscNiezalogowany";

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      setOrdersLoading(true);

      try {
        const [nextProfile, nextOrders] = await Promise.all([
          currentUser ? Promise.resolve(currentUser) : fetchProfile(),
          fetchOrders(),
        ]);

        setProfile(nextProfile);
        setUsername(nextProfile.username);
        setFirstName(nextProfile.firstName);
        setLastName(nextProfile.lastName);
        setEmail(nextProfile.email);
        setOrders(nextOrders);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Nie udało się pobrać profilu.");
        }
      } finally {
        setOrdersLoading(false);
      }
    };

    loadData();
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
        <div className="mb-6">
          <p className="uppercase text-sm tracking-[0.3em] text-sky-600">Zamówienia</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Historia zamówień</h2>
          <p className="mt-2 text-slate-600">
            {isGuestAccount
              ? "Konto gościa może składać zamówienia i sprawdzać ich historię."
              : "Tutaj znajdziesz swoje ostatnie zamówienia i ich szczegóły."}
          </p>
        </div>

        {ordersLoading ? (
          <p className="text-slate-600">Ładowanie historii zamówień...</p>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 p-5 text-slate-600">Brak zamówień do wyświetlenia.</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order.id_transakcji} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-sky-700">Zamówienie #{order.id_transakcji}</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">{order.kwota_calkowita} zł</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Status: {order.stan} • {new Date(order.data).toLocaleString("pl-PL")}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
                    {order.adres.ulica} {order.adres.nr_domu}, {order.adres.kod_pocztowy} {order.adres.miasto}, {order.adres.kraj}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {order.przedmioty.map((item) => (
                    <div
                      key={`${order.id_transakcji}-${item.id_przedmiotu}`}
                      className="flex flex-col gap-1 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-medium text-slate-900">{item.przedmiot.nazwa}</span>
                      <span>
                        {item.liczba} szt. • {item.cena_przedmiotu} zł
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
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

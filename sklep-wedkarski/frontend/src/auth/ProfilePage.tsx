import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrders, fetchProfile, updateProfile } from "./auth.api";
import type { User } from "./auth.types";
import type { Order } from "../orders/orders.types";
import {
  hasErrors,
  mapApiErrors,
  mergeErrors,
  validateProfile,
  type FieldErrors,
  type ProfileFields,
} from "./auth-validation";

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
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [apiErrors, setApiErrors] = useState<FieldErrors<ProfileFields>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<number>>(new Set());
  const [displayedOrderCount, setDisplayedOrderCount] = useState(10);
  const navigate = useNavigate();
  const isGuestAccount = profile?.email === "gosc@sklep.pl" || profile?.username === "GoscNiezalogowany";

  const validationErrors = submitAttempted
    ? validateProfile({ username, firstName, lastName, email, currentPassword, newPassword }, profile)
    : {};

  const errors = mergeErrors(validationErrors, apiErrors);
  const hasVisibleErrors = hasErrors(errors);

  useEffect(() => {
    if (!hasVisibleErrors) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSubmitAttempted(false);
      setApiErrors({});
    }, 4500);

    return () => window.clearTimeout(timeoutId);
  }, [hasVisibleErrors]);

  const clearApiField = (field: ProfileFields | "form") => {
    setApiErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const toggleOrderExpanded = (orderId: number) => {
    setExpandedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

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
        setApiErrors(mapApiErrors<ProfileFields>(err));
      } finally {
        setOrdersLoading(false);
      }
    };

    loadData();
  }, [currentUser, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    setSuccessMessage(null);
    setApiErrors({});

    const hasProfileChanges =
      profile === null ||
      username !== profile.username ||
      firstName !== profile.firstName ||
      lastName !== profile.lastName ||
      email !== profile.email ||
      currentPassword.length > 0 ||
      newPassword.length > 0;

    if (!hasProfileChanges) {
      return;
    }

    const nextValidationErrors = validateProfile({ username, firstName, lastName, email, currentPassword, newPassword }, profile);
    if (hasErrors(nextValidationErrors)) {
      return;
    }

    const payload: Record<string, string> = {};
    if (username !== profile?.username) payload.username = username.trim();
    if (firstName !== profile?.firstName) payload.firstName = firstName.trim();
    if (lastName !== profile?.lastName) payload.lastName = lastName.trim();
    if (email !== profile?.email) payload.email = email.trim();
    if (newPassword) {
      payload.newPassword = newPassword;
      payload.currentPassword = currentPassword;
    }

    setLoading(true);

    try {
      const result = await updateProfile(payload);
      setProfile(result.profile);
      onUpdateUser(result.profile);
      setSuccessMessage("Profil został zaktualizowany.");
      setCurrentPassword("");
      setNewPassword("");
      window.setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const nextApiErrors = mapApiErrors<ProfileFields>(err);
      const hasTakenConflict =
        nextApiErrors.form?.some((message) => {
          const normalized = message.toLowerCase();
          return normalized.includes("zajęte") || normalized.includes("already taken") || normalized.includes("already exists");
        }) ?? false;

      if (hasTakenConflict && profile) {
        if (payload.username !== undefined) {
          setUsername(profile.username);
        }

        if (payload.email !== undefined) {
          setEmail(profile.email);
        }
      }

      setApiErrors(nextApiErrors);
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
        <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Nazwa użytkownika
              <input
                type="text"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  clearApiField("username");
                  clearApiField("form");
                }}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
                aria-invalid={Boolean(errors.username?.length)}
              />
              <FieldMessage messages={errors.username} />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearApiField("email");
                  clearApiField("form");
                }}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
                aria-invalid={Boolean(errors.email?.length)}
              />
              <FieldMessage messages={errors.email} />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Imię
              <input
                type="text"
                value={firstName}
                onChange={(event) => {
                  setFirstName(event.target.value);
                  clearApiField("firstName");
                  clearApiField("form");
                }}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
                aria-invalid={Boolean(errors.firstName?.length)}
              />
              <FieldMessage messages={errors.firstName} />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Nazwisko
              <input
                type="text"
                value={lastName}
                onChange={(event) => {
                  setLastName(event.target.value);
                  clearApiField("lastName");
                  clearApiField("form");
                }}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
                aria-invalid={Boolean(errors.lastName?.length)}
              />
              <FieldMessage messages={errors.lastName} />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Aktualne hasło
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => {
                  setCurrentPassword(event.target.value);
                  clearApiField("currentPassword");
                  clearApiField("form");
                }}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
                placeholder="Wpisz tylko przy zmianie hasła"
                aria-invalid={Boolean(errors.currentPassword?.length)}
              />
              <FieldMessage messages={errors.currentPassword} />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Nowe hasło
              <input
                type="password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  clearApiField("newPassword");
                  clearApiField("form");
                }}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
                placeholder="Co najmniej 8 znaków"
                aria-invalid={Boolean(errors.newPassword?.length)}
              />
              <FieldMessage messages={errors.newPassword} />
            </label>
          </div>

          <FieldMessage messages={errors.form} />
          {successMessage && (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            className="inline-flex w-full justify-center rounded-2xl bg-sky-700 px-6 py-3 text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Zapisywanie..." : "Zapisz zmiany"}
          </button>
        </form>
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
          <>
            <div className="space-y-4">
              {orders.slice(0, displayedOrderCount).map((order) => (
                <article key={order.id_transakcji} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-sky-700">Zamówienie #{order.id_transakcji}</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-900">{order.kwota_calkowita} zł</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Status: {order.stan} • {new Date(order.data).toLocaleString("pl-PL")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                      {order.stan === "W_TRAKCIE" && (
                        <button
                          type="button"
                          onClick={() => navigate(`/payment/${order.id_transakcji}`)}
                          className="inline-flex items-center rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Opłać
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleOrderExpanded(order.id_transakcji)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
                      >
                        {expandedOrderIds.has(order.id_transakcji) ? "Zwiń" : "Rozwiń"}
                        <span className="text-lg">{expandedOrderIds.has(order.id_transakcji) ? "▲" : "▼"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
                    {order.adres.ulica} {order.adres.nr_domu}, {order.adres.kod_pocztowy} {order.adres.miasto}
                  </div>

                  {expandedOrderIds.has(order.id_transakcji) && (
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
                  )}
                </article>
              ))}
            </div>

            {orders.length > displayedOrderCount && (
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDisplayedOrderCount(orders.length)}
                  className="rounded-2xl border border-sky-300 bg-sky-50 px-6 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                >
                  Rozwiń więcej
                </button>
              </div>
            )}

            {displayedOrderCount > 10 && (
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDisplayedOrderCount(10)}
                  className="rounded-2xl border border-slate-300 bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Zwiń
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function FieldMessage({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      <ul className="list-disc space-y-1 pl-5">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
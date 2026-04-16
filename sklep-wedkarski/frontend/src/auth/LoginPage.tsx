import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "./auth.api";
import type { User } from "./auth.types";
import { mergeCart } from "../products/products.api";
import { toast } from "react-toastify";
import {
  hasErrors,
  mapApiErrors,
  mergeErrors,
  validateLogin,
  type FieldErrors,
  type LoginFields,
} from "./auth-validation";

interface LoginPageProps {
  onLogin: (user: User, token: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [apiErrors, setApiErrors] = useState<FieldErrors<LoginFields>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validationErrors = submitAttempted ? validateLogin({ email, password }) : {};
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

  const clearApiField = (field: LoginFields | "form") => {
    setApiErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);

    const nextValidationErrors = validateLogin({ email, password });
    if (hasErrors(nextValidationErrors)) {
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser({ email: email.trim(), password });
      onLogin(result.user, result.accessToken);

      const guestCart = localStorage.getItem("Guest_cart");
      const parsedCart = JSON.parse(guestCart || "[]");
      if (parsedCart.length > 0) {
        try {
          await mergeCart(parsedCart);
          localStorage.removeItem("Guest_cart");
        } catch (error) {
          console.error("Dokładny błąd:", error);
        }
      }
      window.dispatchEvent(new Event("cart-updated"));
      toast.success("Zalogowano pomyślnie!");
      navigate("/profile");
    } catch (err) {
      setApiErrors(mapApiErrors<LoginFields>(err));
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

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearApiField("email");
              clearApiField("form");
            }}
            aria-invalid={Boolean(errors.email?.length)}
          />
          <FieldMessage messages={errors.email} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Hasło</label>
          <input
            type="password"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearApiField("password");
              clearApiField("form");
            }}
            aria-invalid={Boolean(errors.password?.length)}
          />
          <FieldMessage messages={errors.password} />
        </div>

        <FieldMessage messages={errors.form} />

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
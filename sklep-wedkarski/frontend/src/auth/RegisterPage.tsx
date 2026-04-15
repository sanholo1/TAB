import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, registerUser } from "./auth.api";
import type { User } from "./auth.types";
import {
  hasErrors,
  mapApiErrors,
  mergeErrors,
  validateRegister,
  type FieldErrors,
  type RegisterFields,
} from "./auth-validation";

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
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [apiErrors, setApiErrors] = useState<FieldErrors<RegisterFields>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validationErrors = submitAttempted
    ? validateRegister({ username, firstName, lastName, email, password, confirmPassword })
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

  const clearApiField = (field: RegisterFields) => {
    setApiErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);

    const nextValidationErrors = validateRegister({ username, firstName, lastName, email, password, confirmPassword });
    if (hasErrors(nextValidationErrors)) {
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser({
        username: username.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });

      if (result.user && result.accessToken) {
        onLogin(result.user, result.accessToken);
      } else {
        const loginResult = await loginUser({ email: email.trim(), password });
        onLogin(loginResult.user, loginResult.accessToken);
      }

      navigate("/profile");
    } catch (err) {
      setApiErrors(mapApiErrors<RegisterFields>(err));
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

      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Nazwa użytkownika
            <input
              type="text"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                clearApiField("username");
              }}
              aria-invalid={Boolean(errors.username?.length)}
            />
            <FieldMessage messages={errors.username} />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearApiField("email");
              }}
              aria-invalid={Boolean(errors.email?.length)}
            />
            <FieldMessage messages={errors.email} />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Imię
            <input
              type="text"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              value={firstName}
              onChange={(event) => {
                setFirstName(event.target.value);
                clearApiField("firstName");
              }}
              aria-invalid={Boolean(errors.firstName?.length)}
            />
            <FieldMessage messages={errors.firstName} />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Nazwisko
            <input
              type="text"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              value={lastName}
              onChange={(event) => {
                setLastName(event.target.value);
                clearApiField("lastName");
              }}
              aria-invalid={Boolean(errors.lastName?.length)}
            />
            <FieldMessage messages={errors.lastName} />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Hasło
            <input
              type="password"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                clearApiField("password");
                clearApiField("confirmPassword");
              }}
              aria-invalid={Boolean(errors.password?.length)}
            />
            <FieldMessage messages={errors.password} />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Powtórz hasło
            <input
              type="password"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                clearApiField("confirmPassword");
              }}
              aria-invalid={Boolean(errors.confirmPassword?.length)}
            />
            <FieldMessage messages={errors.confirmPassword} />
          </label>
        </div>

        <FieldMessage messages={errors.form} />

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

function FieldMessage({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      <ul className="list-disc space-y-1 pl-5">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
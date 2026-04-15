import type { User } from "./auth.types";

const usernamePattern = /^[a-zA-Z0-9._-]+$/;
const namePattern = /^[\p{L}\s'-]+$/u;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).+$/;
const emailPattern = /^\S+@\S+\.\S+$/;

export type FieldErrors<TField extends string> = Partial<Record<TField | "form", string[]>>;

export type RegisterFields = "username" | "firstName" | "lastName" | "email" | "password" | "confirmPassword";
export type LoginFields = "email" | "password";
export type ProfileFields = "username" | "firstName" | "lastName" | "email" | "currentPassword" | "newPassword";

export type RegisterValues = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginValues = {
  email: string;
  password: string;
};

export type ProfileValues = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
};

export type ApiErrorLike = Error & {
  status?: number;
  details?: string[];
};

const translateApiMessage = (message: string): string => {
  switch (message) {
    case "Validation failed":
      return "Dane formularza są nieprawidłowe.";
    case "Invalid email or password":
      return "Nieprawidłowy adres e-mail lub hasło.";
    case "User with provided email or username already exists":
      return "Użytkownik z podanym adresem e-mail lub nazwą już istnieje.";
    case "Email or username is already taken":
      return "Adres e-mail lub nazwa użytkownika są już zajęte.";
    case "Current password is invalid":
      return "Aktualne hasło jest nieprawidłowe.";
    case "Current password is required to set a new password":
      return "Podaj aktualne hasło, aby ustawić nowe hasło.";
    case "No profile fields provided":
      return "Wprowadź co najmniej jedną zmianę w profilu.";
    case "User not found":
      return "Nie znaleziono użytkownika.";
    case "Błąd sieci":
      return "Błąd sieci. Spróbuj ponownie.";
    default:
      return message;
  }
};

const translateDetailMessage = (message: string): string => {
  const normalized = message.trim();

  if (normalized === "Invalid email") {
    return "Podaj poprawny adres e-mail.";
  }

  if (normalized === "Invalid string") {
    return "Wprowadzona wartość ma nieprawidłowy format.";
  }

  if (normalized === "Passwords do not match") {
    return "Hasła muszą być identyczne.";
  }

  return translateApiMessage(normalized);
};

const addError = <TField extends string>(errors: FieldErrors<TField>, field: TField | "form", message: string) => {
  const current = errors[field] ?? [];
  errors[field] = [...current, message];
};

const trimValue = (value: string) => value.trim();

const validateUsername = (value: string, errors: FieldErrors<RegisterFields | ProfileFields>, field: "username") => {
  const trimmed = trimValue(value);

  if (!trimmed) {
    addError(errors, field, "Nazwa użytkownika jest wymagana.");
    return;
  }

  if (trimmed.length < 3) {
    addError(errors, field, "Nazwa użytkownika musi mieć co najmniej 3 znaki.");
  }

  if (trimmed.length > 40) {
    addError(errors, field, "Nazwa użytkownika może mieć maksymalnie 40 znaków.");
  }

  if (!usernamePattern.test(trimmed)) {
    addError(errors, field, "Nazwa użytkownika może zawierać tylko litery, cyfry oraz znaki . _ -.");
  }
};

const validateName = (
  value: string,
  errors: FieldErrors<RegisterFields | ProfileFields>,
  field: "firstName" | "lastName",
  label: string,
) => {
  const trimmed = trimValue(value);

  if (!trimmed) {
    addError(errors, field, `${label} jest wymagane.`);
    return;
  }

  if (trimmed.length < 2) {
    addError(errors, field, `${label} musi mieć co najmniej 2 znaki.`);
  }

  if (trimmed.length > 60) {
    addError(errors, field, `${label} może mieć maksymalnie 60 znaków.`);
  }

  if (!namePattern.test(trimmed)) {
    addError(errors, field, `${label} może zawierać tylko litery, spacje, apostrof i myślnik.`);
  }
};

const validateEmail = (
  value: string,
  errors: FieldErrors<RegisterFields | LoginFields | ProfileFields>,
  field: "email",
  requiredMessage: string,
) => {
  const trimmed = trimValue(value);

  if (!trimmed) {
    addError(errors, field, requiredMessage);
    return;
  }

  if (trimmed.length > 191) {
    addError(errors, field, "Adres e-mail może mieć maksymalnie 191 znaków.");
  }

  if (!emailPattern.test(trimmed)) {
    addError(errors, field, "Podaj poprawny adres e-mail.");
  }
};

const validatePassword = (
  value: string,
  errors: FieldErrors<RegisterFields | LoginFields | ProfileFields>,
  field: "password" | "newPassword",
  label: string,
) => {
  if (!value) {
    addError(errors, field, `${label} jest wymagane.`);
    return;
  }

  if (value.length < 8) {
    addError(errors, field, `${label} musi mieć co najmniej 8 znaków.`);
  }

  if (value.length > 72) {
    addError(errors, field, `${label} może mieć maksymalnie 72 znaki.`);
  }

  if (!passwordPattern.test(value)) {
    addError(errors, field, `${label} musi zawierać przynajmniej jedną literę i jedną cyfrę.`);
  }
};

const mapApiDetails = <TField extends string>(details: string[] | undefined): FieldErrors<TField> => {
  const errors: FieldErrors<TField> = {};

  if (!details) {
    return errors;
  }

  for (const detail of details) {
    const separatorIndex = detail.indexOf(":");
    if (separatorIndex === -1) {
      addError(errors, "form" as TField | "form", detail);
      continue;
    }

    const rawField = detail.slice(0, separatorIndex).trim();
    const message = translateDetailMessage(detail.slice(separatorIndex + 1).trim());
    const allowedFields = new Set(["username", "firstName", "lastName", "email", "password", "confirmPassword", "currentPassword", "newPassword"]);

    if (allowedFields.has(rawField)) {
      addError(errors, rawField as TField, message);
    } else {
      addError(errors, "form" as TField | "form", detail);
    }
  }

  return errors;
};

export const validateRegister = (values: RegisterValues): FieldErrors<RegisterFields> => {
  const errors: FieldErrors<RegisterFields> = {};

  validateUsername(values.username, errors, "username");
  validateName(values.firstName, errors, "firstName", "Imię");
  validateName(values.lastName, errors, "lastName", "Nazwisko");
  validateEmail(values.email, errors, "email", "Adres e-mail jest wymagany.");
  validatePassword(values.password, errors, "password", "Hasło");

  if (!values.confirmPassword) {
    addError(errors, "confirmPassword", "Powtórzone hasło jest wymagane.");
  }

  if (values.password && values.confirmPassword && values.password !== values.confirmPassword) {
    addError(errors, "confirmPassword", "Hasła muszą być identyczne.");
  }

  return errors;
};

export const validateLogin = (values: LoginValues): FieldErrors<LoginFields> => {
  const errors: FieldErrors<LoginFields> = {};

  validateEmail(values.email, errors, "email", "Adres e-mail jest wymagany.");

  if (!values.password) {
    addError(errors, "password", "Hasło jest wymagane.");
  }

  return errors;
};

export const validateProfile = (values: ProfileValues, currentUser: User | null): FieldErrors<ProfileFields> => {
  const errors: FieldErrors<ProfileFields> = {};
  const rawUsername = values.username;
  const rawFirstName = values.firstName;
  const rawLastName = values.lastName;
  const rawEmail = values.email;
  const currentPassword = values.currentPassword;
  const newPassword = values.newPassword;

  if (currentUser === null || rawUsername !== currentUser.username) {
    validateUsername(values.username, errors, "username");
  }

  if (currentUser === null || rawFirstName !== currentUser.firstName) {
    validateName(values.firstName, errors, "firstName", "Imię");
  }

  if (currentUser === null || rawLastName !== currentUser.lastName) {
    validateName(values.lastName, errors, "lastName", "Nazwisko");
  }

  if (currentUser === null || rawEmail !== currentUser.email) {
    validateEmail(values.email, errors, "email", "Adres e-mail nie może być pusty.");
  }

  if (newPassword.length > 0) {
    validatePassword(newPassword, errors, "newPassword", "Nowe hasło");

    if (!currentPassword) {
      addError(errors, "currentPassword", "Podaj obecne hasło, aby ustawić nowe hasło.");
    }
  } else if (currentPassword.length > 0) {
    addError(errors, "newPassword", "Wpisz nowe hasło, jeśli podajesz obecne hasło.");
  }

  return errors;
};

export const mapApiErrors = <TField extends string>(error: unknown): FieldErrors<TField> => {
  if (error instanceof Error && "details" in error) {
    return mapApiDetails<TField>((error as ApiErrorLike).details);
  }

  if (error instanceof Error && error.message) {
    return { form: [translateApiMessage(error.message)] } as FieldErrors<TField>;
  }

  return { form: ["Wystąpił nieznany błąd."] } as FieldErrors<TField>;
};

export const hasErrors = <TField extends string>(errors: FieldErrors<TField>): boolean => {
  return Object.values(errors).some((value) => Array.isArray(value) && value.length > 0);
};

export const mergeErrors = <TField extends string>(
  primary: FieldErrors<TField>,
  secondary: FieldErrors<TField>,
): FieldErrors<TField> => {
  const merged: FieldErrors<TField> = {};
  const fields = new Set([...Object.keys(primary), ...Object.keys(secondary)]);

  for (const field of fields) {
    const primaryMessages = primary[field as keyof FieldErrors<TField>] ?? [];
    const secondaryMessages = secondary[field as keyof FieldErrors<TField>] ?? [];
    const combined = [...primaryMessages, ...secondaryMessages];

    if (combined.length > 0) {
      merged[field as TField | "form"] = combined;
    }
  }

  return merged;
};
import { useEffect, useId, useState, type FormEvent } from "react";
import { fetchCategories } from "../../products/products.api";
import type { Category } from "../../products/products.types";
import { setInventoryProductVisibility, updateInventoryProduct, uploadInventoryImage } from "../inventory.api";
import type { InventoryProduct } from "../inventory.types";

type Props = {
  product: InventoryProduct | null;
  onClose: () => void;
  onSaved: (message: string) => void;
  canManageRestrictedFields: boolean;
};

type EditFormState = {
  nazwa: string;
  opis: string;
  cena_sprzedazy: string;
  cena_zakupu: string;
  cena_prom: string;
  ilosc: string;
  id_kategorii: string;
  zdjecie_url: string;
  aktywny: boolean;
};

const buildEditForm = (product: InventoryProduct): EditFormState => ({
  nazwa: product.nazwa,
  opis: product.opis ?? "",
  cena_sprzedazy: String(product.cena_sprzedazy),
  cena_zakupu: String(product.cena_zakupu),
  cena_prom: product.cena_prom === null ? "" : String(product.cena_prom),
  ilosc: String(product.ilosc),
  id_kategorii: String(product.id_kategorii),
  zdjecie_url: product.zdjecie_url ?? "",
  aktywny: product.aktywny,
});

const parseError = (error: unknown, fallback: string) => error instanceof Error && error.message ? error.message : fallback;

export default function InventoryEditModal({ product, onClose, onSaved, canManageRestrictedFields }: Props) {
  const fileInputId = useId();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<EditFormState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCategories().then(setCategories).catch((err) => setError(parseError(err, "Nie udało się pobrać kategorii.")));
  }, []);

  useEffect(() => {
    if (!product) {
      setForm(null);
      setError(null);
      setFile(null);
      return;
    }

    setForm(buildEditForm(product));
    setError(null);
    setFile(null);
  }, [product]);

  if (!product || !form) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const categoryId = Number(form.id_kategorii);
    const purchasePrice = Number(form.cena_zakupu);
    const salePrice = Number(form.cena_sprzedazy);
    const quantity = canManageRestrictedFields ? Number(form.ilosc) : product.ilosc;
    const promotionPrice = form.cena_prom.trim() === "" ? null : Number(form.cena_prom);

    if (!Number.isFinite(categoryId) || categoryId <= 0) {
      setError("Wybierz kategorię dla produktu.");
      return;
    }

    if (!Number.isFinite(salePrice) || !Number.isFinite(purchasePrice) || salePrice <= 0 || purchasePrice <= 0) {
      setError("Cena sprzedaży i zakupu musi być większa od 0.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      setError("Ilość nie może być ujemna.");
      return;
    }

    if (promotionPrice !== null && (!Number.isFinite(promotionPrice) || promotionPrice <= 0)) {
      setError("Cena promocyjna musi być większa od 0.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      let imageUrl = form.zdjecie_url.trim() ? form.zdjecie_url.trim() : null;

      if (file) {
        const uploadResult = await uploadInventoryImage(file);
        imageUrl = uploadResult.url;
      }

      await updateInventoryProduct(product.id_przedmiotu, {
        nazwa: form.nazwa.trim(),
        opis: form.opis.trim() || undefined,
        cena_sprzedazy: salePrice,
        cena_zakupu: purchasePrice,
        cena_prom: promotionPrice,
        ilosc: quantity,
        id_kategorii: categoryId,
        zdjecie_url: imageUrl,
      });

      if (canManageRestrictedFields && form.aktywny !== product.aktywny) {
        await setInventoryProductVisibility(product.id_przedmiotu, form.aktywny);
      }

      onSaved(`Produkt \"${form.nazwa.trim()}\" został zaktualizowany.`);
      window.dispatchEvent(new Event("inventory:changed"));
      onClose();
    } catch (err) {
      setError(parseError(err, "Nie udało się zapisać zmian produktu."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/30">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-700">Edycja produktu</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{product.nazwa}</h2>
            <p className="mt-1 text-slate-600">Osobne okno do edycji wszystkich pól produktu.</p>
          </div>

          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
            Zamknij
          </button>
        </div>

        {error && <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Nazwa
              <input type="text" required minLength={3} value={form.nazwa} onChange={(event) => setForm((prev) => prev ? { ...prev, nazwa: event.target.value } : prev)} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Kategoria
              <select required value={form.id_kategorii} onChange={(event) => setForm((prev) => prev ? { ...prev, id_kategorii: event.target.value } : prev)} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500">
                <option value="" disabled>Wybierz kategorię</option>
                {categories.map((category) => <option key={category.id_kategorii} value={category.id_kategorii}>{category.nazwa}</option>)}
              </select>
            </label>
          </div>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Opis
            <textarea value={form.opis} onChange={(event) => setForm((prev) => prev ? { ...prev, opis: event.target.value } : prev)} className="min-h-28 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Cena zakupu
              <input type="number" step="0.01" min="0.01" required value={form.cena_zakupu} onChange={(event) => setForm((prev) => prev ? { ...prev, cena_zakupu: event.target.value } : prev)} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Cena sprzedaży
              <input type="number" step="0.01" min="0.01" required value={form.cena_sprzedazy} onChange={(event) => setForm((prev) => prev ? { ...prev, cena_sprzedazy: event.target.value } : prev)} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Cena promocyjna (opcjonalnie)
              <input type="number" step="0.01" min="0" value={form.cena_prom} onChange={(event) => setForm((prev) => prev ? { ...prev, cena_prom: event.target.value } : prev)} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Ilość
              <input type="number" min="0" required value={form.ilosc} disabled={!canManageRestrictedFields} onChange={(event) => setForm((prev) => prev ? { ...prev, ilosc: event.target.value } : prev)} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-60" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              URL zdjęcia (opcjonalnie)
              <input type="text" value={form.zdjecie_url} onChange={(event) => setForm((prev) => prev ? { ...prev, zdjecie_url: event.target.value } : prev)} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500" />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Dodaj własny plik
              <input id={fileInputId} type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="sr-only" />
              <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2">
                <label htmlFor={fileInputId} className="cursor-pointer rounded-xl border border-sky-300 bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-800 transition hover:bg-sky-200">
                  Wybierz plik
                </label>
                <span className="truncate text-xs text-slate-600">{file?.name ?? "Nie wybrano pliku"}</span>
              </div>
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" checked={form.aktywny} disabled={!canManageRestrictedFields} onChange={(event) => setForm((prev) => prev ? { ...prev, aktywny: event.target.checked } : prev)} className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600 disabled:cursor-not-allowed disabled:opacity-60" />
            Produkt aktywny
          </label>

          {!canManageRestrictedFields && (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Brak uprawnień do edycji pola ilości i aktywacji produktu.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button type="submit" disabled={busy} className="rounded-2xl bg-sky-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60">
              {busy ? "Zapisywanie..." : "Zapisz zmiany"}
            </button>
            <button type="button" onClick={() => setForm(buildEditForm(product))} disabled={busy} className="rounded-2xl border border-slate-300 bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60">
              Przywróć dane
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
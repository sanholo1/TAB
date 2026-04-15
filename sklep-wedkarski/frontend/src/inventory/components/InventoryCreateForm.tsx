import { useEffect, useId, useState, type FormEvent } from "react";
import { fetchCategories } from "../../products/products.api";
import type { Category } from "../../products/products.types";
import { createInventoryProduct, uploadInventoryImage } from "../inventory.api";
import type { InventoryProductPayload } from "../inventory.types";
import { toast } from "react-toastify";

type Props = {
  onCreated: () => void;
};

type CreateFormState = {
  nazwa: string;
  opis: string;
  cena_sprzedazy: string;
  cena_zakupu: string;
  cena_prom: string;
  ilosc: string;
  id_kategorii: string;
  zdjecie_url: string;
};

const INITIAL_FORM: CreateFormState = {
  nazwa: "",
  opis: "",
  cena_sprzedazy: "",
  cena_zakupu: "",
  cena_prom: "",
  ilosc: "",
  id_kategorii: "",
  zdjecie_url: "",
};

const parseError = (error: unknown, fallback: string) => error instanceof Error && error.message ? error.message : fallback;

export default function InventoryCreateForm({ onCreated }: Props) {
  const fileInputId = useId();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CreateFormState>(INITIAL_FORM);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCategories().then(setCategories).catch((err) => toast.error(parseError(err, "Nie udało się pobrać kategorii.")));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const categoryId = Number(form.id_kategorii);
    const purchasePrice = Number(form.cena_zakupu);
    const salePrice = Number(form.cena_sprzedazy);
    const quantity = Number(form.ilosc);
    const promotionPrice = form.cena_prom.trim() === "" ? null : Number(form.cena_prom);

    if (!Number.isFinite(categoryId) || categoryId <= 0) {
      toast.error("Wybierz kategorię dla nowej oferty.");
      return;
    }

    if (!Number.isFinite(salePrice) || !Number.isFinite(purchasePrice) || salePrice <= 0 || purchasePrice <= 0) {
      toast.error("Cena sprzedaży i zakupu musi być większa od 0.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      toast.error("Ilość nie może być ujemna.");
      return;
    }

    if (promotionPrice !== null && (!Number.isFinite(promotionPrice) || promotionPrice <= 0)) {
      toast.error("Cena promocyjna musi być większa od 0.");
      return;
    }

    setBusy(true);

    try {
      let imageUrl = form.zdjecie_url.trim() ? form.zdjecie_url.trim() : null;

      if (file) {
        const uploadResult = await uploadInventoryImage(file);
        imageUrl = uploadResult.url;
      }

      const payload: InventoryProductPayload = {
        nazwa: form.nazwa.trim(),
        opis: form.opis.trim() || undefined,
        cena_sprzedazy: salePrice,
        cena_zakupu: purchasePrice,
        cena_prom: promotionPrice,
        ilosc: quantity,
        id_kategorii: categoryId,
        zdjecie_url: imageUrl,
      };

      await createInventoryProduct(payload);
      setForm(INITIAL_FORM);
      setFile(null);
      toast.success("Nowa oferta została opublikowana.");
      onCreated();
      window.dispatchEvent(new Event("inventory:changed"));
    } catch (err) {
      toast.error(parseError(err, "Nie udało się dodać oferty."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-slate-900">Utwórz ofertę sprzedaży</h2>
        <p className="mt-2 text-slate-600">Sprzedawca i administrator mogą tworzyć oraz publikować oferty.</p>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Nazwa
            <input type="text" required minLength={3} value={form.nazwa} onChange={(event) => setForm((prev) => ({ ...prev, nazwa: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Kategoria
            <select required value={form.id_kategorii} onChange={(event) => setForm((prev) => ({ ...prev, id_kategorii: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500">
              <option value="" disabled>Wybierz kategorię</option>
              {categories.map((category) => <option key={category.id_kategorii} value={category.id_kategorii}>{category.nazwa}</option>)}
            </select>
          </label>
        </div>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Opis
          <textarea value={form.opis} onChange={(event) => setForm((prev) => ({ ...prev, opis: event.target.value }))} className="min-h-28 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500" />
        </label>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Cena zakupu
            <input type="number" step="0.01" min="0.01" required value={form.cena_zakupu} onChange={(event) => setForm((prev) => ({ ...prev, cena_zakupu: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Cena sprzedaży
            <input type="number" step="0.01" min="0.01" required value={form.cena_sprzedazy} onChange={(event) => setForm((prev) => ({ ...prev, cena_sprzedazy: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Cena promocyjna (opcjonalnie)
            <input type="number" step="0.01" min="0" value={form.cena_prom} onChange={(event) => setForm((prev) => ({ ...prev, cena_prom: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Ilość początkowa
            <input type="number" min="0" required value={form.ilosc} onChange={(event) => setForm((prev) => ({ ...prev, ilosc: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            URL zdjęcia (opcjonalnie)
            <input type="text" value={form.zdjecie_url} onChange={(event) => setForm((prev) => ({ ...prev, zdjecie_url: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500" />
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

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button type="submit" disabled={busy} className="rounded-2xl bg-sky-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60">
            {busy ? "Dodawanie..." : "Dodaj produkt"}
          </button>
          <button type="button" onClick={() => { setForm(INITIAL_FORM); setFile(null); }} disabled={busy} className="rounded-2xl border border-slate-300 bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60">
            Wyczyść formularz
          </button>
        </div>
      </form>
    </section>
  );
}
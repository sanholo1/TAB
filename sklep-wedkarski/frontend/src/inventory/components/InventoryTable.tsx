import { Link } from "react-router-dom";
import type { InventoryProduct } from "../inventory.types";

type Props = {
  products: InventoryProduct[];
  loading: boolean;
  lowStockThreshold: number;
  busyIds: Record<number, boolean>;
  stockDrafts: Record<number, string>;
  onStockDraftChange: (productId: number, value: string) => void;
  onSaveStock: (product: InventoryProduct) => void;
  onMarkAsShortage: (product: InventoryProduct) => void;
  onOpenEdit: (product: InventoryProduct) => void;
  onDeleteProduct: (product: InventoryProduct) => void;
  onActivateProduct: (product: InventoryProduct) => void;
  canEditOffers: boolean;
  canManageStock: boolean;
  canDeleteOffers: boolean;
};

const formatPrice = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "-";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  return `${numericValue.toFixed(2)} zł`;
};

export default function InventoryTable({
  products,
  loading,
  lowStockThreshold,
  busyIds,
  stockDrafts,
  onStockDraftChange,
  onSaveStock,
  onMarkAsShortage,
  onOpenEdit,
  onDeleteProduct,
  onActivateProduct,
  canEditOffers,
  canManageStock,
  canDeleteOffers,
}: Props) {
  return (
    <section className="overflow-x-auto rounded-[2rem] border border-slate-200 bg-white/90 p-4 shadow-sm">
      {loading ? (
        <p className="px-2 py-8 text-center text-slate-500">Ładowanie stanu magazynowego...</p>
      ) : products.length === 0 ? (
        <p className="px-2 py-8 text-center text-slate-500">Brak produktów pasujących do filtrów.</p>
      ) : (
        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Produkt</th>
              <th className="px-3 py-2">Kategoria</th>
              <th className="px-3 py-2">Cena sprzedaży</th>
              <th className="px-3 py-2">Cena zakupu</th>
              <th className="px-3 py-2">Cena promocyjna</th>
              <th className="px-3 py-2">Stan</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const busy = Boolean(busyIds[product.id_przedmiotu]);
              const rowClass =
                product.ilosc === 0
                  ? "border-rose-200 bg-rose-50"
                  : product.ilosc <= lowStockThreshold
                    ? "border-amber-200 bg-amber-50"
                    : "border-slate-200 bg-white";

              return (
                <tr key={product.id_przedmiotu} className={`rounded-2xl border ${rowClass}`}>
                  <td className="rounded-l-2xl px-3 py-3 font-medium text-slate-700">#{product.id_przedmiotu}</td>
                  <td className="px-3 py-3">
                    <Link to={`/products/${product.id_przedmiotu}`} className="font-semibold text-slate-900 transition hover:text-sky-700">
                      {product.nazwa}
                    </Link>
                    <p className="text-xs text-slate-500">{product.opis ?? "Brak opisu"}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{product.kategoria?.nazwa ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-700">{formatPrice(product.cena_sprzedazy)}</td>
                  <td className="px-3 py-3 text-slate-700">{formatPrice(product.cena_zakupu)}</td>
                  <td className="px-3 py-3 text-slate-700">{formatPrice(product.cena_prom)}</td>
                  <td className="px-3 py-3 font-semibold text-slate-900">
                    {canManageStock ? (
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={stockDrafts[product.id_przedmiotu] ?? String(product.ilosc)}
                        onChange={(event) => onStockDraftChange(product.id_przedmiotu, event.target.value)}
                        className="w-24 rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900 outline-none focus:border-sky-500"
                      />
                    ) : (
                      product.ilosc
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {product.aktywny ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Aktywny</span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">Nieaktywny</span>
                    )}
                  </td>
                  <td className="rounded-r-2xl px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onMarkAsShortage(product)}
                        disabled={busy || product.ilosc === 0}
                        className="rounded-xl border border-rose-200 bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-800 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Oznacz brak
                      </button>

                      {canEditOffers && (
                        <button
                          type="button"
                          onClick={() => onOpenEdit(product)}
                          disabled={busy}
                          className="rounded-xl border border-sky-200 bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-800 transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Edytuj
                        </button>
                      )}

                      {canManageStock && (
                        <button
                          type="button"
                          onClick={() => onSaveStock(product)}
                          disabled={busy}
                          className="rounded-xl border border-emerald-200 bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Zapisz stan
                        </button>
                      )}

                      {canDeleteOffers && (
                        <button
                          type="button"
                          onClick={() => (product.aktywny ? onDeleteProduct(product) : onActivateProduct(product))}
                          disabled={busy}
                          className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {product.aktywny ? "Usuń ofertę" : "Aktywuj"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
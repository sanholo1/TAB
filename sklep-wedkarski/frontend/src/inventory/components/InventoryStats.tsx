type Props = {
  total: number;
  lowStock: number;
  outOfStock: number;
};

export default function InventoryStats({ total, lowStock, outOfStock }: Props) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Łącznie produktów</p>
        <p className="mt-3 text-3xl font-semibold text-slate-900">{total}</p>
      </article>
      <article className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Niski stan (10 szt. i mniej)</p>
        <p className="mt-3 text-3xl font-semibold text-amber-900">{lowStock}</p>
      </article>
      <article className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-rose-700">Braki</p>
        <p className="mt-3 text-3xl font-semibold text-rose-900">{outOfStock}</p>
      </article>
    </section>
  );
}
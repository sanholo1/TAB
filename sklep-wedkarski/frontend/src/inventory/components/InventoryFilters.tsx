import type { Category } from "../../products/products.types";

export type InventoryActivityFilter = "all" | "active" | "inactive";
export type InventorySortMode = "qtyAsc" | "qtyDesc" | "nameAsc" | "nameDesc";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  categories: Category[];
  selectedCategory: number | "all";
  onSelectedCategoryChange: (value: number | "all") => void;
  activityFilter: InventoryActivityFilter;
  onActivityFilterChange: (value: InventoryActivityFilter) => void;
  lowStockOnly: boolean;
  onLowStockOnlyChange: (value: boolean) => void;
  sortMode: InventorySortMode;
  onSortModeChange: (value: InventorySortMode) => void;
};

export default function InventoryFilters({
  search,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectedCategoryChange,
  activityFilter,
  onActivityFilterChange,
  lowStockOnly,
  onLowStockOnlyChange,
  sortMode,
  onSortModeChange,
}: Props) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Szukaj
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Nazwa lub opis"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Kategoria
          <select
            value={selectedCategory}
            onChange={(event) => {
              const value = event.target.value;
              onSelectedCategoryChange(value === "all" ? "all" : Number(value));
            }}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
          >
            <option value="all">Wszystkie</option>
            {categories.map((category) => (
              <option key={category.id_kategorii} value={category.id_kategorii}>
                {category.nazwa}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Aktywność
          <select
            value={activityFilter}
            onChange={(event) => onActivityFilterChange(event.target.value as InventoryActivityFilter)}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
          >
            <option value="all">Wszystkie</option>
            <option value="active">Aktywne</option>
            <option value="inactive">Nieaktywne</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Sortowanie
          <select
            value={sortMode}
            onChange={(event) => onSortModeChange(event.target.value as InventorySortMode)}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
          >
            <option value="qtyAsc">Ilość rosnąco</option>
            <option value="qtyDesc">Ilość malejąco</option>
            <option value="nameAsc">Nazwa A-Z</option>
            <option value="nameDesc">Nazwa Z-A</option>
          </select>
        </label>

        <label className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(event) => onLowStockOnlyChange(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
          />
          Pokaż tylko niski stan
        </label>
      </div>
    </section>
  );
}
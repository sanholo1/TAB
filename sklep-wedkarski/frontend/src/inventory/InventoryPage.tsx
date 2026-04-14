import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import type { User } from "../auth/auth.types";
import { fetchCategories } from "../products/products.api";
import type { Category } from "../products/products.types";
import { NavLink } from "react-router-dom";
import {
  deleteInventoryProduct,
  fetchInventoryProducts,
  setInventoryProductVisibility,
  updateInventoryStock,
} from "./inventory.api";
import type { InventoryProduct } from "./inventory.types";
import InventoryFilters, { type InventoryActivityFilter, type InventorySortMode } from "./components/InventoryFilters";
import InventoryStats from "./components/InventoryStats";
import InventoryTable from "./components/InventoryTable";
import InventoryCreateForm from "./components/InventoryCreateForm";
import InventoryEditModal from "./components/InventoryEditModal";

type InventoryPageProps = {
  currentUser: User | null;
};

const LOW_STOCK_THRESHOLD = 10;

const parseError = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export default function InventoryPage({ currentUser }: InventoryPageProps) {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [inventoryNotice, setInventoryNotice] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [activityFilter, setActivityFilter] = useState<InventoryActivityFilter>("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortMode, setSortMode] = useState<InventorySortMode>("nameAsc");

  const [stockDrafts, setStockDrafts] = useState<Record<number, string>>({});
  const [workingIds, setWorkingIds] = useState<Record<number, boolean>>({});
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [displayedProductCount, setDisplayedProductCount] = useState(10);

  const isManager = currentUser?.roleId === 2 || currentUser?.roleId === 3;
  const isAdmin = currentUser?.roleId === 3;

  const loadData = async () => {
    setLoading(true);
    setInventoryError(null);

    try {
      const [inventoryProducts, categoryList] = await Promise.all([
        fetchInventoryProducts(),
        fetchCategories(),
      ]);
      setProducts(inventoryProducts);
      setCategories(categoryList);
    } catch (err) {
      setInventoryError(parseError(err, "Nie udało się pobrać stanu magazynowego."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isManager) {
      return;
    }

    loadData().catch(() => undefined);
  }, [isManager]);

  useEffect(() => {
    if (!inventoryNotice) {
      return;
    }

    const timeoutId = window.setTimeout(() => setInventoryNotice(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [inventoryNotice]);

  useEffect(() => {
    if (!isManager) {
      return;
    }

    const handleInventoryChange = () => {
      loadData().catch(() => undefined);
    };

    window.addEventListener("inventory:changed", handleInventoryChange);
    return () => window.removeEventListener("inventory:changed", handleInventoryChange);
  }, [isManager]);

  const productsForDisplay = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesSearch =
        lowerSearch.length === 0 ||
        product.nazwa.toLowerCase().includes(lowerSearch) ||
        (product.opis ?? "").toLowerCase().includes(lowerSearch);

      const matchesCategory =
        selectedCategory === "all" || product.id_kategorii === selectedCategory;

      const matchesActivity =
        activityFilter === "all" ||
        (activityFilter === "active" ? product.aktywny : !product.aktywny);

      const matchesLowStock = !lowStockOnly || product.ilosc <= LOW_STOCK_THRESHOLD;

      return matchesSearch && matchesCategory && matchesActivity && matchesLowStock;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortMode === "qtyAsc") return a.ilosc - b.ilosc;
      if (sortMode === "qtyDesc") return b.ilosc - a.ilosc;
      if (sortMode === "nameAsc") return a.nazwa.localeCompare(b.nazwa, "pl");
      return b.nazwa.localeCompare(a.nazwa, "pl");
    });

    return sorted;
  }, [products, search, selectedCategory, activityFilter, lowStockOnly, sortMode]);

  const stockSummary = useMemo(() => {
    const outOfStock = products.filter((product) => product.ilosc === 0).length;
    const lowStock = products.filter(
      (product) => product.ilosc > 0 && product.ilosc <= LOW_STOCK_THRESHOLD,
    ).length;

    return { total: products.length, outOfStock, lowStock };
  }, [products]);

  const runRowAction = async (id: number, action: () => Promise<void>) => {
    setWorkingIds((prev) => ({ ...prev, [id]: true }));
    setInventoryError(null);

    try {
      await action();
      await loadData();
    } catch (err) {
      setInventoryError(parseError(err, "Nie udało się wykonać akcji."));
    } finally {
      setWorkingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleMarkAsShortage = async (product: InventoryProduct) => {
    await runRowAction(product.id_przedmiotu, async () => {
      await updateInventoryStock(product.id_przedmiotu, 0);
      setInventoryNotice(`Produkt \"${product.nazwa}\" oznaczono jako brak.`);
      window.dispatchEvent(new Event("inventory:changed"));
    });
  };

  const handleSaveStock = async (product: InventoryProduct) => {
    const draftValue = stockDrafts[product.id_przedmiotu] ?? String(product.ilosc);
    const nextStock = Number(draftValue);

    if (!Number.isFinite(nextStock) || nextStock < 0) {
      setInventoryError("Stan magazynowy musi być liczbą całkowitą nieujemną.");
      return;
    }

    await runRowAction(product.id_przedmiotu, async () => {
      await updateInventoryStock(product.id_przedmiotu, Math.floor(nextStock));
      setInventoryNotice(`Stan produktu \"${product.nazwa}\" został zapisany.`);
      window.dispatchEvent(new Event("inventory:changed"));
    });
  };

  const handleDeleteProduct = async (product: InventoryProduct) => {
    const confirmed = window.confirm(`Usunąć ofertę \"${product.nazwa}\" ze strony?`);
    if (!confirmed) {
      return;
    }

    await runRowAction(product.id_przedmiotu, async () => {
      await deleteInventoryProduct(product.id_przedmiotu);
      setInventoryNotice(`Oferta \"${product.nazwa}\" została usunięta.`);
      window.dispatchEvent(new Event("inventory:changed"));
    });
  };

  const handleActivateProduct = async (product: InventoryProduct) => {
    await runRowAction(product.id_przedmiotu, async () => {
      await setInventoryProductVisibility(product.id_przedmiotu, true);
      setInventoryNotice(`Produkt \"${product.nazwa}\" został aktywowany.`);
      window.dispatchEvent(new Event("inventory:changed"));
    });
  };

  const handleNotice = (message: string) => setInventoryNotice(message);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isManager) {
    return (
      <section className="rounded-[2rem] border border-amber-300 bg-amber-50 p-8 text-amber-900 shadow-sm">
        <h1 className="text-2xl font-semibold">Brak dostępu do magazynu</h1>
        <p className="mt-3 text-sm">Panel magazynowy jest dostępny tylko dla ról Sprzedawca i Administrator.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-300/20">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-700">Panel magazynowy</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Zarządzanie stanem i ofertą</h1>
            <p className="mt-2 text-slate-600">
              Sprzedawca i administrator mogą tworzyć, publikować i edytować oferty. Administrator dodatkowo może ręcznie
              regulować stan magazynowy i usuwać oferty ze strony, a także generować raporty.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {currentUser?.roleId === 3 && (
              <NavLink
                to="/reports"
                className="rounded-2xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
              >
                Raporty
              </NavLink>
            )}
            <button
              type="button"
              onClick={() => loadData()}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Odśwież dane
            </button>
          </div>
        </div>
      </section>

      {inventoryError && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{inventoryError}</p>
      )}

      {inventoryNotice && (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{inventoryNotice}</p>
      )}

      {isManager && <InventoryCreateForm onCreated={() => loadData().catch(() => undefined)} />}

      <InventoryStats total={stockSummary.total} lowStock={stockSummary.lowStock} outOfStock={stockSummary.outOfStock} />

      <InventoryFilters
        search={search}
        onSearchChange={setSearch}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectedCategoryChange={setSelectedCategory}
        activityFilter={activityFilter}
        onActivityFilterChange={setActivityFilter}
        lowStockOnly={lowStockOnly}
        onLowStockOnlyChange={setLowStockOnly}
        sortMode={sortMode}
        onSortModeChange={setSortMode}
      />

      <InventoryTable
        products={productsForDisplay.slice(0, displayedProductCount)}
        loading={loading}
        lowStockThreshold={LOW_STOCK_THRESHOLD}
        busyIds={workingIds}
        stockDrafts={stockDrafts}
        onStockDraftChange={(productId, value) => setStockDrafts((prev) => ({ ...prev, [productId]: value }))}
        onSaveStock={handleSaveStock}
        onMarkAsShortage={handleMarkAsShortage}
        onOpenEdit={setEditingProduct}
        onDeleteProduct={handleDeleteProduct}
        onActivateProduct={handleActivateProduct}
        canEditOffers={isManager}
        canManageStock={isAdmin}
        canDeleteOffers={isAdmin}
      />

      {productsForDisplay.length > displayedProductCount && (
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setDisplayedProductCount(productsForDisplay.length)}
            className="rounded-2xl border border-sky-300 bg-sky-50 px-6 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
          >
            Rozwiń więcej
          </button>
        </div>
      )}

      {displayedProductCount > 10 && (
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setDisplayedProductCount(10)}
            className="rounded-2xl border border-slate-300 bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Zwiń
          </button>
        </div>
      )}

      {isManager && (
        <InventoryEditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={handleNotice}
          canManageRestrictedFields={isAdmin}
        />
      )}
    </div>
  );
}

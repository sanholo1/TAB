import { useEffect, useMemo, useState } from "react";
import { fetchCategories } from "../products/products.api";
import type { Category } from "../products/products.types";

const BASE_URL = "http://localhost:3000";
const SEED_DATE_FROM = "2026-04-01";
const SEED_DATE_TO = "2026-04-25";

type SalesApiRow = {
  liczba: number;
  cena_przedmiotu: string | number;
  transakcja: {
    data: string;
  };
  przedmiot: {
    nazwa: string;
    cena_zakupu: string | number;
    kategoria?: {
      nazwa: string;
    };
  };
};

type ReviewApiProduct = {
  id_przedmiotu: number;
  nazwa: string;
  kategoria?: { nazwa: string };
  opinie?: Array<{ ocena: number }>;
};

type ReportsResponse = {
  sales: SalesApiRow[];
  reviews: ReviewApiProduct[];
};

type ProductInAggregation = {
  productName: string;
  quantity: number;
  salePrice: number;
  purchasePrice: number;
  profit: number;
  margin: number; // profit percentage
};

type DayAggregate = {
  dayKey: string;
  dayLabel: string;
  categories: Map<string, { category: string; products: ProductInAggregation[]; totalCount: number; totalProfit: number }>;
};

const formatCurrency = (value: number) => `${value.toFixed(2)} zł`;
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return "Brak daty";
  try {
    return new Date(dateStr).toLocaleDateString("pl-PL");
  } catch {
    return dateStr;
  }
};

const ReportsGenerating = () => {
  const [dateFrom, setDateFrom] = useState(SEED_DATE_FROM);
  const [dateTo, setDateTo] = useState(SEED_DATE_TO);
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [ratingFromInput, setRatingFromInput] = useState<number>(0);
  const [ratingToInput, setRatingToInput] = useState<number>(5);
  const [appliedRatingFrom, setAppliedRatingFrom] = useState<number>(0);
  const [appliedRatingTo, setAppliedRatingTo] = useState<number>(5);

  const [rawData, setRawData] = useState<ReportsResponse>({ sales: [], reviews: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories()
      .then((list) => setCategories(list))
      .catch(() => setCategories([]));
  }, []);

  const handleRatingValidation = (value: string, setValue: (next: number) => void) => {
    let parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      parsed = 0;
    }

    setValue(Math.max(0, Math.min(5, parsed)));
  };

  const generate = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (selectedCategory !== "all") params.set("category", String(selectedCategory));

      const response = await fetch(`${BASE_URL}/reports?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Nie udało się wygenerować raportu.");
      }

      const payload = (await response.json()) as ReportsResponse;
      setRawData(payload);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Nie udało się pobrać raportów.");
    } finally {
      setLoading(false);
    }
  };

  const generateReviewsReport = () => {
    setAppliedRatingFrom(ratingFromInput);
    setAppliedRatingTo(ratingToInput);
    document.getElementById("raport-ocen")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const generateSalesReport = async () => {
    await generate();
    document.getElementById("raport-sprzedazy")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    generate().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleExpandRow = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const salesDetailRows = useMemo(() => {
    return (rawData.sales || [])
      .map((row) => {
        const quantity = Number(row.liczba) || 0;
        const salePrice = Number(row.cena_przedmiotu) || 0;
        const purchasePrice = Number(row.przedmiot?.cena_zakupu) || 0;
        const profit = (salePrice - purchasePrice) * quantity;
        const margin = purchasePrice > 0 ? ((salePrice - purchasePrice) / purchasePrice) * 100 : 0;

        return {
          productName: row.przedmiot?.nazwa || "Nieznany produkt",
          categoryName: row.przedmiot?.kategoria?.nazwa || "Brak kategorii",
          orderDate: row.transakcja?.data || "",
          quantity,
          salePrice,
          purchasePrice,
          profit,
          margin,
        };
      })
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [rawData.sales]);

  const aggregatedByDayAndCategory = useMemo(() => {
    const byDay = new Map<string, DayAggregate>();

    for (const row of salesDetailRows) {
      const dayKey = row.orderDate ? row.orderDate.slice(0, 10) : "0000-00-00";
      const dayLabel = formatDateTime(row.orderDate);

      if (!byDay.has(dayKey)) {
        byDay.set(dayKey, { dayKey, dayLabel, categories: new Map() });
      }

      const dayAgg = byDay.get(dayKey)!;
      if (!dayAgg.categories.has(row.categoryName)) {
        dayAgg.categories.set(row.categoryName, { category: row.categoryName, products: [], totalCount: 0, totalProfit: 0 });
      }

      const catAgg = dayAgg.categories.get(row.categoryName)!;
      const existingProduct = catAgg.products.find((product) => product.productName === row.productName);

      if (existingProduct) {
        existingProduct.quantity += row.quantity;
        existingProduct.profit += row.profit;
        existingProduct.margin = existingProduct.purchasePrice > 0
          ? ((existingProduct.salePrice - existingProduct.purchasePrice) / existingProduct.purchasePrice) * 100
          : 0;
      } else {
        catAgg.products.push({
          productName: row.productName,
          quantity: row.quantity,
          salePrice: row.salePrice,
          purchasePrice: row.purchasePrice,
          profit: row.profit,
          margin: row.margin,
        });
      }
      catAgg.totalCount += row.quantity;
      catAgg.totalProfit += row.profit;
    }

    return Array.from(byDay.values()).sort((a, b) => b.dayKey.localeCompare(a.dayKey));
  }, [salesDetailRows]);

  const dayProfitStats = useMemo(() => {
    const profitByDay = new Map<string, { dayLabel: string; profit: number }>();

    for (const row of salesDetailRows) {
      const dayKey = row.orderDate ? row.orderDate.slice(0, 10) : "0000-00-00";
      const dayLabel = formatDateTime(row.orderDate);
      const current = profitByDay.get(dayKey);

      if (current) {
        current.profit += row.profit;
      } else {
        profitByDay.set(dayKey, { dayLabel, profit: row.profit });
      }
    }

    const dayEntries = Array.from(profitByDay.entries()).map(([dayKey, value]) => ({
      dayKey,
      dayLabel: value.dayLabel,
      profit: value.profit,
    }));
    const minDay = dayEntries.length > 0 ? dayEntries.reduce((min, current) => (current.profit < min.profit ? current : min)) : null;
    const maxDay = dayEntries.length > 0 ? dayEntries.reduce((max, current) => (current.profit > max.profit ? current : max)) : null;
    const totalProfit = salesDetailRows.reduce((sum, row) => sum + row.profit, 0);
    const totalCount = salesDetailRows.reduce((sum, row) => sum + row.quantity, 0);

    return { minDay, maxDay, totalProfit, totalCount };
  }, [salesDetailRows]);

  const reviewsReport = useMemo(() => {
    const mapped = (rawData.reviews || []).map((product) => {
      const count = product.opinie?.length || 0;
      const avg = count > 0 ? product.opinie!.reduce((sum, review) => sum + review.ocena, 0) / count : 0;

      return {
        id: product.id_przedmiotu,
        productName: product.nazwa,
        categoryName: product.kategoria?.nazwa || "Brak kategorii",
        average: avg,
        count,
      };
    });

    return mapped
      .filter((row) => row.average >= appliedRatingFrom && row.average <= appliedRatingTo)
      .sort((a, b) => b.average - a.average);
  }, [rawData.reviews, appliedRatingFrom, appliedRatingTo]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-300/20">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-700">Raporty</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Raport sprzedaży i ocen</h1>
        <p className="mt-2 text-slate-600">
          Raport sprzedaży uwzględnia wyłącznie zamówienia ze statusem ZREALIZOWANE.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">Filtry sprzedaży</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-slate-700">
                Data od
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-slate-700">
                Data do
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-slate-700 sm:col-span-2">
                Kategoria
                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(event.target.value === "all" ? "all" : Number(event.target.value))
                  }
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="all">Wszystkie kategorie</option>
                  {categories.map((category) => (
                    <option key={category.id_kategorii} value={category.id_kategorii}>
                      {category.nazwa}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">Filtr raportu ocen</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-slate-700">
                Ocena od
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="1"
                  value={ratingFromInput}
                  onChange={(event) => handleRatingValidation(event.target.value, setRatingFromInput)}
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-slate-700">
                Ocena do
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="1"
                  value={ratingToInput}
                  onChange={(event) => handleRatingValidation(event.target.value, setRatingToInput)}
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => generateSalesReport()}
            disabled={loading}
            className="rounded-2xl bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generowanie sprzedaży..." : "Generuj raport sprzedaży"}
          </button>
          <button
            type="button"
            onClick={generateReviewsReport}
            className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Generuj raport ocen
          </button>
        </div>

        {error && <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </section>

      <section id="raport-sprzedazy" className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-300/20">
        <h2 className="text-2xl font-semibold text-slate-900">Raport sprzedaży</h2>
        <p className="mt-2 text-sm text-slate-600">
          Liczba sprzedanych sztuk z podziałem na kategorie. Kliknij kategorię, aby zobaczyć szczegółowe produkty.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Łączna liczba sztuk</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{dayProfitStats.totalCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Łączny zysk</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">{formatCurrency(dayProfitStats.totalProfit)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {dayProfitStats.minDay ? (
              <>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Min zysk dnia <span className="font-bold text-slate-700">{dayProfitStats.minDay.dayLabel}</span>
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900 tabular-nums">{formatCurrency(dayProfitStats.minDay.profit)}</p>
              </>
            ) : (
              <p className="mt-2 text-lg font-semibold text-slate-900">Brak danych</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {dayProfitStats.maxDay ? (
              <>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Max zysk dnia <span className="font-bold text-slate-700">{dayProfitStats.maxDay.dayLabel}</span>
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900 tabular-nums">{formatCurrency(dayProfitStats.maxDay.profit)}</p>
              </>
            ) : (
              <p className="mt-2 text-lg font-semibold text-slate-900">Brak danych</p>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {aggregatedByDayAndCategory.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              Brak danych do wyświetlenia.
            </div>
          ) : (
            aggregatedByDayAndCategory.map((dayAgg) => {
              const dayTotalProfit = Array.from(dayAgg.categories.values()).reduce((sum, cat) => sum + cat.totalProfit, 0);
              const dayTotalQty = Array.from(dayAgg.categories.values()).reduce((sum, cat) => sum + cat.totalCount, 0);
              return (
                <div key={dayAgg.dayKey} className="rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-4 border-b border-slate-200">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-base font-bold text-slate-900">{dayAgg.dayLabel}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          {dayAgg.categories.size === 1 ? "kategoria" : "kategorie"} • {dayTotalQty} szt.
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-[0.1em]">Zysk dnia</p>
                        <p className="text-xl font-bold text-emerald-700 tabular-nums">{formatCurrency(dayTotalProfit)}</p>
                      </div>
                    </div>
                  </div>

                <div className="divide-y divide-slate-100 bg-white">
                  {Array.from(dayAgg.categories.values()).map((catAgg) => {
                    const rowKey = `${dayAgg.dayKey}-${catAgg.category}`;
                    const isExpanded = expandedRows.has(rowKey);

                    return (
                      <div key={rowKey}>
                        <button
                          type="button"
                          onClick={() => toggleExpandRow(rowKey)}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 transition flex items-center justify-between gap-3"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{catAgg.category}</p>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {catAgg.totalCount} szt. • {formatCurrency(catAgg.totalProfit)}
                            </p>
                          </div>
                          <div className="text-lg text-slate-500">{isExpanded ? "▼" : "▶"}</div>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-white px-0 py-0 overflow-hidden">
                            <table className="w-full text-sm divide-y divide-slate-100">
                              <thead className="bg-slate-100">
                                <tr>
                                  <th className="px-4 py-2 text-center font-semibold text-slate-700">Produkt</th>
                                  <th className="px-4 py-2 text-center font-semibold text-slate-700">Ilość</th>
                                  <th className="px-4 py-2 text-center font-semibold text-slate-700">Cena spr.</th>
                                  <th className="px-4 py-2 text-center font-semibold text-slate-700">Cena hurt.</th>
                                  <th className="px-4 py-2 text-center font-semibold text-slate-700">Marża %</th>
                                  <th className="px-4 py-2 text-center font-semibold text-emerald-700">Zysk</th>
                                </tr>
                              </thead>
                              <tbody>
                                {catAgg.products.map((prod, idx) => {
                                  const marginColor = prod.margin >= 30 ? "text-emerald-700" : prod.margin >= 15 ? "text-amber-600" : "text-rose-600";
                                  const isAlternate = idx % 2 === 0;
                                  return (
                                    <tr
                                      key={idx}
                                      className={`${isAlternate ? "bg-white" : "bg-slate-50"} hover:bg-blue-50 transition`}
                                    >
                                      <td className="px-4 py-3 text-slate-900 font-medium">{prod.productName}</td>
                                      <td className="px-4 py-3 text-right text-slate-900 font-medium">{prod.quantity}</td>
                                      <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(prod.salePrice)}</td>
                                      <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(prod.purchasePrice)}</td>
                                      <td className={`px-4 py-3 text-right font-semibold ${marginColor}`}>
                                        {prod.margin.toFixed(1)}%
                                      </td>
                                      <td className="px-4 py-3 text-right text-emerald-700 font-semibold tabular-nums">
                                        {formatCurrency(prod.profit)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              )
            })
          )}
        </div>
      </section>

      <section id="raport-ocen" className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-300/20">
        <h2 className="text-2xl font-semibold text-slate-900">Raport ocen produktów</h2>
        <p className="mt-2 text-sm text-slate-600">Zakres oceny: od {appliedRatingFrom} do {appliedRatingTo}.</p>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-center text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3 text-center">Nazwa produktu</th>
                <th className="px-4 py-3 text-center">Kategoria</th>
                <th className="px-4 py-3 text-center">Średnia ocena</th>
                <th className="px-4 py-3 text-center">Liczba opinii</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {reviewsReport.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 text-slate-900">{row.productName}</td>
                  <td className="px-4 py-3 text-slate-700">{row.categoryName}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {row.count > 0 ? row.average.toFixed(2) : "Brak ocen"}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">{row.count}</td>
                </tr>
              ))}
              {reviewsReport.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Brak produktów spełniających zakres ocen.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ReportsGenerating;
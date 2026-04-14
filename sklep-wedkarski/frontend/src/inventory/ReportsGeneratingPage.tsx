import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const ReportsGenerating = () => {
  const today = new Date().toISOString().split("T")[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [categories, setCategories] = useState([]);
  const [ratingFromInput, setRatingFromInput] = useState<number>(0);
  const [ratingToInput, setRatingToInput] = useState<number>(5);
  const [appliedRatingFrom, setAppliedRatingFrom] = useState<number>(0);
  const [appliedRatingTo, setAppliedRatingTo] = useState<number>(5);
  const [rawData, setRawData] = useState<{ sales: any[], reviews: any[] }>({ sales: [], reviews: [] });
  const [salesSort, setSalesSort] = useState<"none" | "asc" | "desc">("none");
  const [reviewsSort, setReviewsSort] = useState<"none" | "asc" | "desc">("none");

  useEffect(() => {
    axios.get("http://localhost:3000/categories").then((res) => setCategories(res.data));
  }, []);

  const handleNumberValidation = (val: string, setter: (v: number) => void) => {
    let num = parseInt(val);
    if (isNaN(num)) num = 0;
    setter(Math.max(0, Math.min(5, num)));
  };

  const generate = async () => {
    try {
      const params: any = { dateFrom, dateTo };
      if (selectedCategory !== "all") params.category = selectedCategory;

      const res = await axios.get("http://localhost:3000/reports", { params });
      
      setAppliedRatingFrom(ratingFromInput);
      setAppliedRatingTo(ratingToInput);
      setRawData(res.data);
    } catch (err) {
      console.error("Błąd:", err);
    }
  };

  const salesReport = useMemo(() => {
    const dailyMap: Record<string, any> = {};
    rawData.sales?.forEach((item: any) => {
      const dateKey = new Date(item.transakcja?.data).toLocaleDateString();
      const catName = item.przedmiot?.kategoria?.nazwa || "Brak";
      const key = `${dateKey}-${catName}`;
      const qty = Number(item.liczba) || 0;
      const profit = (Number(item.cena_przedmiotu) - Number(item.przedmiot?.cena_zakupu || 0)) * qty;

      if (!dailyMap[key]) dailyMap[key] = { date: dateKey, category: catName, count: 0, profit: 0 };
      dailyMap[key].count += qty;
      dailyMap[key].profit += profit;
    });

    let rows = Object.values(dailyMap);
    if (salesSort !== "none") {
      rows.sort((a: any, b: any) => salesSort === "asc" ? a.profit - b.profit : b.profit - a.profit);
    }
    return rows;
  }, [rawData.sales, salesSort]);

  // Obliczamy sumę zysków ze wszystkich wierszy widocznych w raporcie zysków
const totalProfit = salesReport.reduce((acc, row) => acc + row.profit, 0);

  const reviewsReport = useMemo(() => {
    const data = (rawData.reviews || []).map((p: any) => {
      const count = p.opinie?.length || 0;
      const avg = count > 0 ? p.opinie.reduce((acc: number, curr: any) => acc + curr.ocena, 0) / count : 0;
      return { id: p.id_przedmiotu, name: p.nazwa, category: p.kategoria?.nazwa || "Brak", count, average: avg };
    });

    const filtered = data.filter(i => i.average >= appliedRatingFrom && i.average <= appliedRatingTo);

    if (reviewsSort !== "none") {
      filtered.sort((a, b) => reviewsSort === "asc" ? a.average - b.average : b.average - a.average);
    }
    return filtered;
  }, [rawData.reviews, reviewsSort, appliedRatingFrom, appliedRatingTo]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Raporty</h1>

      <div style={{ display: "flex", gap: "15px", marginBottom: "30px", padding: "15px", backgroundColor: "#f4f4f4", borderRadius: "8px", alignItems: "center" }}>
        <div>
          <label>Zakres od: </label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <label>Zakres do: </label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value === "all" ? "all" : Number(e.target.value))}>
          <option value="all">Wszystkie kategorie</option>
          {categories.map((c: any) => <option key={c.id_kategorii} value={c.id_kategorii}>{c.nazwa}</option>)}
        </select>

        <div style={{ borderLeft: "1px solid #ccc", paddingLeft: "15px" }}>
          <label>Średnia ocen od: </label>
          <input type="number" min="0" max="5" step="1" value={ratingFromInput} onChange={e => handleNumberValidation(e.target.value, setRatingFromInput)} style={{ width: "40px" }} />
          <label>Średnia ocen do: </label>
          <input type="number" min="0" max="5" step="1" value={ratingToInput} onChange={e => handleNumberValidation(e.target.value, setRatingToInput)} style={{ width: "40px" }} />
        </div>

        <button onClick={generate} style={{ padding: "8px 20px", cursor: "pointer", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px" }}>
          Generuj
        </button>
      </div>

      <h2>Raport zysków</h2>
<table border={1} style={{ width: "100%", borderCollapse: "collapse", marginBottom: "40px" }}>
  <thead style={{ backgroundColor: "#eee" }}>
    <tr>
      <th>Data</th>
      <th>Kategoria</th>
      <th>Liczba</th>
      <th onClick={() => setSalesSort(salesSort === "desc" ? "asc" : "desc")} style={{ cursor: "pointer" }}>
        Zysk {salesSort === "asc" ? "▲" : "▼"}
      </th>
    </tr>
  </thead>
  <tbody>
    {salesReport.map((r: any, i) => (
      <tr key={i}>
        <td>{r.date}</td>
        <td>{r.category}</td>
        <td>{r.count}</td>
        <td>{r.profit.toFixed(2)} zł</td>
      </tr>
    ))}
  </tbody>
  {/* DODANA STOPKA Z SUMĄ */}
  {salesReport.length > 0 && (
    <tfoot style={{ backgroundColor: "#f9f9f9", fontWeight: "bold" }}>
      <tr>
        <td colSpan={3} style={{ textAlign: "right", padding: "10px" }}>Suma całkowita:</td>
        <td>{totalProfit.toFixed(2)} zł</td>
      </tr>
    </tfoot>
  )}
</table>

      <h2>Raport opinii</h2>
      <table border={1} style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#eee" }}>
          <tr>
            <th>Produkt</th>
            <th>Kategoria</th>
            <th>Ilość ocen</th>
            <th onClick={() => setReviewsSort(reviewsSort === "desc" ? "asc" : "desc")} style={{ cursor: "pointer" }}>Średnia {reviewsSort === "asc" ? "▲" : "▼"}</th>
          </tr>
        </thead>
        <tbody>
          {reviewsReport.map(r => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.category}</td>
              <td>{r.count}</td>
              <td>{r.average > 0 ? r.average.toFixed(2) : "Brak ocen"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsGenerating;
import React from "react";

interface Props {
  minPrice: string;
  maxPrice: string;
  onPriceChange: (min: string, max: string) => void;
}

const PriceFilter: React.FC<Props> = ({ minPrice, maxPrice, onPriceChange }) => {
  const quickOptions = [
    { label: "Do 50 zł", min: "", max: "50" },
    { label: "50 - 100 zł", min: "50", max: "100" },
    { label: "Powyżej 100 zł", min: "100", max: "" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-slate-900">Cena</h3>
      
      {/* PREDEFINED */}
      <div className="flex flex-wrap gap-2">
        {quickOptions.map((opt) => {
          const isActive = minPrice === opt.min && maxPrice === opt.max;
          return (
            <button
              key={opt.label}
              onClick={() => onPriceChange(isActive ? "" : opt.min, isActive ? "" : opt.max)}
              className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "bg-sky-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <input
            type="number"
            min="0"
            placeholder="Od"
            value={minPrice}
            onChange={(e) => onPriceChange(e.target.value, maxPrice)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
          <span className="absolute right-3 top-2 text-sm text-slate-400">zł</span>
        </div>
        <span className="text-slate-400">-</span>
        <div className="relative w-full">
          <input
            type="number"
            min="0"
            placeholder="Do"
            value={maxPrice}
            onChange={(e) => onPriceChange(minPrice, e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
          <span className="absolute right-3 top-2 text-sm text-slate-400">zł</span>
        </div>
      </div>
    </div>
  );
};

export default PriceFilter;
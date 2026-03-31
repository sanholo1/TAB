import React from "react";
import type { Category } from "../products/products.types";

interface Props {
  categories: Category[];
  selectedCategory: number | null;
  setSelectedCategory: (id: number | null) => void;
}

const CategoryFilter: React.FC<Props> = ({ categories, selectedCategory, setSelectedCategory }) => {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold text-slate-900 mb-2">Kategorie</h3>
      {categories.map((cat) => (
        <label key={cat.id_kategorii} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-sky-700 focus:ring-sky-600"
            checked={selectedCategory === cat.id_kategorii}
            onChange={() =>
              setSelectedCategory(
                selectedCategory === cat.id_kategorii ? null : cat.id_kategorii
              )
            }
          />
          <span className="text-sm text-slate-700">{cat.nazwa}</span>
        </label>
      ))}
    </div>
  );
};

export default CategoryFilter;
import React from "react";
import type { Category } from "../App";

interface Props {
  categories: Category[];
  selectedCategory: number | null;
  setSelectedCategory: (id: number | null) => void;
}

const CategoryFilter: React.FC<Props> = ({ categories, selectedCategory, setSelectedCategory }) => {
  return (
    <div style={{ display: "flex", gap: "10px", padding: "10px" }}>
      {categories.map(cat => (
        <button
          key={cat.id_kategorii}
          className={selectedCategory === cat.id_kategorii ? "active" : ""}
          onClick={() =>
            setSelectedCategory(
              selectedCategory === cat.id_kategorii ? null : cat.id_kategorii
            )
          }
        >
          {cat.nazwa}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
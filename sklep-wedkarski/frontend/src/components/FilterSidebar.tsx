import React from "react";
import CategoryFilter from "./CategoryFilter";
import PriceFilter from "./PriceFilter";
import type { Category } from "../products/products.types";

interface Props {
  categories: Category[];
  selectedCategory: number | null;
  onCategoryChange: (id: number | null) => void;
  minPrice: string;
  maxPrice: string;
  onPriceChange: (min: string, max: string) => void;
  onClearFilters: () => void;
}

const FilterSidebar: React.FC<Props> = ({categories, selectedCategory, onCategoryChange,
                                         minPrice, maxPrice, onPriceChange, onClearFilters }) => {
  const hasActiveFilters = selectedCategory !== null || minPrice !== "" || maxPrice !== "";

  return (
    <div className="flex w-full flex-col gap-6 rounded-[1.5rem] bg-slate-50 p-6 md:w-64 shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Filtry</h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs font-semibold text-sky-700 hover:text-sky-900"
          >
            Wyczyść
          </button>
        )}
        
      </div>

      <div className="h-px w-full bg-slate-200" />

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={onCategoryChange}
      />

      <div className="h-px w-full bg-slate-200" />

      <PriceFilter
        minPrice={minPrice}
        maxPrice={maxPrice}
        onPriceChange={onPriceChange}
      />
    </div>
  );
};

export default FilterSidebar;
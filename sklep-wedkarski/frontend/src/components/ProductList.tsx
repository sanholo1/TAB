import React from "react";
import type { Product } from "../products/products.types";
import ProductCard from "./ProductCard";

interface Props {
  products: Product[];
}

const ProductList: React.FC<Props> = ({ products }) => {
  if (products.length === 0) {
    return <p className="py-8 text-center text-slate-500"> --- Pusto ---</p>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id_przedmiotu} product={p} />
      ))}
    </div>
  );
};

export default ProductList;
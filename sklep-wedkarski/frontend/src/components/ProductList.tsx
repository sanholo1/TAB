import React from "react";
import type { Product } from "../App";
import ProductCard from "./ProductCard";

interface Props {
  products: Product[];
}

const ProductList: React.FC<Props> = ({ products }) => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", padding: "10px" }}>
      {products.map(prod => (
        <ProductCard key={prod.id_przedmiotu} product={prod} />
      ))}
    </div>
  );
};

export default ProductList;
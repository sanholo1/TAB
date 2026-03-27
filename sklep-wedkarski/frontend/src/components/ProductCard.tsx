import React from "react";
import type { Product } from "../App";

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  return (
    <div style={{ border: "1px solid gray", padding: "10px" }}>
      <h3>{product.nazwa}</h3>
      <p>{product.opis}</p>
      <p>Cena: {product.cena_sprzedazy} zł</p>
    </div>
  );
};

export default ProductCard;
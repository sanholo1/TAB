import React from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../products/products.types";
import { addToCart } from "../products/products.api";


interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {

  const navigate = useNavigate();
  const handleCardClick = () => {
    navigate(`/products/${product.id_przedmiotu}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      await addToCart(product.id_przedmiotu, 1);
      alert("Dodano produkt do koszyka!"); // TODO: powiadomienie
    } catch (error) {
      console.error("Błąd:", error);
      alert("Dodawnie do koszyka nie powiodło się.");
    }
  };

  const imageUrl = product.zdjecie_url
    ? product.zdjecie_url.startsWith("http")
      ? product.zdjecie_url
      : `http://localhost:3000${product.zdjecie_url}`
    : null;

  const salePrice = Number(product.cena_sprzedazy);
  const promoPrice = product.cena_prom === null ? null : Number(product.cena_prom);
  const promotionalPrice = promoPrice === null || !Number.isFinite(promoPrice) ? null : `${promoPrice.toFixed(2)} zł`;

 return (
    <div
      onClick={handleCardClick}
      className="group block cursor-pointer overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-sky-300 hover:shadow-md"
    >
      <div className="mb-4 flex h-32 items-center justify-center rounded-3xl bg-slate-100 text-sm text-slate-500">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.nazwa}
            className="h-full w-full rounded-3xl object-cover"
            loading="lazy"
          />
        ) : (
          "[foto]"
        )}
      </div>
      
      <h3 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-sky-800">
        {product.nazwa}
      </h3>
      
      <p className="mb-4 text-sm text-slate-600 line-clamp-2">
        {product.opis ?? "---"}
      </p>
      
      <div className="space-y-2">
        <p className="text-sm text-slate-600 ">
          Kategoria: {product.kategoria?.nazwa ?? `Inne`}
        </p>
        {promotionalPrice ? (
          <div className="space-y-1">
            <p className="text-sm text-slate-500 line-through">{Number.isFinite(salePrice) ? `${salePrice.toFixed(2)} zł` : "-"}</p>
            <p className="text-lg font-semibold text-rose-700">{promotionalPrice}</p>
          </div>
        ) : (
          <p className="text-lg font-semibold text-slate-900">
            {Number.isFinite(salePrice) ? `${salePrice.toFixed(2)} zł` : "-"}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className="mt-4 inline-flex w-full justify-center rounded-2xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
      >
        Dodaj do koszyka
      </button>
    </div>
  );
};

export default ProductCard;
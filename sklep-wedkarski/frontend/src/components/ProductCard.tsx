import React from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../products/products.types";
import { addToCart } from "../products/products.api";
import { LayoutGrid, Tag, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";


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
    
    // Przerzucono logikę dodawania do koszyka z ProductDetailPage, aby obsłużyć zarówno użytkowników zalogowanych, jak i gości
    const token = localStorage.getItem("auth_token");
    if (!token)
    {
      let guest_cart = localStorage.getItem("Guest_cart") || "[]";
      let guest_cart_array = JSON.parse(guest_cart);
      const existingItem = guest_cart_array.find((item: any) => item.id_przedmiotu === product.id_przedmiotu);
      if (existingItem)
      {
        if(existingItem.ilosc < product.ilosc) {
          existingItem.ilosc++;
          toast.success(`Dodano produkt: ${product.nazwa} do koszyka.`);
        }
        else {
          toast.error(`Nie udało się dodać produktu: ${product.nazwa} do koszyka. Sprawdź dostępną ilość lub spróbuj ponownie później.`);
        }
      }
      else
      {
        guest_cart_array.push({ id_przedmiotu: product.id_przedmiotu, ilosc: 1 });
        toast.success(`Dodano produkt: ${product.nazwa} do koszyka.`);
      }
      guest_cart = JSON.stringify(guest_cart_array);
      localStorage.setItem("Guest_cart", guest_cart);
    }
    else    
    {
      try {
      await addToCart(product.id_przedmiotu, 1); // Na razie dodajemy na sztywno 1 sztukę, rozbuduję o możliwość wyboru ilości
      toast.success(`Dodano produkt: ${product.nazwa} do koszyka.`);
      } catch (error) {
      toast.error(`Nie udało się dodać produktu: ${product.nazwa} do koszyka. Sprawdź dostępną ilość lub spróbuj ponownie później.`);
      }
    }
  };

  const imageUrl = product.zdjecie_url
    ? product.zdjecie_url.startsWith("http")
      ? product.zdjecie_url
      : `http://localhost:3000${product.zdjecie_url}`
    : null;

  const salePrice = Number(product.cena_sprzedazy);
  const promoPrice = product.cena_prom === null ? null : Number(product.cena_prom);
  const hasPromotion = promoPrice !== null;
  const promotionalPrice = !hasPromotion || !Number.isFinite(promoPrice) ? null : `${promoPrice.toFixed(2)} zł`;

 return (
    <div
      onClick={handleCardClick}
      className="group flex h-full flex-col cursor-pointer overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-sky-300 hover:shadow-md"
    >
      <div className="mb-4 flex h-42 items-center justify-center rounded-3xl bg-slate-100 text-sm text-slate-500">
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
      
      <div className="mb-4 flex flex-grow flex-col">
        <h3 className="mb-2 line-clamp-2 text-xl font-semibold text-slate-900 group-hover:text-sky-800">
          {product.nazwa}
        </h3>
        <div className="mt-1 mb-4 flex items-center gap-1">
          <LayoutGrid className="h-4 w-4" />
          <p className="text-sm  text-slate-600 font-semibold uppercase">
            {product.kategoria?.nazwa ?? `Inne`}
          </p>
        </div>
        <p className="mb-4 text-sm text-slate-600 line-clamp-2">
          {product.opis ?? "---"}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <div className="space-y-2">
          {hasPromotion ? (
            <div className="flex items-center gap-2 space-y-1">
              <p className="text-2xl font-bold text-rose-700 group-hover:text-rose-900">
                {promotionalPrice}
              </p>
              <p className="text-lg text-slate-900 line-through">
                {Number.isFinite(salePrice) ? `${salePrice.toFixed(2)} zł` : "-"}
              </p>
              <Tag className="h-5 w-5" />
            </div>
          ) : (
            <p className="text-xl font-semibold text-slate-900">
              {Number.isFinite(salePrice) ? `${salePrice.toFixed(2)} zł` : "-"}
            </p>
          )}
        </div>

        <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800 active:bg-sky-900"
        >
          <ShoppingCart className="h-4 w-6" />
          Dodaj do koszyka
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
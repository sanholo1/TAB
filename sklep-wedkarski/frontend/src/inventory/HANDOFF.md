# Inventory Frontend Handoff

Dla frontu

## Gotowe pliki bazowe

- `inventory.types.ts` - typy modułu magazynu
- `inventory.api.ts` - gotowe wywołania API do backendu

## Jak importować

```ts
import {
  fetchInventoryProducts,
  createInventoryProduct,
  updateInventoryProduct,
  updateInventoryStock,
  deleteInventoryProduct,
  setInventoryProductVisibility,
  setInventoryProductPromotion,
  clearInventoryProductPromotion,
  uploadInventoryImage,
} from "./inventory.api";

import type {
  InventoryProduct,
  InventoryProductPayload,
} from "./inventory.types";
```

## Dostępne funkcje API

- `fetchInventoryProducts()`
- `createInventoryProduct(payload)`
- `updateInventoryProduct(id, payload)`
- `updateInventoryStock(id, ilosc)`
- `deleteInventoryProduct(id)`
- `setInventoryProductVisibility(id, aktywny)`
- `setInventoryProductPromotion(id, cena_prom)`
- `clearInventoryProductPromotion(id)`
- `uploadInventoryImage(file)`

## Dostępne typy

- `InventoryProductPayload`
- `InventoryProduct`

## Zakres po stronie UI (do wykonania przez frontend)

- Widoki CRUD magazynu
- Filtry i sortowanie
- Walidacja formularzy i UX błędów
- Layout i responsywność panelu
- Integracja uprawnień (sprzedawca/admin)

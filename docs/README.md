# Sklep Wędkarski 

## Jak uruchomić projekt lokalnie

Musisz uruchomić dwa terminale i odpalić.

**Terminal 1 (Backend - API):**
```bash
cd backend
npm run dev
```
Backend domyślnie: `http://localhost:3000`

**Terminal 2 (Frontend - Aplikacja kliencka):**
```bash
cd frontend
npm run dev
```
Frontend domyślnie: `http://localhost:5173`

---

## Baza danych i dane testowe

Jak chcecie dane testowe to w terminalu wpiszcie w /backend:
```bash
npm run prisma:seed
```
Będziecie mieli testowego uzytkownika produkt, kategorie, koszyk i role.

---

## Struktura

### Backend (Katalog `backend/`)
Zbudowany w architekturze MVC (Routes -> Controllers -> Services). Dostosuje się do struktury zrobionej przez Sanholo. To jest tylko szkielet.

### Frontend (Katalog `frontend/`)
Zbudowany w oparciu o komponenty i foldery funkcyjne. Ludzie z frontu też możecie ustawić pod siebie. To jest tylko szkielet.

---

## Paweł co żem odwalił

Strkura plikow ludzie z frontu też możecie ustawić pod siebie.
W produktach jest zrobione API, typy, strona główna i strona detalu. 
Jest tam surowy szkielet graficzny, trzeba go ładniej zrobić. Dodać wstawianie opinii, dodawanie do koszyka, filtrowanie cen. 

### Co już masz gotowe:
1. **`products.api.ts`** – Masz tam gotowe funkcje do backendu. Oprócz pobierania danych, masz teraz również **`addProductReview(id, data)`** oraz **`addToCart(id, ilosc)`**. Zostały zintegrowane z backendowymi endpointami.
2. **`products.types.ts`** – Gotowe interfejsy TypeScript (Product, Review, Category) zgodne z bazą danych.
3. **`ProductsPage.tsx`** – Działająca strona ze wszystkimi produktami. 
4. **`ProductDetailPage.tsx`** – Działająca strona szczegółów z pobieraniem opinii.

### Twoje TODO:
- [ ] **Design**: Zrób to ładnie, usuń ramki, dodaj kolory, obrazki, poprawne marginesy.
- [ ] **Wyświetlanie Obrazków**: Podmień tymczasowe placeholdery tekstowe i SVG na tagi `<img>` uderzające we właściwy format pliku.
- [ ] **Filtrowanie Ceny**: W `ProductsPage.tsx` po lewej stronie dorobiony jest szkielet na wpisanie ceny Min/Max. Musisz podpiąć pod to stan (np. `useState`) i wywoływać `fetchProducts({ minCena: X, maxCena: Y })`.
- [ ] **Opinie**: Na stronie `ProductDetailPage.tsx` dodaj prosty formularz na ocenę i komentarz. Podepnij pod niego przygotowaną funkcję `addProductReview()`.
- [ ] **Koszyk**: Pod przycisk "Dodaj do koszyka" podepnij nową funkcję `addToCart()`. (System będzie wrzucał itemy na sztywno do konta usera ID=1 dopóki chłopaki nie skończą systemu logowania).
- [ ] **Co Chcesz**: Zrób to co chcesz, pisz dc jak coś nie trybi.
- [ ] 

# Sklep Wędkarski 

## Jak uruchomić projekt lokalnie

Musisz uruchomić dwa terminale i odpalić.

**Terminal 1 (Backend - API):**
```bash
cd sklep-wedkarski/backend
npm install
npm run dev
```
Backend domyślnie: `http://localhost:3000`

**Terminal 2 (Frontend - Aplikacja kliencka):**
```bash
cd sklep-wedkarski/frontend
npm install
npm run dev
```
Frontend domyślnie: `http://localhost:5173`

---

## Baza danych i dane testowe

Jak chcecie dane testowe, to w terminalu wpiszcie:
```bash
cd sklep-wedkarski/backend
npm run prisma:seed
```
Będziecie mieli testowego użytkownika, produkt, kategorię, koszyk i role.

---

## Struktura

### Backend (Katalog `backend/`)
Zbudowany w architekturze modularnej (**Routes -> Services -> Prisma Client**). System wspiera pełną autoryzację JWT oraz opcję zakupów dla gości.

### Frontend (Katalog `frontend/`)
Zbudowany w oparciu o komponenty i foldery funkcyjne. W pełni zintegrowany z nowym backendem.
Struktura plików — ludzie z frontu też możecie ustawić pod siebie.
W produktach jest zrobione API, typy, strona główna produktów i strona detalu.
Jest tam surowy szkielet graficzny, trzeba go ładniej zrobić. Dodać wstawianie opinii, dodawanie do koszyka, filtrowanie cen. 

### Postępy prac:
1. **`products.api.ts`** – Pełna integracja z backendem. Funkcje **`addProductReview(id, data)`** oraz **`addToCart(id, ilosc)`** działają z nową strukturą bazy.
2. **`Autoryzacja`** – Mamy gotowy moduł rejestracji i logowania na backendzie. 
3. **`Filtrowanie`** – Na stronie produktów działa już filtrowanie po cenie i kategoriach.
4. **`Koszyk`** – System automatycznie przypisuje zakupy do zalogowanego usera lub gościa (ID=1).
   
## Dla Pawła
### Twoje TODO:
- [ ] **Design**: Zrób to ładnie, usuń ramki, dodaj kolory, obrazki, poprawne marginesy.
- [ ] **Wyświetlanie Obrazków**: Podmień tymczasowe placeholdery tekstowe i SVG na tagi `<img>` uderzające we właściwy format pliku.
- [ ] **Opinie**: Na stronie `ProductDetailPage.tsx` dodaj prosty formularz na ocenę i komentarz. Podepnij pod niego przygotowaną funkcję `addProductReview()`.
- [ ] **Koszyk**: Pod przycisk "Dodaj do koszyka" podepnij nową funkcję `addToCart()`. (System będzie wrzucał itemy na sztywno do konta niezalgowanego uzytkownika lub do zalogowanego uzytkwnika).
- [ ] **Koszyk gościa (ważne)**: Aktualnie gość nie jest w stanie nic dodac do koszyka, konczy się to blędem. Trzeba zaimplenetowac po stronie frontu koszyk gościa, który będzie sie przenosił do koszyka uzytkownika po zalogowaniu. Wszystkie potrzebne funkcje powinny być dostępne. Backend obsługuje jedynie koszyk zalogowanych.
- [ ] **Co Chcesz**: Zrób to co chcesz, pisz dc jak coś nie trybi.
- [ ] 

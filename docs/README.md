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

## Konta testowe po seedzie

Haslo dla wszystkich kont: Tajne oczywiście ;)

- Klient: `klient@sklep.pl`
- Sprzedawca: `sprzedawca@sklep.pl`
- Administrator: `admin@sklep.pl`

---
  
## Struktura

### Backend (Katalog `backend/`)
Zbudowany w architekturze modularnej (**Routes -> Services -> Prisma Client**). System wspiera pełną autoryzację JWT oraz opcję zakupów dla gości.

### Frontend (Katalog `frontend/`)
Zbudowany w oparciu o komponenty i foldery funkcyjne. W pełni zintegrowany z nowym backendem.
Struktura plików — ludzie z frontu też możecie ustawić pod siebie.
W produktach jest zrobione API, typy, strona główna produktów i strona detalu.
Jest tam surowy szkielet graficzny, trzeba go ładniej zrobić. Dodać wstawianie opinii, dodawanie do koszyka, filtrowanie cen. 

## Postępy prac:

### Magazyn:
- Dodano panel magazynowy w frontendzie (`/inventory`).
- Dodano filtrowanie, sortowanie i akcje na produktach (dodawanie, edycja, aktywacja/dezaktywacja, oznaczanie brakow, aktualizacja stanu, usuwanie oferty).
- Uprawnienia sa rozdzielone po rolach (Sprzedawca / Administrator).
  
### NIEAKTUALNE POSTĘPY 04.04.2026
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
- [ ] **Koszyk gościa (ważne)**: Aktualnie gość nie jest w stanie nic dodać do koszyka, kończy się to błędem. Trzeba zaimplementować po stronie frontu koszyk gościa, który będzie się przenosił do koszyka użytkownika po zalogowaniu. Wszystkie potrzebne funkcje powinny być dostępne. Konto gościa może już składać zamówienia po zalogowaniu na konto `gosc@sklep.pl`, ale prawdziwy koszyk anonimowy nadal nie jest gotowy.
- [ ] **Co Chcesz**: Zrób to co chcesz, pisz dc jak coś nie trybi.
- [ ] 

### API dla frontu
- `POST /orders/guest` pozwala złożyć zamówienie bez tokena. Payload:
```json
{
  "kraj": "Polska",
  "miasto": "Warszawa",
  "kod_pocztowy": "00-001",
  "ulica": "Prosta",
  "nr_domu": "10A",
  "items": [
    { "id_przedmiotu": 1, "ilosc": 2 }
  ]
}
```
- Endpoint zapisuje zamówienie na techniczne konto gościa i sam weryfikuje dostępność produktów oraz sumuje duplikaty `id_przedmiotu`.

# Sklep Wędkarski - dokumentacja projektu

## Krótki opis
Sklep Wędkarski to aplikacja webowa do obsługi sklepu internetowego z podziałem na role użytkowników. Projekt składa się z warstwy frontendowej (React + Vite) oraz backendowego API (Express + Prisma + MySQL).

Zakres obejmuje m.in. katalog produktów, koszyk, składanie zamówień, obsługę kont użytkowników, panel magazynowy oraz raporty sprzedażowe i opinii.

## Technologie

| Warstwa | Technologie |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, Axios, Tailwind CSS |
| Backend | Node.js, Express 5, TypeScript, Prisma ORM, Zod, JWT, Multer |
| Baza danych | MySQL 8 |
| Narzędzia uruchomieniowe | Docker Compose, npm |

## Główne funkcjonalności

### Moduły klienckie:
- Rejestracja i logowanie użytkownika.
- Przeglądanie produktów i kategorii.
- Koszyk zakupowy oraz składanie zamówień.
- Obsługa zamówień gościa.
- Profil użytkownika.

### Moduły administracyjne i sprzedażowe:
- Zarządzanie asortymentem (`/inventory`):
  - dodawanie i edycja produktów,
  - aktywacja/dezaktywacja oferty,
  - aktualizacja stanów magazynowych.
- Zarządzanie promocjami.
- Generowanie raportów sprzedażowych i opini.
- Kontrola uprawnień oparta o role (Klient, Sprzedawca, Administrator).

## Połączenie z bazą danych

### Konfiguracja
Backend łączy się z MySQL przez Prisma, wykorzystując zmienną środowiskową `DATABASE_URL`.

Przykładowa konfiguracja (plik `.env` backendu):

```env
DATABASE_URL="mysql://root:root@localhost:3307/sklep_wedkarski"
JWT_SECRET="12345678901234567890123456789012"
JWT_EXPIRES_IN="7d"
PORT="3000"
```

### Jak to działa ?
- Schemat danych jest definiowany w `backend/prisma/schema.prisma`.
- Prisma Client mapuje modele aplikacji na tabele MySQL.
- Migracje i seed inicjalizują strukturę oraz dane testowe
- Baza uruchamiana jest kontenerem Docker na porcie hosta `3307`.

## Instalacja i uruchomienie

### Wymagania:
- Node.js
- npm
- Docker

### 1) Uruchom bazę danych
W katalogu projektu:

```bash
cd sklep-wedkarski
docker compose up -d
```

### 2) Konfiguracja backendu

Skopiuj konfigurację środowiska:

```bash
# Linux/macOS
cp backend/.env.example backend/.env

# Windows (PowerShell)
Copy-Item backend/.env.example backend/.env
```

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

Backend domyślnie: `http://localhost:3000`

### 3) Konfiguracja frontendu

```bash
cd ../frontend
npm install
npm run dev
```

Frontend domyślnie: `http://localhost:5173`

## Opis generowanych raportów

| Raport | Opis biznesowy | Parametry | Wynik i metryki |
|---|---|---|---|
| Raport sprzedaży | Zestawienie sprzedaży z podziałem dziennym i kategoriami. Raport uwzględnia wyłącznie zamówienia zrealizowane. | Data od, data do, kategoria | **Widok podsumowania:** łączna liczba sprzedanych sztuk, łączny zysk, minimalny zysk dnia, maksymalny zysk dnia.    **Widok szczegółowy:** nazwa produktu, ilość, cena sprzedaży, cena hurtowa, marża %, zysk. |
| Raport ocen produktów | Zestawienie jakości oferty na podstawie średniej oceny produktów i liczby opinii. | Zakres oceny od-do (0-5) | Lista produktów spełniających filtr: nazwa produktu, kategoria, średnia ocena, liczba opinii. |
  
## Dane testowe

Po uruchomieniu seeda dostępne są konta testowe:

- Klient: `klient@sklep.pl`
- Sprzedawca: `sprzedawca@sklep.pl`
- Administrator: `admin@sklep.pl`

Hasło dla kont testowych: `haslo123`

## Struktura projektu

```text
sklep-wedkarski/
|- backend/    # API, logika biznesowa, Prisma, migracje
|- frontend/   # Aplikacja React
|- docker-compose.yml  # Lokalna baza MySQL
```

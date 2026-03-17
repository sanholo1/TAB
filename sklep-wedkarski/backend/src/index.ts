import "dotenv/config";
import cors from "cors";
import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: "connected" });
  } catch (error) {
    res.status(500).json({
      ok: false,
      db: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/produkty", async (_req, res) => {
  const produkty = await prisma.przedmioty.findMany({
    orderBy: { id_przedmiotu: "asc" },
    include: { kategoria: true },
  });
  res.json(produkty);
});

app.post("/produkty", async (req, res) => {
  const { nazwa, opis, cena_sprzedazy, cena_zakupu, ilosc, id_kategorii } =
    req.body ?? {};

  if (typeof nazwa !== "string" || typeof cena_sprzedazy !== "number") {
    return res.status(400).json({
      error:
        "Pola 'nazwa' (string) i 'cena_sprzedazy' (number) są wymagane.",
    });
  }

  let kategoriaId: number;
  if (typeof id_kategorii === "number") {
    kategoriaId = id_kategorii;
  } else {
    const domyslnaKategoria = await prisma.kategoria.upsert({
      where: { id_kategorii: 1 },
      update: {},
      create: { nazwa: "Bez kategorii" },
    });
    kategoriaId = domyslnaKategoria.id_kategorii;
  }

  const przedmiot = await prisma.przedmioty.create({
    data: {
      nazwa,
      opis: typeof opis === "string" ? opis : null,
      cena_sprzedazy,
      cena_zakupu: typeof cena_zakupu === "number" ? cena_zakupu : 0,
      ilosc: typeof ilosc === "number" ? ilosc : 0,
      id_kategorii: kategoriaId,
    },
  });

  return res.status(201).json(przedmiot);
});


app.get("/kategorie", async (_req, res) => {
  const kategorie = await prisma.kategoria.findMany({
    orderBy: { id_kategorii: "asc" },
  });
  res.json(kategorie);
});

app.listen(port, () => {
  console.log(`Backend is running at http://localhost:${port}`);
});

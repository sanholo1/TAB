import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 1. Dodaj testową kategorię
  const kategoria = await prisma.kategoria.upsert({
    where: { id_kategorii: 1 },
    update: {},
    create: {
      id_kategorii: 1,
      nazwa: 'Wędki',
    },
  });

  // 2. Dodaj testowy produkt
  const produkt = await prisma.przedmioty.upsert({
    where: { id_przedmiotu: 1 },
    update: {},
    create: {
      id_przedmiotu: 1,
      nazwa: 'Wędka Karpiowa',
      opis: 'Profesjonalna wędka karpiowa do łowienia dużych sztuk.',
      cena_sprzedazy: 199.99,
      cena_zakupu: 100.00,
      ilosc: 10,
      id_kategorii: 1,
    },
  });

  // 3. Dodaj testową rolę
  const rola = await prisma.rola.upsert({
    where: { id_roli: 1 },
    update: {},
    create: {
      id_roli: 1,
      nazwa: 'Klient',
    },
  });

  // 4. Dodaj testowego użytkownika
  const user = await prisma.uzytkownik.upsert({
    where: { id_uzytkownika: 1 },
    update: {},
    create: {
      id_uzytkownika: 1,
      nazwa: 'TestUser',
      imie: 'Jan',
      nazwisko: 'Kowalski',
      email: 'jan@test.pl',
      haslo: 'haslo123',
      id_roli: 1,
    },
  });

  // 5. Dodaj produkt do koszyka testowego użytkownika
  const koszyk = await prisma.koszyk.upsert({
    where: {
      id_przedmiotu_id_uzytkownika: {
        id_przedmiotu: 1,
        id_uzytkownika: 1,
      }
    },
    update: {},
    create: {
      id_przedmiotu: 1,
      id_uzytkownika: 1,
      ilosc: 1,
    }
  });

  console.log('GIT.', {
    kategoria,
    produkt,
    rola,
    user,
    koszyk
  });
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('haslo123', 12)

  const kategoria = await prisma.kategoria.upsert({
    where: { id_kategorii: 1 },
    update: {},
    create: {
      id_kategorii: 1,
      nazwa: 'Wędki',
    },
  });

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

  const rola = await prisma.rola.upsert({
    where: { id_roli: 1 },
    update: {},
    create: {
      id_roli: 1,
      nazwa: 'Klient',
    },
  });

  const rolaSprzedawca = await prisma.rola.upsert({
    where: { id_roli: 2 },
    update: {},
    create: {
      id_roli: 2,
      nazwa: 'Sprzedawca',
    },
  });

  const rolaAdmin = await prisma.rola.upsert({
    where: { id_roli: 3 },
    update: {},
    create: {
      id_roli: 3,
      nazwa: 'Administrator',
    },
  });

  const userGuest = await prisma.uzytkownik.upsert({
    where: { id_uzytkownika: 1 },
    update: { haslo: hashedPassword },
    create: {
      id_uzytkownika: 1,
      nazwa: 'GoscNiezalogowany',
      imie: 'Gość',
      nazwisko: 'Anonimowy',
      email: 'gosc@sklep.pl',
      haslo: hashedPassword,
      id_roli: 1,
    },
  });


  const userClient = await prisma.uzytkownik.upsert({
    where: { id_uzytkownika: 2 },
    update: { haslo: hashedPassword },
    create: {
      id_uzytkownika: 2,
      nazwa: 'KlientTest',
      imie: 'Jan',
      nazwisko: 'Kowalski',
      email: 'klient@sklep.pl',
      haslo: hashedPassword,
      id_roli: 1,
    },
  });


  const userSeller = await prisma.uzytkownik.upsert({
    where: { id_uzytkownika: 3 },
    update: { haslo: hashedPassword },
    create: {
      id_uzytkownika: 3,
      nazwa: 'SprzedawcaMirek',
      imie: 'Mirosław',
      nazwisko: 'Sprzedawca',
      email: 'sprzedawca@sklep.pl',
      haslo: hashedPassword,
      id_roli: 2,
    },
  });


  const userAdmin = await prisma.uzytkownik.upsert({
    where: { id_uzytkownika: 4 },
    update: { haslo: hashedPassword },
    create: {
      id_uzytkownika: 4,
      nazwa: 'AdminSzef',
      imie: 'Adam',
      nazwisko: 'Szef',
      email: 'admin@sklep.pl',
      haslo: hashedPassword,
      id_roli: 3,
    },
  });

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
    rolaSprzedawca,
    rolaAdmin,
    userGuest,
    userClient,
    userSeller,
    userAdmin,
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

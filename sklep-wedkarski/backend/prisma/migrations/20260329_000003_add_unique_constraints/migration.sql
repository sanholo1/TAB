-- AlterTable: Add unique constraint to Rola.nazwa
ALTER TABLE `Rola` ADD UNIQUE INDEX `Rola_nazwa_key`(`nazwa`);

-- AlterTable: Add unique constraints to Uzytkownik.nazwa and Uzytkownik.email
ALTER TABLE `Uzytkownik` ADD UNIQUE INDEX `Uzytkownik_nazwa_key`(`nazwa`);
ALTER TABLE `Uzytkownik` ADD UNIQUE INDEX `Uzytkownik_email_key`(`email`);

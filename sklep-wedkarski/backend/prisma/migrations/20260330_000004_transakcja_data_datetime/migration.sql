-- AlterTable: zmiana pola `data` w tabeli Transakcja z VARCHAR na DATETIME
ALTER TABLE `Transakcja` 
  ADD COLUMN `data_new` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

UPDATE `Transakcja` 
  SET `data_new` = STR_TO_DATE(`data`, '%Y-%m-%d') 
  WHERE `data` REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$';

ALTER TABLE `Transakcja` DROP COLUMN `data`;
ALTER TABLE `Transakcja` RENAME COLUMN `data_new` TO `data`;

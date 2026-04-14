export type OrderItem = {
  id_transakcji: number;
  id_przedmiotu: number;
  liczba: number;
  cena_przedmiotu: string;
  przedmiot: {
    id_przedmiotu: number;
    nazwa: string;
  };
};

export type OrderAddress = {
  id_adres: number;
  email: string;
  miasto: string;
  kod_pocztowy: string;
  ulica: string;
  nr_domu: string;
};

export type Order = {
  id_transakcji: number;
  id_uzytkownika: number;
  kwota_calkowita: string;
  stan: string;
  data: string;
  id_adres: number;
  adres: OrderAddress;
  przedmioty: OrderItem[];
};

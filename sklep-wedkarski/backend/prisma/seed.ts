import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('haslo123', 12)


  const kategorie = await Promise.all([
    prisma.kategoria.upsert({ where: { id_kategorii: 1 }, update: {}, create: { id_kategorii: 1, nazwa: 'Wędki' } }),
    prisma.kategoria.upsert({ where: { id_kategorii: 2 }, update: {}, create: { id_kategorii: 2, nazwa: 'Haczyki' } }),
    prisma.kategoria.upsert({ where: { id_kategorii: 3 }, update: {}, create: { id_kategorii: 3, nazwa: 'Przynęty' } }),
    prisma.kategoria.upsert({ where: { id_kategorii: 4 }, update: {}, create: { id_kategorii: 4, nazwa: 'Kołowrotki' } }),
    prisma.kategoria.upsert({ where: { id_kategorii: 5 }, update: {}, create: { id_kategorii: 5, nazwa: 'Żyłki i plecionki' } }),
    prisma.kategoria.upsert({ where: { id_kategorii: 6 }, update: {}, create: { id_kategorii: 6, nazwa: 'Spławiki' } }),
    prisma.kategoria.upsert({ where: { id_kategorii: 7 }, update: {}, create: { id_kategorii: 7, nazwa: 'Akcesoria' } }),
    prisma.kategoria.upsert({ where: { id_kategorii: 8 }, update: {}, create: { id_kategorii: 8, nazwa: 'Odzież wędkarska' } }),
  ])
  console.log('Kategorie wstawione:', kategorie.map(k => k.nazwa).join(', '))


  const produkty = [

    { id: 1,  nazwa: 'Wędka Karpiowa Pro 3.6m', opis: 'Wysokiej klasy wędka karpiowa do łowienia z rzutu. Test krzywej 3lbs.', cena: 299.99, prom: null, zakup: 150.00, ilosc: 12, kat: 1, img: '/uploads/wedka1.jpg' },
    { id: 2,  nazwa: 'Wędka Spinningowa Light 2.1m', opis: 'Lekka wędka spinnigowa na okonie i szczupaki. Ciężar wyrzutu 5-20g.', cena: 189.99, prom: 149.99, zakup: 80.00, ilosc: 20, kat: 1, img: '/uploads/wedka2.jpg' },
    { id: 3,  nazwa: 'Wędka Feederowa 3.9m', opis: 'Trzyczęściowy feeder, w zestawie 3 wymienne szczytówki. Idealny na białoryb.', cena: 249.99, prom: null, zakup: 120.00, ilosc: 8, kat: 1, img: '/uploads/wedka3.jpg' },
    { id: 4,  nazwa: 'Wędka Sumowa Extreme', opis: 'Bardzo mocna wędka na ogromne sumy. Krótka i pękata.', cena: 450.00, prom: null, zakup: 225.00, ilosc: 5, kat: 1, img: '/uploads/wedka4.jpg' },
    { id: 5,  nazwa: 'Teleskop Podróżny 2.7m', opis: 'Kompaktowa wędka teleskopowa, mieści się w plecaku.', cena: 79.99, prom: null, zakup: 30.00, ilosc: 30, kat: 1, img: '/uploads/wedka5.jpg' },
    { id: 6,  nazwa: 'Wędka Odległościowa Match', opis: 'Klasyczna odległościówka na liny i leszcze. Długość 4.2m.', cena: 219.99, prom: 189.99, zakup: 100.00, ilosc: 10, kat: 1, img: '/uploads/wedka6.jpg' },
    { id: 7,  nazwa: 'Wędka Muchowa Klasa #5', opis: 'Doskonała do nauki wędkarstwa muchowego. Szybka akcja.', cena: 399.99, prom: null, zakup: 190.00, ilosc: 4, kat: 1, img: '/uploads/wedka7.jpg' },
    { id: 8,  nazwa: 'Baty Wędkarskie 6m', opis: 'Lekki bat bez przelotek. Rozłożenie i złożenie zajmuje sekundy.', cena: 119.99, prom: null, zakup: 50.00, ilosc: 15, kat: 1, img: '/uploads/wedka8.jpg' },
    { id: 9,  nazwa: 'Wędka Jigowa', opis: 'Specjalnie wyważona do łowienia metoda jigową. Superczuła szczytówka.', cena: 320.00, prom: 290.00, zakup: 160.00, ilosc: 7, kat: 1, img: '/uploads/wedka9.jpg' },
    { id: 10, nazwa: 'Wędka PodLodowa', opis: 'Króciutka wędka do zimowego łowienia spod lodu.', cena: 45.99, prom: null, zakup: 15.00, ilosc: 40, kat: 1, img: '/uploads/wedka10.jpg' },


    { id: 11, nazwa: 'Haczyki Karpiowe nr 4', opis: 'Solidne haczyki z oczkiem i mikrokadziorem. 10 sztuk.', cena: 14.99, prom: 9.99, zakup: 5.00, ilosc: 50, kat: 2, img: '/uploads/haczyk1.jpg' },
    { id: 12, nazwa: 'Haczyki na Okonia nr 10', opis: 'Cienki drut, idealne do delikatnych przynęt, z łopatką.', cena: 9.99, prom: null, zakup: 3.00, ilosc: 100, kat: 2, img: '/uploads/haczyk2.jpg' },
    { id: 13, nazwa: 'Kotwice Spinningowe roz. 6', opis: 'Bardzo ostre, trzyramienne kotwiczki do woblerów.', cena: 19.99, prom: null, zakup: 7.00, ilosc: 40, kat: 2, img: '/uploads/haczyk3.jpg' },
    { id: 14, nazwa: 'Haczyki Bezzadziorowe', opis: 'Wymagane na niektórych łowiskach komercyjnych. Przyjazne rybom.', cena: 15.99, prom: 11.99, zakup: 6.00, ilosc: 80, kat: 2, img: '/uploads/haczyk4.jpg' },
    { id: 15, nazwa: 'Haczyki Sumowe 8/0', opis: 'Ogromne pancerne haki na wąsiatych drapieżników.', cena: 24.99, prom: null, zakup: 10.00, ilosc: 20, kat: 2, img: '/uploads/haczyk5.jpg' },
    { id: 16, nazwa: 'Haczyki Z Przyponem (Leszcz)', opis: 'Gotowe wiązane haczyki z przyponami 0.14mm. 10 sztuk.', cena: 18.99, prom: null, zakup: 8.00, ilosc: 35, kat: 2, img: '/uploads/haczyk6.jpg' },
    { id: 17, nazwa: 'Haczyki Offsetowe 3/0', opis: 'Idealne do zbrojenia gum bez zaczepów w zarośniętych miejscach.', cena: 17.50, prom: null, zakup: 7.00, ilosc: 45, kat: 2, img: '/uploads/haczyk7.jpg' },
    { id: 18, nazwa: 'Mikro Haczyki Wyczynowe nr 20', opis: 'Ultracienkie, do łowienia z ochotką i pinką.', cena: 22.00, prom: null, zakup: 9.00, ilosc: 30, kat: 2, img: '/uploads/haczyk8.jpg' },
    { id: 19, nazwa: 'Główki Jigowe 10g 4/0', opis: 'Ołowiane główki z wtopionym mocnym hakiem. Zestaw 3 szt.', cena: 12.50, prom: 9.99, zakup: 4.50, ilosc: 70, kat: 2, img: '/uploads/haczyk9.jpg' },
    { id: 20, nazwa: 'Haczyki Muchowe Nymph', opis: 'Zagięte, doważane. Gotowe na wiązanie imitacji nimf.', cena: 21.99, prom: null, zakup: 8.50, ilosc: 25, kat: 2, img: '/uploads/haczyk10.jpg' },

    { id: 21, nazwa: 'Wobler Szczupakowy 12cm', opis: 'Pływający wobler, duża amplituda ruchu, schodzi do 2m.', cena: 34.99, prom: 29.99, zakup: 12.00, ilosc: 30, kat: 3, img: '/uploads/przyneta1.jpg' },
    { id: 22, nazwa: 'Guma Kopyto 7cm', opis: 'Miękka przynęta silikonowa z intensywną pracą ogonka.', cena: 4.50, prom: null, zakup: 1.50, ilosc: 200, kat: 3, img: '/uploads/przyneta2.jpg' },
    { id: 23, nazwa: 'Blacha Wahadłówka Morska', opis: 'Ciężka błystka z tłoczonym wzorem łuski.', cena: 16.99, prom: null, zakup: 6.00, ilosc: 45, kat: 3, img: '/uploads/przyneta3.jpg' },
    { id: 24, nazwa: 'Błystka Obrotowa nr 3', opis: 'Błystka z czerwoną chwościkiem. Klasyk na okonie.', cena: 11.50, prom: null, zakup: 4.00, ilosc: 60, kat: 3, img: '/uploads/przyneta4.jpg' },
    { id: 25, nazwa: 'Kulki Proteinowe Truskawka 1kg', opis: 'Słodki i intensywny zapach, sprawdzone od lat na karpiach.', cena: 49.99, prom: null, zakup: 20.00, ilosc: 25, kat: 3, img: '/uploads/przyneta5.jpg' },
    { id: 26, nazwa: 'Pellel Halibut 14mm 1kg', opis: 'Tłusty pellet z dziurą, powoli rozpuszcza się w wodzie.', cena: 39.99, prom: 34.99, zakup: 15.00, ilosc: 35, kat: 3, img: '/uploads/przyneta6.jpg' },
    { id: 27, nazwa: 'Sztuczna Kukurydza Pływająca', opis: 'Zestaw 20 plastikowych, pływających ziaren pop-up.', cena: 9.99, prom: null, zakup: 2.00, ilosc: 50, kat: 3, img: '/uploads/przyneta7.jpg' },
    { id: 28, nazwa: 'Mucha Sucha - Jętka', opis: 'Precyzyjna imitacja dorosłego owada. Nie tonie.', cena: 8.50, prom: 6.50, zakup: 3.00, ilosc: 40, kat: 3, img: '/uploads/przyneta8.jpg' },
    { id: 29, nazwa: 'Pilker Dorszowy 150g', opis: 'Ciężki pilker na morskie połowy głębinowe.', cena: 24.00, prom: null, zakup: 10.00, ilosc: 20, kat: 3, img: '/uploads/przyneta9.jpg' },
    { id: 30, nazwa: 'Zanęta Płoć Ciemna 2kg', opis: 'Typowa sypka mieszanka z ziołową nutą. Dobrze smuży.', cena: 14.99, prom: null, zakup: 7.00, ilosc: 80, kat: 3, img: '/uploads/przyneta10.jpg' },


    { id: 31, nazwa: 'Kołowrotek Karpiowy Big Pit 8000', opis: 'Pojemna szpula, ultra wolna oscylacja. System nawijania rzutowego.', cena: 450.00, prom: 399.00, zakup: 220.00, ilosc: 6, kat: 4, img: '/uploads/kolowrotek1.jpg' },
    { id: 32, nazwa: 'Kołowrotek Spinningowy 2500', opis: 'Lekki i szybki (przełożenie 6.2:1), przedni precyzyjny hamulec.', cena: 219.00, prom: 189.00, zakup: 100.00, ilosc: 12, kat: 4, img: '/uploads/kolowrotek2.jpg' },
    { id: 33, nazwa: 'Kołowrotek z Wolnym Biegiem', opis: 'Umożliwia branie bez oporu hamulca. Niezastąpiony do gruntówek.', cena: 180.00, prom: null, zakup: 85.00, ilosc: 8, kat: 4, img: '/uploads/kolowrotek3.jpg' },
    { id: 34, nazwa: 'Multiplikator Niskoprofilowy', opis: 'Do castingowych zestawów na szczupaki, super precyzyjne łożyska.', cena: 390.00, prom: null, zakup: 180.00, ilosc: 4, kat: 4, img: '/uploads/kolowrotek4.jpg' },
    { id: 35, nazwa: 'Kołowrotek Muchowy #5/6', opis: 'Szeroka szpula Large Arbor, łożysko oporowe i super lekka obudowa.', cena: 299.99, prom: 240.00, zakup: 140.00, ilosc: 5, kat: 4, img: '/uploads/kolowrotek5.jpg' },
    { id: 36, nazwa: 'Kołowrotek Ultra Light 1000', opis: 'Idealny do okoniowych wykałaczek i dłubania paprochami.', cena: 129.99, prom: null, zakup: 60.00, ilosc: 15, kat: 4, img: '/uploads/kolowrotek6.jpg' },
    { id: 37, nazwa: 'Kołowrotek Morski Saltwater', opis: 'Zabezpieczony przed słoną wodą, grube przekładnie, 20kg hamulca.', cena: 850.00, prom: null, zakup: 400.00, ilosc: 3, kat: 4, img: '/uploads/kolowrotek7.jpg' },
    { id: 38, nazwa: 'Korbka Zapasowa ALU', opis: 'Uniwersalna wykręcana korba aluminiowa z antypoślizgowym knobem.', cena: 45.00, prom: null, zakup: 15.00, ilosc: 20, kat: 4, img: '/uploads/kolowrotek8.jpg' },
    { id: 39, nazwa: 'Kołowrotek Feeder 4000', opis: 'Szersza szpula do rzutów na 100 metrów z ciężkim koszyczkiem.', cena: 260.00, prom: null, zakup: 130.00, ilosc: 7, kat: 4, img: '/uploads/kolowrotek9.jpg' },
    { id: 40, nazwa: 'Kołowrotek Matchowy', opis: 'Szybkie przełożenie pozwala zwijać żyłkę błyskawicznie po rzucie.', cena: 210.00, prom: 190.00, zakup: 100.00, ilosc: 9, kat: 4, img: '/uploads/kolowrotek10.jpg' },

 
    { id: 41, nazwa: 'Żyłka Karpiowa Camou 0.35mm 600m', opis: 'Zlewająca się z dnem, bardzo trwała żyłka. Wytrzymałość do 18kg.', cena: 65.00, prom: 49.99, zakup: 25.00, ilosc: 20, kat: 5, img: '/uploads/zylka1.jpg' },
    { id: 42, nazwa: 'Plecionka X8 Żółta 0.12mm 150m', opis: '8-splotowa plecionka ułatwiająca wzrokowe czytanie brań opadu.', cena: 85.99, prom: 69.99, zakup: 35.00, ilosc: 40, kat: 5, img: '/uploads/zylka2.jpg' },
    { id: 43, nazwa: 'Fluorocarbon Przyponowy 0.20mm 50m', opis: 'Niewidoczny pod wodą, idealny do metody i finezyjnego spinningu.', cena: 45.00, prom: null, zakup: 18.00, ilosc: 50, kat: 5, img: '/uploads/zylka3.jpg' },
    { id: 44, nazwa: 'Żyłka Matchowa Tonąca 0.16mm 150m', opis: 'Szybko przebija błonę powierzchniową żeby uniknąć wpływu wiatru.', cena: 29.99, prom: null, zakup: 12.00, ilosc: 30, kat: 5, img: '/uploads/zylka4.jpg' },
    { id: 45, nazwa: 'Plecionka Sumowa 0.50mm 300m', opis: 'Linka holownicza, którą można by zatrzymać ciężarówkę.', cena: 150.00, prom: null, zakup: 70.00, ilosc: 10, kat: 5, img: '/uploads/zylka5.jpg' },
    { id: 46, nazwa: 'Podkład Muchowy (Backing) 100yds', opis: 'Zabezpieczający dół szpuli w multiplikatorach i muchówkach.', cena: 35.00, prom: null, zakup: 15.00, ilosc: 15, kat: 5, img: '/uploads/zylka6.jpg' },
    { id: 47, nazwa: 'Przypon Tytanowy na Szczupaka 15kg', opis: 'Zestaw 2 plecionych, elastycznych przyponów odpornych na ostre zęby.', cena: 19.99, prom: null, zakup: 8.00, ilosc: 40, kat: 5, img: '/uploads/zylka7.jpg' },
    { id: 48, nazwa: 'Żyłka Zimowa Anti-Ice 0.10mm 50m', opis: 'Żyłka nie zamarzająca, doskonała do łowienia spod lodu.', cena: 14.50, prom: null, zakup: 6.00, ilosc: 25, kat: 5, img: '/uploads/zylka8.jpg' },
    { id: 49, nazwa: 'Szok Lider Konny 15m (3 szt.)', opis: 'Pogrubiająca się żyłka na końcówkę zestawu dystansowego.', cena: 45.00, prom: null, zakup: 18.00, ilosc: 30, kat: 5, img: '/uploads/zylka9.jpg' },
    { id: 50, nazwa: 'Plecionka Przyponowa Miękka 20lbs', opis: 'Bezwęzłowa linka do przyponów do kulek.', cena: 55.00, prom: 49.00, zakup: 22.00, ilosc: 30, kat: 5, img: '/uploads/zylka10.jpg' },


    { id: 51, nazwa: 'Zestaw Pływaków Waggler 5 szt.\u200B', opis: 'Spławiki dociążone, świetne do węglówek i odległości.', cena: 24.99, prom: null, zakup: 10.00, ilosc: 25, kat: 6, img: '/uploads/splawik1.jpg' },
    { id: 52, nazwa: 'Spławik Przelotowy Ołówek 4g', opis: 'Czuły na najdrobniejsze skubnięcia, klasyczny długi ołówek.', cena: 5.50, prom: null, zakup: 2.00, ilosc: 100, kat: 6, img: '/uploads/splawik2.jpg' },
    { id: 53, nazwa: 'Spławik Bombka na Wiatr 8g', opis: 'Kształt bombki czyni go odpornym na znoszenie.', cena: 6.00, prom: 4.50, zakup: 2.50, ilosc: 80, kat: 6, img: '/uploads/splawik3.jpg' },
    { id: 54, nazwa: 'Spławik Podświetlany LED', opis: 'Wymienna bateria trzyma 20 godzin – na nocne żerowania łososiowatych.', cena: 18.00, prom: null, zakup: 8.00, ilosc: 40, kat: 6, img: '/uploads/splawik4.jpg' },
    { id: 55, nazwa: 'Świetliki Chemiczne (10 paczek)', opis: 'Łamiące się patyczki emitujące zielone poświaty. Montowane na antenę.', cena: 15.00, prom: null, zakup: 6.00, ilosc: 60, kat: 6, img: '/uploads/splawik5.jpg' },
    { id: 56, nazwa: 'Marker Karpiowy Z Float', opis: 'Spławik do sondowania z wymiennymi skrzydełkami.', cena: 29.00, prom: 24.00, zakup: 12.00, ilosc: 20, kat: 6, img: '/uploads/splawik6.jpg' },
    { id: 57, nazwa: 'Spławik Żywcowy 30g', opis: 'Gruby bojowy spławik zapobiega utopieniu przez własnego żywca.', cena: 9.99, prom: 7.99, zakup: 4.00, ilosc: 50, kat: 6, img: '/uploads/splawik7.jpg' },
    { id: 58, nazwa: 'Spławik Rzeczny Cralusso 10g', opis: 'Unikalny płaski kształt stopujący zestaw w nurcie rzeki.', cena: 35.00, prom: null, zakup: 15.00, ilosc: 15, kat: 6, img: '/uploads/splawik8.jpg' },
    { id: 59, nazwa: 'Mikro Spławiki Kanałowe 1g', opis: 'Króciutkie precyzyjne bombeczki do dłubania tuż przy brzegu na ukleje.', cena: 4.00, prom: null, zakup: 1.50, ilosc: 120, kat: 6, img: '/uploads/splawik9.jpg' },
    { id: 60, nazwa: 'Spławik Kula Wodna Przezroczysta', opis: 'Napełniana wodą, do powierzchniowego łowienia kleni.', cena: 8.50, prom: null, zakup: 3.50, ilosc: 40, kat: 6, img: '/uploads/splawik10.jpg' },


    { id: 61, nazwa: 'Podbierak Karpiowy 42 Cale', opis: 'Ogromny trójkątny podbierak w który można zawinąć łódź. Gruby teleskop.', cena: 129.00, prom: null, zakup: 60.00, ilosc: 10, kat: 7, img: '/uploads/akcesoria1.jpg' },
    { id: 62, nazwa: 'Krzesełko Wędkarskie Z Oparciem', opis: 'Wygodne, składane szybko, wyposażone w podłokietniki.', cena: 89.00, prom: 70.00, zakup: 40.00, ilosc: 15, kat: 7, img: '/uploads/akcesoria2.jpg' },
    { id: 63, nazwa: 'Namiot Bivvy 2-Osobowy Dwuwarstwowy', opis: 'Dom nad wodę z wejściem odpornym na komary. Wytrzymuje wielkie deszcze.', cena: 1200.00, prom: 999.00, zakup: 600.00, ilosc: 3, kat: 7, img: '/uploads/akcesoria3.jpg' },
    { id: 64, nazwa: 'Skrzynka Siedzisko Wyczynowa', opis: 'Platforma kombajn z szufladkami, podnóżkiem i trzymaczami.', cena: 1950.00, prom: 1800.00, zakup: 1000.00, ilosc: 2, kat: 7, img: '/uploads/akcesoria4.jpg' },
    { id: 65, nazwa: 'Mata Karpiowa Typu Kołyska', opis: 'Stelaż utrzymujący rybę nad ziemią chroniąc jej śluz, z wylewką wody.', cena: 249.00, prom: null, zakup: 120.00, ilosc: 8, kat: 7, img: '/uploads/akcesoria5.jpg' },
    { id: 66, nazwa: 'Uchwyt Na Wędkę (Podpórka INOX)', opis: 'Długi gwintowany sztyc bankstick ze stali nierdzewnej, nie do gięcia.', cena: 45.00, prom: null, zakup: 20.00, ilosc: 40, kat: 7, img: '/uploads/akcesoria6.jpg' },
    { id: 67, nazwa: 'Waga Cyfrowa do 50kg Haczykiem', opis: 'Precyzyjna centalna kalibracja tarowaniem, oświetlenie nocne wyświetlacza.', cena: 59.99, prom: null, zakup: 25.00, ilosc: 25, kat: 7, img: '/uploads/akcesoria7.jpg' },
    { id: 68, nazwa: 'Pudełko Skrzyneczka Dwustronne Lures', opis: 'Organizer z przezroczystymi klapkami, komory V do woblerów.', cena: 39.00, prom: null, zakup: 16.00, ilosc: 35, kat: 7, img: '/uploads/akcesoria8.jpg' },
    { id: 69, nazwa: 'Sygnalizatory Brań Elektryczne Zestaw 3+1', opis: 'Głośne, bezprzewodowa centralka zasięgu do 150m. Czujniki antysabotażowe.', cena: 349.00, prom: null, zakup: 160.00, ilosc: 6, kat: 7, img: '/uploads/akcesoria9.jpg' },
    { id: 70, nazwa: 'Czołówka 800L z czerwoną diodą', opis: 'Czerwone światło nie płoszy ryb po oświetleniu wody.', cena: 99.00, prom: 85.00, zakup: 43.00, ilosc: 20, kat: 7, img: '/uploads/akcesoria10.jpg' },

  
    { id: 71, nazwa: 'Kurtka Przeciwdeszczowa Gore-Tex L', opis: 'Ekstremalna ochrona wędkarska na łódź po oceanie', cena: 850.00, prom: null, zakup: 400.00, ilosc: 5, kat: 8, img: '/uploads/odziez1.jpg' },
    { id: 72, nazwa: 'Spodniobuty Wodery Z Neoprenu r. 43', opis: 'Idealne grube do zimnej wody pstrągowej, ciepłe skarpety.', cena: 320.00, prom: null, zakup: 165.00, ilosc: 7, kat: 8, img: '/uploads/odziez2.jpg' },
    { id: 73, nazwa: 'Czapka Z Daszkiem Morocamo', opis: 'Klasyczna truckerka z logotypem i oddychającą siatką na karku.', cena: 45.00, prom: null, zakup: 20.00, ilosc: 30, kat: 8, img: '/uploads/odziez3.jpg' },
    { id: 74, nazwa: 'Bielizna Termoaktywna Set', opis: 'Kalesony plus koszula techniczna jako pierwsza warstwa zima - wiosna.', cena: 140.00, prom: null, zakup: 65.00, ilosc: 12, kat: 8, img: '/uploads/odziez4.jpg' },
    { id: 75, nazwa: 'Rękawiczki Odkryte Palce', opis: 'Służące do podbierania szczupaka unikając przecięć o skrzela po plecionce.', cena: 85.00, prom: 69.00, zakup: 38.00, ilosc: 25, kat: 8, img: '/uploads/odziez5.jpg' },
    { id: 76, nazwa: 'Kamizelka Spiningowa Krótka', opis: 'Mnogosć 15 kieszeni aby zawsze puszki i blach wieszać na klatę rzecznym brzegowaniem', cena: 195.00, prom: 175.00, zakup: 88.00, ilosc: 10, kat: 8, img: '/uploads/odziez6.jpg' },
    { id: 77, nazwa: 'Komin / Chusta Buff UV', opis: 'Chroni twarz i szyje w upalne dni od zmasowanego opalenia fal odbijając je.', cena: 39.00, prom: null, zakup: 15.00, ilosc: 40, kat: 8, img: '/uploads/odziez7.jpg' },
    { id: 78, nazwa: 'Skarpety Z Wełny Merynos', opis: 'Grzejniki stóp nie nabierają potu - must have dla podlodu.', cena: 55.00, prom: null, zakup: 23.00, ilosc: 22, kat: 8, img: '/uploads/odziez8.jpg' },
    { id: 79, nazwa: 'Spodnie Trekkingowe Wzmocnione M', opis: 'Na kolanach kewlar, szwy niepuszuszczalne wody rosa-trawa', cena: 240.00, prom: null, zakup: 110.00, ilosc: 8, kat: 8, img: '/uploads/odziez9.jpg' },
    { id: 80, nazwa: 'Okulary Polaryzacyjne Bursztynowe', opis: 'Ucinają refleks powierzchniowy - widać każde zatopione drzewo, a płyciej rybę przed braniem.', cena: 175.00, prom: 150.00, zakup: 75.00, ilosc: 16, kat: 8, img: '/uploads/odziez10.jpg' },
  ]

  for (const p of produkty) {
    await prisma.przedmioty.upsert({
      where: { id_przedmiotu: p.id },
      update: {},
      create: {
        id_przedmiotu:  p.id,
        nazwa:          p.nazwa,
        opis:           p.opis,
        cena_sprzedazy: p.cena,
        cena_prom:      p.prom,
        cena_zakupu:    p.zakup,
        ilosc:          p.ilosc,
        id_kategorii:   p.kat,
        zdjecie_url:    p.img,
      },
    })
  }
  console.log(`Produkty: ${produkty.length} wstawionych`)


  await Promise.all([
    prisma.rola.upsert({ where: { id_roli: 1 }, update: {}, create: { id_roli: 1, nazwa: 'Klient' } }),
    prisma.rola.upsert({ where: { id_roli: 2 }, update: {}, create: { id_roli: 2, nazwa: 'Sprzedawca' } }),
    prisma.rola.upsert({ where: { id_roli: 3 }, update: {}, create: { id_roli: 3, nazwa: 'Administrator' } }),
  ])
  console.log('Role: Klient, Sprzedawca, Administrator')


  const uzytkownicy = [
    { id: 1, nazwa: 'GoscNiezalogowany', imie: 'Gość',      nazwisko: 'Anonimowy',  email: 'gosc@sklep.pl',       rola: 1 },
    { id: 2, nazwa: 'KlientTest',        imie: 'Jan',        nazwisko: 'Kowalski',   email: 'klient@sklep.pl',     rola: 1 },
    { id: 3, nazwa: 'SprzedawcaMirek',   imie: 'Mirosław',   nazwisko: 'Sprzedawca', email: 'sprzedawca@sklep.pl', rola: 2 },
    { id: 4, nazwa: 'AdminSzef',         imie: 'Adam',       nazwisko: 'Szef',       email: 'admin@sklep.pl',      rola: 3 },
  ]
  for (const u of uzytkownicy) {
    await prisma.uzytkownik.upsert({
      where: { id_uzytkownika: u.id },
      update: { haslo: hashedPassword },
      create: { id_uzytkownika: u.id, nazwa: u.nazwa, imie: u.imie, nazwisko: u.nazwisko, email: u.email, haslo: hashedPassword, id_roli: u.rola },
    })
  }
  console.log(`Użytkownicy: ${uzytkownicy.length} wstawionych`)


  await prisma.koszyk.upsert({
    where: { id_przedmiotu_id_uzytkownika: { id_przedmiotu: 1, id_uzytkownika: 2 } },
    update: {},
    create: { id_przedmiotu: 1, id_uzytkownika: 2, ilosc: 1 },
  })
  console.log('Koszyk: przykładowy wpis')

  console.log('\nSeed zakończony pomyślnie')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

# Dokument Wymagań - Format Wprowadzania Czasu

## Wprowadzenie

Ta funkcjonalność rozszerza StagePrompt o bardziej intuicyjny sposób wprowadzania czasów oraz możliwość określenia całkowitego czasu trwania utworu. Zamiast wymagać od użytkownika przeliczania minut na sekundy (np. 74 sekundy), system pozwoli na wprowadzanie czasu w formacie MM:SS (np. "1:14"). Dodatkowo, użytkownik będzie mógł określić kiedy utwór się kończy, co jest kluczowe dla prawidłowego działania telepromptera.

## Słownik

- **MM:SS Format**: Format czasu w postaci minuty:sekundy (np. "1:14" oznacza 1 minutę i 14 sekund = 74 sekundy)
- **Duration**: Całkowity czas trwania utworu w sekundach
- **TimeInput**: Pole tekstowe do wprowadzania czasu
- **System**: Aplikacja StagePrompt
- **Song**: Utwór muzyczny
- **LyricLine**: Pojedyncza linijka tekstu piosenki z przypisanym czasem

## Wymagania

### Wymaganie 1

**User Story:** Jako użytkownik, chcę wprowadzać czas w formacie MM:SS, aby nie musieć przeliczać minut na sekundy w głowie.

#### Kryteria Akceptacji

1. WHEN użytkownik wpisuje czas w formacie MM:SS (np. "1:14") THEN System SHALL przekonwertować go na sekundy (74) i zapisać jako timeSeconds
2. WHEN użytkownik wpisuje czas w formacie tylko sekund (np. "74") THEN System SHALL zaakceptować go jako poprawny czas
3. WHEN użytkownik wpisuje czas z pojedynczą cyfrą minuty lub sekundy (np. "1:5") THEN System SHALL zinterpretować go jako 1 minutę i 5 sekund (65 sekund)
4. WHEN użytkownik wpisuje niepoprawny format (np. "1:5:30", "abc", "1:") THEN System SHALL wyświetlić komunikat błędu i nie zapisać wartości
5. WHEN pole czasu wyświetla zapisaną wartość THEN System SHALL pokazać ją w formacie MM:SS jeśli czas >= 60 sekund, w przeciwnym razie w sekundach

### Wymaganie 2

**User Story:** Jako użytkownik, chcę określić całkowity czas trwania utworu, aby teleprompter wiedział kiedy utwór się kończy.

#### Kryteria Akceptacji

1. WHEN użytkownik edytuje utwór THEN System SHALL wyświetlić pole "Duration" do wprowadzenia czasu trwania utworu
2. WHEN użytkownik wprowadza czas trwania w formacie MM:SS lub sekundach THEN System SHALL zapisać wartość jako durationSeconds w modelu Song
3. WHEN użytkownik nie wprowadza czasu trwania THEN System SHALL pozostawić pole durationSeconds jako undefined
4. WHEN użytkownik wprowadza czas trwania krótszy niż czas ostatniej linijki THEN System SHALL wyświetlić ostrzeżenie ale pozwolić na zapisanie
5. WHEN teleprompter osiągnie czas równy durationSeconds THEN System SHALL zatrzymać przewijanie i pozostać na ostatniej pozycji

### Wymaganie 3

**User Story:** Jako użytkownik, chcę aby konwersja między formatami była automatyczna i bezstratna, aby nie tracić precyzji czasów.

#### Kryteria Akceptacji

1. WHEN System konwertuje MM:SS na sekundy THEN System SHALL zachować precyzję do części dziesiętnych sekundy
2. WHEN System wyświetla sekundy jako MM:SS THEN System SHALL zaokrąglić do najbliższej sekundy dla czytelności
3. WHEN użytkownik wprowadza "1:30.5" THEN System SHALL zaakceptować format z częściami dziesiętnymi i zapisać jako 90.5 sekund
4. WHEN użytkownik przełącza się między polami THEN System SHALL zachować wprowadzone wartości bez utraty danych

### Wymaganie 4

**User Story:** Jako użytkownik, chcę aby walidacja czasu była pomocna i jasna, aby szybko poprawić błędy.

#### Kryteria Akceptacji

1. WHEN użytkownik wprowadza niepoprawny format THEN System SHALL wyświetlić komunikat opisujący poprawny format (MM:SS lub sekundy)
2. WHEN użytkownik wprowadza ujemny czas THEN System SHALL odrzucić wartość i wyświetlić komunikat błędu
3. WHEN użytkownik wprowadza czas z minutami > 59 (np. "75:30") THEN System SHALL zaakceptować wartość jako poprawną (75 minut i 30 sekund)
4. WHEN użytkownik wprowadza czas z sekundami > 59 (np. "1:75") THEN System SHALL zaakceptować wartość jako poprawną (1 minuta i 75 sekund = 2:15)
5. WHEN pole czasu traci focus z niepoprawną wartością THEN System SHALL przywrócić ostatnią poprawną wartość

### Wymaganie 5

**User Story:** Jako użytkownik, chcę aby istniejące utwory działały bez zmian, aby nie stracić moich danych.

#### Kryteria Akceptacji

1. WHEN System ładuje utwór z timeSeconds zapisanym jako liczba THEN System SHALL wyświetlić go w odpowiednim formacie bez utraty danych
2. WHEN System ładuje utwór bez pola durationSeconds THEN System SHALL działać normalnie z durationSeconds jako undefined
3. WHEN System zapisuje utwór THEN System SHALL zachować kompatybilność z poprzednim formatem danych
4. WHEN użytkownik importuje stare dane THEN System SHALL poprawnie zinterpretować wszystkie czasy jako sekundy
5. WHEN użytkownik eksportuje dane THEN System SHALL zapisać czasy jako sekundy dla kompatybilności wstecznej

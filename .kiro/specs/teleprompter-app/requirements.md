# Dokument Wymagań - StagePrompt

## Wprowadzenie

StagePrompt to cross-platform aplikacja teleprompter zbudowana w React Native + TypeScript, zaprojektowana z myślą o dwóch środowiskach użytkowania:

1. **Komputer (Web/Desktop)** - środowisko do wygodnej pracy nad utworami: edycja tekstów, ręczne ustawianie timingów, organizacja setlist na dużym ekranie z klawiaturą i myszą
2. **Tablet/Telefon (Android/iOS)** - środowisko do występów: wyświetlanie tekstów z płynnym przewijaniem zsynchronizowanym z czasem, sterowanie kontrolerem Bluetooth

Workflow zakłada, że użytkownik przygotowuje materiały na komputerze, eksportuje je do pliku JSON, a następnie importuje na urządzeniu mobilnym używanym podczas występów. Aplikacja zapewnia pełną kompatybilność danych między platformami oraz zachowuje wszystkie funkcjonalności w obu środowiskach.

## Słownik

- **Teleprompter**: System wyświetlający tekst, który automatycznie przewija się w kontrolowany sposób
- **LyricLine**: Pojedyncza linijka tekstu piosenki z przypisanym czasem wyświetlenia
- **Song**: Utwór muzyczny zawierający tytuł, artystę i listę linijek z timingami
- **Setlist**: Lista utworów w określonej kolejności do wykonania podczas występu
- **AnchorY**: Punkt odniesienia na ekranie (np. 40% wysokości), przez który przechodzą linijki tekstu
- **Kontroler Zewnętrzny**: Zewnętrzne urządzenie Bluetooth (pilot lub footswitch) działające jak klawiatura
- **ScrollY**: Pozycja przewijania widoku w pikselach
- **KeyCode**: Kod klawisza z urządzenia wejściowego
- **System**: Aplikacja StagePrompt

## Requirements

### Wymaganie 1

**User Story:** Jako użytkownik, chcę przeglądać listę moich setlist jako główny widok aplikacji, aby szybko zarządzać moimi występami.

#### Kryteria Akceptacji

1. WHEN użytkownik otwiera aplikację THEN System SHALL wyświetlić listę wszystkich zapisanych setlist z ich nazwami i liczbą utworów
2. WHEN użytkownik dotyka setlisty na liście THEN System SHALL przejść do ekranu edytora setlisty
3. WHEN użytkownik dotyka przycisku "Nowa Setlista" THEN System SHALL utworzyć nową pustą setlistę i przejść do edytora
4. WHEN lista setlist jest pusta THEN System SHALL wyświetlić komunikat zachęcający do utworzenia pierwszej setlisty
5. WHEN użytkownik dotyka przycisku dostępu do utworów THEN System SHALL otworzyć panel z listą wszystkich utworów

### Wymaganie 2

**User Story:** Jako użytkownik, chcę przeglądać i zarządzać moimi utworami w osobnym panelu, aby móc je edytować lub dodawać do setlist.

#### Kryteria Akceptacji

1. WHEN użytkownik otwiera panel utworów THEN System SHALL wyświetlić listę wszystkich zapisanych utworów z ich tytułami i wykonawcami
2. WHEN użytkownik dotyka utworu w panelu THEN System SHALL przejść do ekranu edytora dla tego utworu
3. WHEN użytkownik dotyka przycisku "Nowy Utwór" THEN System SHALL utworzyć nowy pusty utwór i przejść do edytora
4. WHEN lista utworów jest pusta THEN System SHALL wyświetlić komunikat zachęcający do utworzenia pierwszego utworu
5. WHEN użytkownik usuwa utwór THEN System SHALL usunąć utwór i usunąć jego ID ze wszystkich setlist które go zawierały

### Wymaganie 3

**User Story:** Jako użytkownik, chcę zarządzać setlistami z panelem utworów obok, aby łatwo dodawać utwory przez przeciąganie.

#### Kryteria Akceptacji

1. WHEN użytkownik otwiera edytor setlisty THEN System SHALL wyświetlić nazwę setlisty, listę utworów w setliście oraz panel z wszystkimi dostępnymi utworami
2. WHEN użytkownik przeciąga utwór z panelu utworów do setlisty THEN System SHALL dodać ID utworu do setlisty w miejscu upuszczenia
3. WHEN użytkownik zmienia kolejność utworów w setliście przez przeciąganie THEN System SHALL zaktualizować tablicę songIds aby odzwierciedlić nową kolejność
4. WHEN użytkownik usuwa utwór z setlisty THEN System SHALL usunąć ID tego utworu z setlisty bez usuwania samego utworu
5. WHEN użytkownik usuwa setlistę THEN System SHALL usunąć setlistę bez wpływu na utwory które zawierała
6. WHEN użytkownik dotyka utworu w panelu utworów THEN System SHALL przejść do edytora tego utworu

### Wymaganie 4

**User Story:** Jako użytkownik, chcę edytować tekst utworu i przypisywać czasy do linijek, aby przygotować utwór do wyświetlenia w teleprompterze.

#### Kryteria Akceptacji

1. WHEN użytkownik wchodzi do edytora utworu THEN System SHALL wyświetlić tytuł utworu, pole wykonawcy i listę linijek tekstu
2. WHEN użytkownik modyfikuje tytuł utworu lub wykonawcę THEN System SHALL zaktualizować dane utworu natychmiast
3. WHEN użytkownik dodaje nową linijkę tekstu THEN System SHALL utworzyć nowy LyricLine z unikalnym ID i domyślną wartością czasu
4. WHEN użytkownik usuwa linijkę tekstu THEN System SHALL usunąć tę linijkę z utworu i zaktualizować wyświetlanie
5. WHEN użytkownik ręcznie wprowadza wartość czasu dla linijki THEN System SHALL zwalidować i zapisać wartość timeSeconds dla tego LyricLine
6. WHEN użytkownik dotyka przycisku dodania linijki między istniejącymi linijkami THEN System SHALL wstawić nową linijkę w wybranym miejscu
7. WHEN użytkownik przeciąga linijkę do innej pozycji THEN System SHALL zaktualizować kolejność linijek w utworze

### Wymaganie 5

**User Story:** Jako performer, chcę wyświetlać tekst w trybie telepromptera z płynnym przewijaniem, aby czytać tekst podczas występu.

#### Kryteria Akceptacji

1. WHEN użytkownik wchodzi w tryb promptera dla utworu THEN System SHALL wyświetlić tekst na pełnym ekranie z dużą czcionką na ciemnym tle
2. WHEN timer promptera jest uruchomiony THEN System SHALL obliczyć docelową pozycję przewijania na podstawie aktualnego czasu i timingów linijek
3. WHEN pozycja przewijania się zmienia THEN System SHALL animować przewijanie płynnie do docelowej pozycji w ciągu 50-100 milisekund
4. WHEN aktualny czas jest przed czasem pierwszej linijki THEN System SHALL ustawić pierwszą linijkę w punkcie odniesienia
5. WHEN aktualny czas jest po czasie ostatniej linijki THEN System SHALL ustawić ostatnią linijkę w punkcie odniesienia
6. WHEN aktualny czas jest między dwiema linijkami THEN System SHALL interpolować pozycję przewijania liniowo między tymi linijkami na podstawie ułamka czasu

### Wymaganie 6

**User Story:** Jako performer, chcę kontrolować odtwarzanie w trybie promptera, aby zarządzać przebiegiem występu.

#### Kryteria Akceptacji

1. WHEN użytkownik dotyka przycisku pauzy w trybie promptera THEN System SHALL zatrzymać timer i zamrozić pozycję przewijania
2. WHEN użytkownik dotyka przycisku odtwarzania podczas pauzy THEN System SHALL wznowić timer od aktualnej pozycji
3. WHEN użytkownik dotyka przycisku następnego utworu THEN System SHALL załadować następny utwór z setlisty i zresetować timer do zera
4. WHEN użytkownik dotyka przycisku poprzedniego utworu THEN System SHALL załadować poprzedni utwór z setlisty i zresetować timer do zera
5. WHEN użytkownik jest na ostatnim utworze i dotyka następny THEN System SHALL pozostać na ostatnim utworze lub wyjść z trybu promptera

### Wymaganie 7

**User Story:** Jako performer, chcę sterować aplikacją za pomocą zewnętrznego kontrolera Bluetooth, aby zmieniać utwory bez dotykania ekranu.

#### Kryteria Akceptacji

1. WHEN Kontroler Zewnętrzny wysyła zdarzenie klawisza THEN System SHALL przechwycić keyCode z urządzenia Bluetooth
2. WHEN zmapowany klawisz jest naciśnięty THEN System SHALL wykonać odpowiednią akcję (następny utwór, poprzedni utwór lub pauza)
3. WHEN niezmapowany klawisz jest naciśnięty THEN System SHALL zignorować zdarzenie klawisza bez wpływu na stan aplikacji
4. WHEN Kontroler Zewnętrzny się rozłącza THEN System SHALL kontynuować działanie ze sterowaniem dotykowym
5. WHEN wiele zdarzeń klawiszy przychodzi szybko THEN System SHALL zastosować debounce do zdarzeń aby zapobiec niezamierzonym wielokrotnym akcjom

### Wymaganie 8

**User Story:** Jako użytkownik, chcę konfigurować mapowanie klawiszy z pilota, aby dostosować sterowanie do mojego kontrolera.

#### Kryteria Akceptacji

1. WHEN użytkownik wchodzi w tryb mapowania klawiszy dla akcji THEN System SHALL wyświetlić komunikat aby nacisnąć żądany klawisz na kontrolerze
2. WHEN klawisz jest naciśnięty podczas trybu mapowania THEN System SHALL przechwycić keyCode i powiązać go z wybraną akcją
3. WHEN użytkownik zapisuje mapowania klawiszy THEN System SHALL zapisać konfigurację do storage
4. WHEN użytkownik czyści mapowanie klawisza THEN System SHALL usunąć powiązanie między tym keyCode a akcją
5. WHEN aplikacja się uruchamia THEN System SHALL załadować zapisane mapowania klawiszy z storage

### Wymaganie 9

**User Story:** Jako użytkownik, chcę dostosować wygląd telepromptera, aby dopasować go do moich preferencji i warunków oświetleniowych.

#### Kryteria Akceptacji

1. WHEN użytkownik zmienia ustawienie rozmiaru czcionki THEN System SHALL zaktualizować rozmiar tekstu w trybie promptera natychmiast
2. WHEN użytkownik zmienia ustawienie pozycji punktu odniesienia THEN System SHALL dostosować obliczanie anchorY do nowego procentu
3. WHEN użytkownik zmienia kolor tekstu lub kolor tła THEN System SHALL zastosować nowe kolory w trybie promptera
4. WHEN użytkownik zmienia ustawienia marginesów THEN System SHALL dostosować poziomy padding wyświetlania tekstu
5. WHEN ustawienia są modyfikowane THEN System SHALL zapisać zmiany do storage

### Wymaganie 10

**User Story:** Jako użytkownik, chcę przechowywać moje utwory i setlisty lokalnie, aby mieć do nich dostęp offline.

#### Kryteria Akceptacji

1. WHEN użytkownik tworzy lub modyfikuje utwór THEN System SHALL zapisać dane utworu do AsyncStorage natychmiast
2. WHEN użytkownik tworzy lub modyfikuje setlistę THEN System SHALL zapisać dane setlisty do AsyncStorage natychmiast
3. WHEN aplikacja się uruchamia THEN System SHALL załadować wszystkie utwory i setlisty z AsyncStorage
4. WHEN operacje storage zawodzą THEN System SHALL wyświetlić komunikat błędu i utrzymać aktualny stan w pamięci
5. WHEN użytkownik usuwa utwór lub setlistę THEN System SHALL usunąć odpowiednie dane z AsyncStorage

### Wymaganie 11

**User Story:** Jako developer, chcę testować aplikację na komputerze, aby przyspieszyć proces developmentu bez potrzeby używania urządzenia fizycznego.

#### Kryteria Akceptacji

1. WHEN aplikacja działa w Expo Go lub trybie web THEN System SHALL renderować wszystkie komponenty UI poprawnie
2. WHEN aplikacja działa na web lub desktop THEN System SHALL symulować zdarzenia dotykowe kliknięciami myszy
3. WHEN aplikacja działa na web lub desktop THEN System SHALL obsługiwać zdarzenia klawiatury jako zamienniki dla wejścia z Kontrolera Zewnętrznego
4. WHEN funkcje Bluetooth są niedostępne na platformie THEN System SHALL wyłączyć funkcje kontrolera w sposób elegancki i wyświetlić odpowiednie komunikaty
5. WHEN aplikacja działa na różnych platformach THEN System SHALL utrzymywać spójne modele danych i logikę biznesową

### Wymaganie 12

**User Story:** Jako użytkownik, chcę eksportować i importować moje dane, aby tworzyć kopie zapasowe lub przenosić dane między urządzeniami.

#### Kryteria Akceptacji

1. WHEN użytkownik uruchamia eksport THEN System SHALL serializować wszystkie utwory i setlisty do pliku JSON
2. WHEN użytkownik wybiera plik JSON do importu THEN System SHALL zwalidować strukturę pliku przed importem
3. WHEN dane importu są poprawne THEN System SHALL scalić lub zastąpić istniejące dane na podstawie preferencji użytkownika
4. WHEN dane importu są niepoprawne THEN System SHALL wyświetlić komunikat błędu i zachować istniejące dane
5. WHEN eksport się kończy THEN System SHALL zapewnić opcje udostępnienia pliku przez email lub zapisania do zewnętrznego storage

### Wymaganie 13

**User Story:** Jako użytkownik, chcę pracować nad utworami na komputerze i eksportować je do aplikacji mobilnej, aby wygodnie edytować na dużym ekranie i używać na tablecie podczas występów.

#### Kryteria Akceptacji

1. WHEN aplikacja działa na komputerze THEN System SHALL zapewnić pełną funkcjonalność edycji utworów i setlist
2. WHEN użytkownik pracuje na komputerze THEN System SHALL umożliwić wygodną edycję z użyciem klawiatury i myszy
3. WHEN użytkownik kończy pracę na komputerze THEN System SHALL umożliwić eksport danych do pliku
4. WHEN użytkownik importuje dane na urządzeniu mobilnym THEN System SHALL zachować wszystkie utwory, setlisty i timings
5. WHEN aplikacja działa na różnych platformach THEN System SHALL zachować pełną kompatybilność danych i funkcjonalności

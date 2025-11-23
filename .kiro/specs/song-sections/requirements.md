# Dokument Wymagań - Sekcje Utworów (Song Sections)

## Wprowadzenie

Funkcjonalność sekcji utworów pozwala użytkownikom oznaczać różne części piosenki (zwrotki, refren, bridge, intro, outro) w edytorze utworu. Te oznaczenia są następnie wyświetlane w prompterze, pomagając wykonawcy zorientować się w strukturze utworu podczas występu.

## Słownik

- **Section (Sekcja)**: Oznaczenie części utworu (np. Verse, Chorus, Bridge)
- **Section Marker (Znacznik Sekcji)**: Wizualne oznaczenie początku sekcji w edytorze i prompterze
- **Section Type (Typ Sekcji)**: Rodzaj sekcji - Verse (Zwrotka), Chorus (Refren), Bridge (Most), Intro (Wstęp), Outro (Zakończenie)
- **LyricLine**: Linijka tekstu piosenki, która może mieć przypisaną sekcję
- **System**: Aplikacja StagePrompt

## Wymagania

### Wymaganie 1

**User Story:** Jako użytkownik, chcę oznaczać sekcje utworu w edytorze, aby widzieć strukturę piosenki podczas edycji i występu.

#### Kryteria Akceptacji

1. WHEN użytkownik edytuje utwór THEN System SHALL wyświetlić opcję dodania znacznika sekcji dla każdej linijki tekstu
2. WHEN użytkownik dodaje znacznik sekcji THEN System SHALL umożliwić wybór typu sekcji z predefiniowanej listy
3. WHEN użytkownik wybiera typ sekcji THEN System SHALL zapisać typ sekcji wraz z opcjonalną etykietą dla tej linijki
4. WHEN użytkownik usuwa znacznik sekcji THEN System SHALL usunąć informację o sekcji z tej linijki
5. WHEN użytkownik zapisuje utwór THEN System SHALL zachować wszystkie znaczniki sekcji w danych utworu

### Wymaganie 2

**User Story:** Jako użytkownik, chcę widzieć oznaczenia sekcji w edytorze, aby łatwo zrozumieć strukturę utworu podczas edycji.

#### Kryteria Akceptacji

1. WHEN linijka ma przypisaną sekcję THEN System SHALL wyświetlić znacznik sekcji nad lub obok tej linijki w edytorze
2. WHEN znacznik sekcji jest wyświetlany THEN System SHALL użyć różnych kolorów dla różnych typów sekcji
3. WHEN użytkownik klika na znacznik sekcji THEN System SHALL umożliwić edycję lub usunięcie sekcji
4. WHEN wiele linijek należy do tej samej sekcji THEN System SHALL wyświetlić znacznik tylko przy pierwszej linijce sekcji
5. WHEN użytkownik przewija listę linijek THEN System SHALL zachować widoczność znaczników sekcji

### Wymaganie 3

**User Story:** Jako performer, chcę widzieć oznaczenia sekcji w prompterze, aby łatwiej orientować się w strukturze utworu podczas występu.

#### Kryteria Akceptacji

1. WHEN prompter wyświetla tekst utworu THEN System SHALL pokazać znaczniki sekcji przed odpowiednimi linijkami
2. WHEN znacznik sekcji jest wyświetlany w prompterze THEN System SHALL użyć większej czcionki i wyraźnego koloru
3. WHEN sekcja ma niestandardową etykietę THEN System SHALL wyświetlić tę etykietę zamiast domyślnej nazwy typu
4. WHEN użytkownik przewija tekst w prompterze THEN System SHALL zachować widoczność znaczników sekcji
5. WHEN ustawienia wyglądu są zmienione THEN System SHALL zastosować te ustawienia również do znaczników sekcji

### Wymaganie 4

**User Story:** Jako użytkownik, chcę mieć predefiniowane typy sekcji, aby szybko oznaczać standardowe części utworów.

#### Kryteria Akceptacji

1. WHEN użytkownik wybiera typ sekcji THEN System SHALL oferować następujące opcje: Verse, Chorus, Bridge, Intro, Outro, Instrumental
2. WHEN użytkownik wybiera typ Verse THEN System SHALL automatycznie numerować zwrotki (Verse 1, Verse 2, etc.)
3. WHEN użytkownik wybiera typ Chorus THEN System SHALL używać etykiety "Chorus" lub "Refren"
4. WHEN użytkownik wybiera typ Bridge THEN System SHALL używać etykiety "Bridge" lub "Most"
5. WHEN użytkownik potrzebuje niestandardowej etykiety THEN System SHALL umożliwić wprowadzenie własnego tekstu

### Wymaganie 5

**User Story:** Jako użytkownik, chcę kopiować sekcje między utworami, aby przyspieszyć proces tworzenia podobnych utworów.

#### Kryteria Akceptacji

1. WHEN użytkownik eksportuje utwór THEN System SHALL zachować wszystkie informacje o sekcjach w pliku JSON
2. WHEN użytkownik importuje utwór THEN System SHALL odtworzyć wszystkie znaczniki sekcji
3. WHEN użytkownik kopiuje linijki tekstu THEN System SHALL zachować informacje o sekcjach
4. WHEN użytkownik wkleja linijki tekstu THEN System SHALL zastosować skopiowane znaczniki sekcji
5. WHEN dane sekcji są niepoprawne podczas importu THEN System SHALL zignorować błędne sekcje i zachować poprawne dane

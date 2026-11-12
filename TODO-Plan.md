# TODO-Plan: Code-Qualität & Architektur

Erstellt nach Code-Review (Mai 2026). Skizzenmodus — keine fertigen Ausarbeitungsschritte.

**Status (Stand 17.05.2026):** Punkte 1 und 2 inkl. großem Architektur-Aufräumen erledigt. Punkte 3–8 noch offen.

---

## Priorität: Hoch

### ~~1. Audio-Bug: `async init()` ohne `await`~~ ✅ Erledigt (Mai 2026)

~~**Problem:** `playNote`, `playChord`, `playArpeggio`, `playFeedback` rufen `this.init()` ohne `await` auf. Beim ersten Aufruf ist `synth` noch `null`, Audio schlägt silent fehl.~~

**Umgesetzt:** `initPromise`-Cache eingeführt, alle Play-Methoden auf `async/await` umgestellt.

---

### ~~2. Gehörbildung: Alte Architektur ablösen~~ ✅ Erledigt (Mai 2026)

~~**Problem:** Das `ear-training`-Modul in `Home.tsx` fällt auf den alten `Config → Play → Results`-Flow durch.~~

**Umgesetzt:**
- `EarTrainingModule.tsx` neu angelegt (Startseite mit Auswahl: Intervalle / Dreiklänge)
- `EarTrainingQuiz.tsx` als generische Quiz-Komponente (Mode-Prop: `intervals` | `triads`)
- Zufällige Wurzeltöne (MIDI C3–C6), Arpeggio für Intervalle, Akkord für Dreiklänge
- Enharmonische Gleichheit bei Intervallen akzeptiert (Übermäßige Quarte ≡ Verminderte Quinte)
- Route `/ear-training` in `App.tsx` ergänzt, `Home.tsx` leitet direkt dorthin
- `amber`-Akzentfarbe zu `QuizSetup` und `QuizResults` hinzugefügt (passend zum Ear-Icon)

**Architektur-Aufräumen direkt anschließend erledigt:**
- Alte Dateien gelöscht: `contexts/GameContext.tsx`, `pages/Config.tsx`, `pages/Play.tsx`, `pages/Results.tsx`, `components/game/GameEngine.tsx`
- `App.tsx`: `GameProvider`-Wrapping und alte Routen (`/config`, `/play`, `/results`) entfernt
- `Header.tsx`: `useGame`-Bindung entfernt (zeigte ohnehin nichts mehr an)
- `Home.tsx`: datengetriebene Navigation (`path` direkt in Modul-Definition statt if-Chain)
- `types/index.ts` aufgeräumt: ungenutzte Typen (`GameSettings`, `GameState`, `GameResult`, `Module`, `Feedback`, `FeedbackType`, `PianoKey`, `Interval`, `Triad`) entfernt

---

## Priorität: Mittel

### 3. Doppelte Datenhaltung in `music.ts` bereinigen

**Problem:** `INTERVALS` und `QUIZ_INTERVALS` enthalten fast identische Einträge. `PracticeChallenge.rough` ist ein fest kodiertes Ordinalzahl-Feld, das aus `semitones` oder dem Intervallnamen ableitbar wäre.

**Lösungsskizze:**
- Eine einzige kanonische Intervall-Definition anlegen (mit `semitones`, `label`, `abbrev`, `rough`)
- `QUIZ_INTERVALS` und `PRACTICE_CHALLENGES` daraus ableiten (filtern/mappen)
- `rough` entweder rausschmeißen und per Lookup berechnen, oder als echtes Datum in der Masterliste führen

---

### 4. `generateOptions` für Noten clef-aware machen

**Problem:** Zufällige Ablenkoptionen für Noten werden mit `getRandomInt(2, 6)` generiert, unabhängig vom Schlüssel. Optionen können Noten enthalten, die im aktuellen Schlüssel nie als Fragen auftauchen — also offensichtlich falsch sind.

**Lösungsskizze:**
- `generateOptions` den `clef`-Parameter und `useAccidentals`-Flag mitgeben
- Optionen aus derselben Noten-Kombinations-Liste ziehen, die auch `generateNoteQuestion` benutzt (`validCombinations`)
- So sind Optionen immer plausibel im richtigen Bereich

---

## Priorität: Niedrig

### 5. `package.json`: Build-Tools in `devDependencies`

**Problem:** `autoprefixer`, `postcss`, `tailwindcss` stehen in `dependencies` — werden im Produktions-Bundle nicht gebraucht.

**Lösungsskizze:**
- Die drei Pakete nach `devDependencies` verschieben
- `npm install` neu ausführen, Build testen

---

### 6. Duplizierter Code in Modul-Seiten extrahieren

**Problem:** `IntervalModule.tsx`, `TriadsModule.tsx` und `EarTrainingModule.tsx` haben identischen Audio-Unlock-`useEffect`. `startPlaying` und `restart` in `useQuizTimer` sind identische Funktionen.

**Lösungsskizze:**
- Audio-Unlock in eigenen Hook `useAudioUnlock()` extrahieren
- `restart` in `useQuizTimer` entweder entfernen (Alias auf `startPlaying`) oder zusammenführen

---

### 7. Tests ausbauen

**Problem:** Tests prüfen nur Struktur (`toHaveProperty`), kaum Verhalten. Viele Funktionen sind gar nicht getestet.

**Lösungsskizze:**
- Fehlende Tests: `buildTriadKeys`, `buildIntervalKeys`, `toGermanNote`, `checkAnswer` (inkl. enharmonische Gleichheit), `generateIntervalBuildQuestion`
- Bestehende Range-Tests (Oktaven) auf ≥50 Iterationen erhöhen
- `checkAnswer` mit Enharmonik-Fällen testen (z.B. `Fb4` == `E4`)
- Tests für die neue `EarTrainingQuiz` und ihre Frage-Generatoren ergänzen

---

### 8. Kleinere Inkonsistenzen

**Problem:** Mehrere kleine Ungereimtheiten, die kein Blocking-Issue sind.

**Lösungsskizze:**
- [TriadsModule.tsx:53] Subtitle für Quiz- vs. Übungsmodus unterscheiden (copy-paste)
- Einheitliche Kommentarsprache (Deutsch oder Englisch, nicht gemischt)
- `React.FC<Props>` vs. plain function declaration vereinheitlichen (empfohlen: ohne FC)
- [NotationDisplay.tsx:23] Hintergrundfarbe `"#eed"` auf `"#ffffff"` oder `"transparent"` ändern, damit kein Creme-Kontrast zum weißen Container entsteht

---

## Zusätzlich erledigt (außerhalb der 8 Punkte)

- **`tsconfig.json`** (Mai 2026): `baseUrl` und ungenutztes `paths`-Mapping (`@/*`-Alias) entfernt. Der Alias war nirgendwo im Code in Gebrauch und auch in `vite.config.js` nicht konfiguriert. `baseUrl` ist in TypeScript 7.0 ohnehin nicht mehr verfügbar.

---

## Nicht in dieser Liste (bewusst zurückgestellt)

- `generateIntervalQuestion` ist auf C4 als Wurzelnote fixiert — das ist aktuell gewollt (einfaches Intervall-Erkennen), aber langfristig wäre ein variables Root wie bei Dreiklängen wünschenswert. Anmerkung: Die neue `EarTrainingQuiz` nutzt für Intervalle bereits zufällige Wurzeltöne, also nur das klassische Intervall-Quiz (mit Notation) ist hiervon betroffen.

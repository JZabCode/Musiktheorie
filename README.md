# Musiktheorie-Lernen

Eine Web-App zum Üben der Grundlagen der Musiktheorie für den Musikunterricht. Sie läuft komplett im Browser: keine Anmeldung, kein Backend, es werden keine Daten gespeichert.

## Was die App kann

Sieben Module:

- **Notenlesen** – Noten im Violin- oder Bassschlüssel benennen
- **Töne auf der Klaviatur** – die passende Taste zu einer Note finden
- **Intervalle** – Intervalle auf der Klaviatur erkennen und im Notenbild bilden
- **Tonleitern** – Dur- und Moll-Tonleitern im Notensystem bilden
- **Dreiklänge** – Dur, Moll, vermindert und übermäßig bestimmen und bilden
- **Gehörbildung** – Intervalle und Dreiklänge nach Gehör bestimmen
- **Quintenzirkel** – Erklärungen und interaktiver Zirkel (Übungen in Vorbereitung)

Die Übungsmodule gibt es jeweils als **Anleitung**, als **Übungsmodus** (ohne Zeitdruck, mit Hilfen) und als **Quiz** (auf Zeit).

## Lokal entwickeln

Voraussetzung: Node.js 20.19 oder neuer.

Einmalig zur Einrichtung:

```bash
npm install
```

Entwicklungsserver starten (die Adresse steht danach im Terminal, in der Regel `http://localhost:5173`):

```bash
npm run dev
```

## Bauen

```bash
npm run build
```

Die fertige Seite liegt danach im Ordner `dist/`. Dieser Ordner wird nicht ins Repository eingecheckt.

## Weitere Befehle

| Befehl | Was er macht |
|---|---|
| `npm run preview` | Die gebaute Version lokal ansehen |
| `npm test` | Tests einmalig ausführen |
| `npm run lint` | Code auf Stilfehler prüfen |

## Veröffentlichung

Das Repository enthält den Quellcode. Der Stand, in dem es nur den gebauten `dist`-Ordner enthielt, ist unter dem Tag `archiv-dist-only` abrufbar.

## Verwendete Technik

- **React + TypeScript** (Oberfläche)
- **Vite** (Build-Werkzeug)
- **Tailwind CSS** (Gestaltung)
- **Tone.js** (Klangausgabe)
- **VexFlow** (Notendarstellung)

## Aufbau des Codes

```
src/
├── pages/         – eine Seite je Modul (z. B. IntervalModule.tsx)
├── components/    – Bausteine der Oberfläche, nach Modul gruppiert
├── lib/           – Musiklogik (music.ts, scales.ts, circleOfFifths.ts) und Klang (audio.ts)
├── hooks/         – wiederverwendbare React-Logik (z. B. useQuizTimer)
└── types/         – TypeScript-Typdefinitionen
```

Offene Aufgaben stehen in [`TODO-Plan.md`](./TODO-Plan.md).

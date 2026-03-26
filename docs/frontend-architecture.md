# Frontend-Architektur

## Ziel

Das Frontend ist in drei Bereiche geschnitten:

- `app`: App-Hülle
- `features`: fachliche Features
- `shared`: fachneutrale Bausteine

Das ist absichtlich so. Routing, Layout und globale Provider liegen nicht mehr irgendwo zwischen Komponenten. Fachlogik liegt nicht mehr in globalen Ordnern wie `pages`, `context`, `ui` oder `api`.

## Struktur

```text
frontend/src
├── app
│   ├── i18n
│   ├── layouts
│   ├── navigation
│   ├── providers
│   └── router
├── features
│   ├── auth
│   │   ├── api
│   │   ├── model
│   │   ├── pages
│   │   └── ui
│   ├── discovery
│   ├── goals
│   ├── library
│   ├── reading-session
│   ├── search
│   └── stats
└── shared
    ├── api
    ├── lib
    ├── theme
    └── ui
```

## Was wohin gehört

### `app`

Hier liegt nur App-Infrastruktur:

- Router
- Route Guards
- globale Provider
- Navigation
- Layouts
- i18n-Bootstrap

`app` enthält keine Fachlogik für Bücher, Discovery, Goals oder Stats.

### `features`

Jedes Feature besitzt seinen Code selbst.

Typische interne Struktur:

- `api`: Requests zum Backend
- `model`: Hooks, Contexts, Zustand, Use-Case-Logik
- `ui`: Feature-spezifische Komponenten
- `pages`: routbare Seiten des Features

Beispiel:

- `library` enthält Bibliothek und buchbezogene Detailseiten
- `reading-session` enthält Session-State, Session-UI und Session-Seite
- `stats` enthält Overview und Achievements

### `shared`

Hier liegt nur Code, der nicht einem Feature gehört.

Das sind:

- generische UI-Bausteine
- generische Helper
- Theme/Tokens
- generischer API-Client

Wenn etwas nur für ein Feature da ist, gehört es nicht nach `shared`.

## Regeln

1. `app` darf Features zusammensetzen, aber nicht deren Fachlogik übernehmen.
2. Ein Feature importiert keine UI aus einem anderen Feature.
3. Gemeinsamer Code kommt nur dann nach `shared`, wenn er wirklich fachneutral ist.
4. Neue Seiten liegen im passenden Feature unter `pages`, nicht in einem globalen `pages`-Ordner.
5. Contexts liegen beim owning Feature oder in `app/providers`, nicht global in `src/context`.

## Warum diese Architektur

- Fachlich zusammengehöriger Code liegt zusammen.
- App-Infrastruktur ist von Feature-Code getrennt.
- Gemeinsame Bausteine sind klar von fachlichem Code getrennt.
- Neue Features lassen sich hinzufügen, ohne wieder globale Sammelordner aufzubauen.
- Cross-Feature-Abhängigkeiten fallen schneller auf.

## Was bewusst entfernt wurde

Diese globalen Sammelordner sind kein Zielbild mehr:

- `src/pages`
- `src/context`
- `src/ui`
- `src/layouts`
- `src/api`
- `src/utils`

Wenn so ein globaler Ordner wieder entsteht, ist das meistens ein Zeichen, dass Verantwortungen erneut vermischt werden.

## Grenzen

Diese Architektur ist gut, aber nicht magisch.

Sie kippt, wenn:

- ein Feature zu groß wird und intern nicht weiter geschnitten wird
- `shared` zum Müllcontainer wird
- `app` anfängt, Feature-Logik zu enthalten
- Features wieder direkt Komponenten aus anderen Features importieren

Dann ist die Lösung nicht, alles wieder horizontal zu sortieren. Dann muss das betroffene Feature sauberer geschnitten werden.

## Praktische Default-Regel

Bei neuem Frontend-Code:

- Route, Layout, Guard, globaler Provider: `app`
- Fachlicher Hook, Feature-Context, Feature-Seite: passendes `feature`
- generischer Button, Card, API-Client, Helper, Theme: `shared`

Wenn die Zuordnung unklar ist, ist das meist schon ein Hinweis, dass die Verantwortung der Klasse oder Datei noch nicht scharf genug ist.

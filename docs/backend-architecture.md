# Backend-Architektur

## Ziel

Das Backend ist nach Features organisiert.

Innerhalb jedes Features gibt es lokale Schichten:

- `api`
- `application`
- `domain`
- `infra`

Das ist absichtlich so. Fachlich zusammengehöriger Code bleibt zusammen. Es gibt keine globale Struktur wie `controller/service/repository` für die ganze App.

## Struktur

```text
com.example.readflow
├── auth
├── books
├── discovery
├── sessions
├── stats
└── shared
```

Jedes Feature sieht im Normalfall so aus:

```text
feature/
├── api
├── application
├── domain
└── infra
```

## Was wohin gehört

### `api`

Hier liegt alles HTTP-nahe:

- Controller
- Request-/Response-DTOs
- API-Mapping

### `application`

Hier liegt die Use-Case-Steuerung:

- Services
- Orchestrierung
- Transaktionsgrenzen

`application` steuert Abläufe. Es ist nicht der Ort für jede Fachregel.

### `domain`

Hier liegt die Fachlichkeit:

- Entitäten
- Enums
- fachliche Regeln
- fachliche Policies
- fachliche Konzepte und Ports

`domain` beschreibt, wie das Feature fachlich funktioniert.

### `infra`

Hier liegt die Technik:

- Repositories
- externe Clients
- Cache- oder Event-Anbindung
- technische Adapter

### `shared`

Hier liegt nur echter Querschnitt:

- Security
- Config
- Exceptions
- Time

`shared` ist kein Ablageort für Feature-Code.

## Regeln

1. Code gehört zuerst in das fachlich passende Feature.
2. Controller liegen nur in `api`.
3. Use-Case-Logik liegt in `application`.
4. Fachregeln liegen in `domain`.
5. Repositories und technische Adapter liegen in `infra`.
6. Feature-spezifischer Code gehört nicht nach `shared`.
7. Wenn ein Feature wächst, wird zuerst das Feature sauberer geschnitten, nicht die ganze App horizontal umgebaut.

## Warum diese Architektur

- Fachlich zusammengehöriger Code liegt zusammen.
- Große Features können intern wachsen, ohne die ganze Struktur kaputt zu machen.
- Die Rollen im Code sind klar: HTTP, Use Case, Fachlichkeit, Technik.
- Neue Features lassen sich nach demselben Muster anlegen.

## Grenzen

Die Struktur ist gut, aber nicht automatisch sauber.

Sie kippt, wenn:

- `application` zu einem Sammelbecken aus riesigen Services wird
- `shared` zum Müllcontainer wird
- ein Feature zu viele verschiedene Themen gleichzeitig enthält
- fachliche Regeln wieder in Controller oder technische Klassen rutschen

Dann ist die Lösung nicht `controller/service/repository` für die ganze App.
Dann muss das betroffene Feature besser geschnitten werden.

## Praktische Default-Regel

Bei neuer Backend-Logik:

- HTTP und DTOs: `api`
- Use Cases und Ablaufsteuerung: `application`
- Fachregeln und Modell: `domain`
- Datenbank und externe Systeme: `infra`
- echter Querschnitt: `shared`

Wenn die Zuordnung unklar ist, ist meistens die Verantwortung der Klasse noch nicht scharf genug.

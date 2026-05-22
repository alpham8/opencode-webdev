---
name: tech-colleague-de
description: Use when writing any German technical text — PR descriptions, README files, architecture docs, technical emails, bug reports, Slack messages, or documentation. Triggers on requests for technical writing in German or when the audience is developers, architects, or technical stakeholders.
---

# Technischer Kollegen-Schreibstil (Deutsch)

## Stimme und Haltung

Schreibe wie ein erfahrener Senior-Entwickler, der seinen Kollegen etwas erklärt — direkt, klar, ohne Aufwärmphase. Der Leser ist technisch versiert. Zeit verschwenden ist unhöflich.

- Kein akademisches Deutsch
- Kein Marketingsprech
- Kein Passiv, wenn Aktiv funktioniert
- Substantivierungen auflösen: „implementieren" statt „eine Implementierung vornehmen"

## Satzrhythmus

**Variiere Länge aktiv.** Kurze Sätze für Kernaussagen. Längere Sätze wenn Kontext, Einschränkungen oder Abhängigkeiten erklärt werden müssen. Nie alle Sätze gleich lang.

```
❌ Der Service verarbeitet die Anfragen. Er prüft die Authentifizierung.
   Er leitet dann weiter. Das geschieht asynchron.

✅ Der Service prüft die Authentifizierung und leitet asynchron weiter.
   Timeout ist 5 Sekunden.
```

## Verbotene Muster

| Verboten | Stattdessen |
|---|---|
| Em-Gedankenstrich (— oder --) | Komma, Punkt oder neuer Satz |
| „Es ist zu beachten, dass…" | Das direkt sagen |
| „Außerdem", „Darüber hinaus", „Nicht zuletzt" als Satzanfang | Umstrukturieren oder weglassen |
| „könnte möglicherweise" | Eines von beiden |
| „Es versteht sich von selbst…" | Weglassen |
| Aufzählungen ohne Verben | Vollständige Sätze mit Aussage |
| Passiv als Höflichkeitsform | „Wir empfehlen" statt „Es wird empfohlen" |
| „state-of-the-art", „Game Changer" | Konkreter Nutzen in Deutsch |

## Struktur je nach Format

**PR-Beschreibung:** Was ändert sich (1 Satz). Warum (1–2 Sätze). Was der Reviewer prüfen soll.

**README:** Problem → Lösung → Installation → Beispiel. Kein blumiger Einstieg.

**Bug-Report:** Verhalten ist. Verhalten soll. Reproduzierbar mit. Umgebung.

**Technische E-Mail:** Kernaussage im ersten Satz. Details dahinter. Konkrete Frage oder Aktion am Schluss.

## Zahlen und Fakten

Konkret statt vage:

```
❌ Die Performance wurde deutlich verbessert.
✅ Response Time von 340 ms auf 80 ms, gemessen unter Standardlast.
```

## Ton nach Zielgruppe

- **Intern (Kollegen):** „wir", direkt, gerne knapp
- **Kunde (technisch):** „Sie", sachlich, keine internen Abkürzungen
- **Kunde (nicht-technisch):** Auswirkung erklären, nicht Implementierung

## Selbst-Check vor Abgabe

- [ ] Kein em-Gedankenstrich im gesamten Text
- [ ] Kein Satz beginnt mit „Außerdem", „Darüber hinaus", „Zudem", „Nicht zuletzt"
- [ ] Keine zwei aufeinanderfolgenden Sätze gleicher Länge
- [ ] Jede Aufzählung hat vollständige Sätze mit Verb
- [ ] Zahlen belegen alle Aussagen über Performance, Umfang oder Verbesserung

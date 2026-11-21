# Helfer für Voraussetzungen in Moodle

Der Helfer prüft Deinen Entwurf direkt im Moodle-Editor unter **Voraussetzungen**. Du siehst, welche Kombinationen den Zugang ermöglichen können und welche Regeln sich widersprechen oder wiederholen.

[English](README.md)

## Installation

Das Plugin setzt Moodle 4.5, 5.0, 5.1, 5.2 oder 5.3 mit der für die jeweilige Moodle-Version erforderlichen PHP-Version voraus. Voraussetzungen müssen in Moodle aktiviert sein.

Installiere das ZIP unter **Website-Administration → Plugins → Plugins installieren**. Bei einer manuellen Installation legst Du das Plugin unter `local/availabilityhelper` ab und schließt die Installation unter **Website-Administration → Mitteilungen** ab.

## Voraussetzungen im Editor prüfen

Bearbeite eine Aktivität oder einen Kursabschnitt, klappe **Voraussetzungen** auf und wähle **Helfer für Voraussetzungen öffnen**.

- **Analyse** aktualisiert sich nach einer kurzen Eingabepause. Jeder Zugangsweg zeigt die Regeln, die gemeinsam erfüllt sein müssen. Im Aktivitätseditor berücksichtigt der Helfer auch die beim Öffnen gespeicherten Voraussetzungen des zugehörigen Abschnitts. Über die Regelverweise springst Du zur passenden Stelle. Die farbigen Symbole an den Regeln öffnen und schließen die Hinweise.
- **Teilnehmervorschau** prüft den Zugang zur gespeicherten Aktivität für ein aktiv eingeschriebenes Testkonto. Wähle ein Konto und prüfe den Zugang. Moodle meldet die Zugangsentscheidung und die Gründe, die es für eine Sperre kennt. Kursbearbeitende benötigen das Vorschaurecht, die Berechtigung zum Anzeigen der Teilnehmerliste und Zugriff auf alle Gruppen. Manager erhalten das Vorschaurecht standardmäßig.
- **Hilfe** erklärt die Analyse, die Vorschau und die verfügbaren Einstellungen. Die Info-Symbole öffnen das passende Thema.

Lege zum Ausprobieren eine Voraussetzung an, die den Abschluss einer Aktivität verlangt. Füge eine verschachtelte Regel hinzu, nach der dieselbe Aktivität offen bleiben muss. Sind beide Regeln Pflicht, zeigt der Helfer den Widerspruch und verlinkt beide Stellen. Du bearbeitest und speicherst die Regeln wie gewohnt in Moodle.

### Grenzen der Analyse

Der Helfer erkennt leere Gruppen, doppelte Bedingungen und bekannte Zusammenhänge, etwa zwischen Datumsgrenzen oder Abschlusszuständen derselben Aktivität. Unbekannte Bedingungen bleiben in der logischen Auswertung offen. Bei Erweiterungen wie Certificate Issued verwendet die Teilnehmervorschau die tatsächliche Zugangsentscheidung von Moodle. Wie konkret der Sperrgrund ausfällt, hängt von der Meldung der Erweiterung ab.

Die Szenarioübersicht zeigt angenommene Regelzustände und bei größeren Regelbäumen eine Auswahl von Fällen. Die Teilnehmervorschau prüft den Zugang zur Aktivität selbst. Funktionen innerhalb einer Aktivität können eigene Regeln haben.

## Optionale KI

KI ist standardmäßig ausgeschaltet. Die Website-Administration kann sie unter **Plugins → Lokale Plugins → Helfer für Voraussetzungen** einschalten. Moodle braucht dafür einen konfigurierten Anbieter zur Textgenerierung. Ab Moodle 5.0 lässt sich eine bestimmte Anbieterinstanz auswählen. In der automatischen Einstellung gilt Moodles Anbieterreihenfolge. Außerdem gelten die KI-Richtlinie und die Kontexteinstellungen von Moodle.

**Mit KI erklären** erläutert die angezeigten Zugangswege. Bei einem nachgewiesenen Widerspruch bietet **KI-Vorschläge anzeigen** mögliche Ziele an und verweist auf Regeln, die Du prüfen kannst. Entscheide im Editor, welche Anpassung zu Deinem Kurs passt.

## Datenverarbeitung

Die Regelanalyse läuft im Browser. Die Kontosuche und Teilnehmervorschau laufen innerhalb der Moodle-Installation. Das Plugin speichert keine Vorschauergebnisse und meldet Dich nicht als ausgewähltes Konto an.

Bei einem KI-Aufruf übergibt das Plugin Regeltypen, Positionen, Negationen und bekannte Konfliktpaare an Moodles KI-System. Für Vorschläge können symbolische Abschlusszustände hinzukommen. Namen von Kursen oder Aktivitäten, Aktivitäts-IDs, Daten aus der Teilnehmervorschau und weitere Regelwerte bleiben aus der Anfrage. Moodles KI-System verarbeitet das anfragende Konto und den Kontext und protokolliert Anfragen und Antworten.

## Lizenz

Für den Helfer gilt die [108design Availability Helper Software License](LICENSE.md), eine kommerzielle Lizenz mit einsehbarem Quellcode.

Diese Version ist unter der 108design Software License kostenlos erhältlich.

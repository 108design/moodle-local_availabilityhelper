<?php
// This file is part of Moodle - https://moodle.org/
// This file is part of a 108design source-available software product.
//
// Copyright (C) 2026 Andreas Giesen <andreas@108design.com>
//
// Use and modification are permitted only under the Software License included
// with this distribution. Redistribution and circumvention of Pro feature or
// licensing restrictions are prohibited. See LICENSE.md for the full terms.

/**
 * German language strings.
 *
 * @package    local_availabilityhelper
 * @copyright  2026 Andreas Giesen <andreas@108design.com>
 * @license    See LICENSE.md for the full terms.
 */

$string['analysisstale'] = 'Der Entwurf hat sich geändert. Aktualisiere die Analyse für die aktuellen Regeln.';
$string['duplicate'] = 'Diese Regel ist genauso eingestellt wie eine frühere Regel in derselben Gruppe. Für den Zugang reicht eine davon. Prüfe vor dem Entfernen die Einstellung am Augensymbol.';
$string['semanticredundant'] = 'Diese Regel ändert die Zugangsentscheidung der Gruppe nicht. Prüfe vor dem Entfernen die Einstellung am Augensymbol.';
$string['tipallcohorts'] = 'Bei ALLE muss eine Person jeder aufgeführten globalen Gruppe angehören. Wenn eine Gruppe genügen soll, verwendest du stattdessen EINE.';
$string['tipcomplex'] = 'Dieser Regelbaum ist komplex. Prüfe die Szenarioübersicht und teste ihn mit Personen in allen relevanten Zielrollen.';
$string['incomplete'] = 'Moodle meldet mindestens einen Eingabefehler. Prüfe die markierten Regeln. Die Auswertung wird fortgesetzt, sobald die Eingaben gültig sind.';
$string['invalidrule'] = 'Moodle meldet einen Eingabefehler in dieser Regel. Prüfe ihre Eingaben.';
$string['completionitem'] = 'Wähle die Aktivität aus, deren Abschluss zählen soll.';
$string['gradeitem'] = 'Wähle aus, welche Bewertung Moodle prüfen soll.';
$string['gradevalue'] = 'Trage für die aktivierten Bewertungsgrenzen Zahlen zwischen 0 und 100 ein.';
$string['grademinvalue'] = 'Trage für die Untergrenze eine Zahl zwischen 0 und 100 ein.';
$string['grademaxvalue'] = 'Trage für die Obergrenze eine Zahl zwischen 0 und 100 ein.';
$string['aiproviderrequired'] = 'Dafür brauchst du einen aktiven Moodle-KI-Anbieter mit Textgenerierung.';
$string['topic_explanation_setup'] = 'Die Website-Administration kann die KI-Funktion in den Plugin-Einstellungen freigeben. Moodle braucht dafür einen aktiven KI-Anbieter mit Textgenerierung. Ab Moodle 5.0 kannst du in den Plugin-Einstellungen eine bestimmte Anbieterinstanz für den Helfer auswählen. Standardmäßig gilt die Reihenfolge der Moodle-Anbieter.';
$string['aifailed'] = 'Moodle hat keine verwendbare KI-Antwort erhalten. Du kannst es erneut versuchen.';
$string['aipermission'] = 'Du hast hier keine Berechtigung, die Regelwirkung mit KI erklären zu lassen.';
$string['aipolicy'] = 'Stimme den KI-Nutzungsbedingungen von Moodle zu und startest du die Anfrage erneut.';
$string['aiadvicenote'] = 'Die KI leitet mögliche Ziele aus dem Konflikt ab. Du entscheidest, welches Ziel passt.';
$string['aiadjustcompletion'] = 'Setze bei {$a->change} denselben Abschlussstatus wie bei {$a->keep}, oder entferne die widersprechende Voraussetzung.';
$string['aiadjustdate'] = 'Behalte {$a->keep} bei und verschiebe die Grenze in {$a->change}, damit der Beginn vor dem Ende liegt.';
$string['aiadjustgrade'] = 'Wähle bei {$a->change} einen Bewertungsbereich, der sich mit {$a->keep} überschneidet.';
$string['aiadjustconflict'] = 'Behalte {$a->keep} bei. Passe {$a->change} so an, dass beide Voraussetzungen zusammen erfüllt sein können, oder entferne sie, wenn du sie für dieses Ziel nicht brauchst.';
$string['aireview'] = 'Prüfe nach einer Änderung den gesamten Regelbaum. Für ein konkretes Konto kannst du die gespeicherten Regeln in der Teilnehmervorschau prüfen.';
$string['aiproviderid_desc'] = 'Wähle eine Moodle-Anbieterinstanz mit aktivierter Textgenerierung. Bei einer festen Auswahl verwendet die Regelerklärung ausschließlich diese Instanz mit ihrem Modell und ihren Einstellungen. Für die automatische Auswahl gilt die Reihenfolge unter „KI-Anbieter“.';
$string['previewsearchshort'] = 'Gib mindestens zwei Zeichen des Namens ein.';
$string['previewsearchfailed'] = 'Die Suche konnte nicht geladen werden. Versuche es erneut.';
$string['previewrequestfailed'] = 'Die Vorschau konnte nicht geladen werden. Prüfe die Auswahl und versuche es erneut.';
$string['previewpermission'] = 'Dir fehlt die Berechtigung für die Teilnehmervorschau dieser Aktivität.';
$string['topic_analysis_body'] = 'Wähle „Helfer für Voraussetzungen öffnen“ neben „Voraussetzungen“. Die Analyse aktualisiert sich nach einer kurzen Eingabepause und zeigt Befunde und Zugangswege für deinen Entwurf. Bei Aktivitäten bezieht sie die beim Öffnen gespeicherten Regeln des direkten Abschnitts ein. Regelverweise führen zur betreffenden Regel. Abschnittsregeln öffnen sich in einem neuen Tab. Bei vielen Regeln kannst du einzelne Szenarien aufklappen.';
$string['topic_analysis_review'] = 'Bei einer neuen Voraussetzung erscheinen Hinweise zu fehlenden Eingaben, sobald du eine weitere Voraussetzung hinzufügst, speichern oder „Eingaben prüfen“ wählen. Die farbigen Symbole öffnen und schließen die Hinweise direkt an der jeweiligen Voraussetzung. Im Analyse-Reiter findest du alle Befunde zusammen.';
$string['topic_explanation_body'] = 'Bei einem nachgewiesenen Konflikt schlägt die KI mögliche Ziele vor. Zu jedem Ziel siehst du, welche Voraussetzung du prüfen und welche du beibehalten kannst. Über die Verweise kommst du direkt zur jeweiligen Voraussetzung. Die Änderungen nimmst du selbst im Editor vor. Moodle sendet Regeltypen, Positionen, erkannte Konflikte und bei Abschlussregeln den eingestellten Abschlussstatus an den konfigurierten KI-Anbieter. Namen, Kennungen der Aktivitäten und Teilnehmerdaten bleiben im Moodle-Kurs. Moodle protokolliert Anfrage und Antwort unter deinem Konto.';
$string['detail_explanation_help'] = 'Lass dich Zugangswege erklären oder mögliche Korrekturen für nachgewiesene Konflikte anzeigen.';
$string['topic_preview_body'] = 'Gib mindestens zwei Zeichen ein und wähle ein aktiv eingeschriebenes Konto aus den Vorschlägen. Klicke auf „Zugang prüfen“. Moodle berücksichtigt die Aktivität, ihren Abschnitt und die Rechte des Kontos. Wenn du eine Voraussetzung änderst, speicherst du sie vor der nächsten Prüfung. Über × im Suchfeld wechselst du das Testkonto.';
$string['detail_analysis_help'] = 'Die Analyse aktualisiert sich automatisch, wenn du die Voraussetzungen im Editor änderst.';
$string['updateguard_approval'] = 'Die Pakete oder der installierte Stand haben sich seit der Vorschau geändert. Prüfe den Vorgang erneut.';
$string['updateguard_busy'] = 'Eine andere Installation läuft. Versuche es nach deren Abschluss erneut.';
$string['updateguard_dependency'] = 'Eine benötigte Plugin-Version fehlt. Aktualisiere die Abhängigkeit gemeinsam mit diesem Plugin oder vorher.';
$string['updateguard_hint'] = 'Verwende ein freigegebenes Paket für die installierte Ausgabe. Du kannst den Vorgang erneut prüfen.';
$string['updateguard_installed'] = 'Der installierte Updateschutz ist unvollständig. Stelle die Dateien der zuletzt installierten freigegebenen Version wieder her.';
$string['updateguard_operation'] = 'Diese Kombination von Installationsaktionen wird nicht unterstützt. Starte einen einzelnen Updatevorgang erneut.';
$string['updateinfo_choice'] = 'Kontrolliere vor dem Fortfahren die Paketquelle und Moodles Prüfergebnisse. Mit „{$a}“ unten kannst du abbrechen.';

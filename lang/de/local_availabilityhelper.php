<?php
// This file is part of Moodle - http://moodle.org/

/**
 * German language strings.
 *
 * @package    local_availabilityhelper
 * @copyright  2026 Andreas Giesen
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

$string['pluginname'] = 'Verfügbarkeitsprüfung';
$string['analysenow'] = 'Regelwerk prüfen';
$string['analysisdetails'] = 'Ausführliche Regelanalyse';
$string['analysisok'] = 'Keine gesicherten logischen Probleme erkannt.';
$string['closeanalysis'] = 'Details schließen';
$string['conflictcause'] = 'Ursache: „{$a->left}“ und „{$a->right}“ können nicht gleichzeitig erfüllt sein.';
$string['coveragecause'] = 'Ursache: „{$a->left}“ und „{$a->right}“ decken zusammen jeden möglichen Fall ab.';
$string['showdetails'] = 'Details anzeigen';
$string['refreshanalysis'] = 'Analyse aktualisieren';
$string['problemheading'] = 'Logikproblem';
$string['warningheading'] = 'Warnung';
$string['duplicate'] = 'Diese Regel ist mit einer vorherigen Regel derselben Gruppe identisch und redundant.';
$string['emptygroup'] = 'Diese verschachtelte Regelgruppe ist leer und ungültig.';
$string['always'] = 'Diese Regelgruppe wird immer zutreffen.';
$string['never'] = 'Diese Regelgruppe kann nie zutreffen.';
$string['contradiction'] = 'Diese Gruppe verlangt gleichzeitig eine Regel und ihr logisches Gegenteil. Sie kann daher nie zutreffen.';
$string['tautology'] = 'Diese Gruppe akzeptiert eine Regel oder ihr logisches Gegenteil. Sie wird daher immer zutreffen.';
$string['redundantgroup'] = 'Diese nicht negierte Gruppe enthält nur eine Regel; die zusätzliche Verschachtelung verändert das Ergebnis nicht.';
$string['semanticcontradiction'] = 'Diese Bedingungen können nicht gleichzeitig zutreffen. Das Regelset kann daher nie zutreffen.';
$string['semanticredundant'] = 'Diese Bedingung folgt bereits aus einer anderen Bedingung derselben Gruppe und verändert das Ergebnis nicht.';
$string['semantictautology'] = 'Diese Bedingungen decken gemeinsam jeden möglichen Wert ab. Das Regelset wird daher immer zutreffen.';
$string['tipallcohorts'] = 'Bei ALLE muss eine Person jeder aufgeführten globalen Gruppe angehören. Wenn eine Gruppe genügen soll, verwenden Sie stattdessen EINE.';
$string['tipcomplex'] = 'Dieser Regelbaum ist komplex. Prüfen Sie die Szenarioübersicht und testen Sie ihn mit Personen in allen relevanten Zielrollen.';
$string['tipdoublenegation'] = 'Dieser Bereich enthält verschachtelte Negationen. Eine positiv formulierte Entsprechung ist häufig leichter zu pflegen.';
$string['tipheading'] = 'Nützliche Tipps';
$string['tipnegatedgroup'] = 'Hier wird ein vollständiges Regelset negiert. „NICHT ALLE“ bedeutet, dass mindestens eine enthaltene Regel falsch sein muss; „NICHT EINE“ bedeutet, dass alle enthaltenen Regeln falsch sein müssen.';
$string['tipsavailable'] = 'Zusätzliche Tipps sind verfügbar.';
$string['scenarioavailable'] = 'Verfügbar';
$string['scenariocase'] = 'Fall';
$string['scenariofiltered'] = 'Kombinationen, die bekannten Beziehungen zwischen Bedingungen widersprechen, werden nicht angezeigt.';
$string['scenarioheading'] = 'Szenarioübersicht';
$string['scenariolegend'] = 'Regeln';
$string['scenariono'] = 'Nein';
$string['scenarionote'] = 'Die Tabelle zeigt alle logisch möglichen Kombinationen der Regeln. Sie wertet die Regellogik aus, nicht aktuelle Nutzerdaten.';
$string['scenariorepresentative'] = 'Dieses Regelset besitzt sehr viele Kombinationen. Die Tabelle zeigt repräsentative Grenzfälle statt sämtlicher Möglichkeiten.';
$string['scenarioresult'] = 'Gesamtergebnis';
$string['scenariounavailable'] = 'Nicht verfügbar';
$string['scenarioyes'] = 'Ja';
$string['incomplete'] = 'Mindestens eine Bedingung ist unvollständig oder ungültig. Die Gesamtauswertung ist vorläufig.';
$string['provisional'] = 'Vorläufige Analyse';
$string['rulepath'] = 'Regel {$a}';
$string['privacy:metadata'] = 'Die Verfügbarkeitsprüfung speichert keine personenbezogenen Daten.';

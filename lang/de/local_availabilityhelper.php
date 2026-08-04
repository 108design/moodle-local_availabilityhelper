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
$string['analysisok'] = 'Keine sicheren logischen Probleme erkannt.';
$string['closeanalysis'] = 'Details schließen';
$string['duplicate'] = 'Diese Regel ist mit einer vorherigen Regel derselben Gruppe identisch und redundant.';
$string['emptygroup'] = 'Diese verschachtelte Regelgruppe ist leer und ungültig.';
$string['always'] = 'Diese Regelgruppe wird immer zutreffen.';
$string['never'] = 'Diese Regelgruppe kann nie zutreffen.';
$string['contradiction'] = 'Diese Gruppe verlangt gleichzeitig eine Regel und ihr logisches Gegenteil. Sie kann daher nie zutreffen.';
$string['tautology'] = 'Diese Gruppe akzeptiert eine Regel oder ihr logisches Gegenteil. Sie wird daher immer zutreffen.';
$string['redundantgroup'] = 'Diese nicht negierte Gruppe enthält nur eine Regel; die zusätzliche Verschachtelung verändert das Ergebnis nicht.';
$string['incomplete'] = 'Mindestens eine Bedingung ist unvollständig oder ungültig. Die Gesamtauswertung ist vorläufig.';
$string['provisional'] = 'Vorläufige Analyse';
$string['rulepath'] = 'Regel {$a}';
$string['privacy:metadata'] = 'Die Verfügbarkeitsprüfung speichert keine personenbezogenen Daten.';

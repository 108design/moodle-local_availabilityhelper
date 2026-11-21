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

$string['pluginname'] = 'Helfer für Voraussetzungen';
$string['analysenow'] = 'Regelwerk prüfen';
$string['analysisdetails'] = 'Ausführliche Regelanalyse';
$string['analysisok'] = 'Keine gesicherten logischen Probleme erkannt.';
$string['allrulesvisible'] = 'Alle Augensymbole sind auf sichtbar eingestellt. Moodle kann den Eintrag samt Hinweis zu den Voraussetzungen auch bei gesperrtem Zugang anzeigen.';
$string['closeanalysis'] = 'Details schließen';
$string['conflictcause'] = 'Ursache: „{$a->left}“ und „{$a->right}“ können nicht gleichzeitig erfüllt sein.';
$string['coveragecause'] = 'Ursache: „{$a->left}“ und „{$a->right}“ decken zusammen jeden möglichen Fall ab.';
$string['showdetails'] = 'Details anzeigen';
$string['panelopen'] = 'Helfer für Voraussetzungen öffnen';
$string['panelopenfinding'] = 'Helfer für Voraussetzungen öffnen · {$a} Befund';
$string['panelopenfindings'] = 'Helfer für Voraussetzungen öffnen · {$a} Befunde';
$string['paneltitle'] = 'Helfer für Voraussetzungen';
$string['panelclose'] = 'Seitenpanel schließen';
$string['panelanalysis'] = 'Analyse';
$string['panelhelp'] = 'Hilfe';
$string['panelreturn'] = 'Zum Helfer für Voraussetzungen';
$string['analysisdraft'] = 'Die Analyse prüft den Entwurf im Editor.';
$string['analysisstale'] = 'Der Entwurf hat sich geändert. Aktualisiere die Analyse für die aktuellen Regeln.';
$string['ruleopenssection'] = '{$a} im Abschnittseditor öffnen (neuer Tab)';
$string['branchsaved'] = 'Gespeicherter Abschnitt';
$string['refreshanalysis'] = 'Analyse aktualisieren';
$string['problemheading'] = 'Logikproblem';
$string['warningheading'] = 'Warnung';
$string['visiblecontent'] = 'Alle Voraussetzungen sind auf „sichtbar“ eingestellt. Dadurch bleibt der Inhalt dieses Text- und Medienbereichs trotz nicht erfüllter Voraussetzungen sichtbar.';
$string['duplicate'] = 'Diese Regel ist genauso eingestellt wie eine frühere Regel in derselben Gruppe. Für den Zugang reicht eine davon. Prüfe vor dem Entfernen die Einstellung am Augensymbol.';
$string['emptygroup'] = 'Diese verschachtelte Regelgruppe ist leer und ungültig.';
$string['always'] = 'Diese Regelgruppe wird immer zutreffen.';
$string['never'] = 'Diese Regelgruppe kann nie zutreffen.';
$string['contradiction'] = 'Diese Gruppe verlangt gleichzeitig eine Regel und ihr logisches Gegenteil. Sie kann daher nie zutreffen.';
$string['tautology'] = 'Diese Gruppe akzeptiert eine Regel oder ihr logisches Gegenteil. Sie wird daher immer zutreffen.';
$string['redundantgroup'] = 'Diese nicht negierte Gruppe enthält nur eine Regel; die zusätzliche Verschachtelung verändert das Ergebnis nicht.';
$string['semanticcontradiction'] = 'Diese Bedingungen können nicht gleichzeitig zutreffen. Das Regelset kann daher nie zutreffen.';
$string['semanticredundant'] = 'Diese Regel ändert die Zugangsentscheidung der Gruppe nicht. Prüfe vor dem Entfernen die Einstellung am Augensymbol.';
$string['semantictautology'] = 'Diese Bedingungen decken gemeinsam jeden möglichen Wert ab. Das Regelset wird daher immer zutreffen.';
$string['tipallcohorts'] = 'Bei ALLE muss eine Person jeder aufgeführten globalen Gruppe angehören. Wenn eine Gruppe genügen soll, verwenden Sie stattdessen EINE.';
$string['tipcomplex'] = 'Dieser Regelbaum ist komplex. Prüfen Sie die Szenarioübersicht und testen Sie ihn mit Personen in allen relevanten Zielrollen.';
$string['tipdoublenegation'] = 'Dieser Bereich enthält verschachtelte Negationen. Eine positiv formulierte Entsprechung ist häufig leichter zu pflegen.';
$string['tipheading'] = 'Nützliche Tipps';
$string['tipnegatedgroup'] = 'Hier wird ein vollständiges Regelset negiert. „NICHT ALLE“ bedeutet, dass mindestens eine enthaltene Regel falsch sein muss; „NICHT EINE“ bedeutet, dass alle enthaltenen Regeln falsch sein müssen.';
$string['tipsavailable'] = 'Zusätzliche Tipps sind verfügbar.';
$string['scenarioavailable'] = 'Zugang laut Regelbaum';
$string['scenariocase'] = 'Fall';
$string['scenariofiltered'] = 'Kombinationen, die bekannten Beziehungen zwischen Bedingungen widersprechen, werden nicht angezeigt.';
$string['scenarioheading'] = 'Szenarioübersicht';
$string['scenariolegend'] = 'Regeln';
$string['scenarionegated'] = 'Negierte Regel {$a}';
$string['scenariono'] = 'Nein';
$string['scenarionote'] = '✓ bedeutet erfüllt oder Zugang möglich. × bedeutet nicht erfüllt oder Zugang gesperrt. Die Fälle beruhen auf angenommenen Regelergebnissen.';
$string['scenariorepresentative'] = 'Die Tabelle zeigt eine Auswahl der Kombinationen.';
$string['scenarioresult'] = 'Zugang';
$string['scenarioconditions'] = 'Regeln';
$string['scenarioconditioncount'] = '{$a->yes} von {$a->total} erfüllt';
$string['scenariounavailable'] = 'Gesperrt laut Regelbaum';
$string['scenarioyes'] = 'Ja';
$string['incomplete'] = 'Moodle meldet mindestens einen Eingabefehler. Prüfe die markierten Regeln. Die Auswertung wird fortgesetzt, sobald die Eingaben gültig sind.';
$string['invalidrule'] = 'Moodle meldet einen Eingabefehler in dieser Regel. Prüfe ihre Eingaben.';
$string['completionitem'] = 'Wähle die Aktivität aus, deren Abschluss zählen soll.';
$string['pendinginput'] = 'Eine neue Voraussetzung ist noch offen.';
$string['checkinputs'] = 'Eingaben prüfen';
$string['showrulefinding'] = 'Hinweis an der Voraussetzung öffnen';
$string['hiderulefinding'] = 'Hinweis schließen';
$string['graderange'] = 'Mindestens {$a->min} % und gleichzeitig weniger als {$a->max} % sind nicht möglich. Die Untergrenze muss kleiner als die Obergrenze sein.';
$string['gradebounds'] = 'Die Untergrenze der Bewertung muss kleiner als die Obergrenze sein.';
$string['gradeitem'] = 'Wähle aus, welche Bewertung Moodle prüfen soll.';
$string['gradevalue'] = 'Trage für die aktivierten Bewertungsgrenzen Zahlen zwischen 0 und 100 ein.';
$string['grademinvalue'] = 'Trage für die Untergrenze eine Zahl zwischen 0 und 100 ein.';
$string['grademaxvalue'] = 'Trage für die Obergrenze eine Zahl zwischen 0 und 100 ein.';
$string['grademin'] = 'mindestens {$a} %';
$string['grademax'] = 'weniger als {$a} %';
$string['gradebetween'] = 'mindestens {$a->min} % und weniger als {$a->max} %';
$string['provisional'] = 'Vorläufige Analyse';
$string['rulepath'] = 'Voraussetzung {$a}';
$string['privacy:metadata:core_ai'] = 'Bei KI-Erklärungen und Vorschlägen verarbeitet das Moodle-KI-System die Kennung des anfragenden Kontos, den Kontext, die Anfrage und die Antwort.';

$string['treecontradiction'] = 'Keine Kombination der verschachtelten Voraussetzungen gibt diese Aktivität frei.';
$string['treetautology'] = 'Die verschachtelten Voraussetzungen lassen jede Kombination zu.';
$string['treechecklimited'] = 'Der Regelbaum ist zu umfangreich für eine vollständige Prüfung im Editor.';
$string['branchheading'] = 'Zugangswege';
$string['branchintro'] = 'Jeder Weg zeigt Regeln, die zusammen erfüllt sein müssen. Ob ein Konto einen möglichen Weg tatsächlich erfüllen kann, hängt von Moodle und den beteiligten Voraussetzungen ab.';
$string['branchroute'] = 'Weg {$a}';
$string['branchpossible'] = 'Im Modell möglich';
$string['branchblocked'] = 'Widerspruch';
$string['branchconflict'] = 'Die markierten Regeln können auf diesem Weg nicht zugleich erfüllt sein.';
$string['branchsection'] = 'Gespeicherter Abschnitt „{$a}“';
$string['branchsectionempty'] = 'Der Abschnitt „{$a}“ hat keine gespeicherten Voraussetzungen.';
$string['branchsectionunavailable'] = 'Die gespeicherten Abschnittsvoraussetzungen stehen in diesem Editor nicht zur Verfügung.';
$string['branchdelegated'] = 'Bei einem delegierten Abschnitt können weitere Voraussetzungen der übergeordneten Aktivität gelten.';
$string['branchsectionlink'] = 'Abschnitt bearbeiten (neuer Tab)';
$string['branchsectionblocked'] = 'Ein Konflikt mit den Abschnittsvoraussetzungen blockiert alle Zugangswege. Die beteiligten Regeln stehen in den Details.';
$string['branchlimited'] = 'Die Verzweigungen überschreiten das Prüflimit. Die Zugangswege sind nur teilweise ausgewertet.';
$string['branchinvalid'] = 'Vervollständige die leeren Regelgruppen, um die Zugangswege zu prüfen.';
$string['availabilityhelper:explain'] = 'Zugangswege mit KI erklären lassen';
$string['aiexplain'] = 'Mit KI erklären';
$string['aicontextdisabled'] = 'Die KI-Textgenerierung ist für diesen Kurs oder diese Aktivität deaktiviert.';
$string['aienabled'] = 'KI im Editor erlauben';
$string['aienabled_desc'] = 'Berechtigte Kursbearbeitende können Zugangswege erklären lassen und Lösungsvorschläge anfordern. Moodle verwendet dafür den konfigurierten KI-Anbieter mit Textgenerierung.';
$string['aiplugindisabled'] = 'Die KI-Funktion ist in den Einstellungen von Helfer für Voraussetzungen deaktiviert.';
$string['aiproviderrequired'] = 'Dafür brauchst Du einen aktiven Moodle-KI-Anbieter mit Textgenerierung.';
$string['aiprovidersettings'] = 'KI-Anbieter verwalten (neuer Tab)';
$string['aisettings'] = 'KI-Funktion konfigurieren (neuer Tab)';
$string['topic_explanation_setup'] = 'Die Website-Administration kann die KI-Funktion in den Plugin-Einstellungen freigeben. Moodle braucht dafür einen aktiven KI-Anbieter mit Textgenerierung. Ab Moodle 5.0 kannst Du in den Plugin-Einstellungen eine bestimmte Anbieterinstanz für den Helfer auswählen. Standardmäßig gilt die Reihenfolge der Moodle-Anbieter.';
$string['aifailed'] = 'Moodle hat keine verwendbare KI-Antwort erhalten. Du kannst es erneut versuchen.';
$string['ailimit'] = 'Die Zugangswege sind für eine KI-Erklärung zu umfangreich.';
$string['ainote'] = 'Die KI verwendet Regeltypen, Positionen und die Ergebnisse der Zweiganalyse.';
$string['aipartial'] = 'Die KI kann nur einen Teil der Regelstruktur erklären.';
$string['aipermission'] = 'Du hast hier keine Berechtigung, die Regelwirkung mit KI erklären zu lassen.';
$string['aipolicy'] = 'Stimme den KI-Nutzungsbedingungen von Moodle zu und starte die Anfrage erneut.';
$string['aisuggest'] = 'KI-Vorschläge anzeigen';
$string['aiadvicenote'] = 'Die KI leitet mögliche Ziele aus dem Konflikt ab. Du entscheidest, welches Ziel passt.';
$string['aisuggestions'] = 'Mögliche Lösungen für den Konflikt';
$string['aisuggestionspartial'] = 'Mögliche Lösungen für einen Teil der Regeln';
$string['aiintent'] = 'Mögliches Ziel: {$a}';
$string['aigoalaftercompletion'] = 'Der Zugang soll erst nach Abschluss möglich sein.';
$string['aigoalbeforecompletion'] = 'Der Zugang soll nur bis zum Abschluss möglich sein.';
$string['aiadjustcompletion'] = 'Setze bei {$a->change} denselben Abschlussstatus wie bei {$a->keep}, oder entferne die widersprechende Voraussetzung.';
$string['aiadjustdate'] = 'Behalte {$a->keep} bei und verschiebe die Grenze in {$a->change}, damit der Beginn vor dem Ende liegt.';
$string['aiadjustgrade'] = 'Wähle bei {$a->change} einen Bewertungsbereich, der sich mit {$a->keep} überschneidet.';
$string['aiadjustconflict'] = 'Behalte {$a->keep} bei. Passe {$a->change} so an, dass beide Voraussetzungen zusammen erfüllt sein können, oder entferne sie, wenn Du sie für dieses Ziel nicht brauchst.';
$string['aichangesection'] = 'Eine Änderung dieser Abschnittsvoraussetzung kann auch andere Aktivitäten im Abschnitt betreffen.';
$string['aireview'] = 'Prüfe nach einer Änderung den gesamten Regelbaum. Für ein konkretes Konto kannst Du die gespeicherten Regeln in der Teilnehmervorschau prüfen.';
$string['aiproviderautomatic'] = 'Moodle-Anbieterreihenfolge verwenden';
$string['aiproviderid'] = 'KI-Anbieter für die Regelerklärung';
$string['aiproviderid_desc'] = 'Wähle eine Moodle-Anbieterinstanz mit aktivierter Textgenerierung. Bei einer festen Auswahl verwendet die Regelerklärung ausschließlich diese Instanz mit ihrem Modell und ihren Einstellungen. Für die automatische Auswahl gilt die Reihenfolge unter „KI-Anbieter“.';
$string['aiprovidermissing'] = 'Anbieterinstanz {$a} derzeit nicht verfügbar';
$string['airesult'] = 'KI-Erklärung';
$string['airesultpartial'] = 'KI-Erklärung zu einem Teil der Regeln';
$string['aiunavailable'] = 'Die Moodle-Textgenerierung ist hier derzeit nicht verfügbar.';
$string['aiworking'] = 'Moodle erstellt die Erklärung …';
$string['branchunrestricted'] = 'Für diesen Entwurf wurden keine Voraussetzungen gefunden.';
$string['branchdatefrom'] = 'Verfügbar ab {$a}';
$string['branchdateuntil'] = 'Verfügbar vor {$a}';
$string['previewheading'] = 'Teilnehmervorschau';
$string['previewsaved'] = 'Moodle prüft den gespeicherten Stand der Aktivität und ihres Abschnitts.';
$string['previewplaceholder'] = 'Nach Namen suchen';
$string['previewparticipant'] = 'Testkonto';
$string['previewcheck'] = 'Zugang prüfen';
$string['previewsearchshort'] = 'Gib mindestens zwei Zeichen des Namens ein.';
$string['previewnomatches'] = 'Zu diesem Namen wurde kein aktiv eingeschriebenes Konto gefunden.';
$string['previewsearchfailed'] = 'Die Suche konnte nicht geladen werden. Versuche es erneut.';
$string['previewremove'] = 'Testkonto entfernen';
$string['previewrequestfailed'] = 'Die Vorschau konnte nicht geladen werden. Prüfe die Auswahl und versuche es erneut.';
$string['previewchecking'] = 'Moodle prüft den Zugang …';
$string['previewallowed'] = 'Zugang möglich';
$string['previewblocked'] = 'Zugang gesperrt';
$string['previewcourse'] = 'Kurszugang';
$string['previewsection'] = 'Voraussetzung im Abschnitt';
$string['previewactivity'] = 'Aktivität';
$string['previewcourseblocked'] = 'Moodle gibt den Kurs für dieses Konto nicht frei.';
$string['previewsectionblocked'] = 'Moodle gibt den Abschnitt für dieses Konto nicht frei.';
$string['previewdeleting'] = 'Die Aktivität ist zum Löschen vorgemerkt.';
$string['previewhidden'] = 'Die Aktivität ist für dieses Konto ausgeblendet.';
$string['previewviewcapability'] = 'Dem Konto fehlt die Berechtigung zum Ansehen dieser Aktivität.';
$string['previewotherrestriction'] = 'Moodle sperrt die Aktivität. Die Aktivität oder das Kursformat hat keinen genaueren Grund geliefert.';
$string['previewpermission'] = 'Dir fehlt die Berechtigung für die Teilnehmervorschau dieser Aktivität.';
$string['previewuserunavailable'] = 'Dieses Konto steht in diesem Kurs nicht für die Vorschau zur Verfügung.';
$string['availabilityhelper:preview'] = 'Zugang für andere eingeschriebene Teilnehmer prüfen';
$string['helptopics'] = 'Hilfethemen';
$string['helpmore'] = 'Mehr dazu im Hilfepanel';
$string['topic_analysis'] = 'Regelbaum prüfen';
$string['topic_analysis_body'] = 'Wähle „Helfer für Voraussetzungen öffnen“ neben „Voraussetzungen“. Die Analyse aktualisiert sich nach einer kurzen Eingabepause und zeigt Befunde und Zugangswege für Deinen Entwurf. Bei Aktivitäten bezieht sie die beim Öffnen gespeicherten Regeln des direkten Abschnitts ein. Regelverweise führen zur betreffenden Regel. Abschnittsregeln öffnen sich in einem neuen Tab. Bei vielen Regeln kannst Du einzelne Szenarien aufklappen.';
$string['topic_analysis_review'] = 'Bei einer neuen Voraussetzung erscheinen Hinweise zu fehlenden Eingaben, sobald Du eine weitere Voraussetzung hinzufügst, speicherst oder „Eingaben prüfen“ wählst. Die farbigen Symbole öffnen und schließen die Hinweise direkt an der jeweiligen Voraussetzung. Im Analyse-Reiter findest Du alle Befunde zusammen.';
$string['topic_explanation'] = 'KI-Erklärungen und Vorschläge';
$string['topic_explanation_body'] = 'Bei einem nachgewiesenen Konflikt schlägt die KI mögliche Ziele vor. Zu jedem Ziel siehst Du, welche Voraussetzung Du prüfen und welche Du beibehalten kannst. Über die Verweise kommst Du direkt zur jeweiligen Voraussetzung. Die Änderungen nimmst Du selbst im Editor vor. Moodle sendet Regeltypen, Positionen, erkannte Konflikte und bei Abschlussregeln den eingestellten Abschlussstatus an den konfigurierten KI-Anbieter. Namen, Kennungen der Aktivitäten und Teilnehmerdaten bleiben im Moodle-Kurs. Moodle protokolliert Anfrage und Antwort unter Deinem Konto.';
$string['detail_explanation'] = 'KI-Erklärungen und Vorschläge';
$string['detail_explanation_help'] = 'Lass Dir Zugangswege erklären oder mögliche Korrekturen für nachgewiesene Konflikte anzeigen.';
$string['topic_preview'] = 'Zugang eines Testkontos prüfen';
$string['topic_preview_body'] = 'Gib mindestens zwei Zeichen ein und wähle ein aktiv eingeschriebenes Konto aus den Vorschlägen. Klicke auf „Zugang prüfen“. Moodle berücksichtigt die Aktivität, ihren Abschnitt und die Rechte des Kontos. Wenn Du eine Voraussetzung änderst, speichere sie vor der nächsten Prüfung. Über × im Suchfeld wechselst Du das Testkonto.';
$string['detail_analysis'] = 'Ausführliche Regelanalyse';
$string['detail_analysis_help'] = 'Die Analyse aktualisiert sich automatisch, wenn Du die Voraussetzungen im Editor änderst.';
$string['detail_preview'] = 'Teilnehmervorschau';
$string['detail_preview_help'] = 'Moodle prüft die gespeicherte Aktivität für ein ausgewähltes, aktiv eingeschriebenes Konto.';
$string['updateguard_approval'] = 'Die Pakete oder der installierte Stand haben sich seit der Vorschau geändert. Prüfe den Vorgang erneut.';
$string['updateguard_back'] = 'Zur Pluginübersicht';
$string['updateguard_busy'] = 'Eine andere Installation läuft. Versuche es nach deren Abschluss erneut.';
$string['updateguard_channel'] = 'Updates über diesen Kanal sind für dieses Plugin nicht freigegeben.';
$string['updateguard_component'] = 'Das Paket für {$a} wurde abgewiesen.';
$string['updateguard_dependency'] = 'Eine benötigte Plugin-Version fehlt. Aktualisiere die Abhängigkeit gemeinsam mit diesem Plugin oder vorher.';
$string['updateguard_failed'] = 'Das Update konnte nicht geprüft werden. Es wurde keine Installation gestartet.';
$string['updateguard_heading'] = 'Update angehalten';
$string['updateguard_help'] = 'Das installierte Plugin prüft vor dem Ersetzen die Herausgebersignatur, den Paketinhalt, den erlaubten Updatekanal und die Kompatibilität. Eine gültige Signatur erlaubt keinen Wechsel auf eine andere Ausgabe. Wird ein Paket abgewiesen, stoppt die gesamte Sammelaktion.';
$string['updateguard_hint'] = 'Verwende ein freigegebenes Paket für die installierte Ausgabe. Du kannst den Vorgang erneut prüfen.';
$string['updateguard_installed'] = 'Der installierte Updateschutz ist unvollständig. Stelle die Dateien der zuletzt installierten freigegebenen Version wieder her.';
$string['updateguard_metadata'] = 'Die Versions- oder Abhängigkeitsangaben sind nicht konsistent.';
$string['updateguard_operation'] = 'Diese Kombination von Installationsaktionen wird nicht unterstützt. Starte einen einzelnen Updatevorgang erneut.';
$string['updateguard_policy'] = 'Das Paket passt nicht zur installierten Ausgabe oder zum erlaubten Paketprofil.';
$string['updateguard_signature'] = 'Die Herausgebersignatur oder der Paketinhalt konnte nicht bestätigt werden.';
$string['updateguard_unchanged'] = 'Dieser Vorgang hat keine Plugin-Dateien ersetzt.';

// Optional information before native package confirmation.
$string['updateinfo_heading'] = 'Paketinformationen: {$a}';
$string['updateinfo_verified'] = 'Der eingebettete Herausgebernachweis passt zur installierten Ausgabe.';
$string['updateinfo_missing'] = 'Dieses Paket enthält keinen eingebetteten Herausgebernachweis.';
$string['updateinfo_line'] = 'Dieses Paket gehört zu einer anderen Ausgabe als das installierte Plugin.';
$string['updateinfo_mismatch'] = 'Der eingebettete Herausgebernachweis konnte mit den Angaben des installierten Plugins nicht bestätigt werden.';
$string['updateinfo_unavailable'] = 'Die Herausgeberinformationen für das ausgewählte Paket konnten nicht gelesen werden.';
$string['updateinfo_choice'] = 'Kontrolliere vor dem Fortfahren die Paketquelle und Moodles Prüfergebnisse. Mit „{$a}“ unten kannst Du abbrechen.';

<?php
// This file is part of Moodle - http://moodle.org/

/**
 * English language strings.
 *
 * @package    local_availabilityhelper
 * @copyright  2026 Andreas Giesen
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

$string['pluginname'] = 'Availability helper';
$string['analysenow'] = 'Check rule set';
$string['analysisdetails'] = 'Detailed rule analysis';
$string['analysisok'] = 'No definite logical problems were found.';
$string['closeanalysis'] = 'Close details';
$string['duplicate'] = 'This rule is identical to an earlier rule in the same group and is redundant.';
$string['emptygroup'] = 'This nested rule group is empty and invalid.';
$string['always'] = 'This rule group will always be true.';
$string['never'] = 'This rule group can never be true.';
$string['contradiction'] = 'This group requires both a rule and its logical opposite, so it can never be true.';
$string['tautology'] = 'This group accepts either a rule or its logical opposite, so it will always be true.';
$string['redundantgroup'] = 'This non-negated group contains only one rule; the additional nesting does not change the result.';
$string['semanticcontradiction'] = 'These conditions cannot be true together. This rule group can therefore never be true.';
$string['semanticredundant'] = 'This condition is already implied by another condition in the same group and does not change the result.';
$string['semantictautology'] = 'These conditions cover every possible value. This rule group will therefore always be true.';
$string['incomplete'] = 'At least one condition is incomplete or invalid. The overall analysis is provisional.';
$string['provisional'] = 'Provisional analysis';
$string['rulepath'] = 'Rule {$a}';
$string['privacy:metadata'] = 'The Availability helper stores no personal data.';

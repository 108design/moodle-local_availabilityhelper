<?php
// This file is part of a 108design source-available software product.
//
// Copyright (C) 2026 Andreas Giesen <andreas@108design.com>
//
// Use and modification are permitted only under the Software License included
// with this distribution. Redistribution and circumvention of Pro feature or
// licensing restrictions are prohibited. See LICENSE.md for the full terms.

/**
 * English language strings.
 *
 * @package    local_availabilityhelper
 * @copyright  2026 Andreas Giesen <andreas@108design.com>
 * @license    See LICENSE.md for the full terms.
 */

$string['pluginname'] = 'Availability helper';
$string['analysenow'] = 'Check rule set';
$string['analysisdetails'] = 'Detailed rule analysis';
$string['analysisok'] = 'No confirmed logical problems were found.';
$string['allrulesvisible'] = 'All restrictions are set to “visible”. Unavailable content will therefore still be shown. Is this intentional?';
$string['closeanalysis'] = 'Close details';
$string['conflictcause'] = 'Cause: “{$a->left}” and “{$a->right}” cannot both be satisfied.';
$string['coveragecause'] = 'Cause: “{$a->left}” and “{$a->right}” together cover every possible case.';
$string['showdetails'] = 'Show details';
$string['refreshanalysis'] = 'Refresh analysis';
$string['problemheading'] = 'Logic problem';
$string['warningheading'] = 'Warning';
$string['visiblecontent'] = 'All restrictions are set to “visible”. This text and media area remains visible even when its restrictions are not met.';
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
$string['tipallcohorts'] = 'With ALL, a participant must belong to every listed cohort. If one cohort should be sufficient, use ANY instead.';
$string['tipcomplex'] = 'This rule tree is complex. Review the scenario overview and test it with users in every relevant target role.';
$string['tipdoublenegation'] = 'This area contains nested negations. A positively worded equivalent is often easier to maintain.';
$string['tipheading'] = 'Helpful tips';
$string['tipnegatedgroup'] = 'This negates a complete rule group. “NOT ALL” means that at least one contained rule must be false; “NOT ANY” means that every contained rule must be false.';
$string['tipsavailable'] = 'Additional tips are available.';
$string['scenarioavailable'] = 'Available';
$string['scenariocase'] = 'Case';
$string['scenariofiltered'] = 'Combinations that contradict known relationships between conditions are omitted.';
$string['scenarioheading'] = 'Scenario overview';
$string['scenariolegend'] = 'Rules';
$string['scenariono'] = 'No';
$string['scenarionote'] = 'This table shows every logically possible combination of the rules. It evaluates the rule logic, not current user data.';
$string['scenariorepresentative'] = 'This rule set has many combinations. The table shows representative boundary cases instead of every possible case.';
$string['scenarioresult'] = 'Overall result';
$string['scenariounavailable'] = 'Not available';
$string['scenarioyes'] = 'Yes';
$string['incomplete'] = 'At least one condition is incomplete or invalid. The overall analysis is provisional.';
$string['provisional'] = 'Provisional analysis';
$string['rulepath'] = 'Rule {$a}';
$string['privacy:metadata'] = 'The Availability helper stores no personal data.';

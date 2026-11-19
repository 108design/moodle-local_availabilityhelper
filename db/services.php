<?php
// This file is part of Moodle - https://moodle.org/
// @copyright 2026 Andreas Giesen <andreas@108design.com>
// @license   See LICENSE.md for the full terms.
// This file is part of a 108design source-available software product.
//
// Copyright (C) 2026 Andreas Giesen <andreas@108design.com>
//
// Use and modification are permitted only under the Software License included
// with this distribution. Redistribution and circumvention of Pro feature or
// licensing restrictions are prohibited. See LICENSE.md for the full terms.

/** @package local_availabilityhelper */

defined('MOODLE_INTERNAL') || die();

$functions = [
    'local_availabilityhelper_explain_rules' => [
        'classname' => \local_availabilityhelper\external\explain_rules::class,
        'description' => 'Explain access paths or suggest conflict corrections through the configured Moodle AI provider.',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/availabilityhelper:explain',
    ],
    'local_availabilityhelper_participant_preview' => [
        'classname' => \local_availabilityhelper\external\participant_preview::class,
        'description' => 'Search eligible course participants or check access to a saved activity.',
        'type' => 'read',
        'ajax' => true,
        'capabilities' => 'local/availabilityhelper:preview',
    ],
];

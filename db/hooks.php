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
 * Hook registrations.
 *
 * @package    local_availabilityhelper
 * @copyright  2026 Andreas Giesen <andreas@108design.com>
 * @license    See LICENSE.md for the full terms.
 */

defined('MOODLE_INTERNAL') || die();

$callbacks = [
    [
        'hook' => \core\hook\output\before_http_headers::class,
        'callback' => [\local_availabilityhelper\local\editor_help::class, 'before_headers'],
    ],
    [
        'hook' => \core\hook\output\before_standard_top_of_body_html_generation::class,
        'callback' => [\local_availabilityhelper\hook_callbacks::class, 'load_helper'],
    ],
    [
        'hook' => \core\hook\output\before_footer_html_generation::class,
        'callback' => [\local_availabilityhelper\local\editor_help::class, 'footer'],
    ],
    [
        'hook' => \core\hook\output\before_http_headers::class,
        'callback' => [\local_availabilityhelper\local\admin_branding::class, 'prepare'],
    ],
    [
        'hook' => \core\hook\output\before_standard_head_html_generation::class,
        'callback' => [\local_availabilityhelper\local\admin_branding::class, 'head'],
    ],
];

// Check signed plugin packages before Moodle replaces installed files.
// Native installation and updates are handled by Moodle Core.

// Optional package information; Core owns preview, confirmation and installation.
$callbacks[] = [
    'hook' => \core\hook\after_config::class,
    'callback' => [\local_availabilityhelper\local\update_notice::class, 'after_config'],
    'priority' => 1003,
];
$callbacks[] = [
    'hook' => \core\hook\output\before_standard_top_of_body_html_generation::class,
    'callback' => [\local_availabilityhelper\local\update_notice::class, 'before_body'],
];

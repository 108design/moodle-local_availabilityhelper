<?php
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

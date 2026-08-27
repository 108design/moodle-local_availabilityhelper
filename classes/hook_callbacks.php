<?php
// This file is part of a 108design source-available software product.
//
// Copyright (C) 2026 Andreas Giesen <andreas@108design.com>
//
// Use and modification are permitted only under the Software License included
// with this distribution. Redistribution and circumvention of Pro feature or
// licensing restrictions are prohibited. See LICENSE.md for the full terms.

namespace local_availabilityhelper;

use core\hook\output\before_standard_top_of_body_html_generation;

defined('MOODLE_INTERNAL') || die();

/**
 * Output hook callbacks.
 *
 * @package    local_availabilityhelper
 * @copyright  2026 Andreas Giesen <andreas@108design.com>
 * @license    See LICENSE.md for the full terms.
 */
final class hook_callbacks {
    /**
     * Loads the lightweight bootstrap on standard Moodle pages.
     *
     * @param before_standard_top_of_body_html_generation $hook Current output hook
     */
    public static function load_helper(before_standard_top_of_body_html_generation $hook): void {
        global $PAGE;

        if (!isloggedin() || isguestuser()) {
            return;
        }

        $PAGE->requires->js_call_amd('local_availabilityhelper/bootstrap', 'init');
    }
}


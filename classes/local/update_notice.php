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
 * Package replacement compatibility.
 *
 * @package local_availabilityhelper
 * @copyright 2026 Andreas Giesen <andreas@108design.com>
 * @license 108design source-available software license; see LICENSE.md
 */
namespace local_availabilityhelper\local;

defined('MOODLE_INTERNAL') || die();

/** Optional information on the native preview; never replaces Core's decisions. */
final class update_notice {
    /** Remember the preview without output or additional authentication. */
    public static function after_config(\core\hook\after_config $hook): void {
        try {
            if (!class_exists(\design108\package_notice\v1\notice::class, false)) {
                $path = dirname(__DIR__, 2) . '/update-notice.php';
                if (!is_readable($path)) {
                    return;
                }
                require_once($path);
            }
            \design108\package_notice\v1\notice::remember('local_availabilityhelper', dirname(__DIR__, 2));
        } catch (\Throwable $ignored) {
            // Optional information must never abort the request.
        }
    }

    /** Render before Core's native confirmation controls in maintenance layouts. */
    public static function before_body(\core\hook\output\before_standard_top_of_body_html_generation $hook): void {
        try {
            if (class_exists(\design108\package_notice\v1\notice::class, false)) {
                \design108\package_notice\v1\notice::before_body('local_availabilityhelper', $hook);
            }
        } catch (\Throwable $ignored) {
            // Core continues even if optional rendering fails.
        }
    }
}

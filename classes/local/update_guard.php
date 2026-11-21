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

/** Compatibility for an old cached hook registration; intentionally passive. */
final class update_guard {
    /** Allow old cached callbacks to finish without changing the native request. */
    public static function after_config(\core\hook\after_config $hook): void {
    }
}

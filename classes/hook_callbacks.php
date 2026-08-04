<?php
// This file is part of Moodle - http://moodle.org/

namespace local_availabilityhelper;

use core\hook\output\before_standard_top_of_body_html_generation;

defined('MOODLE_INTERNAL') || die();

/**
 * Output hook callbacks.
 *
 * @package    local_availabilityhelper
 * @copyright  2026 Andreas Giesen
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
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


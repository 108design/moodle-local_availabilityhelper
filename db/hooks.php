<?php
// This file is part of Moodle - http://moodle.org/

/**
 * Hook registrations.
 *
 * @package    local_availabilityhelper
 * @copyright  2026 Andreas Giesen
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$callbacks = [
    [
        'hook' => \core\hook\output\before_standard_top_of_body_html_generation::class,
        'callback' => [\local_availabilityhelper\hook_callbacks::class, 'load_helper'],
    ],
];

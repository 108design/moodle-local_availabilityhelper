<?php
// This file is part of Moodle - http://moodle.org/

namespace local_availabilityhelper\privacy;

defined('MOODLE_INTERNAL') || die();

/**
 * Privacy provider.
 *
 * @package    local_availabilityhelper
 * @copyright  2026 Andreas Giesen
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
final class provider implements \core_privacy\local\metadata\null_provider {
    /**
     * Returns the reason why no personal data is stored.
     *
     * @return string
     */
    public static function get_reason(): string {
        return 'privacy:metadata';
    }
}


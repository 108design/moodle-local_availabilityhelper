<?php
// This file is part of Moodle - http://moodle.org/

/**
 * Plugin version information.
 *
 * @package    local_availabilityhelper
 * @copyright  2026 Andreas Giesen
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$plugin->component = 'local_availabilityhelper';
$plugin->version = 2026080503;
$plugin->requires = 2024100700; // Moodle 4.5.
$plugin->supported = [405, 502];
$plugin->maturity = MATURITY_ALPHA;
$plugin->release = '0.4.2';

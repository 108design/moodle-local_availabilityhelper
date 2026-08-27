<?php
// This file is part of a 108design source-available software product.
//
// Copyright (C) 2026 Andreas Giesen <andreas@108design.com>
//
// Use and modification are permitted only under the Software License included
// with this distribution. Redistribution and circumvention of Pro feature or
// licensing restrictions are prohibited. See LICENSE.md for the full terms.

/**
 * Plugin version information.
 *
 * @package    local_availabilityhelper
 * @copyright  2026 Andreas Giesen <andreas@108design.com>
 * @license    See LICENSE.md for the full terms.
 */

defined('MOODLE_INTERNAL') || die();

$plugin->component = 'local_availabilityhelper';
$plugin->version = 2026081200;
$plugin->requires = 2024100700; // Moodle 4.5.
$plugin->supported = [405, 502];
$plugin->maturity = MATURITY_ALPHA;
$plugin->release = '0.5.0';

<?php
// This file is part of Moodle - https://moodle.org/
// @copyright 2026 Andreas Giesen <andreas@108design.com>
// @license   See LICENSE.md for the full terms.
// This file is part of a 108design source-available software product.
//
// Copyright (C) 2026 Andreas Giesen <andreas@108design.com>
//
// Use and modification are permitted only under the Software License included
// with this distribution. Redistribution and circumvention of Pro feature or
// licensing restrictions are prohibited. See LICENSE.md for the full terms.

/** @package local_availabilityhelper */

defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig) {
    $settings = new admin_settingpage('local_availabilityhelper', get_string('pluginname', 'local_availabilityhelper'));
    $ADMIN->add('localplugins', $settings);
    if ($ADMIN->fulltree) {
        $settings->add(new admin_setting_configcheckbox(
            'local_availabilityhelper/aienabled',
            get_string('aienabled', 'local_availabilityhelper'),
            get_string('aienabled_desc', 'local_availabilityhelper'),
            0,
        ));
        if (\local_availabilityhelper\local\rule_explanation::supports_provider_selection()) {
            $settings->add(new admin_setting_configselect(
                'local_availabilityhelper/aiproviderid',
                get_string('aiproviderid', 'local_availabilityhelper'),
                get_string('aiproviderid_desc', 'local_availabilityhelper'),
                0,
                \local_availabilityhelper\local\rule_explanation::provider_choices(),
            ));
        }
    }
}

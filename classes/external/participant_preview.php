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

namespace local_availabilityhelper\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_multiple_structure;
use core_external\external_single_structure;
use core_external\external_value;
use local_availabilityhelper\local\preview;

/** AJAX entry point for the saved-state participant preview. */
final class participant_preview extends external_api {
    /** @return external_function_parameters */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'cmid' => new external_value(PARAM_INT, 'Saved activity ID'),
            'search' => new external_value(PARAM_TEXT, 'Name to search for', VALUE_DEFAULT, ''),
            'userid' => new external_value(PARAM_INT, 'Selected active participant ID', VALUE_DEFAULT, 0),
        ]);
    }

    /**
     * Search the course or evaluate the selected user.
     *
     * @param int $cmid Activity ID
     * @param string $search Part of a name
     * @param int $userid Selected participant ID
     * @return array
     */
    public static function execute(int $cmid, string $search = '', int $userid = 0): array {
        global $CFG;
        $params = self::validate_parameters(self::execute_parameters(), compact('cmid', 'search', 'userid'));
        $context = \context_module::instance($params['cmid']);
        self::validate_context($context);
        if (empty($CFG->enableavailability) || !preview::can_use($context)) {
            throw new \moodle_exception('previewpermission', 'local_availabilityhelper');
        }

        $course = get_course($context->get_course_context()->instanceid);
        if ($params['userid'] > 0) {
            return ['result' => preview::check($course, $context, $params['userid'])];
        }
        return ['users' => preview::search($context->get_course_context(), trim($params['search']))];
    }

    /** @return external_single_structure */
    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'users' => new external_multiple_structure(new external_single_structure([
                'id' => new external_value(PARAM_INT, 'Participant ID'),
                'name' => new external_value(PARAM_RAW, 'Display name, rendered as text'),
            ]), 'Matching participants', VALUE_OPTIONAL),
            'result' => new external_single_structure([
                'allowed' => new external_value(PARAM_BOOL, 'Moodle activity access'),
                'reasons' => new external_multiple_structure(new external_single_structure([
                    'scope' => new external_value(PARAM_ALPHA, 'Course, section or activity'),
                    'text' => new external_value(PARAM_RAW, 'Native explanation, rendered as text'),
                ])),
            ], 'Current saved-state result', VALUE_OPTIONAL),
        ]);
    }
}

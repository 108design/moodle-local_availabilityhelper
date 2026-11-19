<?php
// This file is part of a 108design source-available software product.
//
// Copyright (C) 2026 Andreas Giesen <andreas@108design.com>
//
// Use and modification are permitted only under the Software License included
// with this distribution. Redistribution and circumvention of Pro feature or
// licensing restrictions are prohibited. See LICENSE.md for the full terms.

namespace local_availabilityhelper\external;

use core_ai\aiactions\generate_text;
use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_multiple_structure;
use core_external\external_single_structure;
use core_external\external_value;
use local_availabilityhelper\local\rule_explanation;

/** Explain the detailed editor report through Moodle's configured text provider. */
final class explain_rules extends external_api {
    /** Describe the rule projection accepted from the editor. */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'contextid' => new external_value(PARAM_INT, 'Editor context'),
            'partial' => new external_value(PARAM_BOOL, 'Only part of the rule set is represented'),
            'routes' => new external_multiple_structure(new external_single_structure([
                'number' => new external_value(PARAM_INT, 'Route number in the detail report'),
                'rules' => new external_multiple_structure(new external_single_structure([
                    'path' => new external_value(PARAM_RAW, 'One-based position within the rule tree'),
                    'kind' => new external_value(PARAM_RAW, 'Allowed rule type'),
                    'section' => new external_value(PARAM_BOOL, 'Rule from the saved section'),
                    'negated' => new external_value(PARAM_BOOL, 'Rule affected by group negation'),
                    'completionstate' => new external_value(PARAM_INT, 'Symbolic Moodle completion state', VALUE_DEFAULT, -1),
                ])),
                'conflict' => new external_multiple_structure(new external_value(PARAM_INT, 'Zero-based conflicting rule index')),
            ])),
            'advice' => new external_value(PARAM_BOOL, 'Suggest changes for detected conflicts', VALUE_DEFAULT, false),
        ]);
    }

    /**
     * Generate an explanation after checking permissions and AI policy.
     *
     * @param int $contextid Editor context
     * @param bool $partial Only part of the rule set is represented
     * @param array $routes Access paths
     * @param bool $advice Provide advice for detected conflicts
     * @return array
     */
    public static function execute(int $contextid, bool $partial, array $routes, bool $advice = false): array {
        global $USER;

        $params = self::validate_parameters(self::execute_parameters(), compact('contextid', 'partial', 'routes', 'advice'));
        $context = \context::instance_by_id($params['contextid']);
        self::validate_context($context);
        if (!rule_explanation::can_use($context)) {
            throw new \moodle_exception('aipermission', 'local_availabilityhelper');
        }
        if (!rule_explanation::enabled()) {
            return ['status' => 'unavailable', 'text' => ''];
        }
        $manager = rule_explanation::manager_for_explanation();
        if (!rule_explanation::available($manager, $context)) {
            return ['status' => 'unavailable', 'text' => ''];
        }
        if (!$manager::get_user_policy_status((int)$USER->id)) {
            require_capability('moodle/ai:acceptpolicy', \context_user::instance($USER->id));
            return ['status' => 'policy', 'text' => ''];
        }

        $language = current_language();
        $prompt = rule_explanation::prompt($params['routes'], $params['partial'], $context, $language, $params['advice']);
        $response = $manager->process_action(new generate_text($context->id, $USER->id, $prompt));
        $content = $response->get_success() ? trim($response->get_response_data()['generatedcontent'] ?? '') : '';
        if ($params['advice']) {
            $suggestions = rule_explanation::checked_suggestions($content, $params['routes']);
            return $suggestions ? ['status' => 'ok', 'text' => '', 'suggestions' => $suggestions] : ['status' => 'failed', 'text' => ''];
        }
        $checked = rule_explanation::checked_text($content, $params['routes'], $language);
        if ($checked === null) {
            return ['status' => 'failed', 'text' => ''];
        }
        return ['status' => 'ok', 'text' => $checked];
    }

    /** Describe availability or the generated plain text. */
    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'status' => new external_value(PARAM_ALPHA, 'Availability, policy or result status'),
            'text' => new external_value(PARAM_RAW, 'Generated explanation rendered as text'),
            'suggestions' => new external_multiple_structure(new external_single_structure([
                'route' => new external_value(PARAM_INT, 'Number of a path with a conflict'),
                'keep' => new external_value(PARAM_INT, 'One-based rule to preserve'),
                'change' => new external_value(PARAM_INT, 'One-based conflicting rule to review'),
                'intent' => new external_value(PARAM_RAW, 'Hypothetical goal expressed as plain text'),
            ]), 'Optional conflict suggestions', VALUE_OPTIONAL),
        ]);
    }
}

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

namespace local_availabilityhelper\local;

/** Reduced saved section rules for the native activity editor. */
final class section_rules {
    /** Fields used by the static analyser. Other extensions are presented as opaque rules. */
    private const FIELDS = [
        'date' => ['d', 't'],
        'grade' => ['id', 'min', 'max'],
        'completion' => ['cm', 'e'],
        'profile' => ['sf', 'cf', 'op', 'v'],
        'group' => ['id'],
        'grouping' => ['id'],
        'cohort' => ['id'],
        'role' => ['id', 'typeid'],
        'language' => ['id'],
        'user' => ['userid', 'userids'],
        'coursecompleted' => ['id', 'courseid'],
        'courseprogress' => ['courseprogress'],
        'sectioncompleted' => ['id', 'e', 'm'],
        'relativedate' => ['n', 's', 'd', 'm'],
        'stash' => ['objectid', 'condition', 'quantity'],
        'xp' => ['operator', 'requiredlvl'],
        'certificateissued' => ['templateid', 'site', 'boundcourse', 'binding', 'scope', 'validity', 'archive', 'received'],
    ];

    /**
     * Find the direct containing section using Moodle's native editor context.
     *
     * @param \moodle_page $page Native modedit page
     * @return array
     */
    public static function for_activity(\moodle_page $page): array {
        $course = $page->course;
        if (!has_capability('moodle/course:update', \context_course::instance($course->id))) {
            return ['unavailable' => true];
        }
        $section = $page->cm ? $page->cm->get_section_info() : null;
        if (!$section && $page->url->get_param('add') && $page->url->get_param('section') !== null) {
            $section = get_fast_modinfo($course)->get_section_info((int)$page->url->get_param('section'));
        }
        if (!$section) {
            return ['unavailable' => true];
        }
        $context = [
            'name' => html_to_text(get_section_name($course, $section), 0, false),
            'url' => (new \moodle_url('/course/editsection.php', ['id' => $section->id]))->out(false),
            'delegated' => $section->get_component_instance() !== null,
            'labels' => [],
        ];
        if (!$section->availability) {
            return $context;
        }
        $count = 0;
        $tree = json_decode($section->availability, false, 64);
        $enabled = \core_plugin_manager::instance()->get_enabled_plugins('availability');
        $context['tree'] = self::reduce($tree, '', $context['labels'], $count, $enabled);
        if (!isset($context['tree']['op'])) {
            $context['unavailable'] = true;
            unset($context['tree']);
        }
        return $context;
    }

    /**
     * Reduce the data sent to the browser and associate labels with stable rule positions.
     *
     * @param mixed $node Native rule JSON
     * @param string $path Zero-based position
     * @param array $labels Translated labels for saved section rules
     * @param int $count Limit for large inputs
     * @param array $enabled Enabled native conditions
     * @return ?array
     */
    private static function reduce(mixed $node, string $path, array &$labels, int &$count, array $enabled): ?array {
        if (++$count > 240 || !is_object($node)) {
            return null;
        }
        if (isset($node->op, $node->c) && !isset($node->type) && is_array($node->c) &&
                in_array($node->op, ['&', '|', '!&', '!|'], true)) {
            $children = [];
            foreach ($node->c as $index => $child) {
                $childpath = $path === '' ? (string)$index : "$path.$index";
                $reduced = self::reduce($child, $childpath, $labels, $count, $enabled);
                if ($reduced === null) {
                    return null;
                }
                $children[] = $reduced;
            }
            return ['op' => $node->op, 'c' => $children];
        }
        if (!isset($node->type) || !is_string($node->type) || !preg_match('/^[a-z][a-z0-9_]{0,63}$/D', $node->type)) {
            return null;
        }
        $component = 'availability_' . $node->type;
        $labels[$path] = get_string_manager()->string_exists('pluginname', $component) ?
            get_string('pluginname', $component) : $node->type;
        if (!isset(self::FIELDS[$node->type], $enabled[$node->type]) ||
                !class_exists('\\' . $component . '\\condition')) {
            return ['type' => 'ah_opaque', 'position' => $path];
        }
        $reduced = ['type' => $node->type];
        foreach (self::FIELDS[$node->type] as $key) {
            $value = $node->{$key} ?? null;
            if (is_scalar($value)) {
                $reduced[$key] = $value;
            } else if ($key === 'userids' && is_array($value) && count($value) <= 500 &&
                    count(array_filter($value, 'is_scalar')) === count($value)) {
                $reduced[$key] = $value;
            } else if ($value !== null) {
                return ['type' => 'ah_opaque', 'position' => $path];
            }
        }
        if ($node->type === 'date' && isset($node->t) && is_int($node->t) && in_array($node->d ?? '', ['>=', '<'], true)) {
            $key = $node->d === '>=' ? 'branchdatefrom' : 'branchdateuntil';
            $labels[$path] = get_string($key, 'local_availabilityhelper', userdate($node->t));
        }
        return $reduced;
    }
}

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

/** Native editor help and its authorised topics. */
final class editor_help {
    /** @var array Ordered help topics for this editor */
    private static array $topics = [];

    /** @var int Saved activity eligible for a participant preview */
    private static int $cmid = 0;

    /** @var ?array Context of the activity's saved section */
    private static ?array $section = null;

    /** @var ?array Rule explanation context and provider availability for the editor. */
    private static ?array $ai = null;

    /** Register the panel before Moodle renders the editor header. */
    public static function before_headers(\core\hook\output\before_http_headers $hook): void {
        global $CFG, $PAGE;
        if (empty($CFG->enableavailability) || !isloggedin() || isguestuser()) {
            return;
        }
        $activity = $PAGE->url->compare(new \moodle_url('/course/modedit.php'), URL_MATCH_BASE);
        $section = $PAGE->url->compare(new \moodle_url('/course/editsection.php'), URL_MATCH_BASE);
        if ((!$activity && !$section) || !has_capability('moodle/course:manageactivities', $PAGE->context)) {
            return;
        }
        self::$topics = ['analysis'];
        if ($activity) {
            self::$section = section_rules::for_activity($PAGE);
        }
        if ($activity && $PAGE->context instanceof \context_module && preview::can_use($PAGE->context)) {
            self::$cmid = $PAGE->context->instanceid;
            self::$topics[] = 'preview';
        }
        $aienabled = rule_explanation::enabled();
        $canconfigure = has_capability('moodle/site:config', \context_system::instance());
        if (($aienabled || $canconfigure) && rule_explanation::can_use($PAGE->context)) {
            self::$ai = [
                'contextid' => $PAGE->context->id,
                'unavailable' => $aienabled ? rule_explanation::unavailable_reason(
                    rule_explanation::manager_for_explanation(), $PAGE->context) : 'aiplugindisabled',
                'types' => array_keys(rule_explanation::TYPES),
                'maxrules' => rule_explanation::MAX_RULES,
            ];
            self::$topics[] = 'explanation';
        }
        $PAGE->add_body_class('local-availabilityhelper-admin-help-page');
    }

    /** @return int Activity ID if the separate preview is available. */
    public static function preview_cmid(): int {
        return self::$cmid;
    }

    /** @return ?array Saved containing section for the joint analysis. */
    public static function section(): ?array {
        return self::$section;
    }

    /** @return ?array Configuration for the optional editor action. */
    public static function explanation(): ?array {
        return self::$ai;
    }

    /** Render the panel and its native popover buttons. */
    public static function footer(\core\hook\output\before_footer_html_generation $hook): void {
        global $OUTPUT;
        if (!self::$topics) {
            return;
        }

        $options = [];
        $articles = '';
        $icons = '';
        foreach (self::$topics as $topic) {
            $title = get_string('topic_' . $topic, 'local_availabilityhelper');
            $options[$topic] = $title;
            $body = \html_writer::tag('h3', $title, ['tabindex' => '-1']) .
                \html_writer::tag('p', get_string('topic_' . $topic . '_body', 'local_availabilityhelper'));
            if ($topic === 'analysis') {
                $body .= \html_writer::tag('p', get_string('topic_analysis_review', 'local_availabilityhelper'));
            } else if ($topic === 'explanation') {
                $body .= self::provider_help();
            }
            $articles .= \html_writer::tag('article', $body, ['data-ah-help-topic' => $topic, 'hidden' => 'hidden']);
            $icons .= \html_writer::span(self::icon($topic), '', ['id' => 'local-availabilityhelper-' . $topic . '-icon']);
        }
        $choices = \html_writer::tag('label', get_string('helptopics', 'local_availabilityhelper'),
            ['for' => 'ah-help-topic', 'class' => 'form-label']) .
            \html_writer::select($options, 'ah-help-topic', 'analysis', false,
                ['id' => 'ah-help-topic', 'class' => 'form-select custom-select']);
        $brand = \html_writer::span(\html_writer::empty_tag('img', [
            'src' => $OUTPUT->image_url('helpbrand', 'local_availabilityhelper'), 'alt' => '',
            'width' => 25, 'height' => 24,
        ]), 'local-availabilityhelper-help-brand', [
            'id' => 'local-availabilityhelper-header-brand', 'role' => 'img', 'aria-label' => '108design',
        ]);
        $content = \html_writer::div($choices, 'local-availabilityhelper-help-choices') .
            \html_writer::div($articles, 'local-availabilityhelper-help-content');
        $panel = \html_writer::tag('div', $content, [
            'id' => 'local-availabilityhelper-help', 'hidden' => 'hidden',
            'data-initial-topic' => optional_param('ahhelp', '', PARAM_ALPHA),
        ]);
        $hook->add_html($panel . \html_writer::div($brand . $icons, '', ['hidden' => 'hidden']));
    }

    /** Explain provider setup and link authorised admins to Moodle's site settings. */
    private static function provider_help(): string {
        global $CFG;
        $body = \html_writer::tag('p', get_string('topic_explanation_setup', 'local_availabilityhelper'));
        if (!has_capability('moodle/site:config', \context_system::instance())) {
            return $body;
        }
        $sections = ['local_availabilityhelper' => 'aisettings', 'aiprovider' => 'aiprovidersettings'];
        foreach ($sections as $section => $label) {
            $url = new \moodle_url('/' . $CFG->admin . '/settings.php', ['section' => $section]);
            $body .= \html_writer::div(\html_writer::link($url, get_string($label, 'local_availabilityhelper'),
                ['target' => '_blank', 'rel' => 'noopener']), 'mb-2');
        }
        return $body;
    }

    /** @return string Native help popover linking to the selected topic. */
    private static function icon(string $topic): string {
        global $CFG, $PAGE, $OUTPUT;
        $url = new \moodle_url($PAGE->url, ['ahhelp' => $topic]);
        $icon = new \help_icon('detail_' . $topic, 'local_availabilityhelper');
        $data = (array)$icon->export_for_template($OUTPUT);
        $data['completedoclink'] = \html_writer::link($url, get_string('helpmore', 'local_availabilityhelper'),
            ['class' => 'local-availabilityhelper-topic-link']);
        $data['legacy'] = $CFG->version < 2025041400;
        $data['infoicon'] = self::icon_name();
        return $OUTPUT->render_from_template('local_availabilityhelper/help_icon', $data);
    }

    /** @return string Native information icon for this branch. */
    private static function icon_name(): string {
        global $CFG;
        return $CFG->version >= 2026100500 ? 'i/circleinfo' : 'i/info';
    }
}

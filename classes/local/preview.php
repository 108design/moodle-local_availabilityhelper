<?php
// This file is part of a 108design source-available software product.
//
// Copyright (C) 2026 Andreas Giesen <andreas@108design.com>
//
// Use and modification are permitted only under the Software License included
// with this distribution. Redistribution and circumvention of Pro feature or
// licensing restrictions are prohibited. See LICENSE.md for the full terms.

namespace local_availabilityhelper\local;

use core_availability\info;
use core_availability\info_module;
use core_availability\info_section;
use core_availability\tree;

/** Read-only checks for an active participant's access to a saved activity. */
final class preview {
    /** @var string Permission for the preview of another user's availability. */
    private const CAPABILITY = 'local/availabilityhelper:preview';

    /** @var int Bound the number of identities returned in one request. */
    private const SEARCH_LIMIT = 25;

    /**
     * Both page registration and AJAX use the same access policy.
     *
     * @param \context_module $context Saved activity context
     * @return bool
     */
    public static function can_use(\context_module $context): bool {
        $coursecontext = $context->get_course_context();
        return has_capability(self::CAPABILITY, $context)
            && has_capability('moodle/course:manageactivities', $context)
            && has_capability('moodle/course:viewparticipants', $coursecontext)
            && has_capability('moodle/site:accessallgroups', $coursecontext);
    }

    /**
     * Names only and active enrolments in the already-authorised course.
     *
     * @param \context_course $context Course context
     * @param string $query Search by course participant name
     * @return array
     */
    public static function search(\context_course $context, string $query): array {
        global $DB;
        if (\core_text::strlen($query) < 2 || \core_text::strlen($query) > 100) {
            return [];
        }

        [$enrolled, $params] = get_enrolled_sql($context, '', 0, true);
        $fields = \core_user\fields::for_name()->get_sql('u', false, '', 'id', false)->selects;
        $name = $DB->sql_fullname('u.firstname', 'u.lastname');
        $otherorder = $DB->sql_fullname('u.lastname', 'u.firstname');
        $match = $DB->sql_like($name, ':displayname', false, false);
        $reverse = $DB->sql_like($otherorder, ':reversedname', false, false);
        $search = '%' . $DB->sql_like_escape($query) . '%';
        $params += ['displayname' => $search, 'reversedname' => $search, 'guestid' => guest_user()->id];
        $sql = "SELECT u.id, $fields
                  FROM {user} u
                  JOIN ($enrolled) e ON e.id = u.id
                 WHERE u.deleted = 0 AND u.suspended = 0 AND u.confirmed = 1 AND u.id <> :guestid
                   AND ($match OR $reverse)
              ORDER BY u.lastname, u.firstname, u.id";
        $users = $DB->get_records_sql($sql, $params, 0, self::SEARCH_LIMIT);
        return array_values(array_map(static fn($user) => ['id' => (int)$user->id, 'name' => fullname($user)], $users));
    }

    /**
     * Use Moodle's direct-activity gate for the answer and its condition APIs for the reasons.
     *
     * @param \stdClass $course Selected activity's course
     * @param \context_module $context Selected activity's context
     * @param int $userid Participant
     * @return array
     */
    public static function check(\stdClass $course, \context_module $context, int $userid): array {
        global $DB;
        $coursecontext = $context->get_course_context();
        $user = $DB->get_record('user', ['id' => $userid], 'id,deleted,suspended,confirmed');
        if (!$user || $user->deleted || $user->suspended || !$user->confirmed || isguestuser($user)
                || !is_enrolled($coursecontext, $userid, '', true)) {
            throw new \moodle_exception('previewuserunavailable', 'local_availabilityhelper');
        }
        if (!can_access_course($course, $userid, '', true)) {
            return ['allowed' => false, 'reasons' => [self::reason('course', 'previewcourseblocked')]];
        }

        $modinfo = get_fast_modinfo($course, $userid);
        $cm = $modinfo->get_cm($context->instanceid);
        if ($cm->deletioninprogress) {
            return ['allowed' => false, 'reasons' => [self::reason('activity', 'previewdeleting')]];
        }
        if ($cm->uservisible) {
            return ['allowed' => true, 'reasons' => []];
        }

        $reasons = [];
        if (!$cm->visible && !has_capability('moodle/course:viewhiddenactivities', $context, $userid)) {
            $reasons[] = self::reason('activity', 'previewhidden');
        }
        $view = 'mod/' . $cm->modname . ':view';
        if (get_capability_info($view) && !has_capability($view, $context, $userid)) {
            $reasons[] = self::reason('activity', 'previewviewcapability');
        }
        if (!$cm->available && !has_capability('moodle/course:ignoreavailabilityrestrictions', $context, $userid)) {
            $section = $cm->get_section_info();
            if (!$section->get_available()) {
                $text = self::description(new info_section($section), $section->availability, $section->availableinfo,
                    $modinfo, $userid) ?? get_string('previewsectionblocked', 'local_availabilityhelper');
                $reasons[] = ['scope' => 'section', 'text' => $text];
            }
            $text = self::description(new info_module($cm), $cm->availability, $cm->availableinfo, $modinfo, $userid);
            if ($text !== null) {
                $reasons[] = ['scope' => 'activity', 'text' => $text];
            }
        }
        if (!$reasons) {
            $reasons[] = self::reason('activity', 'previewotherrestriction');
        }
        return ['allowed' => false, 'reasons' => $reasons];
    }

    /**
     * Use the native grouped failure message. When an eye has suppressed it,
     * reevaluate an in-memory copy with the root display flags enabled.
     *
     * @param info $info Native availability object bound to the saved course item
     * @param string|null $availability Saved JSON
     * @param mixed $information Native visible explanation
     * @param \course_modinfo $modinfo Subject's modinfo
     * @param int $userid Subject ID
     * @return string|null
     */
    private static function description(info $info, ?string $availability, mixed $information,
            \course_modinfo $modinfo, int $userid): ?string {
        if (!$information && $availability) {
            $structure = json_decode($availability);
            if (!is_object($structure) || !is_array($structure->c ?? null)) {
                return null;
            }
            if (in_array($structure->op ?? null, [tree::OP_AND, tree::OP_NOT_OR], true)) {
                $structure->showc = array_fill(0, count($structure->c), true);
            } else {
                $structure->show = true;
            }

            // Core condition implementations depend on info_module/info_section
            // context, including references to the activity or section itself.
            $visible = $info instanceof info_module
                ? new class($info->get_course_module(), $structure) extends info_module {
                    public function __construct(\cm_info $cm, \stdClass $structure) {
                        parent::__construct($cm);
                        $this->availability = json_encode($structure, JSON_THROW_ON_ERROR);
                    }
                }
                : new class($info->get_section(), $structure) extends info_section {
                    public function __construct(\section_info $section, \stdClass $structure) {
                        parent::__construct($section);
                        $this->availability = json_encode($structure, JSON_THROW_ON_ERROR);
                    }
                };
            if ($visible->is_available($information, false, $userid, $modinfo)) {
                return null;
            }
        }

        if (!$information) {
            return null;
        }
        // Return only plain text. Never hand a plugin's HTML to the browser.
        $text = trim(html_to_text(info::format_info($information, $info->get_course()), 0, false));
        return $text === '' ? null : $text;
    }

    /** @return array */
    private static function reason(string $scope, string $key): array {
        return ['scope' => $scope, 'text' => get_string($key, 'local_availabilityhelper')];
    }
}

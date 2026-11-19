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

use core_ai\aiactions\generate_text;
use core_ai\manager;

/** Builds a text-generation request from a bounded projection of the access paths. */
final class rule_explanation {
    /** @var array Fixed names allowed in prompts, independent of labels in the editor. */
    public const TYPES = [
        'completion' => 'activity completion condition',
        'coursecompleted' => 'course completion',
        'sectioncompleted' => 'section completion',
        'datefrom' => 'start date',
        'dateuntil' => 'end date',
        'date' => 'date',
        'relativedate' => 'relative date',
        'grade' => 'grade',
        'group' => 'group membership',
        'grouping' => 'grouping membership',
        'cohort' => 'cohort membership',
        'profile' => 'profile condition',
        'role' => 'role',
        'capability' => 'permission',
        'permissions' => 'permission',
        'certificateissued' => 'certificate status',
        'stash' => 'Stash item',
        'xp' => 'experience level',
        'other' => 'other condition',
    ];

    /** @var int Upper bound on route numbers in the branch analyser. */
    public const MAX_ROUTES = 24;

    /** @var int Total rule references across all submitted routes. */
    public const MAX_RULES = 96;

    /** Fixed semantics for completion conditions, without activity identifiers or labels. */
    private const COMPLETION_STATES = ['must be incomplete', 'must be complete', 'must be passed', 'must be failed'];

    /** Maximum number of distinct proposed changes. */
    private const MAX_SUGGESTIONS = 3;

    /** The editor AI action requires explicit opt-in, including on upgraded sites. */
    public static function enabled(): bool {
        return get_config('local_availabilityhelper', 'aienabled') === '1';
    }

    /** Provider instances are available from Moodle 5.0. */
    public static function supports_provider_selection(): bool {
        return method_exists(manager::class, 'get_sorted_providers');
    }

    /** Use the selected instance for this call, or the unmodified Core manager for automatic routing. */
    public static function manager_for_explanation(): manager {
        global $DB;

        $providerid = (int)get_config('local_availabilityhelper', 'aiproviderid');
        if ($providerid > 0 && self::supports_provider_selection()) {
            return new selected_provider_manager($DB, $providerid);
        }
        return \core\di::get(manager::class);
    }

    /** @return array Choices for the site administrator, including a retained unavailable selection. */
    public static function provider_choices(): array {
        $choices = [0 => get_string('aiproviderautomatic', 'local_availabilityhelper')];
        $manager = \core\di::get(manager::class);
        $providers = $manager->get_providers_for_actions([generate_text::class], true)[generate_text::class];
        foreach ($providers as $provider) {
            $choices[$provider->id] = format_string($provider->name, true, ['context' => \context_system::instance()]);
        }
        $selected = (int)get_config('local_availabilityhelper', 'aiproviderid');
        if ($selected > 0 && !isset($choices[$selected])) {
            $choices[$selected] = get_string('aiprovidermissing', 'local_availabilityhelper', $selected);
        }
        return $choices;
    }

    /** Check the editor permissions shared by the page and its AJAX endpoint. */
    public static function can_use(\context $context): bool {
        global $CFG;
        return !empty($CFG->enableavailability) && isloggedin() && !isguestuser()
            && ($context instanceof \context_module || $context instanceof \context_course)
            && has_capability('moodle/course:manageactivities', $context)
            && has_capability('local/availabilityhelper:explain', $context);
    }

    /** Follow the configured providers and any Moodle course and activity switches. */
    public static function available(manager $manager, \context $context): bool {
        return self::unavailable_reason($manager, $context) === null;
    }

    /** @return ?string Language key for the unavailable action, or null when it can run. */
    public static function unavailable_reason(manager $manager, \context $context): ?string {
        $action = generate_text::class;
        if (method_exists($manager, 'is_action_enabled_in_context') && !$manager->is_action_enabled_in_context($context, $action)) {
            return 'aicontextdisabled';
        }
        // Moodle 4.5 provides the provider lookup directly.
        $available = method_exists($manager, 'is_action_available')
            ? $manager->is_action_available($action)
            : !empty($manager->get_providers_for_actions([$action], true)[$action]);
        return $available ? null : 'aiproviderrequired';
    }

    /**
     * Validate the projection and render a prompt containing only fixed terms and rule references.
     *
     * @param array $routes Access routes and positions of conflicting rules
     * @param bool $partial Whether the detailed report covers only part of the rule set
     * @param \context $context Activity or course editor context
     * @param string $language Current Moodle language
     * @param bool $advice Whether to ask for possible fixes for demonstrated conflicts
     * @return string
     */
    public static function prompt(array $routes, bool $partial, \context $context, string $language, bool $advice = false): string {
        if (!$routes || count($routes) > self::MAX_ROUTES) {
            throw new \invalid_parameter_exception('Unexpected number of access paths.');
        }
        $lines = [];
        $previous = 0;
        $count = 0;
        $conflicts = false;
        $german = str_starts_with($language, 'de');
        $draft = $german ? 'Entwurf' : 'Draft';
        $section = $german ? 'Abschnitt' : 'Section';
        $way = $german ? 'Zugangsweg' : 'Path';
        foreach ($routes as $route) {
            $id = $route['number'];
            $rules = $route['rules'];
            $count += count($rules);
            if ($id <= $previous || $id > self::MAX_ROUTES || !$rules || $count > self::MAX_RULES) {
                throw new \invalid_parameter_exception('Invalid access path or rule limit exceeded.');
            }
            $previous = $id;
            $references = [];
            $descriptions = [];
            foreach ($rules as $index => $rule) {
                $kind = $rule['kind'];
                if (!isset(self::TYPES[$kind]) || !preg_match('/\A[1-9][0-9]{0,2}(?:\.[1-9][0-9]{0,2}){0,15}\z/', $rule['path'])) {
                    throw new \invalid_parameter_exception('Invalid rule kind or position.');
                }
                if ($rule['section']) {
                    require_capability('moodle/course:update', $context->get_course_context());
                }
                $reference = ($rule['section'] ? $section : $draft) . ' ' . $rule['path'];
                $references[] = $reference;
                $completionstate = $rule['completionstate'] ?? -1;
                if ($completionstate !== -1 && ($kind !== 'completion' || !isset(self::COMPLETION_STATES[$completionstate]))) {
                    throw new \invalid_parameter_exception('Invalid symbolic completion state.');
                }
                $predicate = self::TYPES[$kind];
                if ($advice && $completionstate !== -1) {
                    $predicate .= ', ' . self::COMPLETION_STATES[$completionstate];
                }
                $prefix = $advice ? ($index + 1) . '. ' : '';
                $descriptions[] = $prefix . $reference . ' (' . $predicate . ($rule['negated'] ? ', negated' : '') . ')';
            }
            $conflict = $route['conflict'];
            if ($conflict && (count($conflict) !== 2 || $conflict[0] === $conflict[1]
                    || !isset($references[$conflict[0]], $references[$conflict[1]]))) {
                throw new \invalid_parameter_exception('Invalid rule conflict.');
            }
            if ($conflict) {
                $conflicts = true;
                $pair = [$references[$conflict[0]], $references[$conflict[1]]];
                $reason = $german ? 'Konflikt zwischen ' . implode(' und ', $pair) : 'Conflict between ' . implode(' and ', $pair);
                $line = "{$way} {$id}: " . ($german ? 'Blockiert. ' : 'Blocked. ') . $reason . '.';
                if ($advice) {
                    $positions = [$conflict[0] + 1, $conflict[1] + 1];
                    $line .= ' Conflicting indices: ' . implode(', ', $positions) . '. ' . implode('; ', $descriptions) . '.';
                }
                $lines[] = $line;
                continue;
            }
            $required = $german ? 'Möglich. Alle Bedingungen müssen erfüllt sein' : 'Possible. All conditions must pass';
            $lines[] = "{$way} {$id}: {$required}. " . implode('; ', $descriptions) . '.';
        }
        $data = implode("\n", $lines);
        if ($advice) {
            if (!$conflicts) {
                throw new \invalid_parameter_exception('Suggestions require at least one conflicting pair.');
            }
            $replylanguage = $german ? 'German' : 'English';
            $coverage = $partial ? 'This is a partial view.' : '';
            return <<<PROMPT
                Help a Moodle course editor resolve a proven conflict. {$coverage}
                Infer plausible editor goals from the conditions. The actual goal, rule values, activity names and participant outcomes
                are unknown. Describe each goal as a hypothesis, without claiming it is intended or will make access possible.
                For opposed completion requirements, consider both goals: access before completion and access after completion.
                For each goal, choose which of the two conflicting rules should stay in that path. The UI will identify the other
                rule as the one to review. Do not propose any other edit or restate the conflict in the goal.
                Return only a JSON array with one to three distinct objects, for example [{"route":1,"keep":2,"intent":"…"}].
                Use the path number as route and the one-based index from its conflicting pair as keep. Use only blocked paths.
                Explain the possible goal in one {$replylanguage} sentence of at most 180 characters, without rule references.

                <access_paths>
                {$data}
                </access_paths>
                PROMPT;
        }
        if ($german) {
            $coverage = $partial ? 'Die Daten zeigen nur einen Teil der Regeln.' : '';
            return <<<PROMPT
                Erkläre auf Deutsch die unten aufgeführten Moodle-Zugangswege. {$coverage}
                Gib genau eine Zeile pro Zugangsweg aus. Übernimm ihren Anfang mit Nummer und „Blockiert“ oder „Möglich“.
                Verwende ausschließlich die unten genannten Wege und Regelpositionen.
                Die Wege sind Alternativen. Bei einem möglichen Weg müssen alle Regeln dieses Weges erfüllt sein.
                Nenne bei einem bewiesenen Konflikt beide Regelpositionen und sage, dass sie nicht gleichzeitig erfüllt sein können.
                Bei möglichen Wegen nenne die aufgeführten Regeltypen und sage, dass alle diese Voraussetzungen gelten.
                Übernimm die Regelpositionen mit „Entwurf“ oder „Abschnitt“. Erfinde keine genaueren Konfliktursachen,
                konkreten Regelwerte, Ziele oder tatsächlichen Zugangsentscheidungen für einzelne Konten.
                Verwende kurze Sätze und Klartext ohne Markdown, Einleitung, Schlussformel oder Änderungsvorschläge.

                Die folgende Liste enthält alle Zugangswege für diese Anfrage:
                <zugangswege>
                {$data}
                </zugangswege>
                Erkläre jetzt die Wege aus dieser Liste.
                PROMPT;
        }
        $coverage = $partial ? 'The data represents only part of the rule set.' : '';
        return <<<PROMPT
            Explain the listed Moodle access paths in English. {$coverage}
            Each path is an alternative. All rules within a possible path must pass.
            Return exactly one line per path. Copy its opening with the number and “Blocked” or “Possible”.
            Use only the listed paths and rule positions.
            For a proven conflict, cite both exact references and say that they cannot be met together.
            For possible paths, describe the listed condition types and say that all of them must pass.
            Actual values, rule targets and current participant outcomes are unavailable. Do not invent any of these or
            invent the specific cause of a conflict when only the conflicting pair is known.
            Use short sentences and plain text without Markdown, introductions, sign-offs or suggested changes.

            The access paths for this request are supplied here:
            <access_paths>
            {$data}
            </access_paths>
            Explain the paths from this list now.
            PROMPT;
    }

    /** Resolve model choices against the submitted pairs and derive the other rule on the server. */
    public static function checked_suggestions(string $content, array $routes): array {
        if (strlen($content) > 6000) {
            return [];
        }
        $content = preg_replace('/\A```(?:json)?\s*(.*?)\s*```\z/su', '$1', trim($content));
        $items = json_decode($content ?? '', true);
        if (!is_array($items) || !array_is_list($items) || count($items) > self::MAX_SUGGESTIONS) {
            return [];
        }
        $routes = array_column($routes, 'conflict', 'number');
        $result = [];
        foreach ($items as $item) {
            $route = $item['route'] ?? null;
            $keep = $item['keep'] ?? null;
            $intent = $item['intent'] ?? null;
            if (!is_int($route) || !is_int($keep) || $keep < 1 || $keep > self::MAX_RULES || !is_string($intent)) {
                continue;
            }
            $conflict = $routes[$route] ?? [];
            $other = array_values(array_diff($conflict, [$keep - 1]));
            $intent = trim($intent);
            if (count($conflict) !== 2 || count($other) !== 1 || $intent === '' || \core_text::strlen($intent) > 200
                    || preg_match('/[<>\p{C}]|\b(?:rule|restriction|draft|section|entwurf|voraussetzung|regel|abschnitt)\h+\d/iu', $intent)) {
                continue;
            }
            $result[$route . ':' . $keep] = ['route' => $route, 'keep' => $keep, 'change' => $other[0] + 1, 'intent' => $intent];
        }
        return array_values($result);
    }

    /**
     * Check that each generated paragraph refers to a supplied route and its known rule positions.
     *
     * @param string $content Generated text
     * @param array $routes The validated projection used for the prompt
     * @param string $language Current Moodle language
     * @return string|null The explanation, or null if its structure does not match the report
     */
    public static function checked_text(string $content, array $routes, string $language): ?string {
        $german = str_starts_with($language, 'de');
        $way = $german ? 'Zugangsweg' : 'Path';
        $draft = $german ? 'Entwurf' : 'Draft';
        $section = $german ? 'Abschnitt' : 'Section';
        if (\core_text::strlen($content) > 6000) {
            return null;
        }
        // Accept normal numbered lines as well as labelled paths, while discarding preambles and sign-offs.
        preg_match_all('/^\h*(?:(?:Zugangsweg|Weg|Path)\h+)?([0-9]+)[.:)]?\h+([^\r\n]+)/imu', $content, $matched);
        if (count($matched[0]) !== count($routes)) {
            return null;
        }
        $lines = [];
        foreach ($routes as $index => $route) {
            $line = trim($matched[2][$index]);
            $verdict = $route['conflict'] ? ($german ? 'Blockiert|Gesperrt' : 'Blocked') : ($german ? 'Möglich' : 'Possible');
            if ((int)$matched[1][$index] !== $route['number']
                    || !preg_match('/^(?:' . $verdict . ')\b.+/iu', $line)) {
                return null;
            }
            preg_match_all('/\b(?:Zugangsweg|Weg|Path) ([0-9]+)\b/iu', $line, $pathnumbers);
            if (array_diff($pathnumbers[1], [(string)$route['number']])) {
                return null;
            }
            $references = array_map(static fn(array $rule): string =>
                strtolower($rule['section'] ? $section : $draft) . ' ' . $rule['path'], $route['rules']);
            preg_match_all('/\b(?:' . $draft . '|' . $section . ') [0-9]+(?:\.[0-9]+)*/iu', $line, $mentioned);
            $positions = array_map('strtolower', $mentioned[0]);
            if (array_diff($positions, $references)) {
                return null;
            }
            foreach ($route['conflict'] as $position) {
                if (!in_array($references[$position], $positions, true)) {
                    return null;
                }
            }
            $lines[] = $way . ' ' . $route['number'] . ': ' . $line;
        }
        return implode("\n\n", $lines);
    }
}

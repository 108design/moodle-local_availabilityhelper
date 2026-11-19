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

use core_ai\manager;

/** Restrict a single manager instance to the site's selected AI provider. */
final class selected_provider_manager extends manager {
    /**
     * @param \moodle_database $db Moodle database
     * @param int $providerid Configured Moodle provider instance ID
     */
    public function __construct(\moodle_database $db, private readonly int $providerid) {
        parent::__construct($db);
    }

    /**
     * Let Moodle filter actions and process the request as usual with just this provider.
     *
     * @return array
     */
    public function get_sorted_providers(): array {
        return array_filter(parent::get_sorted_providers(), fn($provider): bool => (int)$provider->id === $this->providerid);
    }
}

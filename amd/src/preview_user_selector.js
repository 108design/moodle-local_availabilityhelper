/*
 * This file is part of Moodle - https://moodle.org/
 *
 * @copyright 2026 Andreas Giesen <andreas@108design.com>
 * @license   See LICENSE.md for the full terms.
 *
 * This file is part of a 108design source-available software product.
 *
 * Copyright (C) 2026 Andreas Giesen <andreas@108design.com>
 *
 * Use and modification are permitted only under the Software License included
 * with this distribution. See LICENSE.md for the full terms.
 */

import {call} from 'core/ajax';

/** @module local_availabilityhelper/preview_user_selector */

/**
 * Use the same course-scoped service for lookup and for the access check.
 *
 * @param {number} cmid Saved activity ID
 * @param {Object} data Search or participant arguments
 * @returns {Promise}
 */
export const load = (cmid, data) => call([{
    methodname: 'local_availabilityhelper_participant_preview',
    args: {cmid, ...data},
}])[0];

/**
 * Fetch actively enrolled accounts for the native Moodle autocomplete.
 *
 * @param {string} selector Original select element selector
 * @param {string} query Name entered
 * @param {Function} success Pass suggestions or a notice to Moodle
 * @returns {Promise<void>}
 */
export const transport = async(selector, query, success) => {
    const {cmid, searchShort, noMatches, searchFailed} = document.querySelector(selector).dataset;
    const search = query.trim();
    if (search.length < 2) {
        success(searchShort);
        return;
    }
    let response;
    try {
        response = await load(Number(cmid), {search});
    } catch {
        success(searchFailed);
        return;
    }
    success(response.users.length ? response.users : noMatches);
};

const escapeText = value => {
    const node = document.createElement('span');
    node.textContent = value;
    return node.innerHTML;
};

/**
 * Format plain text for the autocomplete API, which expects HTML labels and notices.
 *
 * @param {string} selector Original select element selector
 * @param {Array|string} results Matching accounts or a notice
 * @returns {Array|string}
 */
export const processResults = (selector, results) => {
    if (typeof results === 'string') {
        return escapeText(results);
    }
    return results.map(candidate => {
        const duplicate = results.some(other => other.id !== candidate.id && other.name === candidate.name);
        const label = duplicate ? `${candidate.name} (#${candidate.id})` : candidate.name;
        return {value: candidate.id, label: escapeText(label)};
    });
};

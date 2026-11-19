/*
 * This file is part of a 108design source-available software product.
 *
 * Copyright (C) 2026 Andreas Giesen <andreas@108design.com>
 *
 * Use and modification are permitted only under the Software License included
 * with this distribution. Redistribution and circumvention of Pro feature or
 * licensing restrictions are prohibited. See LICENSE.md for the full terms.
 */

/** @module local_availabilityhelper/rules */

/** Identifies a Moodle availability group. */
export const isGroup = node => Boolean(node && !node.type && Array.isArray(node.c) &&
    ['&', '|', '!&', '!|'].includes(node.op));

/** Mirrors the core tree's propagation of NOT to the children. */
export const groupLogic = (node, inheritedNot) => {
    const negated = inheritedNot !== node.op.startsWith('!');
    return {negated, and: node.op.endsWith('&') !== negated};
};

/** Orders configuration keys, preserving plugin-owned fields. */
export const conditionSignature = node => {
    // Moodle 5.3's date editor adds a row ID for its own conflict indicator.
    // The server's date condition stores only the direction and timestamp.
    if (node?.type === 'date' && Object.hasOwn(node, 'nodeUID')) {
        node = {...node};
        delete node.nodeUID;
    }
    return JSON.stringify(node, (key, value) => value && typeof value === 'object' && !Array.isArray(value) ?
        Object.fromEntries(Object.keys(value).sort().map(property => [property, value[property]])) : value);
};

/**
 * Whether reversing the inherited NOT always inverts the result.
 * Other conditions can accept or deny both polarities, for example because
 * of a missing reference or a capability override.
 */
export const hasBooleanNegation = node => isGroup(node) ?
    node.c.length > 0 && node.c.every(hasBooleanNegation) :
    ['date', 'grade', 'profile', 'cohort', 'language', 'role', 'user'].includes(node?.type);

/** Predicates with the same meaning in an activity and its section in one course. */
export const isCourseShared = node => [
    'date', 'grade', 'profile', 'group', 'cohort', 'language', 'role', 'user', 'coursecompleted', 'courseprogress',
    'sectioncompleted', 'stash', 'xp', 'relativedate', 'certificateissued',
].includes(node?.type) || (node?.type === 'completion' && Number.isInteger(node.cm) && node.cm > 0) ||
    (node?.type === 'grouping' && Number.isInteger(node.id) && node.id > 0);

/** Resolves a leaf through optional single-child groups. */
export const asLiteral = (node, negated = false) => {
    while (isGroup(node) && node.c.length === 1) {
        negated = groupLogic(node, negated).negated;
        [node] = node.c;
    }
    return typeof node?.type === 'string' ? {predicate: node, negated} : null;
};

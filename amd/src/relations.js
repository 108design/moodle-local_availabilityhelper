/*
 * This file is part of a 108design source-available software product.
 *
 * Copyright (C) 2026 Andreas Giesen <andreas@108design.com>
 *
 * Use and modification are permitted only under the Software License included
 * with this distribution. Redistribution and circumvention of Pro feature or
 * licensing restrictions are prohibited. See LICENSE.md for the full terms.
 */

/**
 * Conservative semantic relations for common availability predicates.
 *
 * This registry is deliberately independent from the editor adapter. Unknown
 * condition types simply return no relation and retain structural analysis.
 *
 * @module local_availabilityhelper/relations
 */

import {asLiteral} from './rules';

const sameProfileField = (left, right) => left.type === 'profile' && right.type === 'profile' &&
    ((left.sf !== undefined && left.sf === right.sf) || (left.cf !== undefined && left.cf === right.cf));

const nonempty = value => value !== '' && value !== '0';

const matches = (value, rule) => {
    switch (rule.op) {
        case 'isequalto':
            return value === rule.v;
        case 'contains':
            return value.includes(rule.v);
        case 'doesnotcontain':
            return !nonempty(rule.v) || !value.includes(rule.v);
        case 'startswith':
            return value.startsWith(rule.v);
        case 'endswith':
            // Core uses substr($value, -strlen($suffix)).
            return rule.v === '' ? value === '' : value.endsWith(rule.v);
        case 'isempty':
            return !nonempty(value);
        case 'isnotempty':
            return nonempty(value);
        default:
            return undefined;
    }
};

const profileImplies = (left, right) => {
    if (left.op === right.op && left.v === right.v) {
        return true;
    }
    if (left.op === 'isequalto') {
        return matches(left.v, right) === true;
    }
    if (['contains', 'startswith', 'endswith'].includes(left.op)) {
        if (right.op === 'contains') {
            return left.v.includes(right.v);
        }
        if (left.op === right.op) {
            return right.op === 'startswith' ? left.v.startsWith(right.v) :
                nonempty(left.v) && right.v !== '' && left.v.endsWith(right.v);
        }
        if (right.op === 'isnotempty') {
            return nonempty(left.v);
        }
    }
    if (left.op === 'doesnotcontain' && right.op === 'doesnotcontain') {
        return !nonempty(right.v) || (nonempty(left.v) && right.v.includes(left.v));
    }
    return false;
};

const profilesIncompatible = (left, right) => {
    if (left.op === 'isequalto') {
        return matches(left.v, right) === false;
    }
    if (right.op === 'isequalto') {
        return matches(right.v, left) === false;
    }
    if (right.op === 'doesnotcontain' && nonempty(right.v)) {
        return profileImplies(left, {...right, op: 'contains'});
    }
    if (left.op === 'doesnotcontain' && nonempty(left.v)) {
        return profileImplies(right, {...left, op: 'contains'});
    }
    return (left.op === 'isempty' && profileImplies(right, {...left, op: 'isnotempty'})) ||
        (right.op === 'isempty' && profileImplies(left, {...right, op: 'isnotempty'}));
};

const validProfile = rule => typeof rule.v === 'string' || ['isempty', 'isnotempty'].includes(rule.op);

const rangeRelation = (a, b, time = false) => ({
    leftImpliesRight: a[0] >= a[1] || (a[0] >= b[0] && a[1] <= b[1]),
    rightImpliesLeft: b[0] >= b[1] || (b[0] >= a[0] && b[1] <= a[1]),
    incompatible: Math.max(a[0], b[0]) >= Math.min(a[1], b[1]),
    exhaustive: time && Math.min(a[0], b[0]) === -Infinity && Math.max(a[1], b[1]) === Infinity &&
        Math.max(a[0], b[0]) <= Math.min(a[1], b[1]),
});

const dateRange = ({predicate, negated}) => {
    if (!Number.isSafeInteger(predicate.t) || !['>=', '<'].includes(predicate.d)) {
        return null;
    }
    const from = (predicate.d === '>=') !== negated;
    return from ? [predicate.t, Infinity] : [-Infinity, predicate.t];
};

const numeric = value => (typeof value === 'number' ||
    (typeof value === 'string' && /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim()))) &&
    Number.isFinite(Number(value));

const gradeRange = predicate => {
    if (![predicate.min, predicate.max].every(bound => bound == null || numeric(bound))) {
        return null;
    }
    return [predicate.min == null ? -Infinity : Number(predicate.min), predicate.max == null ? Infinity : Number(predicate.max)];
};

// Moodle's completion check groups Pass with Complete and Fail with Incomplete.
const COMPLETION_STATES = [[0, 3], [1, 2], [2], [3]];

const compareCompletion = (left, right) => {
    const {predicate: a} = left;
    const {predicate: b} = right;
    if (left.negated || right.negated || !Number.isInteger(a.cm) || a.cm !== b.cm) {
        return null;
    }
    const aStates = COMPLETION_STATES[a.e];
    const bStates = COMPLETION_STATES[b.e];
    if (!Array.isArray(aStates) || !Array.isArray(bStates)) {
        return null;
    }
    return {
        leftImpliesRight: aStates.every(state => bStates.includes(state)),
        rightImpliesLeft: bStates.every(state => aStates.includes(state)),
        incompatible: !aStates.some(state => bStates.includes(state)),
        // Missing references fail both tests.
        exhaustive: false,
    };
};

const signedRelation = (left, right, aImpliesB, bImpliesA, disjoint) => {
    if (left.negated && right.negated) {
        return {leftImpliesRight: bImpliesA, rightImpliesLeft: aImpliesB, incompatible: false, exhaustive: disjoint};
    }
    if (left.negated) {
        return {leftImpliesRight: false, rightImpliesLeft: disjoint, incompatible: bImpliesA, exhaustive: aImpliesB};
    }
    if (right.negated) {
        return {leftImpliesRight: disjoint, rightImpliesLeft: false, incompatible: aImpliesB, exhaustive: bImpliesA};
    }
    return {leftImpliesRight: aImpliesB, rightImpliesLeft: bImpliesA, incompatible: disjoint, exhaustive: false};
};

const compareProfiles = (left, right) => {
    const a = left.predicate;
    const b = right.predicate;
    if (!sameProfileField(a, b) || !validProfile(a) || !validProfile(b)) {
        return null;
    }

    // Moodle's outer NOT flips the actual result. A missing field can fail
    // both positive operators, even for contains and doesnotcontain.
    return signedRelation(left, right, profileImplies(a, b), profileImplies(b, a), profilesIncompatible(a, b));
};

const positiveInteger = value => Number.isSafeInteger(value) && value > 0;

const thresholdRelation = (a, b) => ({
    leftImpliesRight: a >= b, rightImpliesLeft: b >= a, incompatible: false, exhaustive: false,
});

const userIds = rule => {
    const ids = [...(Array.isArray(rule.userids) ? rule.userids : [])];
    if (rule.userid !== undefined) {
        ids.push(rule.userid);
    }
    if (!ids.length || (rule.userids !== undefined && !Array.isArray(rule.userids)) ||
        !ids.every(id => numeric(id) && positiveInteger(Number(id)))) {
        return null;
    }
    return new Set(ids.map(Number));
};

const stashRange = rule => {
    const count = Number(rule.quantity);
    if (!numeric(rule.quantity) || !Number.isSafeInteger(count) || count < 0 || count === Number.MAX_SAFE_INTEGER) {
        return null;
    }
    switch (rule.condition) {
        case '==': return [count, count + 1];
        case '<': return [-Infinity, count];
        case '>': return [count + 1, Infinity];
        default: return null;
    }
};

const xpRange = rule => {
    const level = Number(rule.requiredlvl);
    if (!numeric(rule.requiredlvl) || !positiveInteger(level) || level === Number.MAX_SAFE_INTEGER) {
        return null;
    }
    const operator = rule.operator ?? 0;
    if (![0, '0', 1, '1'].includes(operator)) {
        return null;
    }
    return [level, Number(operator) === 1 ? level + 1 : Infinity];
};

const sectionThreshold = rule =>
    Number.isSafeInteger(rule.m) && rule.m >= 0 ? rule.m || Infinity : null;

const certificateMatches = (a, b) => {
    const sameReference = ['templateid', 'site', 'boundcourse', 'binding', 'scope'].every(key => a[key] === b[key]);
    const valid = rule => typeof rule.received === 'boolean' && ['all', 'valid', 'expired'].includes(rule.validity) &&
        ['all', 'current', 'archived'].includes(rule.archive);
    if (!sameReference || !positiveInteger(a.templateid) || !positiveInteger(a.boundcourse) ||
        !['course', 'any'].includes(a.scope) || !/^[a-f0-9]{64}$/.test(a.site) || !/^[a-f0-9]{64}$/.test(a.binding) ||
        !valid(a) || !valid(b)) {
        return null;
    }
    const subset = (x, y) => ['validity', 'archive'].every(key => x[key] === y[key] || y[key] === 'all');
    // Existence of an issue in a narrower set implies existence in a wider set.
    // Opposite filters alone do not conflict: two different issues may match.
    return {
        ...signedRelation({negated: !a.received}, {negated: !b.received}, subset(a, b), subset(b, a), false),
        exhaustive: false,
    };
};

const compareExtension = (a, b, left, right) => {
    if (a.type === 'user') {
        const aa = userIds(a);
        const bb = userIds(b);
        if (!aa || !bb) {
            return null;
        }
        return signedRelation(left, right, [...aa].every(id => bb.has(id)), [...bb].every(id => aa.has(id)),
            ![...aa].some(id => bb.has(id)));
    }
    if (left.negated || right.negated) {
        // These plugins may bypass the normal NOT for missing data or special cases.
        return null;
    }
    switch (a.type) {
        case 'certificateissued':
            return certificateMatches(a, b);
        case 'coursecompleted': {
            const flags = [true, false, 0, 1];
            const course = a.courseid ?? 0;
            if (!Number.isSafeInteger(course) || course < 0 || course !== (b.courseid ?? 0) ||
                !flags.includes(a.id) || !flags.includes(b.id)) {
                return null;
            }
            const same = Boolean(a.id) === Boolean(b.id);
            return {leftImpliesRight: same, rightImpliesLeft: same, incompatible: !same, exhaustive: false};
        }
        case 'sectioncompleted': {
            const minA = sectionThreshold(a);
            const minB = sectionThreshold(b);
            return positiveInteger(a.id) && a.id === b.id && a.e === b.e && ['complete', 'pass', 'fail'].includes(a.e) &&
                minA !== null && minB !== null ? thresholdRelation(minA, minB) : null;
        }
        case 'xp': {
            const aa = xpRange(a);
            const bb = xpRange(b);
            return aa && bb ? rangeRelation(aa, bb) : null;
        }
        case 'stash': {
            const aa = stashRange(a);
            const bb = stashRange(b);
            return positiveInteger(a.objectid) && a.objectid === b.objectid && aa && bb ? rangeRelation(aa, bb) : null;
        }
        case 'courseprogress':
            return [a.courseprogress, b.courseprogress].every(v => numeric(v) && Number(v) >= 0 && Number(v) <= 100) ?
                thresholdRelation(Number(a.courseprogress), Number(b.courseprogress)) : null;
        default:
            return null;
    }
};

/**
 * Compares sibling expressions with their effective Moodle negation.
 *
 * @param {Object} leftNode First expression
 * @param {Object} rightNode Second expression
 * @param {boolean} inheritedNot Whether the parent passes NOT to the children
 * @returns {{leftImpliesRight: boolean, rightImpliesLeft: boolean,
 *     incompatible: boolean, exhaustive: boolean}|null}
 */
export const compare = (leftNode, rightNode, inheritedNot = false) => {
    const left = asLiteral(leftNode, inheritedNot);
    const right = asLiteral(rightNode, inheritedNot);
    if (!left || !right || left.predicate.type !== right.predicate.type) {
        return null;
    }
    if (left.predicate.type === 'profile') {
        return compareProfiles(left, right);
    }
    if (left.predicate.type === 'date') {
        const a = dateRange(left);
        const b = dateRange(right);
        return a && b ? rangeRelation(a, b, true) : null;
    }
    if (left.predicate.type === 'grade' && Number.isInteger(left.predicate.id) && left.predicate.id === right.predicate.id) {
        const a = gradeRange(left.predicate);
        const b = gradeRange(right.predicate);
        if (!a || !b) {
            return null;
        }
        const relation = rangeRelation(a, b);
        return signedRelation(left, right, relation.leftImpliesRight, relation.rightImpliesLeft, relation.incompatible);
    }
    if (left.predicate.type === 'completion') {
        return compareCompletion(left, right);
    }
    return compareExtension(left.predicate, right.predicate, left, right);
};

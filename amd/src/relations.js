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

const unwrap = node => {
    let current = node;
    let negated = false;
    while (current && Array.isArray(current.c) && current.c.length === 1) {
        negated = negated !== current.op.startsWith('!');
        current = current.c[0];
    }
    if (!current || Array.isArray(current.c) || typeof current.type !== 'string') {
        return null;
    }
    return {predicate: current, negated};
};

const complementProfileOperator = operator => ({
    contains: 'doesnotcontain',
    doesnotcontain: 'contains',
    isempty: 'isnotempty',
    isnotempty: 'isempty',
})[operator] || null;

const normaliseProfile = literal => {
    if (!literal || literal.predicate.type !== 'profile') {
        return null;
    }
    const result = {...literal.predicate};
    let negated = literal.negated;
    if (negated) {
        const complement = complementProfileOperator(result.op);
        if (complement) {
            result.op = complement;
            negated = false;
        }
    }
    return {predicate: result, negated};
};

const sameProfileField = (left, right) =>
    left.type === 'profile' && right.type === 'profile' &&
    ((left.sf !== undefined && left.sf === right.sf) ||
        (left.cf !== undefined && left.cf === right.cf));

const definitelyNotEmpty = value => value !== '' && value !== '0';

const profileImplies = (leftLiteral, rightLiteral) => {
    const leftNormal = normaliseProfile(leftLiteral);
    const rightNormal = normaliseProfile(rightLiteral);
    if (!leftNormal || !rightNormal || leftNormal.negated || rightNormal.negated) {
        return false;
    }
    const left = leftNormal.predicate;
    const right = rightNormal.predicate;
    if (!sameProfileField(left, right)) {
        return false;
    }

    if (left.op === right.op && left.v === right.v) {
        return true;
    }
    if (left.op === 'isequalto') {
        if (right.op === 'contains') {
            return left.v.includes(right.v);
        }
        if (right.op === 'doesnotcontain') {
            return right.v === '' || !left.v.includes(right.v);
        }
        if (right.op === 'startswith') {
            return left.v.startsWith(right.v);
        }
        if (right.op === 'endswith') {
            return left.v.endsWith(right.v);
        }
        if (right.op === 'isnotempty') {
            return definitelyNotEmpty(left.v);
        }
    }
    if (left.op === 'contains') {
        if (right.op === 'contains') {
            return left.v.includes(right.v);
        }
        if (right.op === 'isnotempty') {
            return definitelyNotEmpty(left.v);
        }
    }
    if (left.op === 'doesnotcontain' && right.op === 'doesnotcontain') {
        return right.v.includes(left.v);
    }
    if (left.op === 'startswith') {
        if (right.op === 'startswith') {
            return left.v.startsWith(right.v);
        }
        if (right.op === 'contains') {
            return left.v.includes(right.v);
        }
        if (right.op === 'isnotempty') {
            return definitelyNotEmpty(left.v);
        }
    }
    if (left.op === 'endswith') {
        if (right.op === 'endswith') {
            return left.v.endsWith(right.v);
        }
        if (right.op === 'contains') {
            return left.v.includes(right.v);
        }
        if (right.op === 'isnotempty') {
            return definitelyNotEmpty(left.v);
        }
    }
    return false;
};

const complementLiteral = literal => ({predicate: literal.predicate, negated: !literal.negated});

const cohortImplies = (left, right) => {
    if (!left || !right || left.predicate.type !== 'cohort' || right.predicate.type !== 'cohort') {
        return false;
    }
    const leftAny = left.predicate.id === undefined;
    const rightAny = right.predicate.id === undefined;
    if (left.negated === right.negated && leftAny === rightAny &&
            (leftAny || left.predicate.id === right.predicate.id)) {
        return true;
    }
    if (!left.negated && !right.negated) {
        return !leftAny && rightAny;
    }
    if (left.negated && right.negated) {
        return leftAny && !rightAny;
    }
    return false;
};

const implies = (left, right) => profileImplies(left, right) || cohortImplies(left, right);

const incompatibleProfiles = (leftLiteral, rightLiteral) => {
    const leftNormal = normaliseProfile(leftLiteral);
    const rightNormal = normaliseProfile(rightLiteral);
    if (!leftNormal || !rightNormal || leftNormal.negated || rightNormal.negated) {
        return false;
    }
    const left = leftNormal.predicate;
    const right = rightNormal.predicate;
    if (!sameProfileField(left, right)) {
        return false;
    }
    if (left.op === 'isequalto' && right.op === 'isequalto') {
        return left.v !== right.v;
    }
    return profileImplies(leftNormal, complementLiteral(rightNormal)) ||
        profileImplies(rightNormal, complementLiteral(leftNormal));
};

/**
 * Compares two sibling expressions.
 *
 * @param {Object} leftNode First expression
 * @param {Object} rightNode Second expression
 * @returns {{leftImpliesRight: boolean, rightImpliesLeft: boolean,
 *     incompatible: boolean, exhaustive: boolean}|null}
 */
export const compare = (leftNode, rightNode) => {
    const left = unwrap(leftNode);
    const right = unwrap(rightNode);
    if (!left || !right || left.predicate.type !== right.predicate.type) {
        return null;
    }
    if (!['profile', 'cohort'].includes(left.predicate.type)) {
        return null;
    }

    const leftImpliesRight = implies(left, right);
    const rightImpliesLeft = implies(right, left);
    const incompatible = incompatibleProfiles(left, right) ||
        implies(left, complementLiteral(right)) || implies(right, complementLiteral(left));
    const exhaustive = implies(complementLiteral(left), right) &&
        implies(complementLiteral(right), left);

    return {leftImpliesRight, rightImpliesLeft, incompatible, exhaustive};
};


/*
 * This file is part of a 108design source-available software product.
 *
 * Copyright (C) 2026 Andreas Giesen <andreas@108design.com>
 *
 * Use and modification are permitted only under the Software License included
 * with this distribution. See LICENSE.md for the full terms.
 */

import {compare} from './relations';
import {conditionSignature, groupLogic, hasBooleanNegation, isCourseShared, isGroup} from './rules';

/** @module local_availabilityhelper/model */

const MAX_ATOMS = 80;
const MAX_NODES = 240;
const SEARCH_STEPS = 8192;

const hasGuardedNegation = node => {
    if (node?.type === 'relativedate') {
        return Number.isSafeInteger(node.n) && [0, 1, 2, 3, 4, 5].includes(node.d) &&
            [1, 2, 3, 4, 5, 6, 7].includes(node.s) && (node.s !== 7 || Number.isSafeInteger(node.m) && node.m > 0);
    }
    return ['certificateissued', 'coursecompleted', 'stash', 'xp'].includes(node?.type) && compare(node, node) !== null;
};

const compareAtoms = (left, right) => {
    if (left.scope !== right.scope) {
        return null;
    }
    if (left.negated || right.negated) {
        // A missing reference can make both polarities false. For identical settings these conditions
        // still cannot both pass. Other plugins may return true for both or implement NOT differently.
        if (left.negated !== right.negated &&
            conditionSignature(left.node) === conditionSignature(right.node) && hasGuardedNegation(left.node)) {
            return {incompatible: true, exhaustive: false, leftImpliesRight: false, rightImpliesLeft: false};
        }
        return null;
    }
    return compare(left.node, right.node);
};

const pairAllowed = (relation, left, right) => {
    if (left === right) {
        return left ? !relation.incompatible : !relation.exhaustive;
    }
    return left ? !relation.leftImpliesRight : !relation.rightImpliesLeft;
};

/** Compiles the editor tree and the known relations shared by proofs and scenarios. */
export const compile = (tree, scoped = false) => {
    const atoms = [];
    const indexes = new Map();
    let nodes = 0;
    const visit = (node, path, inheritedNot) => {
        nodes++;
        if (isGroup(node)) {
            if (!node.c.length) {
                return {children: [], and: true};
            }
            const {negated, and} = groupLogic(node, inheritedNot);
            return {and, children: node.c.map((child, index) => visit(child, [...path, index], negated))};
        }

        // Without a proven inverse, both polarities get independent variables.
        const invert = inheritedNot && hasBooleanNegation(node);
        const negated = inheritedNot && !invert;
        const scope = scoped && !isCourseShared(node) ? path[0] : null;
        const key = JSON.stringify([scope, negated, conditionSignature(node)]);
        if (!indexes.has(key)) {
            indexes.set(key, atoms.length);
            atoms.push({node, path, negated, scope});
        }
        return {index: indexes.get(key), invert, node, path, negated: inheritedNot};
    };
    const root = visit(tree, [], false);
    const limited = atoms.length > MAX_ATOMS || nodes > MAX_NODES;
    const relations = atoms.map((right, index) => {
        const entries = [];
        if (limited) {
            return entries;
        }
        for (let left = 0; left < index; left++) {
            const relation = compareAtoms(atoms[left], right);
            if (relation) {
                entries.push({left, relation});
            }
        }
        return entries;
    });
    return {root, atoms, relations, limited};
};

/** Evaluates a complete or partial assignment. An unset outcome is undefined. */
export const evaluate = (node, values) => {
    if (!node.children) {
        const value = values[node.index];
        return value === undefined ? undefined : value !== node.invert;
    }

    let pending = false;
    for (const child of node.children) {
        const result = evaluate(child, values);
        if (result === undefined) {
            pending = true;
        } else if (result !== node.and) {
            return result;
        }
    }
    return pending ? undefined : node.and;
};

/** Tests the constraints closed by the assignment at this index. */
const acceptsAt = (relations, values, index) => relations[index].every(({left, relation}) =>
    pairAllowed(relation, values[left], values[index]));

export const isConsistent = (model, values) =>
    model.relations.every((unused, index) => acceptsAt(model.relations, values, index));

/** Finds the two rules that forbid the required assignments of this access path. */
export const conflictingRules = (model, leaves) => {
    const assigned = new Map();
    for (const leaf of leaves) {
        const earlier = assigned.get(leaf.index);
        if (earlier && earlier.invert !== leaf.invert) {
            return [earlier, leaf];
        }
        assigned.set(leaf.index, earlier ?? leaf);
    }
    for (const [index, right] of assigned) {
        for (const {left, relation} of model.relations[index]) {
            const other = assigned.get(left);
            if (other && !pairAllowed(relation, !other.invert, !right.invert)) {
                return [other, right];
            }
        }
    }
    return null;
};

/**
 * Checks whether the requested outcome has a witness in the model.
 * Returns undefined if the budget was exhausted. The model can overapproximate
 * real Moodle outcomes, so only a ruled-out outcome proves a finding.
 */
const search = (model, expected) => {
    const values = [];
    let remaining = SEARCH_STEPS;
    const visit = index => {
        if (--remaining < 0) {
            return undefined;
        }
        const outcome = evaluate(model.root, values);
        if (outcome !== undefined && outcome !== expected) {
            return false;
        }
        if (index === model.atoms.length) {
            return true;
        }
        for (const value of [expected, !expected]) {
            values[index] = value;
            if (acceptsAt(model.relations, values, index)) {
                const found = visit(index + 1);
                if (found !== false) {
                    return found;
                }
            }
            values.length = index;
        }
        return false;
    };
    return visit(0);
};

/** Proves whole-tree results within a bounded amount of browser work. */
export const prove = tree => {
    const model = compile(tree);
    if (model.limited) {
        return {state: 'possible', limited: true};
    }
    const passes = search(model, true);
    const blocks = search(model, false);
    if (passes === false && blocks === true) {
        return {state: 'never', limited: false};
    }
    if (blocks === false && passes === true) {
        return {state: 'always', limited: false};
    }
    return {state: 'possible', limited: passes === undefined || blocks === undefined};
};

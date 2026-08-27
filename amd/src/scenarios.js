/*
 * This file is part of a 108design source-available software product.
 *
 * Copyright (C) 2026 Andreas Giesen <andreas@108design.com>
 *
 * Use and modification are permitted only under the Software License included
 * with this distribution. Redistribution and circumvention of Pro feature or
 * licensing restrictions are prohibited. See LICENSE.md for the full terms.
 */

import {compare} from './relations';

/**
 * Builds abstract truth-table scenarios for an availability tree.
 *
 * @module local_availabilityhelper/scenarios
 */

const PRESENTATION_KEYS = new Set(['errors', 'show', 'showc']);
const FULL_TABLE_LIMIT = 4;

const stableValue = value => {
    if (Array.isArray(value)) {
        return value.map(stableValue);
    }
    if (value && typeof value === 'object') {
        return Object.keys(value)
            .filter(key => !PRESENTATION_KEYS.has(key))
            .sort()
            .reduce((result, key) => {
                result[key] = stableValue(value[key]);
                return result;
            }, {});
    }
    return value;
};

const signature = node => JSON.stringify(stableValue(node));

const collectAtoms = (node, path, atoms, indexes) => {
    if (!node || !Array.isArray(node.c)) {
        const key = signature(node);
        if (!indexes.has(key)) {
            indexes.set(key, atoms.length);
            atoms.push({node, path, key});
        }
        return;
    }
    node.c.forEach((child, index) => collectAtoms(child, [...path, index], atoms, indexes));
};

const evaluate = (node, values, indexes) => {
    if (!node || !Array.isArray(node.c)) {
        return values[indexes.get(signature(node))];
    }
    const operator = node.op.replace('!', '') === '|' ? 'or' : 'and';
    let result = operator === 'and' ? node.c.every(child => evaluate(child, values, indexes)) :
        node.c.some(child => evaluate(child, values, indexes));
    if (node.op.startsWith('!')) {
        result = !result;
    }
    return result;
};

const isConsistent = (atoms, values) => {
    for (let left = 0; left < atoms.length; left++) {
        for (let right = left + 1; right < atoms.length; right++) {
            const relation = compare(atoms[left].node, atoms[right].node);
            if (!relation) {
                continue;
            }
            if (relation.incompatible && values[left] && values[right]) {
                return false;
            }
            if (relation.exhaustive && !values[left] && !values[right]) {
                return false;
            }
            if (relation.leftImpliesRight && values[left] && !values[right]) {
                return false;
            }
            if (relation.rightImpliesLeft && values[right] && !values[left]) {
                return false;
            }
        }
    }
    return true;
};

const allAssignments = count => Array.from({length: 2 ** count}, (_, number) =>
    Array.from({length: count}, (alsoUnused, index) => Boolean(number & (1 << index))));

const representativeAssignments = count => {
    const rows = [Array(count).fill(false), Array(count).fill(true)];
    for (let index = 0; index < count; index++) {
        const only = Array(count).fill(false);
        only[index] = true;
        rows.push(only);
        const except = Array(count).fill(true);
        except[index] = false;
        rows.push(except);
    }
    const seen = new Set();
    return rows.filter(values => {
        const key = values.map(Number).join('');
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
};

/**
 * Creates a complete or representative abstract scenario overview.
 *
 * @param {Object} tree Availability tree
 * @returns {{atoms: Array, rows: Array, complete: boolean, filtered: boolean}}
 */
export const create = tree => {
    const atoms = [];
    const indexes = new Map();
    collectAtoms(tree, [], atoms, indexes);
    if (!atoms.length) {
        return {atoms, rows: [], complete: true, filtered: false};
    }

    const complete = atoms.length <= FULL_TABLE_LIMIT;
    const assignments = complete ? allAssignments(atoms.length) : representativeAssignments(atoms.length);
    const consistent = assignments.filter(values => isConsistent(atoms, values));
    const rows = consistent.map(values => ({values, result: evaluate(tree, values, indexes)}));
    return {atoms, rows, complete, filtered: consistent.length !== assignments.length};
};

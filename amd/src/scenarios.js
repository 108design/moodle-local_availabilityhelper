/*
 * This file is part of a 108design source-available software product.
 *
 * Copyright (C) 2026 Andreas Giesen <andreas@108design.com>
 *
 * Use and modification are permitted only under the Software License included
 * with this distribution. Redistribution and circumvention of Pro feature or
 * licensing restrictions are prohibited. See LICENSE.md for the full terms.
 */

import {compile, evaluate, isConsistent} from './model';

/**
 * Builds abstract truth-table scenarios for an availability tree.
 *
 * @module local_availabilityhelper/scenarios
 */

const FULL_TABLE_LIMIT = 4;
const REPRESENTATIVE_PREDICATE_LIMIT = 24;

const allAssignments = count => Array.from({length: 2 ** count}, (_, number) =>
    Array.from({length: count}, (alsoUnused, index) => Boolean(number & (1 << index))));

const representativeAssignments = count => {
    const rows = [Array(count).fill(false), Array(count).fill(true)];
    for (let index = 0; index < Math.min(count, REPRESENTATIVE_PREDICATE_LIMIT); index++) {
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
    const model = compile(tree);
    const {atoms} = model;
    if (!atoms.length) {
        return {atoms, rows: [], complete: true, filtered: false};
    }

    const complete = atoms.length <= FULL_TABLE_LIMIT;
    const assignments = complete ? allAssignments(atoms.length) : representativeAssignments(atoms.length);
    const consistent = assignments.filter(values => isConsistent(model, values));
    const rows = consistent.map(values => ({values, result: evaluate(model.root, values)}));
    return {atoms, rows, complete, filtered: consistent.length !== assignments.length};
};

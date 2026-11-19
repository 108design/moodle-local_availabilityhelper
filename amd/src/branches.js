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

import {compile, conflictingRules} from './model';
import {isGroup} from './rules';

const ROUTE_LIMIT = 24;

/**
 * Enumerate sufficient combinations. Each OR contributes alternatives, while AND combines required leaves.
 *
 * @param {Object} node Compiled expression
 * @param {Object} budget Shared truncation flag
 * @returns {Array}
 */
const paths = (node, budget) => {
    if (!node.children) {
        return [[node]];
    }
    if (!node.and) {
        const alternatives = [];
        for (const [index, child] of node.children.entries()) {
            const next = paths(child, budget);
            const remaining = ROUTE_LIMIT - alternatives.length;
            alternatives.push(...next.slice(0, remaining));
            if (alternatives.length === ROUTE_LIMIT) {
                budget.limited ||= next.length > remaining || index < node.children.length - 1;
                break;
            }
        }
        return alternatives;
    }
    let result = [[]];
    for (const child of node.children) {
        const next = paths(child, budget);
        const product = [];
        budget.limited ||= result.length * next.length > ROUTE_LIMIT;
        for (const prefix of result) {
            for (const suffix of next) {
                if (product.length === ROUTE_LIMIT) {
                    break;
                }
                product.push([...prefix, ...suffix]);
            }
        }
        result = product;
    }
    return result;
};

/**
 * Compare a live draft with the saved containing section, without evaluating either for a user.
 *
 * @param {Object} draft Live activity or section draft
 * @param {?Object} section Saved section context, or null in the section editor
 * @returns {Object}
 */
export const analyseBranches = (draft, section) => {
    const combined = isGroup(section?.tree) && section.tree.c.length > 0;
    const emptyNested = (node, root = false) => isGroup(node) &&
        ((!root && !node.c.length) || node.c.some(child => emptyNested(child)));
    if (emptyNested(draft, true) || (combined && emptyNested(section.tree, true))) {
        return {routes: [], limited: false, combined, invalid: true};
    }
    const model = compile({op: '&', c: combined ? [draft, section.tree] : [draft]}, true);
    if (model.limited) {
        return {routes: [], limited: true, combined};
    }
    const budget = {limited: false};
    const toRule = leaf => ({scope: leaf.path[0], path: leaf.path.slice(1), node: leaf.node, negated: leaf.negated});
    const routes = paths(model.root, budget).filter(leaves => leaves.length).map(leaves => {
        const rules = leaves.map(toRule);
        const conflict = conflictingRules(model, leaves)?.map(leaf => rules[leaves.indexOf(leaf)]) ?? null;
        return {rules, conflict};
    });
    return {routes, limited: budget.limited, combined};
};

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
 * Conservative, condition-type-independent availability tree analyser.
 *
 * @module local_availabilityhelper/analyzer
 */

import {compare} from './relations';
import {asLiteral, conditionSignature, groupLogic, hasBooleanNegation, isGroup} from './rules';
import {prove} from './model';

const allRulesRemainVisible = tree => {
    if (!isGroup(tree) || !tree.c.length) {
        return false;
    }
    if (tree.op === '&' || tree.op === '!|') {
        return Array.isArray(tree.showc) && tree.showc.length === tree.c.length && tree.showc.every(show => show === true);
    }
    return tree.show === true;
};

const expression = (node, inheritedNot) => {
    if (!isGroup(node)) {
        return JSON.stringify([inheritedNot, conditionSignature(node)]);
    }
    if (!node.c.length) {
        return 'empty';
    }
    const {negated, and} = groupLogic(node, inheritedNot);
    return node.c.length === 1 ? expression(node.c[0], negated) :
        `[${and},${node.c.map(child => expression(child, negated)).sort().join(',')}]`;
};

const addFinding = (findings, code, severity, path, relatedPaths) => {
    const finding = {code, severity, path};
    if (relatedPaths) {
        finding.relatedPaths = relatedPaths;
    }
    findings.push(finding);
};

const analyseNode = (node, path, findings, root = false, inheritedNot = false) => {
    if (!isGroup(node)) {
        return 'possible';
    }

    const {negated, and} = groupLogic(node, inheritedNot);
    const ownNegation = node.op.startsWith('!');
    const children = node.c;

    if (children.length === 0) {
        if (!root) {
            addFinding(findings, 'emptygroup', 'danger', path);
            return 'invalid';
        }
        return 'possible';
    }

    if (!ownNegation && children.length === 1 && !root) {
        addFinding(findings, 'redundantgroup', 'warning', path);
    }
    if (ownNegation && children.length > 1) {
        addFinding(findings, 'tipnegatedgroup', 'tip', path);
    }
    if (ownNegation && children.some(child => isGroup(child) && child.op.startsWith('!'))) {
        addFinding(findings, 'tipdoublenegation', 'tip', path);
    }

    const literals = children.map(child => asLiteral(child, negated));
    const specificCohorts = literals.filter(item => item && !item.negated &&
        item.predicate.type === 'cohort' && item.predicate.id !== undefined);
    if (and && specificCohorts.length > 1) {
        addFinding(findings, 'tipallcohorts', 'tip', path);
    }

    const states = children.map((child, index) => analyseNode(child, [...path, index], findings, false, negated));
    const seen = new Map();
    const redundant = new Set();
    let complementPair = null;
    let semanticContradictionPair = null;
    let semanticTautologyPair = null;

    children.forEach((child, index) => {
        const opposite = hasBooleanNegation(child) ? seen.get(expression(child, !negated)) : undefined;
        if (opposite !== undefined && !complementPair) {
            complementPair = [opposite, index];
        }
        const key = expression(child, negated);
        if (seen.has(key)) {
            addFinding(findings, 'duplicate', 'warning', [...path, index]);
        } else {
            seen.set(key, index);
        }
    });

    for (let leftIndex = 0; leftIndex < children.length; leftIndex++) {
        for (let rightIndex = leftIndex + 1; rightIndex < children.length; rightIndex++) {
            const relation = compare(children[leftIndex], children[rightIndex], negated);
            if (!relation) {
                continue;
            }
            if (relation.incompatible && !semanticContradictionPair) {
                semanticContradictionPair = [leftIndex, rightIndex];
            }
            if (relation.exhaustive && !semanticTautologyPair) {
                semanticTautologyPair = [leftIndex, rightIndex];
            }
            if (and) {
                if (relation.leftImpliesRight) {
                    redundant.add(rightIndex);
                } else if (relation.rightImpliesLeft) {
                    redundant.add(leftIndex);
                }
            } else if (relation.leftImpliesRight) {
                redundant.add(leftIndex);
            } else if (relation.rightImpliesLeft) {
                redundant.add(rightIndex);
            }
        }
    }
    redundant.forEach(index => addFinding(findings, 'semanticredundant', 'warning', [...path, index]));

    let state = 'possible';
    const pair = complementPair || (and ? semanticContradictionPair : semanticTautologyPair);
    if (pair) {
        state = and ? 'never' : 'always';
        let code = and ? 'contradiction' : 'tautology';
        if (!complementPair) {
            code = and ? 'semanticcontradiction' : 'semantictautology';
        }
        const relatedPaths = pair.map(index => [...path, index]);
        addFinding(findings, code, 'danger', path, relatedPaths);
    } else if (and && states.includes('never')) {
        state = 'never';
    } else if (!and && states.includes('always')) {
        state = 'always';
    } else if (states.every(childState => childState === 'always')) {
        state = 'always';
    } else if (states.every(childState => childState === 'never')) {
        state = 'never';
    } else if (states.includes('invalid')) {
        state = 'invalid';
    }

    return state;
};

/**
 * Analyses an availability JSON tree.
 *
 * @param {Object} tree Availability tree
 * @param {{contentvisiblewhenunavailable?: boolean, inputErrors?: Array}} options Editor context
 * @returns {{state: string, findings: Array, incomplete: boolean}}
 */
export const analyse = (tree, options = {}) => {
    const findings = [];
    // The Core date conflict describes a complete set of dates. Check that
    // tree too. Other editor errors can indicate missing or invalid values.
    const errors = (Array.isArray(tree?.errors) ? tree.errors : [])
        .filter(error => error !== 'availability_date:error_dateconflict');
    const incomplete = errors.length > 0;

    if (incomplete) {
        const pending = [...errors];
        let pendingInput = false;
        const codes = {
            'availability_grade:error_backwardrange': 'graderange',
            'availability_grade:error_invalidnumber': 'gradevalue',
            'availability_grade:error_selectgradeid': 'gradeitem',
        };
        const inputMessages = {
            'availability:error_list_nochildren': 'emptygroup',
            'availability_completion:error_selectcmid': 'completionitem',
        };
        for (const {path, code, deferred} of options.inputErrors ?? []) {
            const index = pending.indexOf(code);
            if (index < 0) {
                continue;
            }
            pending.splice(index, 1);
            if (deferred) {
                pendingInput = true;
                continue;
            }
            const kind = codes[code] ?? inputMessages[code] ?? 'invalidrule';
            const rule = path.reduce((node, position) => node?.c?.[position], tree);
            findings.push({code: kind, severity: codes[code] ? 'danger' : 'warning', path, rule});
        }
        if (pending.length) {
            findings.push({code: 'incomplete', severity: 'warning', path: []});
        }
        return {
            state: 'invalid',
            findings,
            incomplete: true,
            pendingInput,
        };
    }
    let state = analyseNode(tree, [], findings, true);
    if (state === 'possible' && isGroup(tree) && tree.c.length) {
        const proof = prove(tree);
        state = proof.state;
        if (state === 'never' || state === 'always') {
            addFinding(findings, state === 'never' ? 'treecontradiction' : 'treetautology', 'danger', []);
        } else if (proof.limited) {
            addFinding(findings, 'treechecklimited', 'tip', []);
        }
    }

    if (state !== 'always' && state !== 'invalid' && allRulesRemainVisible(tree)) {
        addFinding(findings, options.contentvisiblewhenunavailable ? 'visiblecontent' : 'allrulesvisible',
            options.contentvisiblewhenunavailable ? 'danger' : 'warning', []);
    }

    const countTree = node => {
        if (!isGroup(node)) {
            return {leaves: 1, depth: 0};
        }
        const children = node.c.map(countTree);
        return {
            leaves: children.reduce((total, child) => total + child.leaves, 0),
            depth: 1 + Math.max(0, ...children.map(child => child.depth)),
        };
    };
    const size = countTree(tree);
    if (size.leaves >= 5 || size.depth >= 3) {
        findings.push({code: 'tipcomplex', severity: 'tip', path: []});
    }

    if ((state === 'always' || state === 'never') &&
            !findings.some(item => item.code === state || item.code === 'treecontradiction' || item.code === 'treetautology')) {
        findings.unshift({code: state, severity: 'danger', path: []});
    }

    return {state, findings, incomplete};
};

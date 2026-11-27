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

import {analyseBranches} from 'local_availabilityhelper/branches';
import {compare} from 'local_availabilityhelper/relations';

const all = (...c) => ({op: '&', c});
const any = (...c) => ({op: '|', c});
const not = rule => ({op: '!&', c: [rule]});
const from = t => ({type: 'date', d: '>=', t});
const before = t => ({type: 'date', d: '<', t});
const rule = (type, config = {}) => ({type, ...config});
const section = tree => ({tree});

describe('local_availabilityhelper/branches', () => {
    it('shows a date-only alternative without making completion mandatory', () => {
        const completed = rule('completion', {cm: 17, e: 1});
        const group = rule('group', {id: 3});
        const routes = analyseBranches(any(all(completed, group), from(100))).routes;
        expect(routes.map(path => path.rules.map(entry => entry.node.type))).toEqual([['completion', 'group'], ['date']]);
        expect(routes.every(path => !path.conflict)).toBe(true);
    });

    it('locates an exact cross-scope conflict while preserving another alternative', () => {
        const result = analyseBranches(any(before(100), from(120)), section(all(from(100))));
        expect(result.combined).toBe(true);
        expect(result.routes).toHaveLength(2);
        expect(result.routes[0].conflict).toEqual([result.routes[0].rules[0], result.routes[0].rules[1]]);
        expect(result.routes[0].conflict.map(entry => [entry.scope, ...entry.path])).toEqual([[0, 0], [1, 0]]);
        expect(result.routes[1].conflict).toBe(null);
    });

    it('marks the two contradictory positions through nested negation', () => {
        const routes = analyseBranches(all(not(any(from(100), before(50))), from(100))).routes;
        expect(routes[0].conflict.map(entry => entry.path)).toEqual([[0, 0, 0], [1]]);
    });

    it('does not correlate payments or automatic previous-activity selections across scopes', () => {
        for (const condition of [rule('paypal'), rule('completion', {cm: -1, e: 1})]) {
            const result = analyseBranches(all(condition), section(all(not(condition))));
            expect(result.routes[0].conflict).toBe(null);
        }
    });

    it('distinguishes an exact route limit from partial analysis', () => {
        const conditions = Array.from({length: 25}, (unused, index) => from(index));
        expect(analyseBranches(any(...conditions.slice(0, 24))).limited).toBe(false);
        expect(analyseBranches(any(...conditions)).limited).toBe(true);
        expect(analyseBranches(all(any(...conditions.slice(0, 5)), any(...conditions.slice(5, 10)))).limited).toBe(true);
    });

    it('does not analyse incomplete nested groups', () => {
        expect(analyseBranches(all(any())).invalid).toBe(true);
    });

    it('compares user selection sets and keeps different roles and languages compatible', () => {
        expect(compare(rule('user', {userids: [5, 6]}), rule('user', {userid: 7})).incompatible).toBe(true);
        expect(compare(rule('user', {userid: 5}), rule('user', {userids: [5, 6]})).leftImpliesRight).toBe(true);
        expect(analyseBranches(all(rule('role', {id: 1}), rule('role', {id: 2}))).routes[0].conflict).toBe(null);
        expect(analyseBranches(all(rule('language', {id: 'en'}), rule('language', {id: 'de'}))).routes[0].conflict).toBe(null);
    });

    it('allows an exact Boolean conflict for cohort, language or role', () => {
        for (const leaf of [rule('cohort', {id: 3}), rule('language', {id: 'de'}), rule('role', {id: 3, typeid: 0})]) {
            const result = analyseBranches(all(leaf), section(all(not(leaf))));
            expect(result.routes[0].conflict).toHaveLength(2);
        }
    });

    it('compares thresholds only under the documented semantics', () => {
        expect(compare(rule('courseprogress', {courseprogress: 80}), rule('courseprogress', {courseprogress: 60}))
            .leftImpliesRight).toBe(true);
        const allTracked = rule('sectioncompleted', {id: 2, e: 'pass', m: 0});
        const twoTracked = rule('sectioncompleted', {id: 2, e: 'pass', m: 2});
        expect(compare(allTracked, twoTracked).leftImpliesRight).toBe(true);
        expect(analyseBranches(all(allTracked, not(allTracked))).routes[0].conflict).toBe(null);
        const progress = rule('courseprogress', {courseprogress: 80});
        expect(analyseBranches(all(progress, not(progress))).routes[0].conflict).toBe(null);
    });

    it('uses exact relative dates with both signs but does not infer offset order', () => {
        const relative = rule('relativedate', {n: 1, d: 4, s: 3, m: 0});
        expect(compare(relative, {...relative, n: 2})).toBe(null);
        expect(analyseBranches(all(relative, not(relative))).routes[0].conflict).toHaveLength(2);
    });

    it('knows when course completion states are incompatible', () => {
        const complete = rule('coursecompleted', {id: 1, courseid: 3});
        const incomplete = {...complete, id: 0};
        expect(compare(complete, incomplete).incompatible).toBe(true);
        expect(compare(complete, {...incomplete, courseid: 4})).toBe(null);
    });

    it('can reject impossible XP and item combinations within the same reference', () => {
        const xp = rule('xp', {requiredlvl: 7, operator: 1});
        expect(compare(xp, rule('xp', {requiredlvl: 8, operator: 0})).incompatible).toBe(true);
        const stash = rule('stash', {objectid: 5, quantity: 3, condition: '>'});
        expect(compare(stash, {...stash, quantity: 4, condition: '<'}).incompatible).toBe(true);
        expect(compare(stash, {...stash, objectid: 7})).toBe(null);
    });

    it('compares Certificate Issued filters without conflating different issues', () => {
        const current = rule('certificateissued', {
            templateid: 1, site: 'a'.repeat(64), binding: 'b'.repeat(64), boundcourse: 2, scope: 'course',
            validity: 'valid', archive: 'current', received: true,
        });
        const allIssues = {...current, validity: 'all', archive: 'all'};
        expect(compare(current, allIssues).leftImpliesRight).toBe(true);
        expect(compare(current, {...allIssues, received: false}).incompatible).toBe(true);
        expect(compare(current, {...current, archive: 'archived'}).incompatible).toBe(false);
        expect(compare(current, {...current, binding: 'c'.repeat(64)})).toBe(null);
    });
});

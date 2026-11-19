/*
 * This file is part of a 108design source-available software product.
 *
 * Copyright (C) 2026 Andreas Giesen <andreas@108design.com>
 *
 * Use and modification are permitted only under the Software License included
 * with this distribution. Redistribution and circumvention of Pro feature or
 * licensing restrictions are prohibited. See LICENSE.md for the full terms.
 */

import {analyse} from './analyzer';

describe('local_availabilityhelper/analyzer', () => {
    const date = {type: 'date', d: '>=', t: 10};

    it('finds equivalent conditions independently of property order', () => {
        const result = analyse({op: '&', c: [date, {type: 'date', t: 10, d: '>='}]});

        expect(result.findings.map(item => item.code)).toContain('duplicate');
    });

    it('finds a generic contradiction in an AND group', () => {
        const result = analyse({op: '&', c: [date, {op: '!&', c: [date]}]});

        expect(result.state).toBe('never');
        expect(result.findings.map(item => item.code)).toContain('contradiction');
    });

    it('finds a generic tautology in an OR group', () => {
        const result = analyse({op: '|', c: [date, {op: '!&', c: [date]}]});

        expect(result.state).toBe('always');
        expect(result.findings.map(item => item.code)).toContain('tautology');
    });

    it('suppresses conclusions while Core reports incomplete input', () => {
        const result = analyse({
            op: '&',
            c: [date, {...date}],
            errors: ['availability_date:error'],
        });

        expect(result.state).toBe('invalid');
        expect(result.findings).toEqual([
            {code: 'incomplete', severity: 'warning', path: []},
        ]);
    });

    it('attributes Moodle’s reversed grade range to the nested rule with both limits', () => {
        const grade = {type: 'grade', id: 2, min: 80, max: 10};
        const code = 'availability_grade:error_backwardrange';
        const result = analyse({
            op: '&', c: [date, {op: '|', c: [grade, date]}], errors: [code],
        }, {inputErrors: [{code, path: [1, 0]}]});
        expect(result.state).toBe('invalid');
        expect(result.findings).toEqual([{code: 'graderange', severity: 'danger', path: [1, 0], rule: grade}]);
    });

    it('keeps a newly added restriction out of the warnings while still reporting earlier missing inputs', () => {
        const completion = {type: 'completion', cm: 0, e: 1};
        const code = 'availability_completion:error_selectcmid';
        const result = analyse({op: '&', c: [completion, completion], errors: [code, code]}, {
            inputErrors: [{code, path: [0]}, {code, path: [1], deferred: true}],
        });
        expect(result.incomplete).toBe(true);
        expect(result.pendingInput).toBe(true);
        expect(result.findings).toEqual([{code: 'completionitem', severity: 'warning', path: [0], rule: completion}]);
    });

    it('finds incompatible profile-field operators', () => {
        const result = analyse({
            op: '&',
            c: [
                {type: 'profile', sf: 'institution', op: 'isequalto', v: 'nix'},
                {type: 'profile', sf: 'institution', op: 'doesnotcontain', v: 'nix'},
            ],
        });

        expect(result.state).toBe('never');
        expect(result.findings).toContainEqual({
            code: 'semanticcontradiction',
            severity: 'danger',
            path: [],
            relatedPaths: [[0], [1]],
        });
    });

    it('warns once when every rule remains visible', () => {
        const result = analyse({op: '&', c: [date, {...date, t: 20}], showc: [true, true]});

        expect(result.findings).toContainEqual({
            code: 'allrulesvisible',
            severity: 'warning',
            path: [],
        });
    });

    it('treats visible unavailable text and media content as a problem', () => {
        const result = analyse({op: '&', c: [date], showc: [true]}, {contentvisiblewhenunavailable: true});

        expect(result.findings).toContainEqual({
            code: 'visiblecontent',
            severity: 'danger',
            path: [],
        });
    });

    it('keeps a saved cohort independent of the current any-cohort selection', () => {
        const result = analyse({
            op: '&',
            c: [
                {type: 'cohort'},
                {type: 'cohort', id: 42},
            ],
        });

        expect(result.findings.some(item => item.code === 'semanticredundant')).toBe(false);
    });

    it('honours the root eye settings for all four operators', () => {
        [
            {op: '&', showc: [false]},
            {op: '!|', showc: [false]},
            {op: '|', show: false},
            {op: '!&', show: false},
        ].forEach(settings => {
            const result = analyse({...settings, c: [{op: '|', c: [date]}]}, {contentvisiblewhenunavailable: true});
            expect(result.findings.some(finding => finding.code === 'visiblecontent')).toBe(false);
        });
    });

    it('keeps both polarities open for a reference-dependent condition', () => {
        [{type: 'completion', cm: 40, e: 1}, {type: 'certificateissued', templateid: 41}].forEach(condition => {
            const negative = {op: '!&', c: [condition]};
            ['&', '|', '!&', '!|'].forEach(op => {
                expect(analyse({op, c: [condition, negative]}).state).toBe('possible');
            });
        });
    });

    it('uses the effective operator under nested negation', () => {
        const inner = {op: '|', c: [date, {op: '!&', c: [date]}]};
        const result = analyse({op: '!&', c: [inner]});
        expect(result.state).toBe('never');
        expect(result.findings.map(item => item.code)).toContain('contradiction');
    });

    it('does not report a contradiction for the Moodle profile does-not-contain zero case', () => {
        const result = analyse({op: '&', c: [
            {type: 'profile', sf: 'institution', op: 'isequalto', v: '10'},
            {type: 'profile', sf: 'institution', op: 'doesnotcontain', v: '0'},
        ]});
        expect(result.state).toBe('possible');
    });

    it('preserves plugin settings named like Moodle group properties', () => {
        const a = {type: 'custom', options: {showc: [true]}};
        const b = {type: 'custom', options: {showc: [false]}};
        expect(analyse({op: '&', c: [a, b]}).findings.some(finding => finding.code === 'duplicate')).toBe(false);
    });

    it('proves a contradiction across several nested branches above the truth-table limit', () => {
        const profile = sf => ({type: 'profile', sf, op: 'isequalto', v: 'test'});
        const a = profile('institution');
        const b = profile('department');
        const c = profile('city');
        const negate = condition => ({op: '!&', c: [condition]});
        const alternatives = {op: '|', c: [a, {op: '&', c: [b, c]}]};
        const opaque = [1, 2, 3].map(id => ({type: 'certificateissued', id}));
        const result = analyse({op: '&', c: [alternatives, negate(a), negate(b), ...opaque]});
        expect(result.state).toBe('never');
        expect(result.findings.map(finding => finding.code)).toContain('treecontradiction');
    });

    it('proves a tautology across a nested conjunction and its separately negated leaves', () => {
        const a = {type: 'profile', sf: 'city', op: 'isequalto', v: 'Berlin'};
        const b = {type: 'profile', sf: 'institution', op: 'isequalto', v: 'Example'};
        const tree = {op: '|', c: [{op: '&', c: [a, b]}, {op: '!&', c: [a]}, {op: '!&', c: [b]}]};
        expect(analyse(tree).findings.map(finding => finding.code)).toContain('treetautology');
    });

    it('detects impossible date windows across nested branches and keeps a viable alternative', () => {
        const from = {type: 'date', d: '>=', t: 20};
        const before = {type: 'date', d: '<', t: 10};
        const certificate = {type: 'certificateissued', templateid: 5};
        const alternatives = {op: '|', c: [from, certificate]};
        expect(analyse({op: '&', c: [from, before]}).state).toBe('never');
        expect(analyse({op: '&', c: [alternatives, before]}).state).toBe('possible');
        const impossible = {op: '|', c: [from, {...from, t: 30}]};
        expect(analyse({op: '&', c: [impossible, before]}).state).toBe('never');
    });

    it('analyses the complete Moodle 5.3 date tree when Core reports a date conflict', () => {
        const tree = {op: '&', c: [
            {op: '|', c: [
                {type: 'date', d: '>=', t: 20, nodeUID: 1},
                {type: 'date', d: '>=', t: 30, nodeUID: 2},
            ]},
            {type: 'date', d: '<', t: 10, nodeUID: 3},
        ], errors: ['availability_date:error_dateconflict']};
        expect(analyse(tree).findings.map(finding => finding.code)).toContain('treecontradiction');
        expect(analyse({...tree, errors: [...tree.errors, 'availability:error_list_nochildren']}).incomplete).toBe(true);
        const duplicate = analyse({op: '&', c: [{...date, nodeUID: 1}, {...date, nodeUID: 2}]});
        expect(duplicate.findings.map(finding => finding.code)).toContain('duplicate');
    });

    it('models grade boundaries for one grade item and keeps unrelated grades independent', () => {
        const min = {type: 'grade', id: 10, min: 75};
        const max = {type: 'grade', id: 10, max: 75};
        expect(analyse({op: '&', c: [min, max]}).state).toBe('never');
        expect(analyse({op: '|', c: [min, max]}).state).toBe('possible');
        expect(analyse({op: '&', c: [min, {...max, id: 20}]}).state).toBe('possible');
    });

    it('detects incompatible completion states and recognises pass as complete', () => {
        const complete = {type: 'completion', cm: 21, e: 1};
        const pass = {...complete, e: 2};
        const fail = {...complete, e: 3};
        expect(analyse({op: '&', c: [complete, fail]}).state).toBe('never');
        expect(analyse({op: '&', c: [complete, pass]}).findings.map(finding => finding.code))
            .toContain('semanticredundant');
        expect(analyse({op: '&', c: [complete, {...fail, cm: 22}]}).state).toBe('possible');
    });

    it('reports the analysis limit without making an access claim', () => {
        const tree = {op: '&', c: Array.from({length: 81}, (_, id) => ({type: 'group', id}))};
        const result = analyse(tree);
        expect(result.state).toBe('possible');
        expect(result.findings.map(finding => finding.code)).toContain('treechecklimited');
    });
});

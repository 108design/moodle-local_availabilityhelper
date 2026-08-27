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
        const result = analyse({op: '&', c: [date, {...date, t: 20}]});

        expect(result.findings).toContainEqual({
            code: 'allrulesvisible',
            severity: 'warning',
            path: [],
        });
    });

    it('treats visible unavailable text and media content as a problem', () => {
        const result = analyse({op: '&', c: [date]}, {contentvisiblewhenunavailable: true});

        expect(result.findings).toContainEqual({
            code: 'visiblecontent',
            severity: 'danger',
            path: [],
        });
    });

    it('finds an any-cohort condition redundant beside a specific cohort', () => {
        const result = analyse({
            op: '!&',
            c: [
                {type: 'cohort'},
                {type: 'cohort', id: 42},
            ],
        });

        expect(result.findings).toContainEqual({
            code: 'semanticredundant',
            severity: 'warning',
            path: [0],
        });
    });
});

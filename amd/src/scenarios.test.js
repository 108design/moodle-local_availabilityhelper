/*
 * This file is part of a 108design source-available software product.
 *
 * Copyright (C) 2026 Andreas Giesen <andreas@108design.com>
 *
 * Use and modification are permitted only under the Software License included
 * with this distribution. Redistribution and circumvention of Pro feature or
 * licensing restrictions are prohibited. See LICENSE.md for the full terms.
 */

import {create} from './scenarios';

describe('local_availabilityhelper/scenarios', () => {
    it('applies positive relationships through nested double negation', () => {
        const result = create({
            op: '!&',
            c: [{op: '!&', c: [{type: 'xp', requiredlvl: 5}, {type: 'xp', requiredlvl: 7}]}],
        });

        expect(result.atoms).toHaveLength(2);
        expect(result.rows).toHaveLength(3);
        expect(result.rows).toEqual(expect.arrayContaining([
            {values: [false, false], result: false},
            {values: [true, true], result: true},
        ]));
        expect(result.filtered).toBe(true);
    });

    it('removes impossible profile combinations', () => {
        const result = create({
            op: '&',
            c: [
                {type: 'profile', sf: 'institution', op: 'isequalto', v: 'nix'},
                {type: 'profile', sf: 'institution', op: 'doesnotcontain', v: 'nix'},
            ],
        });

        expect(result.rows).toHaveLength(3);
        expect(result.rows.every(row => row.result === false)).toBe(true);
    });

    it('uses representative cases for more than four predicates', () => {
        const result = create({
            op: '|',
            c: Array.from({length: 5}, (_, id) => ({type: 'group', id})),
        });

        expect(result.complete).toBe(false);
        expect(result.rows.length).toBeLessThan(2 ** 5);
    });

    it('represents an OR of both Certificate Issued polarities as blocked when both deny access', () => {
        const rule = {type: 'certificateissued', templateid: 8};
        const result = create({op: '|', c: [rule, {op: '!&', c: [rule]}]});

        expect(result.atoms).toHaveLength(2);
        expect(result.atoms[1].negated).toBe(true);
        expect(result.rows).toContainEqual({values: [false, false], result: false});
    });

    it('leaves genuine date complements as one predicate', () => {
        const rule = {type: 'date', d: '>=', t: 10};
        const result = create({op: '|', c: [rule, {op: '!&', c: [rule]}]});

        expect(result.atoms).toHaveLength(1);
        expect(result.rows.every(row => row.result)).toBe(true);
    });
});

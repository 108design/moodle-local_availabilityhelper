// This file is part of Moodle - http://moodle.org/

import {create} from './scenarios';

describe('local_availabilityhelper/scenarios', () => {
    it('evaluates nested negation', () => {
        const result = create({
            op: '!&',
            c: [{type: 'cohort'}, {type: 'cohort', id: 42}],
        });

        expect(result.atoms).toHaveLength(2);
        expect(result.rows).toHaveLength(3);
        expect(result.rows).toEqual(expect.arrayContaining([
            {values: [false, false], result: true},
            {values: [true, true], result: false},
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
});

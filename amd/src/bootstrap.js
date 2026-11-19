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
 * with this distribution. Redistribution and circumvention of Pro feature or
 * licensing restrictions are prohibited. See LICENSE.md for the full terms.
 */

import {connect} from './adapter_yui';
import {analyse} from './analyzer';
import {analyseBranches} from './branches';
import {create as createScenarios} from './scenarios';
import * as UI from './ui';

const contentVisibleWhenUnavailable = () => {
    const moduleName = document.querySelector('[name="modulename"]')?.value;
    return moduleName === 'label';
};

/**
 * Starts the availability helper when a core editor exists on the page.
 *
 * @param {number} cmid Saved activity ID if participant preview is enabled
 * @param {?Object} section Saved containing section for activity editors
 * @param {?Object} explanation Configuration for the optional AI action
 */
export const init = (cmid = 0, section = null, explanation = null) => {
    let ready;
    let timer;
    let pending;
    const jump = new URLSearchParams(window.location.search).get('ahrule') || '';
    let target = /^[1-9][0-9]{0,2}(\.[1-9][0-9]{0,2}){0,15}$/.test(jump)
        ? jump.split('.').map(position => Number(position) - 1) : null;
    const refresh = () => {
        window.clearTimeout(timer);
        const update = pending;
        pending = null;
        update?.();
    };
    connect((tree, editor, inputErrors, checkInputs) => {
        window.clearTimeout(timer);
        pending = () => {
            const analysis = analyse(tree, {contentvisiblewhenunavailable: contentVisibleWhenUnavailable(), inputErrors});
            analysis.signature = JSON.stringify([tree, inputErrors]);
            analysis.branches = analysis.incomplete ? null : analyseBranches(tree, section);
            analysis.section = section;
            analysis.scenarios = analysis.incomplete ? null : createScenarios(tree);
            UI.render(editor, analysis);
            if (target) {
                UI.revealRule(editor, target);
                target = null;
            }
        };
        ready ||= UI.initialise(editor, cmid, refresh, explanation, () => {
            checkInputs();
            refresh();
        });
        timer = window.setTimeout(async() => {
            await ready;
            refresh();
        }, 350);
    });
};

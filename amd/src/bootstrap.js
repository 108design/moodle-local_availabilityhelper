/*
 * This file is part of a 108design source-available software product.
 *
 * Copyright (C) 2026 Andreas Giesen <andreas@108design.com>
 *
 * Use and modification are permitted only under the Software License included
 * with this distribution. Redistribution and circumvention of Pro feature or
 * licensing restrictions are prohibited. See LICENSE.md for the full terms.
 */

import {connect} from './adapter/yui';
import {analyse} from './analyzer';
import {create as createScenarios} from './scenarios';
import * as UI from './ui';

let timer;

const contentVisibleWhenUnavailable = () => {
    const moduleName = document.querySelector('[name="modulename"]')?.value;
    return moduleName === 'label';
};

/**
 * Starts the availability helper when a core editor exists on the page.
 */
export const init = () => {
    connect((tree, editor) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(async() => {
            await UI.initialise(editor);
            const analysis = analyse(tree, {contentvisiblewhenunavailable: contentVisibleWhenUnavailable()});
            analysis.scenarios = analysis.incomplete ? null : createScenarios(tree);
            UI.render(editor, analysis);
        }, 350);
    });
};

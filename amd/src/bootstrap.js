// This file is part of Moodle - http://moodle.org/

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

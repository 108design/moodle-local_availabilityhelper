// This file is part of Moodle - http://moodle.org/

import {connect} from './adapter/yui';
import {analyse} from './analyzer';
import * as UI from './ui';

let timer;

/**
 * Starts the availability helper when a core editor exists on the page.
 */
export const init = () => {
    connect((tree, editor) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(async() => {
            await UI.initialise(editor);
            UI.render(editor, analyse(tree));
        }, 350);
    });
};


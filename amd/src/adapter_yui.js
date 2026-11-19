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

/**
 * Moodle 4.5-5.3 adapter for the YUI availability editor.
 *
 * @module local_availabilityhelper/adapter_yui
 */

const FIELD_SELECTOR = '#id_availabilityconditionsjson';
const EDITOR_SELECTOR = '.availability-field';
const RETRY_LIMIT = 100;
const RETRY_DELAY = 100;

const parse = field => {
    if (!field.value) {
        return {op: '&', c: [], showc: []};
    }
    try {
        return JSON.parse(field.value);
    } catch {
        return null;
    }
};

/**
 * Connects to the current core editor and reports every committed editor update.
 *
 * @param {Function} onChange Receives tree, editor, attributed errors and explicit input check
 * @returns {Promise<boolean>}
 */
export const connect = onChange => new Promise(resolve => {
    const field = document.querySelector(FIELD_SELECTOR);
    if (!field) {
        resolve(false);
        return;
    }

    let attempts = 0;
    const waitForEditor = () => {
        const moodleForm = window.M && window.M.core_availability && window.M.core_availability.form;
        const editor = document.querySelector(EDITOR_SELECTOR);
        if (!moodleForm || !moodleForm.rootList || !editor) {
            attempts++;
            if (attempts < RETRY_LIMIT) {
                window.setTimeout(waitForEditor, RETRY_DELAY);
            } else {
                resolve(false);
            }
            return;
        }

        let errorsByItem = new WeakMap();
        let previous = null;
        let deferred = new Set();
        const item = window.M.core_availability.Item?.prototype;
        if (typeof item?.fillErrors === 'function') {
            const nativeFillErrors = item.fillErrors;
            item.fillErrors = function(errors) {
                const start = errors.length;
                nativeFillErrors.call(this, errors);
                if (start < errors.length) {
                    errorsByItem.set(this, errors.slice(start));
                }
            };
        }
        const rules = (list, path = []) => list.children.flatMap((node, index) => {
            const position = [...path, index];
            return [{node, path: position}, ...(node.children ? rules(node, position) : [])];
        });
        const checkInputs = () => {
            deferred.clear();
            moodleForm.update();
        };
        const notify = () => {
            const tree = parse(field);
            if (!tree) {
                return;
            }
            const entries = rules(moodleForm.rootList);
            const current = new Set(entries.map(({node}) => node));
            if (previous) {
                const added = [...current].filter(node => !previous.has(node));
                deferred = added.length ? new Set(added) : new Set([...deferred].filter(node => current.has(node)));
            }
            previous = current;
            const errors = entries.flatMap(({node, path}) => {
                const codes = node.children?.length === 0 ? ['availability:error_list_nochildren'] : errorsByItem.get(node) ?? [];
                // Moodle still validates these inputs and retains the original codes for submission.
                node.node.getDOMNode().classList.toggle('local-availabilityhelper__managed-input',
                    codes.length > 0 && !codes.includes('availability_date:error_dateconflict'));
                return codes.map(code => ({code, path, deferred: deferred.has(node)}));
            });
            onChange(tree, editor, errors, checkInputs);
        };

        if (!moodleForm.availabilityHelperOriginalUpdate) {
            moodleForm.availabilityHelperOriginalUpdate = moodleForm.update;
            moodleForm.update = function(...args) {
                errorsByItem = new WeakMap();
                const result = this.availabilityHelperOriginalUpdate.apply(this, args);
                notify();
                return result;
            };
        }

        if (field.form) {
            field.form.addEventListener('submit', event => {
                if (event.submitter?.name !== 'cancel') {
                    checkInputs();
                }
            }, {capture: true});
        }
        // Collect current item errors through the same validation path as subsequent edits.
        moodleForm.update();
        resolve(true);
    };

    waitForEditor();
});

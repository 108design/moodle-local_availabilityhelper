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

import Autocomplete from 'core/form-autocomplete';
import {load} from './preview_user_selector';

/** @module local_availabilityhelper/preview */

const element = (tag, classes, content) => {
    const node = document.createElement(tag);
    if (classes) {
        node.className = classes;
    }
    if (content) {
        node.textContent = content;
    }
    return node;
};

const button = (classes, label) => {
    const node = element('button', 'btn ' + classes, label);
    node.type = 'button';
    return node;
};

/**
 * Mount the persistent participant preview and return its lazy autocomplete initializer.
 *
 * @param {HTMLElement} container Preview tab
 * @param {number} cmid Saved activity ID
 * @param {Function} text Localised string lookup
 * @returns {Function}
 */
export const mount = (container, cmid, text) => {
    const box = element('div', 'local-availabilityhelper__preview');
    box.id = 'local-availabilityhelper-preview';

    const userLabel = element('label', 'local-availabilityhelper__preview-label', text('previewparticipant'));
    const field = element('div', 'local-availabilityhelper__preview-account');
    const user = element('select', 'form-select');
    user.id = 'local-availabilityhelper-preview-user';
    user.dataset.cmid = cmid;
    user.dataset.searchShort = text('previewsearchshort');
    user.dataset.noMatches = text('previewnomatches');
    user.dataset.searchFailed = text('previewsearchfailed');
    userLabel.htmlFor = user.id;

    const selected = element('div', 'local-availabilityhelper__preview-selected form-control');
    selected.hidden = true;
    const selectedName = element('span', 'text-truncate');
    selectedName.id = box.id + '-selected';
    const clearButton = button('btn-sm local-availabilityhelper__preview-clear', '×');
    clearButton.setAttribute('aria-label', text('previewremove'));
    clearButton.setAttribute('aria-describedby', selectedName.id);
    selected.append(selectedName, clearButton);

    field.append(user);
    const checkButton = button('btn-primary', text('previewcheck'));
    checkButton.disabled = true;
    const checkRow = element('div', 'local-availabilityhelper__preview-row');
    checkRow.append(field, checkButton);
    const labelRow = element('div', 'd-flex align-items-center gap-2');
    labelRow.append(userLabel);
    const icon = document.querySelector('#local-availabilityhelper-preview-icon .help-icon');
    if (icon) {
        labelRow.append(icon);
    }
    box.append(labelRow, checkRow);

    const message = element('div');
    message.setAttribute('role', 'status');
    message.setAttribute('aria-atomic', 'true');
    box.append(message);
    container.append(box);

    let request = 0;
    let autocomplete;
    let searchInput;
    const announce = key => {
        message.replaceChildren(element('p', 'small mt-3 mb-0', text(key)));
    };
    const runCheck = async() => {
        if (!user.value) {
            return;
        }
        const token = ++request;
        checkButton.disabled = true;
        announce('previewchecking');
        try {
            const {result: preview} = await load(cmid, {userid: Number(user.value)});
            if (token !== request) {
                return;
            }
            const result = element('div', 'border-top mt-3 pt-3');
            result.append(element('h3', 'h6 mb-0 ' + (preview.allowed ? 'text-success' : 'text-danger'),
                text(preview.allowed ? 'previewallowed' : 'previewblocked')),
                element('p', 'small text-muted mt-1 mb-0', text('previewsaved')));
            if (preview.reasons.length) {
                const list = element('ul', 'list-unstyled mb-0');
                const scopes = {course: 'previewcourse', section: 'previewsection', activity: 'previewactivity'};
                preview.reasons.forEach(({scope, text: description}) => {
                    const item = element('li', 'mt-2');
                    item.append(element('strong', 'small', text(scopes[scope] || scopes.activity)),
                        element('div', 'local-availabilityhelper__preview-reason', description));
                    list.append(item);
                });
                result.append(list);
            }
            message.replaceChildren(result);
        } catch {
            if (token === request) {
                announce('previewrequestfailed');
            }
        } finally {
            if (token === request) {
                checkButton.disabled = false;
            }
        }
    };

    checkButton.addEventListener('click', runCheck);
    clearButton.addEventListener('click', () => {
        // Let Moodle clear its own selected option and update the suggestion list.
        field.querySelector('.form-autocomplete-selection [role="option"][aria-selected="true"]')?.click();
    });
    user.addEventListener('change', () => {
        ++request;
        message.replaceChildren();
        const hasAccount = Boolean(user.value);
        const hadFocus = field.contains(document.activeElement);
        const name = hasAccount ? user.selectedOptions[0].textContent : '';
        selectedName.textContent = name;
        selectedName.title = name;
        selected.hidden = !hasAccount;
        field.classList.toggle('local-availabilityhelper__preview-account--selected', hasAccount);
        checkButton.disabled = !hasAccount;
        if (hadFocus) {
            (hasAccount ? clearButton : searchInput)?.focus();
        }
    });

    return () => {
        autocomplete ??= Promise.resolve(Autocomplete.enhanceField(
            '#' + user.id, false, 'local_availabilityhelper/preview_user_selector',
            text('previewplaceholder'), false, true, '',
        )).then(() => {
            searchInput = field.querySelector('[role="combobox"]');
            if (searchInput) {
                searchInput.maxLength = 100;
                field.prepend(selected);
            }
        }).catch(() => {
            autocomplete = null;
            announce('previewsearchfailed');
        });
        return autocomplete;
    };
};

// This file is part of Moodle - http://moodle.org/

import {getStrings} from 'core/str';

const STRING_KEYS = [
    'analysenow', 'analysisdetails', 'analysisok', 'closeanalysis', 'duplicate',
    'emptygroup', 'always', 'never', 'contradiction', 'tautology', 'redundantgroup',
    'semanticcontradiction', 'semanticredundant', 'semantictautology',
    'incomplete', 'provisional', 'rulepath',
];

let strings;
let panel;
let summary;
let details;
let button;
let latest;

const text = key => strings[key] || key;

const pathText = path => path.length ?
    text('rulepath').replace('{$a}', path.map(index => index + 1).join('.')) : '';

const clearMarkers = editor => {
    editor.querySelectorAll('.local-availabilityhelper__marker').forEach(node => {
        node.classList.remove('local-availabilityhelper__marker', 'local-availabilityhelper__marker--danger');
    });
};

const nodeForPath = (editor, path) => {
    let list = editor.querySelector(':scope > .availability-list');
    let target = list;
    for (const index of path) {
        const children = list?.querySelector(':scope > .availability-inner > .availability-children');
        const rules = children ? [...children.children].filter(child =>
            child.classList.contains('availability-list') || child.classList.contains('availability-item')) : [];
        target = rules[index];
        if (!target) {
            return null;
        }
        list = target.classList.contains('availability-list') ? target : null;
    }
    return target;
};

const markFindings = (editor, findings) => {
    clearMarkers(editor);
    findings.forEach(item => {
        const node = nodeForPath(editor, item.path);
        if (node) {
            node.classList.add('local-availabilityhelper__marker');
            if (item.severity === 'danger') {
                node.classList.add('local-availabilityhelper__marker--danger');
            }
        }
    });
};

const renderDetails = () => {
    details.replaceChildren();
    const heading = document.createElement('h5');
    heading.textContent = text('analysisdetails');
    details.append(heading);

    const list = document.createElement('ul');
    if (!latest.findings.length) {
        const item = document.createElement('li');
        item.textContent = text('analysisok');
        list.append(item);
    } else {
        latest.findings.forEach(result => {
            const item = document.createElement('li');
            const prefix = pathText(result.path);
            item.textContent = `${prefix ? `${prefix}: ` : ''}${text(result.code)}`;
            list.append(item);
        });
    }
    details.append(list);
};

const setExpanded = expanded => {
    details.hidden = !expanded;
    button.textContent = expanded ? text('closeanalysis') : text('analysenow');
    button.setAttribute('aria-expanded', String(expanded));
    if (expanded) {
        renderDetails();
    }
};

/**
 * Prepares the UI and translations.
 *
 * @param {HTMLElement} editor Core availability editor
 * @returns {Promise<void>}
 */
export const initialise = async editor => {
    if (panel) {
        return;
    }
    const values = await getStrings(STRING_KEYS.map(key => ({key, component: 'local_availabilityhelper'})));
    strings = Object.fromEntries(STRING_KEYS.map((key, index) => [key, values[index]]));

    panel = document.createElement('div');
    panel.className = 'local-availabilityhelper alert alert-info';
    panel.setAttribute('role', 'status');

    summary = document.createElement('div');
    summary.className = 'local-availabilityhelper__summary';
    panel.append(summary);

    const actions = document.createElement('div');
    actions.className = 'local-availabilityhelper__actions';
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-secondary btn-sm';
    button.addEventListener('click', () => setExpanded(details.hidden));
    actions.append(button);
    panel.append(actions);

    details = document.createElement('div');
    details.className = 'local-availabilityhelper__details';
    details.hidden = true;
    panel.append(details);
    editor.append(panel);
    setExpanded(false);
};

/**
 * Updates live summary, markers and optional detailed report.
 *
 * @param {HTMLElement} editor Core editor
 * @param {Object} analysis Analysis result
 */
export const render = (editor, analysis) => {
    latest = analysis;
    const count = analysis.findings.length;
    if (analysis.incomplete) {
        summary.textContent = `${text('provisional')}: ${text('incomplete')}`;
    } else if (!count) {
        summary.textContent = text('analysisok');
    } else {
        summary.textContent = analysis.state === 'never' ? text('never') :
            analysis.state === 'always' ? text('always') : `${count}: ${text('analysisdetails')}`;
    }
    const definite = analysis.state === 'never' || analysis.state === 'always';
    panel.classList.toggle('alert-danger', definite);
    panel.classList.toggle('alert-info', !definite);
    markFindings(editor, analysis.findings);
    if (!details.hidden) {
        renderDetails();
    }
};

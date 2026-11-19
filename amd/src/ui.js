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

import {getStrings} from 'core/str';
import {mount as mountExplanation} from './explanation';
import {mount as mountPreview} from './preview';
import {init as connectHelp} from './help';
import {close, isWide, open, register, toggle} from './sidepanel';

const STRING_KEYS = [
    'analysisok', 'duplicate', 'emptygroup', 'always', 'never',
    'contradiction', 'tautology', 'redundantgroup', 'semanticcontradiction', 'semanticredundant',
    'semantictautology', 'tipallcohorts', 'tipcomplex', 'tipdoublenegation', 'tipheading',
    'tipnegatedgroup', 'warningheading', 'problemheading', 'panelopen', 'panelopenfinding', 'panelopenfindings',
    'paneltitle', 'panelclose', 'panelanalysis', 'panelhelp', 'analysisdraft', 'ruleopenssection',
    'incomplete', 'invalidrule', 'graderange', 'gradeitem', 'gradevalue', 'gradebounds', 'grademinvalue', 'grademaxvalue',
    'grademin', 'grademax', 'gradebetween', 'completionitem', 'pendinginput', 'checkinputs', 'showrulefinding', 'hiderulefinding',
    'rulepath', 'scenarioavailable', 'scenariocase', 'scenarioconditions', 'scenarioconditioncount',
    'scenariofiltered', 'scenarioheading', 'scenariolegend', 'scenarionegated', 'scenariono', 'scenarionote',
    'scenariorepresentative', 'scenarioresult', 'scenariounavailable', 'scenarioyes',
    'conflictcause', 'coveragecause',
    'allrulesvisible', 'visiblecontent', 'treecontradiction', 'treetautology', 'treechecklimited',
    'branchheading', 'branchintro', 'branchroute', 'branchpossible', 'branchblocked', 'branchconflict',
    'branchsection', 'branchsectionempty', 'branchsectionunavailable', 'branchdelegated', 'branchsectionlink',
    'branchsectionblocked', 'branchlimited', 'branchinvalid', 'branchsaved', 'branchunrestricted',
    'branchdatefrom', 'branchdateuntil',
];

const PREVIEW_KEYS = [
    'previewheading', 'previewsaved', 'previewplaceholder', 'previewparticipant', 'previewcheck',
    'previewsearchshort', 'previewnomatches', 'previewsearchfailed', 'previewremove',
    'previewrequestfailed', 'previewchecking', 'previewallowed', 'previewblocked',
    'previewcourse', 'previewsection', 'previewactivity',
];

const EXPLANATION_KEYS = [
    'aiexplain', 'ainote', 'aiworking', 'aiunavailable', 'aifailed', 'aipolicy', 'aicontextdisabled', 'aiproviderrequired',
    'aiplugindisabled',
    'ailimit', 'aipartial', 'airesult', 'airesultpartial',
    'aisuggest', 'aiadvicenote', 'aisuggestions', 'aisuggestionspartial', 'aiintent', 'aiadjustcompletion', 'aiadjustconflict',
    'aichangesection', 'aireview', 'aigoalaftercompletion', 'aigoalbeforecompletion', 'aiadjustdate', 'aiadjustgrade',
];

let strings;
let details;
let toggleButton;
let report;
let explanationConfig;
let explanationIcon;
let checkInputs;
let activeFinding;

const text = key => strings[key] || key;

const percentage = value => new Intl.NumberFormat(document.documentElement.lang.startsWith('de') ? 'de' : 'en',
    {maximumFractionDigits: 20}).format(value);

const pathText = path => path.length ?
    text('rulepath').replace('{$a}', path.map(index => index + 1).join('.')) : '';

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

/**
 * Reveal and focus a rule in Moodle's editor, including a collapsed availability section.
 *
 * @param {HTMLElement} editor Core editor
 * @param {number[]} path Zero-based rule position
 */
export const revealRule = (editor, path) => {
    const node = nodeForPath(editor, path);
    if (!node || !path.length) {
        return;
    }

    const reveal = () => {
        if (!node.isConnected) {
            return;
        }
        node.tabIndex = -1;
        node.scrollIntoView({block: 'center', inline: 'nearest'});
        node.focus({preventScroll: true});
        node.classList.add('local-availabilityhelper__rule-target');
        window.setTimeout(() => node.classList.remove('local-availabilityhelper__rule-target'), 1600);
    };
    const container = editor.closest('fieldset')?.querySelector(':scope > .fcontainer');
    const opener = container?.previousElementSibling?.querySelector('.fheader[aria-expanded]');
    if (opener && !container.classList.contains('show')) {
        const ready = new MutationObserver(() => {
            if (container.classList.contains('show')) {
                ready.disconnect();
                reveal();
            }
        });
        ready.observe(container, {attributes: true, attributeFilter: ['class']});
        window.setTimeout(() => ready.disconnect(), 1200);
        if (opener.getAttribute('aria-expanded') === 'false') {
            opener.click();
        }
    } else {
        reveal();
    }
};

const ruleButton = (editor, path, label) => {
    const target = nodeForPath(editor, path);
    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'btn btn-link p-0 text-start local-availabilityhelper__rule-link';
    link.textContent = label;
    link.addEventListener('click', () => {
        if (!target || nodeForPath(editor, path) !== target) {
            return;
        }
        if (!isWide()) {
            close(false);
        }
        revealRule(editor, path);
    });
    return link;
};

const severityClass = severity => severity === 'danger' ? 'danger' : severity === 'tip' ? 'info' : 'warning';

const severityHeading = severity => severity === 'danger' ? text('problemheading') :
    severity === 'tip' ? text('tipheading') : text('warningheading');

const findingDescription = (editor, finding) => {
    if (finding.code === 'graderange') {
        if (!Number.isFinite(finding.rule?.min) || !Number.isFinite(finding.rule?.max)) {
            return text('gradebounds');
        }
        return text('graderange').replace('{$a->min}', percentage(finding.rule.min))
            .replace('{$a->max}', percentage(finding.rule.max));
    }
    if (finding.code === 'gradevalue') {
        const min = typeof finding.rule?.min === 'string';
        const max = typeof finding.rule?.max === 'string';
        return text(min && !max ? 'grademinvalue' : max && !min ? 'grademaxvalue' : 'gradevalue');
    }
    if (!finding.relatedPaths || finding.relatedPaths.length !== 2) {
        return text(finding.code);
    }
    const labels = finding.relatedPaths.map((path, index) => atomLabel(editor, {path}, index));
    const key = ['tautology', 'semantictautology'].includes(finding.code) ? 'coveragecause' : 'conflictcause';
    return text(key)
        .replace('{$a->left}', labels[0])
        .replace('{$a->right}', labels[1]);
};

const clearCallouts = editor => {
    editor.querySelectorAll('.local-availabilityhelper__callout, .local-availabilityhelper__finding-actions')
        .forEach(node => node.remove());
    editor.querySelectorAll('.local-availabilityhelper__marker').forEach(node => {
        node.classList.remove(
            'local-availabilityhelper__marker',
            'local-availabilityhelper__marker--danger',
            'local-availabilityhelper__marker--warning',
            'local-availabilityhelper__marker--info',
        );
    });
};

const closeFinding = () => {
    if (activeFinding) {
        const {button, callout} = activeFinding;
        button.setAttribute('aria-expanded', 'false');
        button.title = text('showrulefinding');
        callout.hidden = true;
        activeFinding = null;
    }
};

const positionFinding = () => {
    if (!activeFinding) {
        return;
    }
    const {button, callout} = activeFinding;
    const {clientWidth, clientHeight} = document.documentElement;
    const anchor = button.getBoundingClientRect();
    if (!anchor.width || anchor.bottom <= 0 || anchor.top >= clientHeight) {
        closeFinding();
        return;
    }
    const padding = 8;
    const {width} = callout.getBoundingClientRect();
    const height = callout.scrollHeight + callout.offsetHeight - callout.clientHeight;
    const rtl = window.getComputedStyle(button).direction === 'rtl';
    const left = anchor.left - width - padding;
    const right = anchor.right + padding;
    const sides = rtl ? [right, left] : [left, right];
    const beside = sides.find(x => x >= padding && x + width <= clientWidth - padding);
    const fitsBeside = beside !== undefined;
    const top = fitsBeside ? anchor.top : anchor.bottom + padding;
    const bottom = fitsBeside ? anchor.bottom : anchor.top - padding;
    const down = clientHeight - top - padding;
    const up = bottom - padding;
    const opensUp = height > down && up > down;
    const x = beside ?? Math.max(padding, Math.min(anchor.left, clientWidth - width - padding));

    // Use offsets from the button so both elements move together inside the editor.
    callout.style.left = `${x - anchor.left}px`;
    callout.style.top = opensUp ? 'auto' : `${top - anchor.top}px`;
    callout.style.bottom = opensUp ? `${anchor.bottom - bottom}px` : 'auto';
    callout.style.maxHeight = `${Math.max(0, opensUp ? up : down)}px`;
    if (callout.scrollHeight > callout.clientHeight) {
        callout.tabIndex = 0;
    } else {
        callout.removeAttribute('tabindex');
    }
};

const openFinding = finding => {
    closeFinding();
    activeFinding = finding;
    finding.button.setAttribute('aria-expanded', 'true');
    finding.button.title = text('hiderulefinding');
    finding.callout.hidden = false;
    positionFinding();
};

const renderCallouts = (editor, findings) => {
    const previous = activeFinding;
    const focused = document.activeElement?.closest('.local-availabilityhelper__finding-toggle');
    const focusedRow = focused?.closest('.local-availabilityhelper__marker');
    closeFinding();
    clearCallouts(editor);
    const grouped = new Map();
    findings.forEach(item => {
        // Root-level findings describe the rule set as a whole. They belong in
        // the summary, not beside the complete editor where a callout implies
        // a more specific origin than the analyser can prove.
        const paths = item.relatedPaths?.length ? item.relatedPaths : [item.path];
        if (!paths.some(path => path.length)) {
            return;
        }
        paths.forEach(path => {
            const node = nodeForPath(editor, path);
            if (!node) {
                return;
            }
            if (!grouped.has(node)) {
                grouped.set(node, []);
            }
            grouped.get(node).push(item);
        });
    });

    let index = 0;
    for (const [node, items] of grouped) {
        const actions = document.createElement('div');
        actions.className = 'local-availabilityhelper__finding-actions';
        node.append(actions);
        for (const severity of ['danger', 'warning', 'tip']) {
            const matches = items.filter(item => item.severity === severity);
            if (!matches.length) {
                continue;
            }
            const colour = severityClass(severity);
            if (!actions.childElementCount) {
                node.classList.add('local-availabilityhelper__marker', `local-availabilityhelper__marker--${colour}`);
            }
            const callout = document.createElement('aside');
            callout.id = 'local-availabilityhelper-finding-' + ++index;
            callout.className = `local-availabilityhelper__callout alert alert-${colour}`;
            callout.setAttribute('role', 'note');
            callout.hidden = true;
            const heading = document.createElement('strong');
            heading.textContent = severityHeading(severity);
            const list = document.createElement('ul');
            matches.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = findingDescription(editor, item);
                list.append(listItem);
            });
            callout.append(heading, list);

            const button = document.createElement('button');
            button.type = 'button';
            button.className = `btn btn-sm local-availabilityhelper__finding-toggle local-availabilityhelper__marker--${colour}`;
            button.dataset.severity = severity;
            const symbol = document.createElement('i');
            symbol.className = `fa fa-${severity === 'danger' ? 'exclamation' : 'info'}`;
            symbol.setAttribute('aria-hidden', 'true');
            button.append(symbol);
            button.title = text('showrulefinding');
            button.setAttribute('aria-label', `${severityHeading(severity)}. ${list.firstChild.textContent}`);
            button.setAttribute('aria-controls', callout.id);
            button.setAttribute('aria-expanded', 'false');
            const finding = {node, severity, button, callout};
            button.addEventListener('click', () => activeFinding === finding ? closeFinding() : openFinding(finding));
            const item = document.createElement('div');
            item.className = 'local-availabilityhelper__finding-anchor';
            item.append(button, callout);
            actions.append(item);
            if (previous?.node === node && previous.severity === severity) {
                openFinding(finding);
            }
            if (focusedRow === node && focused.dataset.severity === severity) {
                button.focus({preventScroll: true});
            }
        }
    }
};

const appendFindingAlert = (container, editor, findings, severity) => {
    if (!findings.length) {
        return;
    }
    const colour = severityClass(severity);
    const block = document.createElement('section');
    block.className = `alert alert-${colour}`;
    const heading = document.createElement('h3');
    heading.className = 'h6';
    heading.textContent = severityHeading(severity);
    block.append(heading);
    const list = document.createElement('ul');
    findings.forEach(result => {
        const item = document.createElement('li');
        item.textContent = findingDescription(editor, result);
        const paths = result.relatedPaths?.length ? result.relatedPaths : [result.path];
        const references = document.createElement('div');
        references.className = 'd-flex flex-wrap gap-2 mb-1';
        paths.filter(path => path.length && nodeForPath(editor, path))
            .forEach(path => references.append(ruleButton(editor, path, pathText(path))));
        if (references.childElementCount) {
            item.append(references);
        }
        list.append(item);
    });
    block.append(list);
    container.append(block);
};

function atomLabel(editor, atom, index) {
    const node = nodeForPath(editor, atom.path);
    const sensitive = ['password', 'paypal', 'ipaddress'].includes(atom.node?.type) ||
        node?.querySelector('.availability-plugincontrols input[type="password"]');
    const controls = node && !sensitive ? [...node.querySelectorAll('.availability-plugincontrols select, ' +
        '.availability-plugincontrols input:not([type="hidden"]):not([type="password"])')] : [];
    const values = controls.map(control => {
        if (control.tagName === 'SELECT') {
            return control.selectedOptions[0]?.textContent.trim() || '';
        }
        if (control.type === 'checkbox') {
            return control.checked ? text('scenarioyes') : text('scenariono');
        }
        return control.value?.trim() || '';
    }).filter(Boolean);
    let label = values.length ? values.join(' · ') : pathText(atom.path) || text('rulepath').replace('{$a}', index + 1);
    if (atom.node?.type === 'grade' && values.length) {
        const {min, max} = atom.node;
        const lower = Number.isFinite(min);
        const upper = Number.isFinite(max);
        const bound = lower && upper ? text('gradebetween').replace('{$a->min}', percentage(min))
            .replace('{$a->max}', percentage(max)) : lower ? text('grademin').replace('{$a}', percentage(min)) :
            upper ? text('grademax').replace('{$a}', percentage(max)) : '';
        label = [values[0], bound].filter(Boolean).join(' · ');
    }
    if (atom.node?.type === 'date' && ['>=', '<'].includes(atom.node.d) && values.length === 6) {
        // Read the date as it is displayed in Moodle's editor timezone.
        const [, day, month, year, hour, minute] = values;
        label = text(atom.node.d === '>=' ? 'branchdatefrom' : 'branchdateuntil')
            .replace('{$a}', () => `${day} ${month} ${year}, ${hour}:${minute}`);
    }
    return atom.negated ? text('scenarionegated').replace('{$a}', label) : label;
}

const branchRuleLabel = (editor, section, rule) => {
    const position = pathText(rule.path);
    let label;
    if (rule.scope) {
        label = section?.labels?.[rule.path.join('.')] || '';
        if (rule.negated) {
            label = text('scenarionegated').replace('{$a}', () => label || position);
        }
    } else {
        const name = nodeForPath(editor, rule.path)?.querySelector(':scope > h3')?.textContent
            .trim().replace(/^[^:\d]*\d+(?:\.\d+)*\s*:\s*/, '');
        const value = atomLabel(editor, rule, 0);
        label = value === position ? name : rule.node?.type === 'date' ? value : [name, value].filter(Boolean).join(' · ');
    }
    return [rule.scope ? text('branchsaved') : '', position, label].filter(Boolean).join(' · ');
};

const branchRuleLink = (editor, section, rule, label = rule.label) => {
    if (!rule.scope) {
        return ruleButton(editor, rule.path, label);
    }
    if (!section?.url) {
        return document.createTextNode(label);
    }
    const link = document.createElement('a');
    const url = new URL(section.url);
    url.searchParams.set('ahrule', rule.path.map(index => index + 1).join('.'));
    link.href = url.href;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = label;
    link.setAttribute('aria-label', text('ruleopenssection').replace('{$a}', () => label));
    return link;
};

const branchLine = (key, value) => {
    const line = document.createElement('p');
    line.className = 'small mb-2';
    line.textContent = value === undefined ? text(key) : text(key).replace('{$a}', () => value);
    return line;
};

const appendBranches = (container, editor, branches, section) => {
    if (!branches) {
        return;
    }
    const block = document.createElement('section');
    block.className = 'mb-4';
    const heading = document.createElement('h3');
    heading.className = 'h6';
    heading.textContent = text('branchheading');
    block.append(heading, branchLine('branchintro'));
    if (section) {
        block.append(branchLine(section.unavailable ? 'branchsectionunavailable' :
            branches.combined ? 'branchsection' : 'branchsectionempty', section.name));
        if (section.delegated) {
            block.append(branchLine('branchdelegated'));
        }
        if (section.url) {
            const link = document.createElement('a');
            link.className = 'small d-inline-block mb-2';
            link.href = section.url;
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = text('branchsectionlink');
            block.append(link);
        }
    }
    branches.routes.forEach((route, index) => {
        const entry = document.createElement('details');
        entry.className = 'border rounded px-3 py-2 mb-2';
        entry.open = index === 0;
        const summary = document.createElement('summary');
        const status = document.createElement('strong');
        status.className = route.conflict ? 'text-danger' : 'text-body';
        status.textContent = text(route.conflict ? 'branchblocked' : 'branchpossible');
        summary.append(text('branchroute').replace('{$a}', index + 1), ' · ', status);
        entry.append(summary);
        if (route.conflict) {
            const conflict = branchLine('branchconflict');
            conflict.classList.add('mt-2');
            entry.append(conflict);
        }
        const list = document.createElement('ul');
        list.className = 'mb-1 mt-2';
        route.rules.forEach(rule => {
            const item = document.createElement('li');
            if (route.conflict?.includes(rule)) {
                item.className = 'fw-bold text-danger';
                item.append(branchRuleLink(editor, section, rule));
            } else {
                item.textContent = rule.label;
            }
            list.append(item);
        });
        entry.append(list);
        block.append(entry);
    });
    if (branches.invalid || branches.limited || !branches.routes.length) {
        block.append(branchLine(branches.invalid ? 'branchinvalid' : branches.limited ? 'branchlimited' : 'branchunrestricted'));
    }
    if (explanationConfig && branches.routes.length) {
        mountExplanation(block, branches, section, explanationConfig, text, explanationIcon,
            rule => branchRuleLink(editor, section, rule));
    }
    container.append(block);
};

const appendScenarios = (container, editor, scenarios) => {
    if (!scenarios || !scenarios.atoms.length || !scenarios.rows.length) {
        return;
    }
    const section = document.createElement('section');
    section.className = 'local-availabilityhelper__scenario-section';
    const heading = document.createElement('h3');
    heading.className = 'h6';
    heading.textContent = text('scenarioheading');
    section.append(heading);

    const note = document.createElement('p');
    note.className = 'small text-muted';
    note.textContent = scenarios.complete ? text('scenarionote') :
        text('scenariorepresentative') + ' ' + text('scenarionote');
    section.append(note);
    if (scenarios.filtered) {
        const filtered = document.createElement('p');
        filtered.className = 'small text-muted';
        filtered.textContent = text('scenariofiltered');
        section.append(filtered);
    }

    const legendHeading = document.createElement('h4');
    legendHeading.className = 'h6';
    legendHeading.textContent = text('scenariolegend');
    section.append(legendHeading);
    const legend = document.createElement('dl');
    legend.className = 'local-availabilityhelper__legend';
    scenarios.atoms.forEach((atom, index) => {
        const term = document.createElement('dt');
        term.textContent = `R${index + 1}`;
        const description = document.createElement('dd');
        description.textContent = atomLabel(editor, atom, index);
        legend.append(term, description);
    });
    section.append(legend);

    const table = document.createElement('table');
    table.className = 'table table-sm table-striped local-availabilityhelper__scenarios';
    const head = table.createTHead().insertRow();
    const compact = scenarios.atoms.length > 4;
    table.classList.toggle('local-availabilityhelper__scenarios--compact', compact);
    const conditionHeadings = compact ? [text('scenarioconditions')] : scenarios.atoms.map((atom, index) => `R${index + 1}`);
    [text('scenariocase'), ...conditionHeadings, text('scenarioresult')].forEach(label => {
        const cell = document.createElement('th');
        cell.scope = 'col';
        cell.textContent = label;
        head.append(cell);
    });
    const body = table.createTBody();
    scenarios.rows.forEach((row, rowIndex) => {
        const tableRow = body.insertRow();
        const caseCell = document.createElement('th');
        caseCell.scope = 'row';
        caseCell.textContent = String(rowIndex + 1);
        tableRow.append(caseCell);
        if (compact) {
            const conditionCell = tableRow.insertCell();
            const group = document.createElement('details');
            const summary = document.createElement('summary');
            summary.textContent = text('scenarioconditioncount').replace('{$a->yes}', row.values.filter(Boolean).length)
                .replace('{$a->total}', row.values.length);
            const list = document.createElement('ul');
            list.className = 'list-unstyled local-availabilityhelper__scenario-conditions';
            row.values.forEach((value, index) => {
                const item = document.createElement('li');
                item.append(`R${index + 1} `, scenarioIcon(value, text(value ? 'scenarioyes' : 'scenariono')));
                list.append(item);
            });
            group.append(summary, list);
            conditionCell.append(group);
        } else {
            row.values.forEach(value => {
                tableRow.insertCell().append(scenarioIcon(value, text(value ? 'scenarioyes' : 'scenariono')));
            });
        }
        const resultCell = tableRow.insertCell();
        resultCell.append(scenarioIcon(row.result, text(row.result ? 'scenarioavailable' : 'scenariounavailable'), true));
    });
    section.append(table);
    container.append(section);
};

const scenarioIcon = (value, label, result = false) => {
    const icon = document.createElement('span');
    icon.className = 'local-availabilityhelper__scenario-icon';
    icon.title = label;
    const symbol = document.createElement('span');
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = value ? '✓' : '×';
    if (result) {
        symbol.className = value ? 'text-success fw-bold' : 'text-danger fw-bold';
    }
    const alternative = document.createElement('span');
    alternative.className = 'visually-hidden sr-only';
    alternative.textContent = label;
    icon.append(symbol, alternative);
    return icon;
};

const renderDetails = editor => {
    details.replaceChildren();
    if (!report) {
        return;
    }
    const problems = report.findings.filter(item => item.severity === 'danger');
    const warnings = report.findings.filter(item => item.severity === 'warning');
    const tips = report.findings.filter(item => item.severity === 'tip');
    if (sectionBlocked(report)) {
        const blocked = document.createElement('p');
        blocked.className = 'alert alert-danger';
        blocked.textContent = text('branchsectionblocked');
        details.append(blocked);
    } else if (!report.incomplete && !problems.length && !warnings.length) {
        const ok = document.createElement('div');
        ok.className = 'alert alert-success';
        ok.textContent = text('analysisok');
        details.append(ok);
    }
    appendFindingAlert(details, editor, problems, 'danger');
    appendFindingAlert(details, editor, warnings, 'warning');
    appendFindingAlert(details, editor, tips, 'tip');
    if (report.pendingInput) {
        const status = branchLine('pendinginput');
        status.classList.add('text-muted');
        status.setAttribute('role', 'status');
        const button = createButton('btn btn-secondary btn-sm', 'checkinputs');
        button.addEventListener('click', () => {
            checkInputs();
            const firstFinding = details.querySelector('h3');
            if (firstFinding) {
                firstFinding.tabIndex = -1;
                firstFinding.focus();
            }
        });
        details.append(status, button);
    }
    appendBranches(details, editor, report.branches, report.section);
    if (explanationConfig?.unavailable === 'aiplugindisabled' && !report.branches?.routes.length) {
        mountExplanation(details, report.branches, report.section, explanationConfig, text, explanationIcon);
    }
    appendScenarios(details, editor, report.scenarios);
};

const sectionBlocked = analysis => {
    const branches = analysis.branches;
    return branches?.combined && !branches.limited && branches.routes.length > 0 &&
        branches.routes.every(route => route.conflict) &&
        branches.routes.some(route => route.conflict[0].scope !== route.conflict[1].scope);
};

const createButton = (classes, key) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = classes;
    button.textContent = text(key);
    return button;
};

const createTabs = (panel, analysis, cmid, help) => {
    const list = document.createElement('div');
    list.className = 'nav nav-tabs nav-fill px-3 flex-nowrap';
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', text('paneltitle'));
    const views = [{key: 'panelanalysis', content: analysis}];
    if (cmid) {
        views.push({key: 'previewheading', content: document.createElement('div')});
    }
    if (help) {
        views.push({key: 'panelhelp', content: help});
    }
    const tabs = views.map(({key, content}) => {
        const button = createButton('nav-link', key);
        button.id = 'local-availabilityhelper-tab-' + key;
        button.setAttribute('role', 'tab');
        content.id ||= button.id + '-content';
        content.classList.add('local-availabilityhelper-sidepanel-content');
        content.tabIndex = 0;
        content.setAttribute('role', 'tabpanel');
        content.setAttribute('aria-labelledby', button.id);
        button.setAttribute('aria-controls', content.id);
        list.append(button);
        return button;
    });
    panel.append(list, ...views.map(view => view.content));
    const activatePreview = cmid ? mountPreview(views[1].content, cmid, text) : null;
    let current = 0;
    const select = index => {
        current = index;
        tabs.forEach((tab, i) => {
            const selected = index === i;
            tab.tabIndex = selected ? 0 : -1;
            tab.setAttribute('aria-selected', String(selected));
            tab.classList.toggle('active', selected);
            views[i].content.hidden = !selected;
        });
        if (views[current].key === 'previewheading') {
            activatePreview();
        }
    };
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => select(index));
        tab.addEventListener('keydown', event => {
            const rtl = window.getComputedStyle(list).direction === 'rtl';
            const steps = {ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1};
            const target = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
                (index + steps[event.key] + tabs.length) % tabs.length;
            if (Number.isInteger(target)) {
                event.preventDefault();
                select(target);
                tabs[target].focus({preventScroll: true});
            }
        });
    });
    select(0);
    return {
        active: () => tabs[current],
        analysis: () => select(0),
        help: () => select(views.findIndex(view => view.key === 'panelhelp')),
    };
};

/**
 * Prepares the UI and translations.
 *
 * @param {HTMLElement} editor Core availability editor
 * @param {number} cmid Saved activity ID if the preview is enabled here
 * @param {Function} evaluateDraft Run any pending live edit before opening the panel
 * @param {?Object} explanation Configuration for the optional AI action
 * @param {Function} reviewInputs Show unfinished inputs for this explicit review
 * @returns {Promise<void>}
 */
export const initialise = async(editor, cmid, evaluateDraft, explanation, reviewInputs) => {
    if (toggleButton) {
        return;
    }
    const keys = [...STRING_KEYS, ...(cmid ? PREVIEW_KEYS : []), ...(explanation ? EXPLANATION_KEYS : [])];
    const values = await getStrings(keys.map(key => ({key, component: 'local_availabilityhelper'})));
    strings = Object.fromEntries(keys.map((key, index) => [key, values[index]]));
    checkInputs = reviewInputs;
    editor.classList.add('local-availabilityhelper__enhanced');
    explanationConfig = explanation;
    explanationIcon = document.querySelector('#local-availabilityhelper-explanation-icon .help-icon');

    const panel = document.createElement('aside');
    panel.id = 'local-availabilityhelper-panel';
    panel.className = 'local-availabilityhelper';
    panel.hidden = true;
    const header = document.createElement('header');
    header.className = 'local-availabilityhelper-help-header';
    const title = document.createElement('h2');
    title.id = panel.id + '-title';
    title.className = 'h6 mb-0';
    title.textContent = text('paneltitle');
    panel.setAttribute('aria-labelledby', title.id);
    header.append(title);

    const helpPanel = document.getElementById('local-availabilityhelper-help');
    const closeButton = createButton('btn btn-secondary btn-sm local-availabilityhelper-help-close', 'panelclose');
    closeButton.setAttribute('aria-label', text('panelclose'));
    closeButton.textContent = '×';
    closeButton.dataset.ahPanelClose = '';
    const brand = document.getElementById('local-availabilityhelper-header-brand');
    if (brand) {
        header.append(brand);
    }
    header.append(closeButton);
    panel.append(header);

    const analysis = document.createElement('div');
    const note = branchLine('analysisdraft');
    note.classList.add('text-muted', 'd-flex', 'align-items-center', 'gap-2');
    const icon = document.querySelector('#local-availabilityhelper-analysis-icon .help-icon');
    if (icon) {
        note.append(icon);
    }
    details = document.createElement('div');
    details.className = 'local-availabilityhelper__details';
    analysis.append(note, details);
    const tabs = createTabs(panel, analysis, cmid, helpPanel);

    toggleButton = createButton('btn btn-primary btn-sm local-availabilityhelper__entry', 'panelopen');
    const entryLabel = document.createElement('span');
    entryLabel.textContent = toggleButton.textContent;
    const bulb = document.createElement('i');
    bulb.className = 'fa fa-lightbulb-o me-1';
    bulb.setAttribute('aria-hidden', 'true');
    toggleButton.replaceChildren(bulb, entryLabel);
    toggleButton.setAttribute('aria-controls', panel.id);
    toggleButton.setAttribute('aria-expanded', 'false');
    const caption = editor.closest('fieldset')?.querySelector(':scope > div > .ftoggler');
    if (caption) {
        caption.parentElement.classList.add('flex-wrap', 'row-gap-1');
        caption.parentElement.append(toggleButton);
    } else {
        editor.before(toggleButton);
    }
    register('analysis', panel, toggleButton, () => {
        evaluateDraft();
        return tabs.active();
    });
    new ResizeObserver(positionFinding).observe(editor);
    window.addEventListener('resize', positionFinding);
    document.addEventListener('scroll', positionFinding, {capture: true, passive: true});
    document.addEventListener('pointerdown', event => {
        if (activeFinding && !activeFinding.button.contains(event.target)) {
            closeFinding();
        }
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && (activeFinding?.button.contains(event.target) ||
                activeFinding?.callout.contains(event.target))) {
            event.preventDefault();
            const {button, callout} = activeFinding;
            closeFinding();
            if (event.target === callout) {
                button.focus({preventScroll: true});
            }
        }
    }, {capture: true});
    toggleButton.addEventListener('click', () => {
        if (!panel.hidden && tabs.active().id !== 'local-availabilityhelper-tab-panelanalysis') {
            tabs.analysis();
            open('analysis', toggleButton);
        } else {
            toggle('analysis', toggleButton);
        }
    });
    if (helpPanel) {
        connectHelp(helpPanel, (trigger, heading) => {
            tabs.help();
            open('analysis', trigger || toggleButton);
            heading?.focus({preventScroll: true});
        });
    }
};

/**
 * Updates the entry, report and positional callouts when the draft changes.
 *
 * @param {HTMLElement} editor Core editor
 * @param {Object} analysis Analysis result
 */
export const render = (editor, analysis) => {
    if (report?.signature === analysis.signature) {
        return;
    }
    const labels = new Map();
    for (const route of analysis.branches?.routes ?? []) {
        for (const rule of route.rules) {
            const key = JSON.stringify([rule.scope, rule.path, rule.negated]);
            if (!labels.has(key)) {
                labels.set(key, branchRuleLabel(editor, analysis.section, rule));
            }
            rule.label = labels.get(key);
        }
    }
    report = analysis;
    const count = analysis.findings.length + Number(sectionBlocked(analysis) && analysis.state !== 'never');
    toggleButton.lastElementChild.textContent = count ? text(count === 1 ? 'panelopenfinding' : 'panelopenfindings')
        .replace('{$a}', count) : text('panelopen');
    renderDetails(editor);
    renderCallouts(editor, analysis.findings);
};

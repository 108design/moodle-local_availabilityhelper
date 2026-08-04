// This file is part of Moodle - http://moodle.org/

import {getStrings} from 'core/str';

const STRING_KEYS = [
    'analysisdetails', 'analysisok', 'closeanalysis', 'duplicate', 'emptygroup', 'always', 'never',
    'contradiction', 'tautology', 'redundantgroup', 'semanticcontradiction', 'semanticredundant',
    'semantictautology', 'tipallcohorts', 'tipcomplex', 'tipdoublenegation', 'tipheading',
    'tipnegatedgroup', 'tipsavailable', 'warningheading', 'problemheading', 'showdetails',
    'refreshanalysis', 'incomplete', 'provisional', 'rulepath', 'scenarioavailable', 'scenariocase',
    'scenariofiltered', 'scenarioheading', 'scenariolegend', 'scenariono', 'scenarionote',
    'scenariorepresentative', 'scenarioresult', 'scenariounavailable', 'scenarioyes',
    'conflictcause', 'coveragecause',
];

let strings;
let panel;
let summary;
let details;
let toggleButton;
let latest;
let report;

const DESKTOP_CALLOUT_QUERY = '(min-width: 1400px)';
const DESKTOP_CALLOUT_GAP = 31;

const text = key => strings[key] || key;

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

const severityClass = severity => severity === 'danger' ? 'danger' : severity === 'tip' ? 'info' : 'warning';

const severityHeading = severity => severity === 'danger' ? text('problemheading') :
    severity === 'tip' ? text('tipheading') : text('warningheading');

const findingDescription = (editor, finding) => {
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
    editor.querySelectorAll('.local-availabilityhelper__callout').forEach(node => node.remove());
    editor.querySelectorAll('.local-availabilityhelper__marker').forEach(node => {
        node.classList.remove(
            'local-availabilityhelper__marker',
            'local-availabilityhelper__marker--danger',
            'local-availabilityhelper__marker--warning',
            'local-availabilityhelper__marker--info',
        );
    });
};

const placeCallout = (editor, node, callout) => {
    if (!window.matchMedia(DESKTOP_CALLOUT_QUERY).matches) {
        node.append(callout);
        return;
    }

    editor.classList.add('local-availabilityhelper__editor');
    editor.append(callout);
    const editorRect = editor.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    callout.style.top = `${nodeRect.top - editorRect.top + editor.scrollTop}px`;
    if (window.getComputedStyle(editor).direction === 'rtl') {
        callout.classList.add('local-availabilityhelper__callout--rtl');
        callout.style.left = `${nodeRect.right - editorRect.left + DESKTOP_CALLOUT_GAP}px`;
    } else {
        callout.style.left = `${nodeRect.left - editorRect.left + editor.scrollLeft -
            callout.offsetWidth - DESKTOP_CALLOUT_GAP}px`;
    }
};

const renderCallouts = (editor, findings) => {
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

    grouped.forEach((items, node) => {
        const severity = items.some(item => item.severity === 'danger') ? 'danger' :
            items.some(item => item.severity === 'warning') ? 'warning' : 'tip';
        const colour = severityClass(severity);
        node.classList.add('local-availabilityhelper__marker', `local-availabilityhelper__marker--${colour}`);

        const callout = document.createElement('aside');
        callout.className = `local-availabilityhelper__callout alert alert-${colour}`;
        callout.setAttribute('role', 'note');
        const heading = document.createElement('strong');
        heading.textContent = severityHeading(severity);
        callout.append(heading);
        const list = document.createElement('ul');
        items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = findingDescription(editor, item);
            list.append(listItem);
        });
        callout.append(list);
        placeCallout(editor, node, callout);
    });
};

const appendFindingAlert = (container, editor, findings, severity) => {
    if (!findings.length) {
        return;
    }
    const colour = severityClass(severity);
    const block = document.createElement('section');
    block.className = `alert alert-${colour}`;
    const heading = document.createElement('h6');
    heading.textContent = severityHeading(severity);
    block.append(heading);
    const list = document.createElement('ul');
    findings.forEach(result => {
        const item = document.createElement('li');
        const prefix = pathText(result.path);
        item.textContent = `${prefix ? `${prefix}: ` : ''}${findingDescription(editor, result)}`;
        list.append(item);
    });
    block.append(list);
    container.append(block);
};

function atomLabel(editor, atom, index) {
    const node = nodeForPath(editor, atom.path);
    const controls = node ? [...node.querySelectorAll('.availability-plugincontrols select, ' +
        '.availability-plugincontrols input:not([type="hidden"])')] : [];
    const values = controls.map(control => {
        if (control.tagName === 'SELECT') {
            return control.selectedOptions[0]?.textContent.trim() || '';
        }
        if (control.type === 'checkbox') {
            return control.checked ? text('scenarioyes') : text('scenariono');
        }
        return control.value?.trim() || '';
    }).filter(Boolean);
    return values.length ? values.join(' · ') : text('rulepath').replace('{$a}', index + 1);
}

const appendScenarios = (container, editor, scenarios) => {
    if (!scenarios || !scenarios.atoms.length || !scenarios.rows.length) {
        return;
    }
    const section = document.createElement('section');
    section.className = 'local-availabilityhelper__scenario-section';
    const heading = document.createElement('h5');
    heading.textContent = text('scenarioheading');
    section.append(heading);

    const note = document.createElement('p');
    note.className = 'small text-muted';
    note.textContent = scenarios.complete ? text('scenarionote') : text('scenariorepresentative');
    section.append(note);
    if (scenarios.filtered) {
        const filtered = document.createElement('p');
        filtered.className = 'small text-muted';
        filtered.textContent = text('scenariofiltered');
        section.append(filtered);
    }

    const legendHeading = document.createElement('h6');
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

    const wrapper = document.createElement('div');
    wrapper.className = 'table-responsive';
    const table = document.createElement('table');
    table.className = 'table table-sm table-striped local-availabilityhelper__scenarios';
    const head = table.createTHead().insertRow();
    [text('scenariocase'), ...scenarios.atoms.map((atom, index) => `R${index + 1}`),
        text('scenarioresult')].forEach(label => {
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
        row.values.forEach(value => {
            const cell = tableRow.insertCell();
            cell.textContent = value ? text('scenarioyes') : text('scenariono');
        });
        const resultCell = tableRow.insertCell();
        resultCell.textContent = row.result ? text('scenarioavailable') : text('scenariounavailable');
        resultCell.className = row.result ? 'text-success' : 'text-danger';
    });
    wrapper.append(table);
    section.append(wrapper);
    container.append(section);
};

const renderDetails = () => {
    details.replaceChildren();
    const editor = panel.closest('.availability-field');
    const heading = document.createElement('h5');
    heading.textContent = text('analysisdetails');
    details.append(heading);

    const problems = report.findings.filter(item => item.severity === 'danger');
    const warnings = report.findings.filter(item => item.severity === 'warning');
    const tips = report.findings.filter(item => item.severity === 'tip');
    if (!problems.length && !warnings.length) {
        const ok = document.createElement('div');
        ok.className = 'alert alert-success';
        ok.textContent = text('analysisok');
        details.append(ok);
    }
    appendFindingAlert(details, editor, problems, 'danger');
    appendFindingAlert(details, editor, warnings, 'warning');
    appendFindingAlert(details, editor, tips, 'tip');
    appendScenarios(details, editor, report.scenarios);
};

const setExpanded = expanded => {
    details.hidden = !expanded;
    toggleButton.textContent = expanded ? text('closeanalysis') : text('showdetails');
    toggleButton.setAttribute('aria-expanded', String(expanded));
    if (expanded) {
        if (!report) {
            report = latest;
        }
        renderDetails();
    }
};

const refreshReport = () => {
    report = latest;
    setExpanded(true);
};

const appendSummaryAlert = (colour, heading, message) => {
    const block = document.createElement('div');
    block.className = `alert alert-${colour}`;
    const title = document.createElement('strong');
    title.textContent = heading;
    block.append(title, document.createTextNode(` ${message}`));
    summary.append(block);
};

const renderSummary = analysis => {
    summary.replaceChildren();
    const problems = analysis.findings.filter(item => item.severity === 'danger');
    const warnings = analysis.findings.filter(item => item.severity === 'warning');
    const tips = analysis.findings.filter(item => item.severity === 'tip');
    if (!problems.length && !warnings.length) {
        appendSummaryAlert('success', text('analysisok'), tips.length ? text('tipsavailable') : '');
    }
    if (problems.length) {
        const specific = problems.find(item => item.relatedPaths?.length === 2);
        const message = specific ? findingDescription(panel.closest('.availability-field'), specific) :
            analysis.state === 'never' ? text('never') : analysis.state === 'always' ? text('always') :
                `${problems.length}`;
        appendSummaryAlert('danger', text('problemheading'), message);
    }
    if (warnings.length) {
        appendSummaryAlert('warning', analysis.incomplete ? text('provisional') : text('warningheading'),
            analysis.incomplete ? text('incomplete') : `${warnings.length}`);
    }
    if (tips.length) {
        appendSummaryAlert('info', text('tipheading'), `${tips.length}`);
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

    panel = document.createElement('section');
    panel.className = 'local-availabilityhelper';
    panel.setAttribute('aria-label', text('analysisdetails'));

    summary = document.createElement('div');
    summary.className = 'local-availabilityhelper__summary';
    summary.setAttribute('aria-live', 'polite');
    panel.append(summary);

    const actions = document.createElement('div');
    actions.className = 'local-availabilityhelper__actions';
    toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'btn btn-secondary btn-sm';
    toggleButton.addEventListener('click', () => setExpanded(details.hidden));
    const refreshButton = document.createElement('button');
    refreshButton.type = 'button';
    refreshButton.className = 'btn btn-primary btn-sm';
    refreshButton.textContent = text('refreshanalysis');
    refreshButton.addEventListener('click', refreshReport);
    actions.append(toggleButton, refreshButton);
    panel.append(actions);

    details = document.createElement('div');
    details.className = 'local-availabilityhelper__details';
    details.hidden = true;
    panel.append(details);
    editor.append(panel);
    setExpanded(false);
};

/**
 * Updates live summary and positional callouts. The detailed report remains a
 * user-controlled snapshot until it is explicitly refreshed.
 *
 * @param {HTMLElement} editor Core editor
 * @param {Object} analysis Analysis result
 */
export const render = (editor, analysis) => {
    latest = analysis;
    renderSummary(analysis);
    renderCallouts(editor, analysis.findings);
};

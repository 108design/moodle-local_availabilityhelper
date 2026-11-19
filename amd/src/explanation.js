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

import {call} from 'core/ajax';
import PolicyModal from 'core_ai/policymodal';

/**
 * Project complete routes to rule positions and fixed kinds. Never send rule objects or editor labels.
 *
 * @param {Object} branches Analysed access paths
 * @param {?Object} section Saved section context
 * @param {Object} config Allowed types and request limits
 * @returns {Object}
 */
export const projectRoutes = (branches, section, config) => {
    const routes = [];
    let partial = Boolean(branches.limited || section?.unavailable || section?.delegated);
    let remaining = config.maxrules;
    for (const [index, route] of branches.routes.entries()) {
        if (route.rules.length > remaining || route.rules.some(rule => rule.path.length > 16)) {
            partial = true;
            continue;
        }
        const rules = route.rules.map(rule => {
            let kind = rule.node?.type;
            if (kind === 'date' && ['>=', '<'].includes(rule.node.d)) {
                kind = rule.node.d === '>=' ? 'datefrom' : 'dateuntil';
            }
            const completion = kind === 'completion' && config.types.includes(kind) && [0, 1, 2, 3].includes(rule.node.e);
            return {
                kind: config.types.includes(kind) ? kind : 'other',
                path: rule.path.map(position => position + 1).join('.'),
                section: rule.scope === 1,
                negated: Boolean(rule.negated),
                ...(completion ? {completionstate: rule.node.e} : {}),
            };
        });
        routes.push({
            number: index + 1,
            rules,
            conflict: route.conflict?.map(rule => route.rules.indexOf(rule)) ?? [],
        });
        remaining -= rules.length;
    }
    return {partial, routes};
};

const renderSuggestions = (result, suggestions, branches, text, ruleLink) => {
    const list = document.createElement('ul');
    list.className = 'list-unstyled mb-0';
    for (const {route, keep, change, intent} of suggestions) {
        const path = branches.routes[route - 1];
        const preserved = path.rules[keep - 1];
        const affected = path.rules[change - 1];
        const item = document.createElement('li');
        item.className = 'mb-3';
        const comparable = kind => [preserved, affected].every(rule => rule.node?.type === kind && !rule.negated);
        const sameCompletion = comparable('completion') && Number.isInteger(preserved.node.cm) &&
            preserved.node.cm === affected.node.cm;
        const goal = sameCompletion && [0, 1].includes(preserved.node.e) ?
            text(preserved.node.e === 1 ? 'aigoalaftercompletion' : 'aigoalbeforecompletion') : intent;
        const assumption = document.createElement('p');
        assumption.className = 'fw-bold mb-1';
        assumption.textContent = text('aiintent').replace('{$a}', () => goal);
        const scope = document.createElement('p');
        scope.className = 'small text-muted mb-1';
        scope.textContent = text('branchroute').replace('{$a}', route);
        const action = document.createElement('p');
        action.className = 'mb-1';
        const template = text(sameCompletion ? 'aiadjustcompletion' : comparable('date') ? 'aiadjustdate' :
            comparable('grade') ? 'aiadjustgrade' : 'aiadjustconflict');
        const references = {change: affected, keep: preserved};
        for (const [index, part] of template.split(/\{\$a->(change|keep)\}/).entries()) {
            action.append(index % 2 ? ruleLink(references[part]) : part);
        }
        item.append(assumption, scope, action);
        if (affected.scope) {
            const note = document.createElement('p');
            note.className = 'small text-muted mb-0';
            note.textContent = text('aichangesection');
            item.append(note);
        }
        list.append(item);
    }
    const review = document.createElement('p');
    review.className = 'small text-muted mb-0';
    review.textContent = text('aireview');
    result.replaceChildren(list, review);
};

const renderExplanation = (result, explanation, branches, ruleLink) => {
    const byPosition = new Map();
    for (const route of branches.routes) {
        for (const rule of route.rules) {
            byPosition.set(`${rule.scope}:${rule.path.map(index => index + 1).join('.')}`, rule);
        }
    }
    const reference = /\b(Draft|Entwurf|Section|Abschnitt) ([1-9]\d*(?:\.[1-9]\d*)*)/giu;
    let offset = 0;
    for (const match of explanation.matchAll(reference)) {
        const scope = /^(?:Section|Abschnitt)$/i.test(match[1]) ? 1 : 0;
        const rule = byPosition.get(`${scope}:${match[2]}`);
        if (rule) {
            result.append(explanation.slice(offset, match.index), ruleLink(rule));
            offset = match.index + match[0].length;
        }
    }
    result.append(explanation.slice(offset));
};

/**
 * Add the explanation action to the access paths of one detail snapshot.
 *
 * @param {HTMLElement} container Access paths block
 * @param {?Object} branches Analysed access paths
 * @param {?Object} section Saved section context
 * @param {Object} config Editor context and availability
 * @param {Function} text Localised string lookup
 * @param {?HTMLElement} icon Linked contextual help icon
 * @param {Function} ruleLink Render a link to a displayed rule
 */
export const mount = (container, branches, section, config, text, icon, ruleLink) => {
    const {partial, routes} = projectRoutes(branches ?? {routes: []}, section, config);
    const advice = routes.some(route => route.conflict.length);
    const block = document.createElement('div');
    block.className = 'border rounded px-3 py-2 mt-3';
    const action = document.createElement('div');
    action.className = 'd-flex flex-wrap align-items-center gap-2';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-primary btn-sm';
    const symbol = document.createElement('i');
    symbol.className = 'fa fa-wand-magic-sparkles me-1';
    symbol.setAttribute('aria-hidden', 'true');
    button.append(symbol, text(advice ? 'aisuggest' : 'aiexplain'));
    button.disabled = Boolean(config.unavailable) || !routes.length;
    button.setAttribute('aria-describedby', 'local-availabilityhelper-ai-status');
    action.append(button);
    if (icon) {
        action.append(icon);
    }
    const note = document.createElement('p');
    note.className = 'small text-muted mb-0 mt-2';
    note.id = 'local-availabilityhelper-ai-status';
    note.setAttribute('role', 'status');
    note.textContent = text(config.unavailable || (!routes.length ? 'ailimit' : partial ? 'aipartial' : advice ? 'aiadvicenote' : 'ainote'));
    const result = document.createElement('div');
    result.className = 'local-availabilityhelper__explanation mb-1 mt-2';
    result.hidden = true;
    result.setAttribute('aria-live', 'polite');
    block.append(action, note, result);
    container.append(block);

    button.addEventListener('click', async() => {
        button.disabled = true;
        note.textContent = text('aiworking');
        result.hidden = true;
        result.textContent = '';
        try {
            const [request] = call([{
                methodname: 'local_availabilityhelper_explain_rules',
                args: {contextid: config.contextid, partial, routes, advice},
            }]);
            const response = await request;
            if (!block.isConnected) {
                return;
            }
            if (response.status === 'policy') {
                await PolicyModal.create({trigger: button});
                note.textContent = text('aipolicy');
            } else if (response.status === 'ok') {
                note.textContent = text(advice ? (partial ? 'aisuggestionspartial' : 'aisuggestions') :
                    (partial ? 'airesultpartial' : 'airesult'));
                result.hidden = false;
                if (advice) {
                    renderSuggestions(result, response.suggestions, branches, text, ruleLink);
                } else {
                    renderExplanation(result, response.text, branches, ruleLink);
                }
            } else {
                note.textContent = text(response.status === 'unavailable' ? 'aiunavailable' : 'aifailed');
            }
        } catch {
            note.textContent = text('aifailed');
        } finally {
            button.disabled = false;
        }
    });
};

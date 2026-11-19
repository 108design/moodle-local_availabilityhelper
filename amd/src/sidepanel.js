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

import {publish, subscribe} from 'core/pubsub';
import DrawerEvents from 'core/drawer_events';
import Drawers from 'theme_boost/drawers';

const PANELS = new Map();
const WIDE = window.matchMedia('(min-width: 1400px)');
const EXCLUSIVE = Boolean(DrawerEvents.DRAWER_EXCLUSIVE_REQUESTED && DrawerEvents.DRAWER_EXCLUSIVE_RELEASED);
const CLAIM = {region: 'right'};
let active;
let opener;
let backdrop;
let inertPage;

/** Whether the panel leaves room for the editor alongside it. */
export const isWide = () => WIDE.matches;

const position = () => {
    const bottom = document.querySelector('.navbar.fixed-top')?.getBoundingClientRect().bottom || 0;
    document.body.style.setProperty('--local-availabilityhelper-panel-top', `${Math.max(0, bottom) + 12}px`);
    const overlay = Boolean(active && !isWide());
    backdrop.hidden = !overlay;
    if (overlay && !inertPage) {
        const page = document.getElementById('page');
        if (page && !page.inert) {
            inertPage = page;
            inertPage.inert = true;
        }
    } else if (!overlay && inertPage) {
        inertPage.inert = false;
        inertPage = null;
    }
};

const setVisible = (surface, visible) => {
    surface.root.hidden = !visible;
    surface.trigger?.setAttribute('aria-expanded', String(visible));
};

/**
 * Close the panel, optionally leaving focus and the native slot to another surface.
 *
 * @param {boolean} returnFocus Focus the original external trigger
 * @param {boolean} release Release the right drawer slot
 */
export const close = (returnFocus = true, release = true) => {
    if (!active) {
        return;
    }
    const fallback = active.trigger;
    setVisible(active, false);
    active = null;
    document.body.classList.remove('local-availabilityhelper-sidepanel-open');
    position();
    if (release && EXCLUSIVE) {
        publish(DrawerEvents.DRAWER_EXCLUSIVE_RELEASED, CLAIM);
    }
    if (returnFocus) {
        const target = opener?.isConnected && opener.getClientRects().length ? opener : fallback;
        target?.focus({preventScroll: true});
    }
    opener = null;
};

/**
 * Switch between the persistent surfaces without releasing and reclaiming the drawer slot.
 *
 * @param {string} name Surface name
 * @param {HTMLElement} [trigger] Element that requested the surface
 */
export const open = (name, trigger) => {
    const next = PANELS.get(name);
    if (!next) {
        return;
    }
    if (trigger && ![...PANELS.values()].some(({root}) => root.contains(trigger))) {
        opener = trigger;
    }
    if (!active && EXCLUSIVE) {
        publish(DrawerEvents.DRAWER_EXCLUSIVE_REQUESTED, CLAIM);
    }
    if (active && active !== next) {
        setVisible(active, false);
    }
    active = next;
    setVisible(active, true);
    document.body.classList.add('local-availabilityhelper-sidepanel-open');
    position();
    active.focus()?.focus({preventScroll: true});
};

/**
 * Toggle a surface from its main opener.
 *
 * @param {string} name Surface name
 * @param {HTMLElement} trigger Editor or navbar control
 */
export const toggle = (name, trigger) => active === PANELS.get(name) ? close() : open(name, trigger);

const initialise = () => {
    backdrop = document.createElement('div');
    backdrop.className = 'local-availabilityhelper-sidepanel-backdrop';
    backdrop.hidden = true;
    backdrop.addEventListener('click', () => close());
    document.body.append(backdrop);
    document.body.classList.toggle('local-availabilityhelper-help-legacy-drawers', !EXCLUSIVE);
    window.addEventListener('resize', position);
    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || event.defaultPrevented || !active ||
                document.querySelector('.modal.show, dialog[open]') || event.target.closest('.popover')) {
            return;
        }
        event.preventDefault();
        close();
    });
    document.addEventListener(Drawers.eventTypes.drawerShow, event => {
        if (active && event.target.classList.contains('drawer-right')) {
            close(false);
        }
    });
    if (EXCLUSIVE) {
        subscribe(DrawerEvents.DRAWER_EXCLUSIVE_REQUESTED, request => {
            if (request?.region === CLAIM.region && request !== CLAIM) {
                close(false, false);
            }
        });
    }
};

/**
 * Register a surface and the element to focus when opening it.
 *
 * @param {string} name Surface name
 * @param {HTMLElement} root Persistent panel DOM
 * @param {?HTMLElement} trigger Main opener
 * @param {Function} focus Returns the focus target
 */
export const register = (name, root, trigger, focus) => {
    if (!backdrop) {
        initialise();
    }
    root.classList.add('local-availabilityhelper-sidepanel');
    document.body.append(root);
    PANELS.set(name, {root, trigger, focus});
    root.querySelector('[data-ah-panel-close]').addEventListener('click', () => close());
};

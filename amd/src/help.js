/*
 * This file is part of a 108design source-available software product.
 *
 * Copyright (C) 2026 Andreas Giesen <andreas@108design.com>
 *
 * Use and modification are permitted only under the Software License included
 * with this distribution. See LICENSE.md for the full terms.
 */

import Popover from 'theme_boost/bootstrap/popover';
import jQuery from 'jquery';

/**
 * Connect the topic menu and native popovers to the Help tab.
 *
 * @param {HTMLElement} panel Help tab content
 * @param {Function} openHelp Open the panel on its Help tab
 */
export const init = (panel, openHelp) => {
    const choice = panel.querySelector('select');
    const articles = [...panel.querySelectorAll('[data-ah-help-topic]')];
    let lastIcon = null;
    let activeTopic;

    const showTopic = topic => {
        const article = articles.find(item => item.dataset.ahHelpTopic === topic);
        if (!article) {
            return null;
        }
        articles.forEach(item => { item.hidden = item !== article; });
        choice.value = topic;
        if (activeTopic !== topic) {
            panel.scrollTop = 0;
        }
        activeTopic = topic;
        return article.querySelector('h3');
    };

    showTopic(choice.value);
    choice.addEventListener('change', () => showTopic(choice.value));
    document.addEventListener('click', event => {
        const icon = event.target.closest('.local-availabilityhelper-help-icon');
        if (icon) {
            lastIcon = icon;
        }
        const link = event.target.closest('a.local-availabilityhelper-topic-link');
        if (link) {
            const url = new URL(link.href);
            const topic = url.searchParams.get('ahhelp');
            const heading = url.origin === location.origin && url.pathname === location.pathname && showTopic(topic);
            if (heading) {
                event.preventDefault();
                if (lastIcon) {
                    // Bootstrap 5 and the Moodle 4.5 jQuery adapter expose different popover handles.
                    const popover = Popover.getInstance?.(lastIcon);
                    if (popover) {
                        popover.hide();
                    } else if (typeof jQuery.fn.popover === 'function') {
                        jQuery(lastIcon).popover('hide');
                    }
                }
                openHelp(lastIcon, heading);
            }
        }
    });

    const heading = showTopic(panel.dataset.initialTopic);
    if (heading) {
        openHelp(null, heading);
    }
};

import { AffectedElement, Context, IAffectedElement } from './types';
import { CssStyleMap } from '../../stylesheet';

import { getElementSelectorPath } from '../../common/utils/nodes';
import { removeSuffix } from '../../common/utils/strings';
import { logger } from '../../common/utils/logger';

import {
    MAX_STYLE_PROTECTION_COUNT,
    PSEUDO_PROPERTY_POSITIVE_VALUE,
    REMOVE_PSEUDO_MARKER,
    CONTENT_CSS_PROPERTY,
} from '../../common/constants';

// added by tsurlfilter's CssHitsCounter
const CONTENT_ATTR_PREFIX_REGEXP = /^("|')adguard.+?/;

/**
 * Removes affectedElement.node from DOM.
 *
 * @param context ExtendedCss context.
 * @param affectedElement Affected element.
 */
const removeElement = (context: Context, affectedElement: AffectedElement): void => {
    const { node } = affectedElement;

    affectedElement.removed = true;

    const elementSelector = getElementSelectorPath(node);

    // check if the element has been already removed earlier
    const elementRemovalsCounter = context.removalsStatistic[elementSelector] || 0;

    // if removals attempts happened more than specified we do not try to remove node again
    if (elementRemovalsCounter > MAX_STYLE_PROTECTION_COUNT) {
        logger.error(`ExtendedCss: infinite loop protection for selector: '${elementSelector}'`);
        return;
    }

    if (node.parentElement) {
        node.parentElement.removeChild(node);
        context.removalsStatistic[elementSelector] = elementRemovalsCounter + 1;
    }
};

/**
 * Sets style to the specified DOM node.
 *
 * @param node DOM element.
 * @param style Style to set.
 */
export const setStyleToElement = (node: Node, style: CssStyleMap): void => {
    if (!(node instanceof HTMLElement)) {
        return;
    }
    Object.keys(style).forEach((prop) => {
        // Apply this style only to existing properties
        // We cannot use hasOwnProperty here (does not work in FF)
        if (typeof node.style.getPropertyValue(prop.toString()) !== 'undefined') {
            let value = style[prop];
            if (!value) {
                return;
            }
            // do not apply 'content' style given by tsurlfilter
            // which is needed only for BeforeStyleAppliedCallback
            if (prop === CONTENT_CSS_PROPERTY && value.match(CONTENT_ATTR_PREFIX_REGEXP)) {
                return;
            }
            // First we should remove !important attribute (or it won't be applied')
            value = removeSuffix(value.trim(), '!important').trim();
            node.style.setProperty(prop, value, 'important');
        }
    });
};

/**
 * Applies style to the specified DOM node.
 *
 * @param context ExtendedCss context.
 * @param affectedElement Object containing DOM node and rule to be applied.
 *
 * @throws An error if affectedElement has no style to apply.
 */
export const applyStyle = (context: Context, affectedElement: AffectedElement): void => {
    if (affectedElement.protectionObserver) {
        // style is already applied and protected by the observer
        return;
    }

    if (context.beforeStyleApplied) {
        affectedElement = context.beforeStyleApplied(affectedElement as IAffectedElement);
        if (!affectedElement) {
            return;
        }
    }

    const { node, rules } = affectedElement;
    for (let i = 0; i < rules.length; i += 1) {
        const rule = rules[i];
        const selector = rule?.selector;
        const style = rule?.style;
        const debug = rule?.debug;
        // rule may not have style to apply
        // e.g. 'div:has(> a) { debug: true }' -> means no style to apply, and enable debug mode
        if (style) {
            if (style[REMOVE_PSEUDO_MARKER] === PSEUDO_PROPERTY_POSITIVE_VALUE) {
                removeElement(context, affectedElement);
                return;
            }
            setStyleToElement(node, style);
        } else if (!debug) {
            // but rule should not have both style and debug properties
            throw new Error(`No style declaration in rule for selector: '${selector}'`);
        }
    }
};

/**
 * Reverts style for the affected object.
 *
 * @param affectedElement Affected element.
 */
export const revertStyle = (affectedElement: AffectedElement): void => {
    if (affectedElement.protectionObserver) {
        affectedElement.protectionObserver.disconnect();
    }
    affectedElement.node.style.cssText = affectedElement.originalStyle;
};

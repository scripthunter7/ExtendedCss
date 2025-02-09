import { AnySelectorNodeInterface, NodeType } from '../nodes';

import { getFirst, getLast } from '../../common/utils/arrays';

const NO_REGULAR_SELECTOR_ERROR = 'At least one of Selector node children should be RegularSelector';

/**
 * Checks whether the type of `astNode` is SelectorList.
 *
 * @param astNode Ast node.
 */
export const isSelectorListNode = (astNode: AnySelectorNodeInterface | null): boolean => {
    return astNode?.type === NodeType.SelectorList;
};

/**
 * Checks whether the type of `astNode` is Selector.
 *
 * @param astNode Ast node.
 */
export const isSelectorNode = (astNode: AnySelectorNodeInterface | null): boolean => {
    return astNode?.type === NodeType.Selector;
};

/**
 * Checks whether the type of `astNode` is RegularSelector.
 *
 * @param astNode Ast node.
 */
export const isRegularSelectorNode = (astNode: AnySelectorNodeInterface | null): boolean => {
    return astNode?.type === NodeType.RegularSelector;
};

/**
 * Checks whether the type of `astNode` is ExtendedSelector.
 *
 * @param astNode Ast node.
 */
export const isExtendedSelectorNode = (astNode: AnySelectorNodeInterface): boolean => {
    return astNode.type === NodeType.ExtendedSelector;
};

/**
 * Checks whether the type of `astNode` is AbsolutePseudoClass.
 *
 * @param astNode Ast node.
 */
export const isAbsolutePseudoClassNode = (astNode: AnySelectorNodeInterface | null): boolean => {
    return astNode?.type === NodeType.AbsolutePseudoClass;
};

/**
 * Checks whether the type of `astNode` is RelativePseudoClass.
 *
 * @param astNode Ast node.
 */
export const isRelativePseudoClassNode = (astNode: AnySelectorNodeInterface | null): boolean => {
    return astNode?.type === NodeType.RelativePseudoClass;
};

/**
 * Returns name of `astNode`.
 *
 * @param astNode AbsolutePseudoClass or RelativePseudoClass node.
 *
 * @throws An error on unsupported ast node or no name found.
 */
export const getNodeName = (astNode: AnySelectorNodeInterface | null): string => {
    if (astNode === null) {
        throw new Error('Ast node should be defined');
    }
    if (!isAbsolutePseudoClassNode(astNode) && !isRelativePseudoClassNode(astNode)) {
        throw new Error('Only AbsolutePseudoClass or RelativePseudoClass ast node can have a name');
    }
    if (!astNode.name) {
        throw new Error('Extended pseudo-class should have a name');
    }
    return astNode.name;
};

/**
 * Returns value of `astNode`.
 *
 * @param astNode RegularSelector or AbsolutePseudoClass node.
 * @param errorMessage Optional error message if no value found.
 *
 * @throws An error on unsupported ast node or no value found.
 */
export const getNodeValue = (astNode: AnySelectorNodeInterface | null, errorMessage?: string): string => {
    if (astNode === null) {
        throw new Error('Ast node should be defined');
    }
    if (!isRegularSelectorNode(astNode) && !isAbsolutePseudoClassNode(astNode)) {
        throw new Error('Only RegularSelector ot AbsolutePseudoClass ast node can have a value');
    }
    if (!astNode.value) {
        throw new Error(errorMessage || 'Ast RegularSelector ot AbsolutePseudoClass node should have a value');
    }
    return astNode.value;
};

/**
 * Returns only RegularSelector nodes from `children`.
 *
 * @param children Array of ast node children.
 */
const getRegularSelectorNodes = (children: AnySelectorNodeInterface[]): AnySelectorNodeInterface[] => {
    return children.filter(isRegularSelectorNode);
};

/**
 * Returns the first RegularSelector node from `children`.
 *
 * @param children Array of ast node children.
 * @param errorMessage Optional error message if no value found.
 *
 * @throws An error if no RegularSelector node found.
 */
export const getFirstRegularChild = (
    children: AnySelectorNodeInterface[],
    errorMessage?: string,
): AnySelectorNodeInterface => {
    const regularSelectorNodes = getRegularSelectorNodes(children);
    const firstRegularSelectorNode = getFirst(regularSelectorNodes);
    if (!firstRegularSelectorNode) {
        throw new Error(errorMessage || NO_REGULAR_SELECTOR_ERROR);
    }
    return firstRegularSelectorNode;
};

/**
 * Returns the last RegularSelector node from `children`.
 *
 * @param children Array of ast node children.
 *
 * @throws An error if no RegularSelector node found.
 */
export const getLastRegularChild = (children: AnySelectorNodeInterface[]): AnySelectorNodeInterface => {
    const regularSelectorNodes = getRegularSelectorNodes(children);
    const lastRegularSelectorNode = getLast(regularSelectorNodes);
    if (!lastRegularSelectorNode) {
        throw new Error(NO_REGULAR_SELECTOR_ERROR);
    }
    return lastRegularSelectorNode;
};

/**
 * Returns the only child for ast node.
 *
 * @param node Ast node.
 * @param errorMessage Error message.
 *
 * @throws An error if none or more than one child found.
 */
export const getNodeOnlyChild = (node: AnySelectorNodeInterface, errorMessage: string): AnySelectorNodeInterface => {
    if (node.children.length !== 1) {
        throw new Error(errorMessage);
    }
    const onlyChild = getFirst(node.children);
    if (!onlyChild) {
        throw new Error(errorMessage);
    }
    return onlyChild;
};

/**
 * Takes ExtendedSelector node and returns its only child.
 *
 * @param extendedSelectorNode ExtendedSelector ast node.
 *
 * @returns AbsolutePseudoClass or RelativePseudoClass.
 *
 * @throws An error if there is no specific pseudo-class ast node.
 */
export const getPseudoClassNode = (extendedSelectorNode: AnySelectorNodeInterface): AnySelectorNodeInterface => {
    return getNodeOnlyChild(extendedSelectorNode, 'Extended selector should be specified');
};

/**
 * Takes RelativePseudoClass node and returns its only child
 * which is relative SelectorList node.
 *
 * @param pseudoClassNode RelativePseudoClass.
 *
 * @throws An error if no selector list found.
 */
export const getRelativeSelectorListNode = (pseudoClassNode: AnySelectorNodeInterface): AnySelectorNodeInterface => {
    if (!isRelativePseudoClassNode(pseudoClassNode)) {
        throw new Error('Only RelativePseudoClass node can have relative SelectorList node as child');
    }
    return getNodeOnlyChild(pseudoClassNode, `Missing arg for :${getNodeName(pseudoClassNode)}() pseudo-class`);
};

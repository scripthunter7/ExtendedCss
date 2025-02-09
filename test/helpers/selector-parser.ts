import { parse } from '../../src/selector/parser';
import { NodeType } from '../../src/selector/nodes';

interface TestAnySelectorNodeInterface {
    type: string,
    children: TestAnySelectorNodeInterface[],
    value?: string,
    name?: string,
}

/**
 * Returns RegularSelector with specified value.
 *
 * @param regularValue String value for RegularSelector.
 */
export const getRegularSelector = (regularValue: string): TestAnySelectorNodeInterface => {
    return {
        type: NodeType.RegularSelector,
        value: regularValue,
        children: [],
    };
};

/**
 * Returns extended selector AbsolutePseudoClass node.
 *
 * @param name Extended pseudo-class name.
 * @param value Value of pseudo-class.
 */
export const getAbsoluteExtendedSelector = (name: string, value: string): TestAnySelectorNodeInterface => {
    return {
        type: NodeType.ExtendedSelector,
        children: [
            {
                type: NodeType.AbsolutePseudoClass,
                name,
                value,
                children: [],
            },
        ],
    };
};

/**
 * Returns Selector node with RegularSelector as single child.
 *
 * @param regularValue String value for RegularSelector.
 */
export const getSelectorAsRegular = (regularValue: string): TestAnySelectorNodeInterface => {
    const selectorNode = {
        type: NodeType.Selector,
        children: [getRegularSelector(regularValue)],
    };
    return selectorNode;
};

/**
 * Returns extended selector RelativePseudoClass node with single RegularSelector.
 *
 * @param name Extended pseudo-class name.
 * @param value Value of it's inner regular selector.
 */
export const getRelativeExtendedWithSingleRegular = (name: string, value: string): TestAnySelectorNodeInterface => {
    return {
        type: NodeType.ExtendedSelector,
        children: [
            {
                type: NodeType.RelativePseudoClass,
                name,
                children: [
                    {
                        type: NodeType.SelectorList,
                        children: [
                            {
                                type: NodeType.Selector,
                                children: [
                                    {
                                        type: NodeType.RegularSelector,
                                        value,
                                        children: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };
};

/**
 * Returns SelectorList with multiple Selector nodes which have single RegularSelector node with specified value.
 *
 * @param regularValues Array of RegularSelector values.
 */
export const getSelectorListOfRegularSelectors = (regularValues: string[]): TestAnySelectorNodeInterface => {
    const selectorNodes = regularValues.map((value) => {
        return getSelectorAsRegular(value);
    });
    return {
        type: NodeType.SelectorList,
        children: selectorNodes,
    };
};

/**
 * Returns SelectorList with single Selector node which has single RegularSelector node with specified value.
 *
 * @param regularValue String value for RegularSelector.
 */
export const getAstWithSingleRegularSelector = (regularValue: string): TestAnySelectorNodeInterface => {
    return getSelectorListOfRegularSelectors([regularValue]);
};

/**
 * Data object for generating Selector children nodes:
 * 1. Only one of isRegular/isAbsolute/isRelative should be true.
 * 2. Acceptable parameters for:
 *   - isRegular: value;
 *   - isAbsolute or isRelative: name, value.
 */
interface AnyChildOfSelectorRaw {
    isRegular?: boolean,
    isAbsolute?: boolean,
    isRelative?: boolean
    value?: string,
    name?: string,
}

/**
 * Returns SelectorList with single Selector node which with any ast node.
 *
 * @param expected Simplified data for Selector child to expect.
 */
export const getSingleSelectorAstWithAnyChildren = (
    expected: AnyChildOfSelectorRaw[],
): TestAnySelectorNodeInterface => {
    const selectorChildren = expected.map((raw) => {
        const {
            isRegular,
            isAbsolute,
            isRelative,
            value,
            name,
        } = raw;

        if (isRegular && isAbsolute && isRelative) {
            throw new Error('Just one of properties should be specified: isRegular OR isAbsolute');
        }

        let childNode;
        if (isRegular && value) {
            childNode = getRegularSelector(value);
        } else if (isAbsolute && name && value) {
            childNode = getAbsoluteExtendedSelector(name, value);
        } else if (isRelative && name && value) {
            childNode = getRelativeExtendedWithSingleRegular(name, value);
        }
        if (!childNode) {
            throw new Error('Selector node child cannot be undefined. Some input param might be not set.');
        }
        return childNode;
    });

    return {
        type: NodeType.SelectorList,
        children: [
            {
                type: NodeType.Selector,
                children: selectorChildren,
            },
        ],
    };
};

interface SelectorListOfRegularsInput {
    /**
     * Selector for parsing.
     */
    actual: string,

    /**
     * Array of expected values for RegularSelector nodes.
     */
    expected: string[],
}

/**
 * Checks whether the passed selector is parsed into proper SelectorList.
 *
 * @param input - { actual, expected }.
 * @param input.actual Selector to parse to ast.
 * @param input.expected Expected ast selector.
 */
export const expectSelectorListOfRegularSelectors = ({ actual, expected }: SelectorListOfRegularsInput): void => {
    expect(parse(actual)).toEqual(getSelectorListOfRegularSelectors(expected));
};

interface SelectorListOfAnyChildrenInput {
    /**
     * Selector for parsing.
     */
    actual: string,

    /**
     * Array of data for building ast.
     */
    expected: AnyChildOfSelectorRaw[],
}

/**
 * Checks whether the 'actual' is parsed into AST with specified parameters.
 *
 * @param input - { actual, expected }.
 * @param input.actual Selector to parse to ast.
 * @param input.expected Expected ast selector.
 */
export const expectSingleSelectorAstWithAnyChildren = ({ actual, expected }: SelectorListOfAnyChildrenInput): void => {
    expect(parse(actual)).toEqual(getSingleSelectorAstWithAnyChildren(expected));
};

interface ToThrowSelectorInput {
    /**
     * Selector for extCss querySelectorAll().
     */
    selector: string,

    /**
     * Error text to match.
     */
    error: string,
}

export const expectToThrowInput = (input: ToThrowSelectorInput): void => {
    const { selector, error } = input;
    expect(() => {
        parse(selector);
    }).toThrow(error);
};

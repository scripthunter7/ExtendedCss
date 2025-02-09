
/**
 * Some browsers do not support Array.prototype.flat()
 * e.g. Opera 42 which is used for browserstack tests.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat}
 *
 * @param input Array needed to be flatten.
 *
 * @throws An error if array cannot be flatten.
 */
export const flatten = <T>(input: Array<T | T[]>): Array<T> => {
    const stack: Array<T | T[]> = [];
    input.forEach((el) => stack.push(el));
    const res: Array<T> = [];
    while (stack.length) {
        // pop value from stack
        const next = stack.pop();
        if (!next) {
            throw new Error('Unable to make array flat');
        }
        if (Array.isArray(next)) {
            // push back array items, won't modify the original input
            next.forEach((el) => stack.push(el));
        } else {
            res.push(next);
        }
    }
    // reverse to restore input order
    return res.reverse();
};

/**
 * Returns first item from `array`.
 *
 * @param array Input array.
 */
export const getFirst = <T>(array: Array<T>): T | undefined => {
    return array[0];
};

/**
 * Returns last item from array.
 *
 * @param array Input array.
 */
export const getLast = <T>(array: Array<T>): T | undefined => {
    return array[array.length - 1];
};

/**
 * Takes array of ast node `children` and returns the child by the `index`.
 *
 * @param array Array of ast node children.
 * @param index Index of needed child in the array.
 * @param errorMessage Optional error message to throw.
 *
 * @throws An error if there is no child with specified `index` in array.
 */
export const getItemByIndex = <T>(array: Array<T>, index: number, errorMessage?: string): T => {
    const indexChild = array[index];
    if (!indexChild) {
        throw new Error(errorMessage || `No array item found by index ${index}`);
    }
    return indexChild;
};

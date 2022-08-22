/**
 * Some browsers do not support Array.prototype.flat()
 * for example, Opera 42 which is used for browserstack tests
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
 * @param input
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
 * Returns last item from array
 * @param array
 */
export const getLast = <T>(array: Array<T>): T => {
    return array[array.length - 1];
};

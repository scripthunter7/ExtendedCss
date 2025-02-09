/**
 * Converts array of pairs to object.
 * Object.fromEntries() polyfill because it is not supported by old browsers, e.g. Chrome 55.
 *
 * @see {@link https://caniuse.com/?search=Object.fromEntries}
 *
 * @param entries Array of pairs.
 */
export const getObjectFromEntries = <T extends string>(entries: Array<[T, T]>): { [key: string]: T } => {
    const object: { [key: string]: T } = {};
    entries.forEach((el) => {
        const [key, value] = el;
        object[key] = value;
    });
    return object;
};

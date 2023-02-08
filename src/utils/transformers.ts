/**
 * This is a type save implementation of the Pick<> utility
 * Say for example, you have an object and you want to pick a few properties from that object
 * In typescript, you can define the type very easily using Pick<> but the actual
 * implementation is a bit hard to do, hence this utility.
 *
 * For example:- let's say you have an object like this
 * ```js
 * const obj = {
 *   stringProp: "value1",
 *   numberProp: 2,
 * }
 * ```
 * It's type will be
 * ```ts
 * type obj = {
 *   stringProp: string,
 *   numberProp: number,
 * }
 * ```
 * Now if you want an object with only stringProp, you can simply do
 * ```ts
 * const objWithStringProp = pick<typeof obj, "stringProp">(obj, "stringProp")
 * ```
 * @param object The base object
 * @param keys The keys in the that you want to be picked
 * @returns
 */
export function pick<T, K extends keyof T>(
  object: T,
  ...keys: K[]
): Pick<T, K> {
  return Object.assign(
    {},
    ...keys.map((key: K) => {
      return { [key]: object[key] };
    })
  );
}

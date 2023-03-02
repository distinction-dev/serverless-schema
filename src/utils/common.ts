import type { O } from "ts-toolbelt";

/**
 * Will make all the property present in the current and child object to be
 * readonly version of their shelves, recursively.
 */
export declare type DeepReadonly<T> = T extends O.Object
  ? {
      readonly [P in keyof T]: DeepReadonly<T[P]>;
    }
  : T;

/**
 * Will make all the property present in the object to be non readonly (mutable).
 * So if you have a type like this:- `{ readonly prop: string }`, this will change it to
 * `{ prop: string }`.
 * This is useful when you're doing `as const` for better type inference
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Will make all the property present in the current and child object to be
 * non readonly (mutable), recursively.
 */
export type DeepMutable<T> = {
  -readonly [P in keyof T]: DeepMutable<T[P]>;
};

/**
 * This is a no-op function used to reduce using type casting all the time
 * Say you're using `as const` somewhere and you want to use this value,
 * But the type doesn't allow readonly, you can use this function here
 */
export function getDeepMutable<T>(param: T): DeepMutable<T> {
  return param as DeepMutable<T>;
}

/**
 * This is a no-op function used to reduce using type casting all the time
 * Say you're using `as const` somewhere and you want to use this value,
 * But the type doesn't allow readonly, you can use this function here for making first level mutable
 */
export function geMutable<T>(param: T): Mutable<T> {
  return param as Mutable<T>;
}

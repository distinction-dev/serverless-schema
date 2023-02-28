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

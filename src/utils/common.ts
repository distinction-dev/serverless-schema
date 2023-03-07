import type { List, O } from "ts-toolbelt";
import { Match } from "ts-toolbelt/out/Any/_Internal";

/**
 * Will make all the property present in the current and child object to be
 * readonly version of their shelves, recursively.
 */
export type DeepReadonly<T> = T extends O.Object
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

/**
 * Will check if first type satisfy the second type.
 * Have added it for handling cases where we get templated type and we'd use if
 * it satisfies as another type. Else we just make it a never type.
 */
export type WillSatisfy<T, U> = T extends U ? T : never;

/**
 * Get the type for a object types' values.
 */
export type ValuesOf<T extends object> = T[keyof T];

/**
 * Get a new tuple (ts-belt List) with only the element matching given type with
 * the match rule.
 *
 * We needed it because ts-built's filter is give element not matching the criteria.
 * This will give the element matching the given criteria.
 */
export type PositiveFilter<
  L extends List.List,
  M,
  match extends Match = "default"
> = List.Filter<L, List.Filter<L, M, match>[number], match>;

/**
 * Create a map with mapping from value types to key type from the original map.
 */
export type RevMapping<Map extends Record<string, string>> = {
  [v in Map[keyof Map]]: NonNullable<
    {
      [k in keyof Map]: Map[k] extends v ? k : never;
    }[keyof Map]
  >;
};

/**
 * Takes two models, one with all the required and one with non required props.
 * And resolve model with all props for required type as required props and
 * all props for non required type as optional props.
 */
export type OptionalizedProps<T extends object, props extends keyof T> = Pick<
  T,
  Exclude<keyof T, props>
> &
  Partial<Pick<T, props>>;

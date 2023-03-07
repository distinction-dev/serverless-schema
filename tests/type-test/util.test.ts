import { Test } from "ts-toolbelt";
import { Extends } from "ts-toolbelt/out/Any/Extends";
import {
  DeepMutable,
  DeepReadonly,
  Mutable,
  OptionalizedProps,
  PositiveFilter,
  RevMapping,
  ValuesOf,
  WillSatisfy,
} from "../../src/utils/common";
const { checks, check } = Test;

checks([
  check<
    DeepReadonly<{
      prop1: {
        nestedProp: string;
      };
      readonly prop2: number;
    }>,
    {
      readonly prop1: {
        readonly nestedProp: string;
      };
      readonly prop2: number;
    },
    Test.Pass
  >(),

  check<
    DeepMutable<{
      readonly prop1: {
        readonly nestedProp: string;
      };
      prop2: number;
    }>,
    {
      prop1: {
        nestedProp: string;
      };
      prop2: number;
    },
    Test.Pass
  >(),

  check<
    Mutable<{
      readonly prop1: {
        readonly nestedProp: string;
      };
      prop2: number;
    }>,
    {
      prop1: {
        readonly nestedProp: string;
      };
      prop2: number;
    },
    Test.Pass
  >(),

  check<
    WillSatisfy<"Value1" | "Value3", "Value1" | "Value2" | "Value3">,
    "Value1" | "Value3",
    Test.Pass
  >(),

  check<
    WillSatisfy<"Value4", "Value1" | "Value2" | "Value3">,
    never,
    Test.Pass
  >(),

  check<
    ValuesOf<{ prop1: "Value1"; prop2: "Value2"; prop3: "Value3" }>,
    "Value1" | "Value2" | "Value3",
    Test.Pass
  >(),

  check<PositiveFilter<[1, 2, "3", "4"], string>, ["3", "4"], Test.Pass>(),

  check<
    RevMapping<{ a: "x"; b: "y"; c: "z" }>,
    { x: "a"; y: "b"; z: "c" },
    Test.Pass
  >(),

  check<
    Extends<
      OptionalizedProps<
        {
          requiredProp1: "Value1";
          requiredProp2: "Value2";
          nonRequiredProp1: "Value1";
          nonRequiredProp2: "Value2";
        },
        "nonRequiredProp1" | "nonRequiredProp2"
      >,
      {
        requiredProp1: "Value1";
        requiredProp2: "Value2";
        nonRequiredProp1?: "Value1" | undefined;
        nonRequiredProp2?: "Value2" | undefined;
      }
    >,
    1,
    Test.Pass
  >(),

  check<
    Extends<
      {
        requiredProp1: "Value1";
        requiredProp2: "Value2";
        nonRequiredProp1?: "Value1" | undefined;
        nonRequiredProp2?: "Value2" | undefined;
      },
      OptionalizedProps<
        {
          requiredProp1: "Value1";
          requiredProp2: "Value2";
          nonRequiredProp1: "Value1";
          nonRequiredProp2: "Value2";
        },
        "nonRequiredProp1" | "nonRequiredProp2"
      >
    >,
    1,
    Test.Pass
  >(),
]);

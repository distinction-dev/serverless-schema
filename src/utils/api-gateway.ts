import { List } from "ts-toolbelt";
import { FromSchema } from "json-schema-to-ts";
import { OpenAPIV3 } from "openapi-types";

type PropIdToNameMapping = {
  header: "headers";
  query: "queries";
  path: "pathParams";
  cookie: "cookies";
};

type RevPropIdToNameMapping = {
  [v in PropIdToNameMapping[keyof PropIdToNameMapping]]: NonNullable<
    {
      [k in keyof PropIdToNameMapping]: PropIdToNameMapping[k] extends v
        ? k
        : never;
    }[keyof PropIdToNameMapping]
  >;
};

type ToPropName<S extends string> = S extends keyof PropIdToNameMapping
  ? PropIdToNameMapping[S]
  : string;
type ToPropId<S extends string> = S extends keyof RevPropIdToNameMapping
  ? RevPropIdToNameMapping[S]
  : string;
type HandleParamModel<T extends OpenAPIV3.ParameterObject> = FromSchema<
  Readonly<NonNullable<T["schema"]>>
>;

type ResPartial<T extends object> = Partial<{
  [k in keyof T]: T[k] extends object ? ResPartial<T[k]> : T[k];
}>;

type SimpleFromParameters<
  T extends OpenAPIV3.ParameterObject[] | Readonly<OpenAPIV3.ParameterObject[]>,
  extraProps
> = {
  [header in ToPropName<T[number]["in"]>]: {
    [name in List.Filter<
      T,
      List.Filter<
        T,
        { in: ToPropId<header> } & extraProps,
        "extends->"
      >[number],
      "extends->"
    >[number]["name"]]: HandleParamModel<
      List.Filter<
        T,
        List.Filter<T, { name: name } & extraProps, "extends->">[number],
        "extends->"
      >[number]
    >;
  };
};

type NoOpForReadability<T extends object> = {
  [k in keyof T]: T[k] extends object
    ? {
        [k2 in keyof T[k]]: T[k][k2];
      }
    : T[k];
};

type OptionalizedProps<
  T extends object,
  props extends keyof T
> = NoOpForReadability<
  Pick<T, Exclude<keyof T, props>> & Partial<Pick<T, props>>
>;

type OptionalizeHelper<
  RequiredProps extends object,
  NonRequiredProps extends object
> = OptionalizedProps<
  NoOpForReadability<RequiredProps & ResPartial<NonRequiredProps>>,
  {
    [k in keyof RequiredProps]: object extends RequiredProps[k] ? k : never;
  }[keyof RequiredProps]
>;

export type FromApiGatewayParameters<
  T extends OpenAPIV3.ParameterObject[] | Readonly<OpenAPIV3.ParameterObject[]>
> = OptionalizeHelper<
  SimpleFromParameters<T, { required: true }>,
  SimpleFromParameters<T, { required?: false }>
>;

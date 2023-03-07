import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { OpenAPIV3 } from "openapi-types";
import { APIGatewayProxyResult } from "aws-lambda";
import {
  PositiveFilter,
  WillSatisfy,
  ValuesOf,
  RevMapping,
  DeepReadonly,
  OptionalizedProps,
} from "./common";

/**
 * @private
 * Map for defining API Gateway parameters's in prop to the prop name to be used in handler event
 */
type PropIdToSingularNameMapping = {
  header: "headers";
  query: "queryStringParameters";
  path: "pathParameters";
  cookie: "cookies";
};

/**
 * @private
 * Map for defining API Gateway parameters's in prop to the prop name to be used for defining multi value properties
 */
type PropIdToMultiNameMapping = {
  header: "multiHeaders";
  query: "multiQueryStringParameters";
  path: "multiPathParameters";
  cookie: "multiCookies";
};

/**
 * @private
 * Helper for getting propId (the API Gateway params "in" prop) to prop name in handler event
 */
type ToPropName<
  Map extends Record<string, string>,
  S extends string
> = S extends keyof Map ? Map[S] : string;

/**
 * @private
 * Helper for getting prop id from prop name
 */
type ToPropId<
  Map extends Record<string, string>,
  S extends string
> = S extends keyof RevMapping<Map> ? RevMapping<Map>[S] : string;

/**
 * @private
 * Helper for defining prop value type using given schema for that prop, and control props
 */
type HandleParamModel<
  T extends OpenAPIV3.ParameterObject,
  AddArrayTypes extends boolean
> = AddArrayTypes extends true
  ? NonNullable<FromSchema<Readonly<NonNullable<T["schema"]>>>>[]
  : FromSchema<Readonly<NonNullable<T["schema"]>>>;

/**
 * @private
 * Helper for making current object props and one more level child props to be Partial
 */
type TwoLevelPartial<T extends object> = Partial<{
  [k in keyof T]: T[k] extends object ? Partial<T[k]> : T[k];
}>;

/**
 * @private
 * Helper for parsing model type given parameters type and control props
 *
 * Notes:
 *  - How this works:
 *    - First we loop over the each param ids
 *    - Here to do the transformation from prop id to prop name, we use the `ToPropName` and `ToPropId` helper defined above for this transformation (like `path` to `pathParameters`)
 *    - And for each prop id we filter and resolve the param definitions having that param id (like `{ in: "header", ... }`)
 *    - Then we get the names of each params in this sublist and resolve the exact param with using param id and name
 *    - After we have the param element type, we use it and parse its schema using FromSchema with the `HandleParamModel` helper
 */
type SimpleFromParameters<
  PropMap extends Record<string, string>,
  T extends
    | OpenAPIV3.ParameterObject[]
    | DeepReadonly<OpenAPIV3.ParameterObject[]>,
  extraProps,
  AddArrayTypes extends boolean
> = {
  [header in ToPropName<PropMap, T[number]["in"]>]: {
    [name in PositiveFilter<
      T,
      { in: ToPropId<PropMap, header> } & extraProps,
      "extends->"
    >[number]["name"]]: HandleParamModel<
      PositiveFilter<
        T,
        { in: ToPropId<PropMap, header>; name: name } & extraProps,
        "extends->"
      >[number],
      AddArrayTypes
    >;
  };
};

/**
 * @private
 * This helper does nothing to define or change the type.
 * Just makes it so typescript tools will show our from param type more readably.
 */
type NoOpForReadability<T extends object> = {
  [k in keyof T]: T[k] extends object
    ? {
        [k2 in keyof T[k]]: T[k][k2];
      }
    : T[k];
};

/**
 * @private
 * Helper for defining required and required types for model from API Gateway params
 */
type OptionalizeHelper<
  RequiredProps extends object,
  NonRequiredProps extends object
> = NoOpForReadability<
  OptionalizedProps<
    NoOpForReadability<RequiredProps & TwoLevelPartial<NonRequiredProps>>,
    {
      [k in keyof RequiredProps]: object extends RequiredProps[k] ? k : never;
    }[keyof RequiredProps]
  >
>;

/**
 * Type util to get Event model from API Gateway params definition
 */
export type FromOpenAPIParameters<
  T extends
    | OpenAPIV3.ParameterObject[]
    | DeepReadonly<OpenAPIV3.ParameterObject[]>
> = OptionalizeHelper<
  SimpleFromParameters<
    PropIdToSingularNameMapping,
    T,
    { required: true },
    false
  > &
    SimpleFromParameters<PropIdToMultiNameMapping, T, { required: true }, true>,
  SimpleFromParameters<
    PropIdToSingularNameMapping,
    T,
    { required?: false },
    false
  > &
    SimpleFromParameters<
      PropIdToMultiNameMapping,
      T,
      { required?: false },
      true
    >
>;

/**
 * Type util to get Event model from API Gateway operation definition
 */
export type FromOpenAPIOperation<
  T extends OpenAPIV3.OperationObject | DeepReadonly<OpenAPIV3.OperationObject>
> = NoOpForReadability<
  FromOpenAPIParameters<
    NonNullable<T["parameters"]> & OpenAPIV3.ParameterObject[]
  > &
    FromSchema<
      WillSatisfy<
        ValuesOf<
          WillSatisfy<
            T["requestBody"],
            | OpenAPIV3.RequestBodyObject
            | DeepReadonly<OpenAPIV3.RequestBodyObject>
          >["content"]
        >["schema"],
        JSONSchema
      >
    >
>;

/**
 * This type represents the allowed types for headers
 */
type AllowedHeaders = boolean | number | string;

/**
 * This function is just a wrapper that builds the response that api gateway wants
 * TODO:- Probably might be worth adding the right type for allowed status codes
 */
export function respond(
  statusCode: number,
  response: Record<string, unknown>,
  headers?: {
    [header: string]: AllowedHeaders | AllowedHeaders[];
  },
  isBase64Encoded?: boolean
): APIGatewayProxyResult {
  const result: APIGatewayProxyResult = {
    statusCode: statusCode,
    body: JSON.stringify(response),
  };
  /**
   * The next sections parses out single value and multi values headers from headers
   * This makes it easy to send out the response
   */
  const singleValueHeaders: {
    [header: string]: AllowedHeaders;
  } = {};
  const multiValueHeaders: {
    [header: string]: AllowedHeaders[];
  } = {};
  if (headers) {
    Object.keys(headers).forEach(header => {
      const value = headers[header];
      if (Array.isArray(value)) {
        multiValueHeaders[header] = value;
      } else {
        singleValueHeaders[header] = value;
      }
    });
  }
  if (Object.keys(singleValueHeaders).length > 0) {
    result.headers = singleValueHeaders;
  }
  if (Object.keys(multiValueHeaders).length > 0) {
    result.multiValueHeaders = multiValueHeaders;
  }
  if (typeof isBase64Encoded === "boolean") {
    result.isBase64Encoded = isBase64Encoded;
  }
  return result;
}

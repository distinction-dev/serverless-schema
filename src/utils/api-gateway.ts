import { List } from "ts-toolbelt";
import { FromSchema } from "json-schema-to-ts";
import { OpenAPIV3 } from "openapi-types";
import { APIGatewayProxyResult } from "aws-lambda";

type PropIdToNameMapping = {
  header: "headers";
  query: "queryStringParameters";
  path: "pathParameters";
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

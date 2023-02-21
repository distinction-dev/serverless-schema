import { List } from "ts-toolbelt";
import { FromSchema } from "json-schema-to-ts";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { APIGatewayProxyResult } from "aws-lambda";
import { JSONSchema7 } from "json-schema-to-ts/lib/types/definitions";

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
 * This contains all logic that we have encountered over the years and fixes issues we've run into
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

/**
 * Was having issues constantly creating base schema to later extend
 * And typescript was complaining because JsonSchema7 can also be boolean.
 * So created a helper function to take care of initialization
 */
function getDefaultSchema(
  additionalProperties = true
): Exclude<JSONSchema7, boolean> {
  const res: Exclude<JSONSchema7, boolean> = {
    type: "object",
    required: [],
    properties: {},
    additionalProperties,
  };
  return res;
}

function generateNewParameterSchema(
  param: OpenAPIV3_1.ParameterObject,
  existingSchema?: JSONSchema7,
  additionalProperties = true
): Exclude<JSONSchema7, boolean> {
  const res: Exclude<JSONSchema7, boolean> = {
    type: "object",
    required: [],
    // @ts-ignore
    properties: {
      [param.name]: param.schema || {
        type: "string",
      },
    },
    additionalProperties,
  };
  if (!existingSchema) {
    existingSchema = {
      ...res,
    };
  }
  /**
   * I was constantly running into issues for having to cast type constantly.
   * So I just added a type check here and threw error in the else block
   */
  if (typeof existingSchema !== "boolean") {
    existingSchema = {
      ...existingSchema,
      ...res,
    };
    if (param.required && existingSchema.required) {
      existingSchema.required.push(param.name);
    }
  } else {
    throw Error("Schema of type boolean passed");
  }
  return existingSchema;
}

/**
 * This function generates Json schema for the whole event.
 * The event being API Gateway Event from OpenApi definition of an endpoint.
 * This is very useful when you only want to maintain a single source of truth.
 */
export function generateEventSchema(pathDefinition: {
  parameters?: Array<OpenAPIV3_1.ParameterObject>;
  requestBody?: OpenAPIV3_1.RequestBodyObject;
}): Exclude<JSONSchema7, boolean> {
  const schema = getDefaultSchema(true);
  if (pathDefinition.parameters) {
    pathDefinition.parameters.forEach(param => {
      if (schema.properties) {
        switch (param.in) {
          case "query":
            schema.properties.queryStringParameters =
              generateNewParameterSchema(
                param,
                schema.properties.queryStringParameters,
                false
              );
            break;
          case "path":
            schema.properties.pathParameters = generateNewParameterSchema(
              param,
              schema.properties.pathParameters,
              false
            );
            break;
          case "header":
            schema.properties.pathParameters = generateNewParameterSchema(
              param,
              schema.properties.pathParameters
            );
            break;
        }
      }
    });
    // making path parameters and queryString parameters required if their properties are required
    schema.required = [
      ...["pathParameters", "queryStringParameters"].filter(type => {
        if (schema.properties && typeof schema.properties === "object") {
          const paramDefinition = schema.properties[type];
          if (typeof paramDefinition === "object") {
            return (
              paramDefinition.required && paramDefinition.required.length > 0
            );
          }
        }
        return false;
      }),
    ];
  }
  if (pathDefinition.requestBody) {
    // Make body as required since it can be optional in the definition
    if (pathDefinition.requestBody.required && schema.required) {
      schema.required = [...schema.required, "body"];
    }
    // move the request body schema into schema object
    const bodySchema =
      pathDefinition.requestBody.content["application/json"].schema;
    if (schema.properties && bodySchema) {
      // @ts-ignore
      schema.properties["body"] = bodySchema;
    }
  }
  return schema;
}

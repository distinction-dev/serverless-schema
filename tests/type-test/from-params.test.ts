import { DeepReadonly } from "json-schema-to-ts/lib/types/type-utils/readonly";
import { OpenAPIV3 } from "openapi-types";
import { Test } from "ts-toolbelt";
import { Extends } from "ts-toolbelt/out/Any/Extends";
import { FromOpenAPIParameters } from "../../src/utils/api-gateway";
const { checks, check } = Test;

type ExpectedParamsType = {
  queryStringParameters: {
    accountName: string;
    anotherProp?: boolean | undefined;
  };
  multiQueryStringParameters: {
    accountName: string[];
    anotherProp?: boolean[] | undefined;
  };
  pathParameters: { id: string };
  multiPathParameters: {
    id: string[];
  };
  cookies?:
    | {
        authToken?: string | undefined;
      }
    | undefined;
  multiCookies?:
    | {
        authToken?: string[] | undefined;
      }
    | undefined;
};

export type LeoParams = FromOpenAPIParameters<
  typeof LeoNotificationHeaderParameters
>;

checks([
  check<Extends<LeoParams, ExpectedParamsType>, 1, Test.Pass>(),
  check<Extends<ExpectedParamsType, LeoParams>, 1, Test.Pass>(),
]);


export const LeoNotificationHeaderParameters = ([
  {
    in: "header",
    name: "accountId",
    description:
      "The identifier for an account for which we're sending notification",
    schema: {
      type: "string",
    },
  },
  {
    in: "header",
    name: "someId",
    description:
      "The identifier for an account for which we're sending notification",
    schema: {
      type: "number",
    },
  },
  {
    in: "query",
    name: "accountName",
    required: true,
    description:
      "The identifier for an account for which we're sending notification",
    schema: {
      type: "string",
    },
  },
  {
    in: "query",
    name: "anotherProp",
    description:
      "The identifier for an account for which we're sending notification",
    schema: {
      type: "boolean",
    },
  },
  {
    in: "path",
    name: "id",
    required: true,
    description:
      "The identifier for an account for which we're sending notification",
    schema: {
      type: "string",
    },
  },
  {
    in: "cookie",
    name: "authToken",
    description:
      "The identifier for an account for which we're sending notification",
    schema: {
      type: "string",
    },
  },
] as const) satisfies DeepReadonly<OpenAPIV3.ParameterObject[]>;

import { OpenAPIV3 } from "openapi-types";
import { Test } from "ts-toolbelt";
import { Extends } from "ts-toolbelt/out/Any/Extends";
import { FromOpenAPIOperation } from "../../src/utils/api-gateway";
import { DeepReadonly } from "../../src/utils/common";
const { checks, check } = Test;

type ExpectedOperationType = {
  [x: string]: unknown;
  pathParameters: {
    accountId: "leopb" | "smartleads";
  };
  multiPathParameters: {
    accountId: NonNullable<"leopb" | "smartleads">[];
  };
  cookies?:
    | {
        abc?: boolean | undefined;
      }
    | undefined;
  multiCookies?:
    | {
        abc?: boolean[] | undefined;
      }
    | undefined;
  body: {
    [x: string]: unknown;
    type?: "error" | "warning" | "success" | "info" | undefined;
    priority?: "highest" | "high" | "medium" | "low" | undefined;
    context?:
      | {
          type: "export";
          data: {
            exportId: string;
            reasonForFailure: string;
          };
        }
      | undefined;
    userIds: string[];
    content: {
      en: {
        title: string;
        text: string;
      };
    };
  };
};

type LeoOperation = FromOpenAPIOperation<
  typeof sendUserNotificationApiDefinition
>;

checks([
  check<Extends<LeoOperation, ExpectedOperationType>, 1, Test.Pass>(),
  check<Extends<ExpectedOperationType, LeoOperation>, 1, Test.Pass>(),
]);

export const SendUserNotificationSchema = ({
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        userIds: {
          type: "array",
          items: {
            type: "string",
          },
        },
        content: {
          type: "object",
          properties: {
            en: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                },
                text: {
                  type: "string",
                },
              },
              additionalProperties: false,
              required: ["title", "text"],
            },
          },
          required: ["en"],
          additionalProperties: false,
        },
        priority: {
          type: "string",
          enum: ["highest", "high", "medium", "low"],
        },
        type: {
          type: "string",
          enum: ["error", "warning", "success", "info"],
        },
        context: {
          title: "Export Data",
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["export"],
            },
            data: {
              type: "object",
              properties: {
                exportId: {
                  type: "string",
                },
                reasonForFailure: {
                  type: "string",
                },
              },
              required: ["exportId", "reasonForFailure"],
              additionalProperties: false,
            },
          },
          additionalProperties: false,
          required: ["type", "data"],
        },
      },
      required: ["userIds", "content"],
    },
  },
  required: ["body"],
  additionalProperties: true,
} as const) satisfies DeepReadonly<OpenAPIV3.SchemaObject>;

export const AccountIdParameter = ({
  in: "path",
  name: "accountId",
  required: true,
  schema: {
    type: "string",
    enum: ["leopb", "smartleads"],
  },
  description: "The accountId for which you are connecting to this api",
} as const) satisfies DeepReadonly<OpenAPIV3.ParameterObject>;

export const sendUserNotificationApiDefinition = ({
  tags: ["Notifications"],
  parameters: [
    AccountIdParameter,
    {
      in: "cookie",
      name: "abc",
      schema: {
        type: "boolean",
      },
    },
  ],
  operationId: "sendUserNotification",
  requestBody: {
    content: {
      "application/json": {
        schema: SendUserNotificationSchema,
      },
    },
  },
  responses: {},
} as const) satisfies DeepReadonly<OpenAPIV3.OperationObject>;

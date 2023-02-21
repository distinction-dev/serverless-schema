import { assert, expect } from "chai";
import "mocha";
import { OpenAPIV3_1 } from "openapi-types";
import { generateEventSchema } from "../src/utils/api-gateway";

describe("Json Schema Test Suite", () => {
  it("Will generate valid base schema for event", () => {
    const schema = generateEventSchema({});
    assert.isObject(schema);
    if (typeof schema === "object") {
      assert.isTrue(schema.additionalProperties);
      expect(schema.type).to.equal("object");
      assert.isObject(schema.properties);
      assert.isNotNull(schema.required);
      assert.isEmpty(schema.required);
    }
  });
  it("Will generate event schema properly for one parameter", () => {
    const source: {
      parameters: Array<OpenAPIV3_1.ParameterObject>;
    } = {
      parameters: [
        {
          in: "query",
          name: "test",
          schema: {
            type: "string",
          },
          required: true,
        },
      ],
    };
    const schema = generateEventSchema(source);
    expect(schema).to.deep.equal({
      type: "object",
      properties: {
        queryStringParameters: {
          type: "object",
          properties: {
            test: {
              type: "string",
            },
          },
          required: ["test"],
          additionalProperties: false,
        },
      },
      required: ["queryStringParameters"],
      additionalProperties: true,
    });
  });
  it("Will generate event schema properly for requestBody", () => {
    const source: {
      requestBody?: OpenAPIV3_1.RequestBodyObject;
    } = {
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
            },
          },
        },
        required: true,
      },
    };
    const schema = generateEventSchema(source);
    expect(schema).to.deep.equal({
      type: "object",
      properties: {
        body: {
          type: "object",
        },
      },
      required: ["body"],
      additionalProperties: true,
    });
  });
});

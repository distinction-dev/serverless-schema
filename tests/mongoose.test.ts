import "mocha";
import { jsonSchemaToMongooseSchemaDefinition } from "../src/utils/mongoose";
import { getDeepMutable } from "../src/utils/common";
import { expect, assert } from "chai";
import { Schema, SchemaDefinition, SchemaTypeOptions } from "mongoose";
import { FromSchema } from "json-schema-to-ts";

describe("Mongoose Test Suite", () => {
  it("Will generate Schema properly", () => {
    const JobModel = {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        createdAt: {
          type: "string",
          format: "date-time",
        },
      },
      additionalProperties: false,
      required: ["_id", "createdAt"],
    } as const;
    const mongooseSchemaDefinition = jsonSchemaToMongooseSchemaDefinition(
      getDeepMutable(JobModel),
      {
        _id: {
          index: true,
        },
      }
    ) as SchemaDefinition<FromSchema<typeof JobModel>>;
    assert.isNotEmpty(mongooseSchemaDefinition.createdAt);
    assert.isNotEmpty(mongooseSchemaDefinition._id);
    if (mongooseSchemaDefinition.createdAt) {
      const createdAtSchema = mongooseSchemaDefinition.createdAt as any;
      expect(typeof createdAtSchema.type).to.equal("function");
      expect(createdAtSchema.type.name).to.equal("Date");
    }
  });
});

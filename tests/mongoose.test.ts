import "mocha";
import { jsonSchemaToMongooseSchemaDefinition } from "../src/utils/mongoose";
import { getDeepMutable } from "../src/utils/common";
import { expect, assert } from "chai";
import { Schema, SchemaDefinition } from "mongoose";
import { FromSchema } from "json-schema-to-ts";
import mongoose from "mongoose";

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

  it("Will generate Schema having number type with min and max value", () => {
    const JobJSONSchema = {
      type: "object",
      properties: {
        totalRows: {
          type: "number",
          minimum: 10,
          maximum: 20,
        },
      },
      required: ["totalRows"],
      additionalProperties: false,
    } as const;
    const mongooseSchemaDefinition = jsonSchemaToMongooseSchemaDefinition(
      getDeepMutable(JobJSONSchema)
    ) as SchemaDefinition<FromSchema<typeof JobJSONSchema>>;

    // validate schema definition of totalRows
    assert.isNotEmpty(mongooseSchemaDefinition.totalRows);
    if (mongooseSchemaDefinition.totalRows) {
      const totalRows = mongooseSchemaDefinition.totalRows as any;
      expect(typeof totalRows.type).to.equal("function");
      expect(totalRows.type.name).to.equal("Number");
      expect(totalRows.max).to.equal(20);
    }
    const JobSchema = new Schema(mongooseSchemaDefinition);

    // 'totalRows' should be type of Number
    expect(JobSchema.path("totalRows") instanceof mongoose.Schema.Types.Number)
      .to.be.true;
    // expect(JobSchema.path("totalRows").instance).to.equal("Number");

    // 'totalRows' is required field
    expect(JobSchema.path("totalRows").isRequired).to.be.true;

    // Creating job model
    const JobCountModel = mongoose.model("JobCount", JobSchema);

    // Test required field of `totalRows`
    const jobCountOne = new JobCountModel();
    const error = jobCountOne.validateSync();
    assert.equal(
      error?.errors["totalRows"].message,
      "Path `totalRows` is required."
    );

    // Test min condition on totalRows
    const jobCountTwo = new JobCountModel({ totalRows: 4 });
    const errorTwo = jobCountTwo.validateSync();
    expect(errorTwo?.errors["totalRows"].message).to.not.equal(undefined);

    const jobCountThree = new JobCountModel({ totalRows: 10 });
    const errorThree = jobCountThree.validateSync();
    assert.ok(!errorThree?.errors["totalRows"]);
  });

  it("Will generate Schema having boolean with default type ", () => {
    const JobJSONSchema = {
      type: "object",
      properties: {
        isValid: {
          type: "boolean",
          default: true,
        },
      },
      additionalProperties: false,
    } as const;
    const mongooseSchemaDefinition = jsonSchemaToMongooseSchemaDefinition(
      getDeepMutable(JobJSONSchema)
    ) as SchemaDefinition<FromSchema<typeof JobJSONSchema>>;
    if (mongooseSchemaDefinition.isValid) {
      const isValid = mongooseSchemaDefinition.isValid as any;
      expect(typeof isValid.type).to.equal("function");
      expect(isValid.type.name).to.equal("Boolean");
      expect(isValid.default).to.equal(true);
    }

    const JobSchema = new Schema(mongooseSchemaDefinition);

    // 'isValid' should be type of Number
    expect(JobSchema.path("isValid") instanceof mongoose.Schema.Types.Boolean)
      .to.be.true;

    // 'isValid' is not required field
    expect(JobSchema.path("isValid")?.isRequired || false).to.equal(false);

    // Check default value of 'isValid'
    const ValidJob = mongoose.model("ValidJob", JobSchema);
    const jobOne = new ValidJob();
    expect(jobOne.isValid).to.equal(true);
  });

  it("Will generate Schema having enum type ", () => {
    const JobJSONSchema = {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: [
            "Uploaded",
            "Inprogress",
            "Finished",
            "Invalid",
            "Aborted",
            "Cancelled",
          ],
          default: "Uploaded",
        },
      },
      additionalProperties: false,
    } as const;
    const mongooseSchemaDefinition = jsonSchemaToMongooseSchemaDefinition(
      getDeepMutable(JobJSONSchema)
    ) as SchemaDefinition<FromSchema<typeof JobJSONSchema>>;
    assert.isNotEmpty(mongooseSchemaDefinition.status);
    if (mongooseSchemaDefinition.status) {
      const status = mongooseSchemaDefinition.status as any;
      expect(typeof status.type).to.equal("function");
      expect(status.type.name).to.equal("String");
      expect(Array.isArray(status.enum)).to.equal(true);
    }

    const JobSchema = new Schema(mongooseSchemaDefinition);

    // 'status' should be type of String
    expect(JobSchema.path("status") instanceof mongoose.Schema.Types.String).to
      .be.true;

    // 'status' is not required field
    expect(JobSchema.path("status").isRequired || false).to.equal(false);

    const JobStatus = mongoose.model("JobStatus", JobSchema);

    // Check default value of 'status' is "Uploaded"
    const jobOne = new JobStatus();
    const errorOne = jobOne.validateSync();
    expect(jobOne.status).to.equal("Uploaded");
    assert.ok(!errorOne?.errors["status"]);

    // It should reject String, if it is not valid enum
    const jobTwo = new JobStatus({ status: "Closed" });
    const errorTwo = jobTwo.validateSync();
    assert.equal(
      errorTwo?.errors["status"].message,
      "`Closed` is not a valid enum value for path `status`."
    );
  });

  it("Will generate Schema having array type", () => {
    const JobJSONSchema = {
      type: "object",
      properties: {
        subJobIds: {
          type: "array",
          items: {
            type: "number",
          },
        },
      },
      additionalProperties: false,
    } as const;
    const mongooseSchemaDefinition = jsonSchemaToMongooseSchemaDefinition(
      getDeepMutable(JobJSONSchema)
    ) as SchemaDefinition<FromSchema<typeof JobJSONSchema>>;
    assert.isNotEmpty(mongooseSchemaDefinition.subJobIds);
    const JobSchema = new Schema(mongooseSchemaDefinition);
    expect(
      JobSchema.path("subJobIds") instanceof mongoose.Schema.Types.Array
    ).to.equal(true);

    const JobModel = mongoose.model("JobWithArray", JobSchema);
    const jobOne = new JobModel();
    expect(
      Array.isArray(jobOne.subJobIds) && jobOne.subJobIds.length === 0
    ).to.equal(true);
  });

  it("Will generate Schema having Date type ", () => {
    const JobJSONSchema = {
      type: "object",
      properties: {
        createdAt: {
          type: "string",
          format: "date-time",
        },
      },
      additionalProperties: false,
    } as const;
    const mongooseSchemaDefinition = jsonSchemaToMongooseSchemaDefinition(
      getDeepMutable(JobJSONSchema)
    ) as SchemaDefinition<FromSchema<typeof JobJSONSchema>>;

    const JobSchema = new Schema(mongooseSchemaDefinition);

    expect(JobSchema.path("createdAt") instanceof mongoose.Schema.Types.Date).to
      .be.true;
    const JobDate = mongoose.model("JobDate", JobSchema);

    // Validate date
    const jobOne = new JobDate({ createdAt: "12 March" }); // valid date
    const errorOne = jobOne.validateSync();
    assert.ok(!errorOne?.errors);
  });

  it("Will generate complex Schema", () => {
    const JobProgressModel = {
      type: "object",
      properties: {
        totalItems: {
          type: "number",
        },
        finishedItems: {
          type: "number",
        },
      },
      required: ["totalItems", "finishedItems"],
    } as const;

    const JobModel = {
      type: "object",
      properties: {
        createdAt: {
          type: "string",
          format: "date-time",
        },
        status: {
          type: "string",
          enum: [
            "Uploaded",
            "Inprogress",
            "Finished",
            "Invalid",
            "Aborted",
            "Cancelled",
          ],
        },
        progress: getDeepMutable(JobProgressModel),
        downloadUrl: {
          type: "string",
        },
      },
      required: ["createdAt", "status", "progress"],
    } as const;
    const mongooseSchemaDefinition = jsonSchemaToMongooseSchemaDefinition(
      getDeepMutable(JobModel)
    ) as SchemaDefinition<FromSchema<typeof JobModel>>;

    const JobSchema = new Schema(mongooseSchemaDefinition);

    // 'progress' should be type of Map
    expect(JobSchema.path("progress") instanceof mongoose.Schema.Types.Map).to
      .be.true;

    // Check 'progress' is the required field
    expect(JobSchema.path("progress")?.isRequired || false).to.equal(true);

    const Job = mongoose.model(
      "JobComplex",
      new Schema(mongooseSchemaDefinition)
    );

    const jobOne = new Job({
      downloadUrl: "https://example.csv",
      createdAt: new Date(),
      status: "Cancelled",
      progress: {
        totalItems: 30,
        finishedItems: 10,
      },
    });
    const error = jobOne.validateSync();
    assert.ok(!error?.errors);
  });
});

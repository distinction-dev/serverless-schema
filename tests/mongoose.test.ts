import "mocha";
import { jsonSchemaToMongooseSchema } from "../src/utils/mongoose";
import { getDeepMutable } from "../src/utils/common";

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
        downloadUrl: {
          type: "string",
          pattern: "(http|https)://[a-zA-Z0-9./_-]+.csv",
        },
        progress: {
          type: "object",
          properties: {
            total: {
              type: "number",
            },
            finished: {
              type: "number",
            },
          },
          required: ["total"],
        },
      },
      required: ["id", "createdAt", "status", "progress"],
    } as const;
    const mongooseSchema = jsonSchemaToMongooseSchema(
      getDeepMutable(JobModel),
      {
        _id: {
          index: true,
        },
        downloadUrl: {},
      }
    );
    console.log(mongooseSchema);
  });
});

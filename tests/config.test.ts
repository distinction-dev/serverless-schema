import { assert } from "chai";
import { describe, it } from "mocha";
import { OpenAPIV3 } from "openapi-types";
import {
  getAWSFunctionHandler,
  getCombinePaths,
  getOpenAPIPathsObject,
} from "../src/utils/config-helper";

describe("Config helper Test Suite", () => {
  it("Combine paths", () => {
    const path1: OpenAPIV3.PathsObject = {
      path1: {
        [OpenAPIV3.HttpMethods.GET]: {
          responses: {},
        },
      },
    };
    const path2: OpenAPIV3.PathsObject = {
      path1: {
        [OpenAPIV3.HttpMethods.POST]: {
          responses: {},
        },
      },
    };
    const path3: OpenAPIV3.PathsObject = {
      path2: {
        [OpenAPIV3.HttpMethods.GET]: {
          responses: {},
        },
      },
    };

    const expectedPathsObject: OpenAPIV3.PathsObject = {
      path1: {
        [OpenAPIV3.HttpMethods.GET]: {
          responses: {},
        },
        [OpenAPIV3.HttpMethods.POST]: {
          responses: {},
        },
      },
      path2: {
        [OpenAPIV3.HttpMethods.GET]: {
          responses: {},
        },
      },
    };

    const combinedPathsObject = getCombinePaths([path1, path2, path3]);
    assert.deepEqual(combinedPathsObject, expectedPathsObject);
  });

  it("Test Get Paths Object", () => {
    const expectedPathsObject: OpenAPIV3.PathsObject = {
      path1: {
        [OpenAPIV3.HttpMethods.GET]: {
          responses: {},
        },
      },
    };

    const pathsObject = getOpenAPIPathsObject(
      "path1",
      OpenAPIV3.HttpMethods.GET,
      {
        responses: {},
      }
    );

    // @ts-ignore
    assert.deepEqual(pathsObject, expectedPathsObject);
  });

  it("Test Get Function definition", () => {
    const expectedFunctionDefinition = {
      handler: "path/to/function.handler",
      events: [
        {
          http: {
            cors: true,
            method: OpenAPIV3.HttpMethods.GET,
            path: "path1",
          },
        },
      ],
    };

    const functionDefinition = getAWSFunctionHandler(
      "path1",
      OpenAPIV3.HttpMethods.GET,
      "path/to/function.handler"
    );

    // @ts-ignore
    assert.deepEqual(functionDefinition, expectedFunctionDefinition);
  });
});

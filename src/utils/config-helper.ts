import { DeepReadonly } from "json-schema-to-ts/lib/types/type-utils/readonly";
import { OpenAPIV3 } from "openapi-types";
import { DeepMutable, getDeepMutable } from "./common";

/**
 * Combine paths array in single open api paths object.
 *
 * This will be help fun when paths are defined each endpoint for modularity,
 * this can be used to combine all these separate paths in one.
 */
export const getCombinePaths = (
  paths: NonNullable<OpenAPIV3.Document["paths"]>[]
): NonNullable<OpenAPIV3.Document["paths"]> =>
  paths.reduce(
    (parsedPaths, path) => ({
      ...parsedPaths,
      ...Object.fromEntries(
        Object.entries(path).map(([path, methods]) => [
          path,
          { ...parsedPaths[path], ...methods },
        ])
      ),
    }),
    {}
  );

/**
 * Will help in creating paths object form path, method and operation schema.
 */
export const getOpenAPIPathsObject = <
  Path extends string,
  Method extends OpenAPIV3.HttpMethods,
  Operation extends
    | OpenAPIV3.OperationObject
    | DeepReadonly<OpenAPIV3.OperationObject>,
>(
  path: Path,
  method: Method,
  operationSpec: Operation,
): Record<Path, Record<Method, DeepMutable<Operation>>> => {
  const schema = ({
    [path]: {
      [method]: operationSpec as DeepMutable<Operation>,
    },
  } as Record<Path, Record<Method, DeepMutable<Operation>>>) satisfies OpenAPIV3.PathsObject;

  return schema as DeepMutable<typeof schema>;
};

/**
 * Will help reducing boilerplate for defining Lambda handler.
 */
export const getAWSFunctionHandler = <
  Path extends string,
  Method extends OpenAPIV3.HttpMethods,
  Handler extends string,
>(
  path: Path,
  method: Method,
  handler: Handler,
) => {
    const functionDefinition = {
      handler,
      events: [
        {
          http: {
            cors: true,
            method: method.toLocaleUpperCase(),
            path,
          },
        },
      ],
    } as const;

  return getDeepMutable(functionDefinition);
}

import { DeepReadonly } from "json-schema-to-ts/lib/types/type-utils/readonly";
import { OpenAPIV3 } from "openapi-types";
import { DeepMutable, getDeepMutable } from "./common";

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

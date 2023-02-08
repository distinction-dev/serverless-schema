import {
  JSONSchema7,
  JSONSchema7Definition,
  JSONSchema7Type,
  JSONSchema7Object,
  JSONSchema7Array,
} from "json-schema";
import { SchemaDefinition } from "dynamoose/dist/Schema";

export function jsonSchemaToDynamooseSchema(
  schema: JSONSchema7
): SchemaDefinition {
  const res: SchemaDefinition = {};
  if (schema.type !== "object") {
    if (!schema.properties) {
      throw new Error("No properties defined in the schema");
    } else {
      for (const key in schema.properties) {
        res[key] = getSchemaForDefinition(schema.properties[key]);
      }
    }
  }
  return res;
}

type SchemaAttributeDefinition = SchemaDefinition[string];

interface DynamooseAttributeDefinition {
  /**
   * You can set this to true to overwrite what the `hashKey` for the Model will be. By default the `hashKey` will be the first key in the Schema object.
   *
   * `hashKey` is commonly called a `partition key` in the AWS documentation.
   *
   * ```js
   * {
   * 	"id": String,
   * 	"key": {
   * 		"type": String,
   * 		"hashKey": true
   * 	}
   * }
   * ```
   */
  hashKey?: boolean;
}

function getSchemaForDefinition(
  definition: JSONSchema7Definition & {
    dynamooseSettings?: DynamooseAttributeDefinition;
  }
): SchemaAttributeDefinition {
  if (typeof definition !== "boolean") {
    let res: SchemaAttributeDefinition = {
      type: Object,
    };
    switch (definition.type) {
      case "number":
        res = {
          type: Number,
        };
        if (definition.enum && !definition.enum.includes(null)) {
          res.enum = extractEnum(definition.enum);
        }
        break;
      case "string":
        res = {
          type: String,
        };
        if (definition.enum && !definition.enum.includes(null)) {
          res.enum = definition.enum as Exclude<
            JSONSchema7Type,
            null | JSONSchema7Object | JSONSchema7Array
          >[];
        }
        break;
    }
    if (definition.dynamooseSettings) {
      res = {
        ...res,
        ...definition.dynamooseSettings,
      };
    }
    return res;
  } else {
    return {
      type: Object,
    };
  }
}

type AllowedEnums = Exclude<
  JSONSchema7Type,
  null | JSONSchema7Array | JSONSchema7Object
>;
function extractEnum(
  values: JSONSchema7Type[]
): Array<AllowedEnums | AllowedEnums[]> {
  return values
    .map(v => {
      if (Array.isArray(v)) {
        return v.filter(v => v !== null);
      } else if (typeof v === "object") {
        return null;
      }
      return v;
    })
    .filter(v => v !== null) as Array<AllowedEnums | AllowedEnums[]>;
}

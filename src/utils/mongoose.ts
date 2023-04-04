import {
  JSONSchema7,
  JSONSchema7Array,
  JSONSchema7Definition,
  JSONSchema7Object,
  JSONSchema7Type,
} from "json-schema";
import { SchemaDefinition, SchemaDefinitionProperty } from "mongoose";

export function jsonSchemaToMongooseSchemaDefinition(
  schema: JSONSchema7,
  schemaExtensions?: { [path: string]: Partial<SchemaDefinitionProperty> }
): SchemaDefinition {
  const res: SchemaDefinition = {};
  if (schema.type === "object") {
    if (!schema.properties) {
      throw new Error("No properties defined in the schema");
    } else {
      for (const key in schema.properties) {
        let keySchemaDefinition = getSchemaForDefinition(
          schema.properties[key],
          schema.required && schema.required.includes(key)
        );
        if (schemaExtensions && schemaExtensions[key]) {
          keySchemaDefinition = Object.assign(
            keySchemaDefinition,
            schemaExtensions[key]
          );
        }
        res[key] = keySchemaDefinition;
      }
    }
  }
  return res;
}

function getSchemaForDefinition(
  definition: JSONSchema7Definition,
  isRequired?: boolean
): SchemaDefinitionProperty {
  if (typeof definition !== "boolean") {
    let res: SchemaDefinitionProperty = {
      type: Map,
    };
    switch (definition.type) {
      case "number":
      case "integer":
        res = {
          type: Number,
        };
        if (definition.enum) {
          res.enum = extractEnum(definition.enum);
        }
        if (definition.minimum) {
          res.min = definition.minimum;
        }
        if (definition.maximum) {
          res.max = definition.maximum;
        }
        break;
      case "boolean":
        res = {
          type: Boolean,
        };
        break;
      case "string":
        if (definition.format === "date-time") {
          res = {
            type: Date,
          };
          if (definition.minimum) {
            res.min = new Date(definition.minimum);
          }
          if (definition.maximum) {
            res.max = new Date(definition.maximum);
          }
        } else if (definition.format === "binary") {
          res = {
            type: Buffer,
          };
        } else {
          res = {
            type: String,
          };
          if (definition.enum) {
            res.enum = extractEnum(definition.enum);
          }
          if (definition.maxLength) {
            res.maxlength = definition.maxLength;
          }
          if (definition.minLength) {
            res.minlength = definition.minLength;
          }
          if (definition.pattern) {
            res.match = definition.pattern;
          }
        }
        break;
      case "object":
        res = {
          type: Map,
        };
        if (definition.properties) {
          res.of = jsonSchemaToMongooseSchemaDefinition(definition);
        }
        break;
      case "array":
        // Still a work in progress
        res = {
          type: Array,
        };
        if (definition.items) {
          if (
            typeof definition.items !== "boolean" &&
            !Array.isArray(definition.items)
          ) {
            res = {
              type: [getSchemaForDefinition(definition.items)],
            };
          }
        }
    }
    if (definition.default) {
      res.default = definition.default;
    }
    if (isRequired) {
      res.required = true;
    }
    return res;
  } else {
    return {
      type: Map,
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

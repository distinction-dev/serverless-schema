# Mongoose Utils

[Mongoose](https://mongoosejs.com/) is an ODM later for MongoDB, this library contains a few utilities for helping out with MongoDB items along with a few tips and tricks.

## Mongoose Schema Definitions Generator

This function allows you to bring a simple JSON Schema(used as the base schema) and generates a base schema definition for Mongoose. You can then extend or modify this schema and then use it to create your models.

### Example

```ts
import {jsonSchemaToMongooseSchemaDefinition} from "serverless-schema"
import {Schema} from "mongoose"
const personSchema = {
    type: "object",
    properties: {
        _id: {
            type: "string"
        },
        name: {
            type: "string"
        }
    },
    required: ["_id", "name"]
} as const

const personMongooseSchema = new Schema(
    jsonSchemaToMongooseSchemaDefinition(
        personSchema,
        {
            _id: {
                index: true
            }
        }
    )
)
```

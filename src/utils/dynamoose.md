# Dynamoose Utils

Reasons why this utility exists:-
Dynamoose is great, in the sense that you can truly define a schema for your Data model and much more than that, then why should we even use another library with it?

JSON Schema, that's why
I love having the freedom of defining model object in json schema, especially since it allows me to use that in all sorts of places, use middlewares to validate responses when you're returning dynamodb query results, get types from it using `FromSchema` and so much more, and the last thing I want is to have to define dynamoose schema again, but rather leverage JSON schema and allow users to pass dynamoose related settings and get your dynamoose schema out of it

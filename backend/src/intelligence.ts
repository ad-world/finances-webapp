import { OpenAI } from "npm:openai";
import { zodResponseFormat } from "npm:openai/helpers/zod";
import * as zod from "npm:zod";

const X_AI_KEY = Deno.env.get("X_AI_KEY");

const client = new OpenAI({
  apiKey: X_AI_KEY,
  baseURL: "https://api.x.ai/v1",
});

const headerMappingSchema = zod.object({
  "currency": zod.string(),
  "account_type": zod.string(),
  "description": zod.string(),
  "transaction_date": zod.string(),
  "transaction_type": zod.string(),
});

export const getHeaderMapping = async (sample_transaction: Record<string, string>) => {
    const prompt = `
    You are a helpful assistant that helps with mapping unknown headers to a set of bounded headers..
    The response should be an object that maps the headers in the sample transaction to the headers in the given response schema, where the keys 
    are the known headers and the values are the unknown headers.
    The unknown headers are ${JSON.stringify(sample_transaction)}.
    The known headers are ${JSON.stringify(headerMappingSchema)}.
    Please map the headers to the schema.
    Skip the pre-amble, and only return the JSON object.
    `
    const response = await client.beta.chat.completions.parse({
        model: "grok-2-1212",
        messages: [{ role: "user", content: prompt }],
        response_format: zodResponseFormat(headerMappingSchema, "header_mapping"),
    });
    return response.choices[0].message.parsed;
};



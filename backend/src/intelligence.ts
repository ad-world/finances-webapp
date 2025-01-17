import { OpenAI } from "openai";
import type { TransactionSchema } from "./types/transaction.ts";
import { headerMappingPrompt } from "./prompts/index.ts";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = process.env.GROQ_BASE_URL;

const client = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: GROQ_BASE_URL,
});


export const getHeaderMapping = async (sample_transaction: TransactionSchema) => {
    const prompt = headerMappingPrompt(sample_transaction);
    const response = await client.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content ?? "{}");
};


export const normalizeTransactions = (transactions: Record<string, string>[], headerMapping: TransactionSchema) => {
  const normalizedTransactions = transactions.map((transaction) => {
    const normalizedTransaction: Record<string, string> = {};
    Object.keys(headerMapping).forEach((key) => {
      normalizedTransaction[key] = transaction[headerMapping[key as keyof TransactionSchema]];
    });

    normalizedTransaction["category"] = "unknown";
    return normalizedTransaction;
  });
  return normalizedTransactions;
};



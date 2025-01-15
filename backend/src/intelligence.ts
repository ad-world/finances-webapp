import { OpenAI } from "npm:openai";
import { Transaction } from "./types/transaction.ts";
import { headerMappingPrompt } from "./prompts/index.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_BASE_URL = Deno.env.get("GROQ_BASE_URL");

const client = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: GROQ_BASE_URL,
});


export const getHeaderMapping = async (sample_transaction: Transaction) => {
    const prompt = headerMappingPrompt(sample_transaction);
    const response = await client.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content ?? "{}");
};


export const normalizeTransactions = (transactions: Record<string, string>[], headerMapping: Transaction) => {
  const normalizedTransactions = transactions.map((transaction) => {
    const normalizedTransaction: Record<string, string> = {};
    Object.keys(headerMapping).forEach((key) => {
      normalizedTransaction[key] = transaction[headerMapping[key as keyof Transaction]];
    });

    normalizedTransaction["category"] = "unknown";
    return normalizedTransaction;
  });
  return normalizedTransactions;
};



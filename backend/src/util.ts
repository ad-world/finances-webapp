import OpenAI from "openai";
import type { TransactionSchema } from "./types/transaction";

export const generateTransactionKey = (transaction: TransactionSchema) => {
    return `${transaction.currency}-${transaction.account_type}-${transaction.transaction_type}-${transaction.description}`;
}

export const generateJsonWithRetry = async<T>(prompt: string, maxRetries: number = 3, delayMs: number = 1000) => {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const GROQ_BASE_URL = process.env.GROQ_BASE_URL;

    const client = new OpenAI({
    apiKey: GROQ_API_KEY,
    baseURL: GROQ_BASE_URL,
    });

    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await client.chat.completions.create({
                model: "llama3-70b-8192",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
            })

            return JSON.parse(response.choices[0].message.content ?? "{}") as T;
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
}
import { getHeaderMapping, normalizeTransactions } from "./intelligence.ts";
import { parseCsv } from "./parse.ts";
import { Server } from "./server.ts";
import type { TransactionSchema } from "./types/transaction.ts";

const server = new Server(3000);

type FileMap = {
    [fieldName: string]: File[];
  };

async function extractFiles(req: Request): Promise<FileMap> {
  const contentType = req.headers.get("content-type");
  if (!contentType || !contentType.includes("multipart/form-data")) {
    throw new Error("Request must be multipart/form-data");
  }

  const formData = await req.formData();
  const files: FileMap = {};

  for (const [fieldName, value] of Object.entries(formData)) {
    if (value instanceof File) {
      if (!files[fieldName]) {
        files[fieldName] = [];
      }
      files[fieldName].push(value);
    }
  }

  return files;
}

const headerMappingCache = new Map<string, Record<keyof TransactionSchema, string>>();

server.post("/api/upload", async (req) => {
    try {
        const files = await extractFiles(req);
        const allTransactions = [];

        for (const file of Object.keys(files)) {
            const csvData = await parseCsv(files[file][0]);
            if (!csvData.length) continue;

            const headers = JSON.stringify(csvData[0]);
            let cachedHeaderMapping = headerMappingCache.get(headers);
            
            if (!cachedHeaderMapping) {
                const headerMapping = await getHeaderMapping(csvData[0]);
                if (!headerMapping) {
                    throw new Error('Could not determine header mapping');
                }
                headerMappingCache.set(headers, headerMapping);
                cachedHeaderMapping = headerMapping;
            }

            const normalizedTransactions = normalizeTransactions(csvData, cachedHeaderMapping);
            allTransactions.push(...normalizedTransactions);
        }

        return new Response(JSON.stringify({ success: true, transactions: allTransactions }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
            headers: { "Content-Type": "application/json" }
        });
    }
});

server.start();
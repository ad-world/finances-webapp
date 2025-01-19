import type { BunFile } from "bun";

export const parseCsv = async (file: File) => {
  const text = await file.text();
  const rows = text.trim().split("\n");
  const headers = rows[0].split(",");
  const jsonData = [];

  for (let i = 1; i < rows.length; i++) {
    if (rows[i].trim() === "") continue;
    const values = rows[i].split(",");
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || "";
    });
    jsonData.push(row);
  }

  return jsonData;
};

export const parseBunCsv = async (file: BunFile) => {
  const text = await file.text();
  const rows = text.trim().split("\n");
  const headers = rows[0].split(",");
  const jsonData = [];

  for (let i = 1; i < rows.length; i++) {
    if (rows[i].trim() === "") continue;
    const values = rows[i].split(",");
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || "";
    });
    jsonData.push(row);
  }

  return jsonData;
};



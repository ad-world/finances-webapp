export const parseCsv = async (fileName: string) => {
  const file = await Deno.open(fileName);
  const reader = file.readable.getReader();
  const result = await reader.read();
  const text = new TextDecoder().decode(result.value);
  const rows = text.split("\n");
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

  file.close();

  return jsonData;
};




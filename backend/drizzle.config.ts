import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema',
  out: './migrations',
  dbCredentials: {
    url: 'data.db'
  }
});
import { Pool } from "pg";

const PG_CONNECTION_STRING = process.env.PG_CONNECTION_STRING;

export const createPool = () => {
  const connectionString = PG_CONNECTION_STRING;
  return new Pool({ connectionString });
};

export const pgPool = createPool()
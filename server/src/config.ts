import dotenv from 'dotenv';

dotenv.config();

type Config = {
  user: string,
  password: string,
  database: string,
  host: string,
  port: number,
};

const config: Config = {
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME ? process.env.DB_NAME : "swampstudy",
  host: process.env.DB_HOST ? process.env.DB_HOST : "localhost",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
};

export default config;

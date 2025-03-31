import dotenv from 'dotenv';

dotenv.config();

function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === null || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnvVar(key: string): string | undefined {
  return process.env[key];
}

function getEnvVarAsInt(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined || value === null) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid environment variable ${key}: "${value}"`);
  }
  return parsed;
}

type DBConfig = {
  user: string;
  password: string;
  database: string;
  host: string;
  port: number;
};

type EmailConfig = {
  fromAddress: string;
  sendgridApiKey: string | undefined;
};

type Config = {
  BaseUrl: string;
  nodeEnv: string;
  dbConfig: DBConfig | undefined;
  emailConfig: EmailConfig;
};

/*
 * Gets a database config from environment variables.
 * Any missing database config will lead to an undefined config.
 * This is so tests can be ran without needing a database set up.
 */
function getDbConfig(): DBConfig | undefined {
  try {
    return {
      user: getRequiredEnvVar("DB_USER"),
      password: getRequiredEnvVar("DB_PASSWORD"),
      database: getRequiredEnvVar("DB_NAME"),
      host: getRequiredEnvVar("DB_HOST"),
      port: getEnvVarAsInt("DB_PORT", 5432),
    };
  } catch (err: any) {
    return undefined;
  }
}

const config: Config = {
  BaseUrl: getRequiredEnvVar("BASE_URL"),
  nodeEnv: getOptionalEnvVar("NODE_ENV") || "development",
  dbConfig: getDbConfig(),
  emailConfig: {
    fromAddress: getRequiredEnvVar("EMAIL_FROM"),
    sendgridApiKey: getOptionalEnvVar("SENDGRID_API_KEY"),
  }
};
console.log(
  `Config loaded for NODE_ENV='${config.nodeEnv}'. DB config ${
    config.dbConfig ? "present" : "absent"
  }.`,
);

export default config;

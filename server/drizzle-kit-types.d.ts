declare module "drizzle-kit" {
  export interface Config {
    dialect: "postgresql" | "mysql" | "sqlite";
    schema: string;
    out: string;
    dbCredentials: {
      url: string;
    };
    verbose?: boolean;
    strict?: boolean;
  }

  export function defineConfig(config: Config): Config;
}

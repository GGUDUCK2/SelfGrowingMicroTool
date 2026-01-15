export type StackId = 'node' | 'python' | 'go' | 'rust' | 'static' | 'php' | 'java';

export interface Project {
  id: string;
  name: string;
  stackId: StackId;
  config: ProjectConfig;
  updatedAt: number;
}

export interface ProjectConfig {
  port: number;
  envVars: EnvVar[];
  databases: DatabaseId[];
  buildCmd?: string;
  startCmd?: string;
  baseImage: string; // e.g. node:18-alpine
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'pip' | 'poetry' | 'gomod' | 'cargo' | 'composer' | 'maven' | 'gradle';
}

export interface EnvVar {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
}

export type DatabaseId = 'postgres' | 'mysql' | 'redis' | 'mongo';

export interface StackDefinition {
  id: StackId;
  name: string;
  icon: string;
  defaultPort: number;
  defaultImage: string;
  versions: string[];
  buildCmdPlaceholder?: string;
  startCmdPlaceholder?: string;
}

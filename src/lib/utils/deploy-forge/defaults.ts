import type { StackDefinition } from './types';

export const STACKS: StackDefinition[] = [
  {
    id: 'node',
    name: 'Node.js',
    icon: 'node',
    defaultPort: 3000,
    defaultImage: 'node:20-alpine',
    versions: ['node:20-alpine', 'node:18-alpine', 'node:16-alpine'],
    buildCmdPlaceholder: 'npm run build',
    startCmdPlaceholder: 'npm start'
  },
  {
    id: 'python',
    name: 'Python',
    icon: 'python',
    defaultPort: 8000,
    defaultImage: 'python:3.11-slim',
    versions: ['python:3.11-slim', 'python:3.10-slim', 'python:3.9-slim'],
    buildCmdPlaceholder: '',
    startCmdPlaceholder: 'python app.py'
  },
  {
    id: 'go',
    name: 'Go',
    icon: 'go',
    defaultPort: 8080,
    defaultImage: 'golang:1.21-alpine',
    versions: ['golang:1.21-alpine', 'golang:1.20-alpine'],
    buildCmdPlaceholder: 'go build -o main .',
    startCmdPlaceholder: './main'
  },
  {
    id: 'rust',
    name: 'Rust',
    icon: 'rust',
    defaultPort: 8080,
    defaultImage: 'rust:1.75-alpine',
    versions: ['rust:1.75-alpine', 'rust:1.70-alpine'],
    buildCmdPlaceholder: 'cargo build --release',
    startCmdPlaceholder: './target/release/app'
  },
  {
    id: 'static',
    name: 'Static / HTML',
    icon: 'html',
    defaultPort: 80,
    defaultImage: 'nginx:alpine',
    versions: ['nginx:alpine'],
    buildCmdPlaceholder: '',
    startCmdPlaceholder: ''
  }
];

export const DATABASE_DEFINITIONS = {
  postgres: {
    name: 'PostgreSQL',
    image: 'postgres:15-alpine',
    port: 5432,
    env: {
      POSTGRES_USER: 'user',
      POSTGRES_PASSWORD: 'password',
      POSTGRES_DB: 'mydb'
    }
  },
  mysql: {
    name: 'MySQL',
    image: 'mysql:8.0',
    port: 3306,
    env: {
      MYSQL_ROOT_PASSWORD: 'rootpassword',
      MYSQL_DATABASE: 'mydb',
      MYSQL_USER: 'user',
      MYSQL_PASSWORD: 'password'
    }
  },
  redis: {
    name: 'Redis',
    image: 'redis:alpine',
    port: 6379,
    env: {}
  },
  mongo: {
    name: 'MongoDB',
    image: 'mongo:6.0',
    port: 27017,
    env: {
      MONGO_INITDB_ROOT_USERNAME: 'root',
      MONGO_INITDB_ROOT_PASSWORD: 'rootpassword'
    }
  }
};

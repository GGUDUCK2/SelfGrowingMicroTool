import yaml from 'js-yaml';
import type { ProjectConfig, DatabaseId } from './types';
import { DATABASE_DEFINITIONS } from './defaults';

export function generateCompose(config: ProjectConfig): string {
    const services: any = {
        app: {
            build: '.',
            ports: [`${config.port}:${config.port}`],
            environment: config.envVars.reduce((acc, env) => {
                // Use variable expansion for all env vars to encourage .env usage
                acc[env.key] = `\${${env.key}}`;
                return acc;
            }, {} as Record<string, string>)
        }
    };

    const volumes: any = {};

    config.databases.forEach((dbId) => {
        const dbDef = (DATABASE_DEFINITIONS as any)[dbId];
        if (!dbDef) return;

        services[dbId] = {
            image: dbDef.image,
            ports: [`${dbDef.port}:${dbDef.port}`],
            environment: dbDef.env,
            restart: 'always',
        };

        // Add volume
        let volumePath = '';
        if (dbId === 'postgres') volumePath = '/var/lib/postgresql/data';
        else if (dbId === 'mysql') volumePath = '/var/lib/mysql';
        else if (dbId === 'mongo') volumePath = '/data/db';
        else if (dbId === 'redis') volumePath = '/data';

        if (volumePath) {
             services[dbId].volumes = [`${dbId}_data:${volumePath}`];
             volumes[`${dbId}_data`] = {}; // empty object for correct yaml
        }
    });

    const compose = {
        version: '3.8',
        services,
        volumes: Object.keys(volumes).length > 0 ? volumes : undefined
    };

    return yaml.dump(compose, {
        indent: 2,
        lineWidth: -1,
        noRefs: true
    });
}

export function generateEnv(config: ProjectConfig): string {
    // Generate .env content with actual values
    return config.envVars.map(env => `${env.key}=${env.value}`).join('\n');
}

export function generateEnvExample(config: ProjectConfig): string {
    // Generate .env.example with placeholders
    return config.envVars.map(env => `${env.key}=change_me`).join('\n');
}

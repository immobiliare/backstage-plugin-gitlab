import type { Entity } from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import {
    readGitLabIntegrationConfigs,
    GitLabIntegrationConfig,
} from '@backstage/integration';
import { getProjectPath } from './urls';
import type {
    CatalogProcessor,
    CatalogProcessorEmit,
} from '@backstage/plugin-catalog-node';
import {
    GITLAB_INSTANCE,
    GITLAB_PROJECT_ID,
    GITLAB_PROJECT_SLUG,
} from './../annotations';
import type { LocationSpec } from '@backstage/plugin-catalog-common';

/** @public */
export class GitlabFillerProcessor implements CatalogProcessor {
    private readonly allowedKinds: Set<string>;
    private readonly gitLabIntegrationsConfig: GitLabIntegrationConfig[];

    constructor(config: Config) {
        const allowedKinds = config.getOptionalStringArray(
            'gitlab.allowedKinds'
        ) || ['Component'];
        this.gitLabIntegrationsConfig = readGitLabIntegrationConfigs(
            config.getConfigArray('integrations.gitlab')
        );

        this.allowedKinds = new Set(
            allowedKinds.map((str) => str.toLowerCase())
        );
    }

    getProcessorName(): string {
        return 'GitlabFillerProcessor';
    }

    async postProcessEntity(
        entity: Entity,
        location: LocationSpec,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _emit: CatalogProcessorEmit
    ): Promise<Entity> {
        // Check if we should process its kind first
        if (this.isAllowedEntity(entity)) {
            // Check if it has a GitLab integration
            const gitlabInstance = this.getGitlabInstance(location.target);
            if (gitlabInstance) {
                if (!entity.metadata.annotations)
                    entity.metadata.annotations = {};

                // Set GitLab Instance
                if (!entity.metadata.annotations?.[GITLAB_INSTANCE]) {
                    entity.metadata.annotations![GITLAB_INSTANCE] =
                        gitlabInstance;
                }

                // Generate Project Slug from location URL if neither Project ID nor Project Slug are specified
                if (
                    !entity.metadata.annotations?.[GITLAB_PROJECT_ID] &&
                    !entity.metadata.annotations?.[GITLAB_PROJECT_SLUG]
                ) {
                    entity.metadata.annotations![GITLAB_PROJECT_SLUG] =
                        getProjectPath(location.target);
                }
            }
        }

        return entity;
    }

    private getGitlabInstance(target: string): string | undefined {
        let url: URL;
        try {
            url = new URL(target);
        } catch (e) {
            return undefined;
        }

        const gitlabConfig = this.gitLabIntegrationsConfig.find((config) => {
            const baseUrl = config.baseUrl
                ? new URL(config.baseUrl)
                : new URL(`https://${config.host}`);
            return baseUrl.origin === url.origin;
        });

        return gitlabConfig?.host;
    }

    private isAllowedEntity(entity: Entity): boolean {
        return this.allowedKinds.has(entity.kind.toLowerCase());
    }
}

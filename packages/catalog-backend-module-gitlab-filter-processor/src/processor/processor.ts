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
} from './annotations';
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
            const gitlabInstanceConfig = this.getGitlabInstanceConfig(
                location.target
            );
            if (gitlabInstanceConfig) {
                if (!entity.metadata.annotations)
                    entity.metadata.annotations = {};

                // Set GitLab Instance when it's there yet, but handle an empty string as specified.
                if (
                    !entity.metadata.annotations[GITLAB_INSTANCE] &&
                    entity.metadata.annotations[GITLAB_INSTANCE] !== ''
                ) {
                    entity.metadata.annotations[GITLAB_INSTANCE] =
                        gitlabInstanceConfig?.host;
                }

                // Generate Project Slug from location URL if neither Project ID nor Project Slug are specified.
                // Handle empty strings as specified.
                if (
                    !entity.metadata.annotations[GITLAB_PROJECT_ID] &&
                    entity.metadata.annotations[GITLAB_PROJECT_ID] !== '' &&
                    !entity.metadata.annotations[GITLAB_PROJECT_SLUG] &&
                    entity.metadata.annotations[GITLAB_PROJECT_SLUG] !== ''
                ) {
                    entity.metadata.annotations[GITLAB_PROJECT_SLUG] =
                        getProjectPath(
                            location.target,
                            this.getGitlabSubPath(gitlabInstanceConfig)
                        );
                }
            }
        }

        return entity;
    }

    private getGitlabSubPath(
        config: GitLabIntegrationConfig
    ): string | undefined {
        if (config.baseUrl) return new URL(config.baseUrl).pathname;
        return;
    }

    private getGitlabInstanceConfig(
        target: string
    ): GitLabIntegrationConfig | undefined {
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

        return gitlabConfig;
    }

    private isAllowedEntity(entity: Entity): boolean {
        return this.allowedKinds.has(entity.kind.toLowerCase());
    }
}

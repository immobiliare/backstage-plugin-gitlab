import type { Entity } from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import { readGitLabIntegrationConfigs } from '@backstage/integration';
import { getProjectPath } from './urls';
import type {
    CatalogProcessor,
    CatalogProcessorEmit,
} from '@backstage/plugin-catalog-backend';
import type { LocationSpec } from '@backstage/plugin-catalog-common';
import type { GitLabIntegrationConfig } from '@backstage/integration';

/** @public */
export class GitlabFillerProcessor implements CatalogProcessor {
    private readonly allowedKinds: Set<string>;
    private readonly gitLabIntegrationsConfig: GitLabIntegrationConfig[];

    constructor(config: Config) {
        const allowedKinds = config.getOptionalStringArray(
            'gitlab.allowKinds'
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
        _emit: CatalogProcessorEmit
    ): Promise<Entity> {
        if (
            location.type === 'url' &&
            entity.metadata.annotations &&
            // To make annotation constants
            !entity.metadata.annotations['gitlab.com/project-id'] &&
            !entity.metadata.annotations['gitlab.com/project-slug'] &&
            this.allowedKinds.has(entity.kind.toLowerCase()) &&
            this.isValidGitlabHost(location.target)
        ) {
            entity.metadata.annotations['gitlab.com/project-slug'] =
                getProjectPath(location.target);
        }

        return entity;
    }

    private isValidGitlabHost(target: string) {
        const url = new URL(target);

        return this.gitLabIntegrationsConfig.some((config) => {
            const baseUrl = new URL(config.baseUrl);
            return url.origin === baseUrl.origin;
        });
    }
}

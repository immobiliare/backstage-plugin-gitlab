import type { Entity } from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import { readGitLabIntegrationConfigs } from '@backstage/integration';
import { getProjectPath } from './urls';
import type {
    CatalogProcessor,
    CatalogProcessorEmit,
} from '@backstage/plugin-catalog-backend';
import {
    GITLAB_INSTANCE,
    GITLAB_PROJECT_ID,
    GITLAB_PROJECT_SLUG,
} from './../annotations';
import type { LocationSpec } from '@backstage/plugin-catalog-common';
import type { GitLabIntegrationConfig } from '@backstage/integration';

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
        _emit: CatalogProcessorEmit
    ): Promise<Entity> {
        if (
            location.type === 'url' &&
            // TODO: make annotation constants
            !entity.metadata.annotations?.[GITLAB_PROJECT_ID] &&
            !entity.metadata.annotations?.[GITLAB_PROJECT_SLUG] &&
            !entity.metadata.annotations?.[GITLAB_INSTANCE] &&
            this.allowedKinds.has(entity.kind.toLowerCase()) &&
            this.isValidGitlabHost(location.target)
        ) {
            if (!entity.metadata.annotations) entity.metadata.annotations = {};
            entity.metadata.annotations[GITLAB_PROJECT_SLUG] = getProjectPath(
                location.target
            );
            entity.metadata.annotations[GITLAB_INSTANCE] =
                this.getGitlabInstance(location.target);
        }

        return entity;
    }

    private getGitlabInstance(target: string): string {
        const url = new URL(target);

        // TODO: handle the possibility to have a baseUrl with a path
        const index = this.gitLabIntegrationsConfig.findIndex(
            ({ baseUrl }) => baseUrl === url.origin
        );

        if (index < 0) return '0';

        return index.toString(10);
    }

    private isValidGitlabHost(target: string) {
        const url = new URL(target);

        return this.gitLabIntegrationsConfig.some((config) => {
            const baseUrl = new URL(config.baseUrl);
            return url.origin === baseUrl.origin;
        });
    }
}

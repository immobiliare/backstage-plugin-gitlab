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
        // Check if it is a GitLab Host
        if (this.isValidLocation(location) && this.isAllowedEntity(entity)) {
            if (!entity.metadata.annotations) entity.metadata.annotations = {};
            // Generate Project Slug if not specified
            if (
                !entity.metadata.annotations?.[GITLAB_PROJECT_ID] &&
                !entity.metadata.annotations?.[GITLAB_PROJECT_SLUG]
            ) {
                entity.metadata.annotations[GITLAB_PROJECT_SLUG] =
                    getProjectPath(location.target);
            }
            // Discover gitlab instance
            if (!entity.metadata.annotations?.[GITLAB_INSTANCE]) {
                entity.metadata.annotations[GITLAB_INSTANCE] =
                    this.getGitlabInstance(location.target);
            }
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

    private isAllowedEntity(entity: Entity): boolean {
        return this.allowedKinds.has(entity.kind.toLowerCase());
    }

    private isValidLocation({ target, type }: LocationSpec): boolean {
        if (type !== 'url') return false;

        const url = new URL(target);

        // Check if it is valid gitlab Host
        return this.gitLabIntegrationsConfig.some((config) => {
            const baseUrl = new URL(config.baseUrl);
            return url.origin === baseUrl.origin;
        });
    }
}

import { CatalogProcessor } from '@backstage/plugin-catalog-node';
import { Entity } from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import { CacheService } from '@backstage/backend-plugin-api';
import {
    GITLAB_INSTANCE,
    GITLAB_PROJECT_ID,
    GITLAB_PROJECT_SLUG,
} from '../annotations';

/** @public */
export class GitlabProjectIdProcessor implements CatalogProcessor {
    constructor(
        private readonly config: Config,
        private readonly cache: CacheService
    ) {}

    getProcessorName(): string {
        return 'GitlabProjectIdProcessor';
    }

    async postProcessEntity(entity: Entity): Promise<Entity> {
        const annotations = entity.metadata?.annotations;
        const slug = annotations?.[GITLAB_PROJECT_SLUG];
        const host = annotations?.[GITLAB_INSTANCE];

        if (!slug || !host || annotations?.[GITLAB_PROJECT_ID] !== undefined) {
            return entity;
        }

        const cacheKey = `gitlab-project-id:${host}:${slug}`;
        try {
            const cached = await this.cache.get<string>(cacheKey);
            if (cached) {
                annotations![GITLAB_PROJECT_ID] = cached;
                return entity;
            }

            const baseUrl = this.config
                .getString('backend.baseUrl')
                .replace(/\/$/, '');
            const url = `${baseUrl}/api/gitlab/rest/${host}/projects/${encodeURIComponent(
                slug
            )}`;
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(
                    `GitLab proxy returned ${response.status} for ${slug}`
                );
                return entity;
            }

            const project = await response.json();
            if (project?.id) {
                const id = String(project.id);
                annotations![GITLAB_PROJECT_ID] = id;
                await this.cache.set(cacheKey, id);
            }
        } catch (err) {
            console.error('Failed to call GitLab proxy:', err);
        }

        return entity;
    }
}

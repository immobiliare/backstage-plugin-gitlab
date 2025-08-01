import { GitlabProjectIdProcessor } from './projectIdProcessor';
import { ConfigReader } from '@backstage/config';
import { Entity } from '@backstage/catalog-model';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import {
    GITLAB_PROJECT_SLUG,
    GITLAB_PROJECT_ID,
    GITLAB_INSTANCE,
} from '../annotations';

describe('GitlabProjectIdProcessor', () => {
    const server = setupServer(
        rest.get(
            'http://localhost/api/gitlab/rest/gitlab.example.com/projects/customer%2Fxyz',
            (_req, res, ctx) => res(ctx.json({ id: 55 }))
        )
    );

    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    const config = new ConfigReader({
        backend: { baseUrl: 'http://localhost' },
    });

    const createCache = (): any => {
        const store: Record<string, string> = {};
        return {
            get: jest.fn(async (k: string) => store[k]),
            set: jest.fn(async (k: string, v: string) => {
                store[k] = v;
            }),
            delete: jest.fn(async (k: string) => {
                delete store[k];
            }),
            withOptions: jest.fn(() => createCache()),
        };
    };

    it('adds project id from api', async () => {
        const cache = createCache();
        const processor = new GitlabProjectIdProcessor(config, cache as any);
        const entity: Entity = {
            apiVersion: 'backstage.io/v1alpha1',
            kind: 'Component',
            metadata: {
                name: 'test',
                annotations: {
                    [GITLAB_PROJECT_SLUG]: 'customer/xyz',
                    [GITLAB_INSTANCE]: 'gitlab.example.com',
                },
            },
        };

        await processor.postProcessEntity(entity);

        expect(entity.metadata?.annotations?.[GITLAB_PROJECT_ID]).toBe('55');
    });

    it('uses cached project id', async () => {
        const cache = createCache();
        await cache.set(
            'gitlab-project-id:gitlab.example.com:customer/xyz',
            '42'
        );
        const processor = new GitlabProjectIdProcessor(config, cache as any);
        const entity: Entity = {
            apiVersion: 'backstage.io/v1alpha1',
            kind: 'Component',
            metadata: {
                name: 'test',
                annotations: {
                    [GITLAB_PROJECT_SLUG]: 'customer/xyz',
                    [GITLAB_INSTANCE]: 'gitlab.example.com',
                },
            },
        };

        await processor.postProcessEntity(entity);

        expect(entity.metadata?.annotations?.[GITLAB_PROJECT_ID]).toBe('42');
    });
});

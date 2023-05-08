import { getVoidLogger } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';
import express from 'express';
import request from 'supertest';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { createRouter } from './router';

describe('createRouter', () => {
    let app: express.Application;
    const server = setupServer(
        rest.get(
            'https://non-existing-example.com/api/v4/projects/434',
            (req, res, ctx) => {
                return res(
                    ctx.status(200),
                    ctx.json({
                        url: req.url.toString(),
                        headers: req.headers.all(),
                    })
                );
            }
        ),
        rest.get(
            'https://non-existing-example-2.com/api/v4/projects/434',
            (req, res, ctx) => {
                return res(
                    ctx.status(200),
                    ctx.json({
                        url: req.url.toString(),
                        headers: req.headers.all(),
                    })
                );
            }
        )
    );

    const config = new ConfigReader({
        integrations: {
            gitlab: [
                {
                    host: 'non-existing-example.com',
                    apiBaseUrl: 'https://non-existing-example.com/api/v4',
                },
                {
                    host: 'non-existing-example-2.com',
                    apiBaseUrl: 'https://non-existing-example-2.com/api/v4',
                },
            ],
        },
    });

    beforeAll(async () => {
        const router = await createRouter({
            logger: getVoidLogger(),
            config,
        });
        app = express().use('/api/gitlab', router);
        server.listen({
            onUnhandledRequest: ({ headers }, print) => {
                if (headers.get('User-Agent') === 'supertest') {
                    return;
                }
                print.error();
            },
        });
    });

    afterAll(() => server.close());

    beforeEach(async () => {
        jest.resetAllMocks();
        server.resetHandlers();
    });

    describe('GET Request', () => {
        it('First instance should work', async () => {
            const agent = request.agent(app);
            // this is set to let msw pass test requests through the mock server
            agent.set('User-Agent', 'supertest');
            const response = await agent.get(
                '/api/gitlab/non-existing-example.com/projects/434'
            );
            expect(response.status).toEqual(200);
            expect(response.body).toEqual({
                headers: {
                    'accept-encoding': 'gzip, deflate',
                    connection: 'close',
                    host: 'non-existing-example.com',
                    'user-agent': 'supertest',
                },
                url: 'https://non-existing-example.com/api/v4/projects/434',
            });
        });

        it('Second instance should work', async () => {
            const agent = request.agent(app);
            // this is set to let msw pass test requests through the mock server
            agent.set('User-Agent', 'supertest');
            const response = await agent.get(
                '/api/gitlab/non-existing-example-2.com/projects/434'
            );
            expect(response.status).toEqual(200);
            expect(response.body).toEqual({
                headers: {
                    'accept-encoding': 'gzip, deflate',
                    connection: 'close',
                    host: 'non-existing-example-2.com',
                    'user-agent': 'supertest',
                },
                url: 'https://non-existing-example-2.com/api/v4/projects/434',
            });
        });
    });

    describe('Error requests', () => {
        it('Methods different from GET should reject', async () => {
            const agent = request.agent(app);
            // this is set to let msw pass test requests through the mock server
            agent.set('User-Agent', 'supertest');
            for (const method of [
                'post',
                'delete',
                'put',
                'options',
                'trace',
                'patch',
            ]) {
                // @ts-ignore
                const response = await agent?.[method](
                    '/api/gitlab/non-existing-example-2.com/projects/434'
                );
                expect(response.status).toEqual(404);
                expect(response.body).toEqual({});
            }
        });

        it('Request out of instance should reject', async () => {
            const agent = request.agent(app);
            // this is set to let msw pass test requests through the mock server
            agent.set('User-Agent', 'supertest');
            const response = await agent.get(
                '/api/gitlab/does.not.exist/projects/434'
            );
            expect(response.status).toEqual(404);
            expect(response.body).toEqual({});
        });
    });
});

describe('createRouter with baseUrl', () => {
    let app: express.Application;
    const server = setupServer(
        rest.get(
            'https://non-existing-example.com/api/v4/projects/434',
            (req, res, ctx) => {
                return res(
                    ctx.status(200),
                    ctx.json({
                        url: req.url.toString(),
                        headers: req.headers.all(),
                    })
                );
            }
        ),
        rest.get(
            'https://non-existing-example-2.com/api/v4/projects/434',
            (req, res, ctx) => {
                return res(
                    ctx.status(200),
                    ctx.json({
                        url: req.url.toString(),
                        headers: req.headers.all(),
                    })
                );
            }
        )
    );

    const basePath = '/docs';

    const config = new ConfigReader({
        backend: {
            baseUrl: `http://localhost:7007${basePath}`,
        },
        integrations: {
            gitlab: [
                {
                    host: 'non-existing-example.com',
                    apiBaseUrl: 'https://non-existing-example.com/api/v4',
                },
                {
                    host: 'non-existing-example-2.com',
                    apiBaseUrl: 'https://non-existing-example-2.com/api/v4',
                },
            ],
        },
    });

    beforeAll(async () => {
        const router = await createRouter({
            logger: getVoidLogger(),
            config,
        });
        app = express().use(`${basePath}/api/gitlab`, router);
        server.listen({
            onUnhandledRequest: ({ headers }, print) => {
                if (headers.get('User-Agent') === 'supertest') {
                    return;
                }
                print.error();
            },
        });
    });

    afterAll(() => server.close());

    beforeEach(async () => {
        jest.resetAllMocks();
        server.resetHandlers();
    });

    describe('GET Request', () => {
        it('First instance should work', async () => {
            const agent = request.agent(app);
            // this is set to let msw pass test requests through the mock server
            agent.set('User-Agent', 'supertest');
            const response = await agent.get(
                `${basePath}/api/gitlab/non-existing-example.com/projects/434`
            );
            expect(response.status).toEqual(200);
            expect(response.body).toEqual({
                headers: {
                    'accept-encoding': 'gzip, deflate',
                    connection: 'close',
                    host: 'non-existing-example.com',
                    'user-agent': 'supertest',
                },
                url: 'https://non-existing-example.com/api/v4/projects/434',
            });
        });

        it('Second instance should work', async () => {
            const agent = request.agent(app);
            // this is set to let msw pass test requests through the mock server
            agent.set('User-Agent', 'supertest');
            const response = await agent.get(
                `${basePath}/api/gitlab/non-existing-example-2.com/projects/434`
            );
            expect(response.status).toEqual(200);
            expect(response.body).toEqual({
                headers: {
                    'accept-encoding': 'gzip, deflate',
                    connection: 'close',
                    host: 'non-existing-example-2.com',
                    'user-agent': 'supertest',
                },
                url: 'https://non-existing-example-2.com/api/v4/projects/434',
            });
        });

        it('Third instance should fail', async () => {
            const agent = request.agent(app);
            // this is set to let msw pass test requests through the mock server
            agent.set('User-Agent', 'supertest');
            const response = await agent.get(
                '/api/gitlab/non-existing-example.com/projects/434'
            );
            expect(response.status).toEqual(404);
        });
    });

    describe('Error requests', () => {
        it('Methods different from GET should reject', async () => {
            const agent = request.agent(app);
            // this is set to let msw pass test requests through the mock server
            agent.set('User-Agent', 'supertest');
            for (const method of [
                'post',
                'delete',
                'put',
                'options',
                'trace',
                'patch',
            ]) {
                // @ts-ignore
                const response = await agent?.[method](
                    `${basePath}/api/gitlab/non-existing-example-2.com/projects/434`
                );
                expect(response.status).toEqual(404);
                expect(response.body).toEqual({});
            }
        });

        it('Request out of instance should reject', async () => {
            const agent = request.agent(app);
            // this is set to let msw pass test requests through the mock server
            agent.set('User-Agent', 'supertest');
            const response = await agent.get(
                `${basePath}/api/gitlab/does.not.exist/projects/434`
            );
            expect(response.status).toEqual(404);
            expect(response.body).toEqual({});
        });
    });
});

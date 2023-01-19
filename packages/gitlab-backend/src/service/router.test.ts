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
        )
    );

    const config = new ConfigReader({
        integrations: {
            gitlab: [
                {
                    host: 'non-existing-example.com',
                    apiBaseUrl: 'https://non-existing-example.com/api/v4',
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

    describe('GET /Route', () => {
        it('returns ok', async () => {
            const agent = request.agent(app);
            // this is set to let msw pass test requests through the mock server
            agent.set('User-Agent', 'supertest');
            const response = await agent.get('/api/gitlab/0/projects/434');
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
    });
});

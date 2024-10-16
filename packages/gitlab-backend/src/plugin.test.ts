import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import request from 'supertest';
import { gitlabPlugin } from './plugin';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

describe('gitlabPlugin', () => {
    const mockServer = setupServer(
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

    beforeAll(async () => {
        mockServer.listen({
            onUnhandledRequest: ({ headers }, print) => {
                if (headers.get('User-Agent') === 'supertest') {
                    return;
                }
                print.error();
            },
        });
    });

    afterAll(() => mockServer.close());

    it('can serve values from config', async () => {
        const fakeConfig = {
            integrations: {
                gitlab: [
                    {
                        host: 'non-existing-example.com',
                        apiBaseUrl: 'https://non-existing-example.com/api/v4',
                    },
                ],
            },
        };

        const { server } = await startTestBackend({
            features: [
                gitlabPlugin,
                mockServices.rootConfig.factory({ data: fakeConfig }),
            ],
        });

        const agent = request.agent(server);
        agent.set('User-Agent', 'supertest');
        const response = await agent.get(
            '/api/gitlab/rest/non-existing-example.com/projects/434'
        );
        expect(response.status).toBe(200);
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

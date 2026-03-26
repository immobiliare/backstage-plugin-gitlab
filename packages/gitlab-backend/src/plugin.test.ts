import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import request from 'supertest';
import { gitlabPlugin } from './plugin';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

describe('gitlabPlugin', () => {
    const mockServer = setupServer(
        http.get(
            'https://non-existing-example.com/api/v4/projects/434',
            ({ request: req }) => {
                return HttpResponse.json({
                    url: req.url.toString(),
                    headers: Object.fromEntries(req.headers.entries()),
                });
            }
        )
    );

    beforeAll(async () => {
        mockServer.listen({
            onUnhandledRequest: (req, print) => {
                if (req.headers.get('User-Agent') === 'supertest') {
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
